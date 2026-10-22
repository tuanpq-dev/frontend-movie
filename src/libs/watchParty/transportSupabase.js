import { getRealtimeClient } from "./supabase";
import { ROOM_EVENTS, membersFromPresence } from "./protocol";

// Supabase Realtime (Broadcast + Presence). Ổn định hơn P2P ở mạng khó (4G, mạng công ty)
// vì mọi tin đi qua server của Supabase. Chỉ dùng khi có VITE_SUPABASE_URL/ANON_KEY.
const SETTLE_MS = 1500;
const pendingRemovals = new Map();

const createSupabaseTransport = async ({
    roomId,
    profile,
    onEvent,
    onMembers,
    onStatus,
}) => {
    const client = getRealtimeClient();
    const topic = `watch-party:${roomId}`;

    // client.channel() trả lại kênh cùng topic nếu kênh đó chưa gỡ xong: chờ gỡ trước.
    await pendingRemovals.get(topic);
    const stale = client
        .getChannels()
        .filter((item) => item.topic === `realtime:${topic}`);
    await Promise.all(stale.map((item) => client.removeChannel(item)));

    let left = false;
    const channel = client.channel(topic, {
        config: {
            broadcast: { self: false, ack: false },
            presence: { key: profile.clientId },
        },
    });

    channel.on("presence", { event: "sync" }, () => {
        if (!left) onMembers(membersFromPresence(channel.presenceState()));
    });
    ROOM_EVENTS.forEach((event) => {
        channel.on("broadcast", { event }, ({ payload }) => {
            if (!left) onEvent(event, payload);
        });
    });
    channel.subscribe(async (status) => {
        if (left) return;
        if (status === "SUBSCRIBED") {
            await channel.track(profile);
            if (!left) onStatus("online");
        } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
        ) {
            // supabase-js tự nối lại; xong sẽ quay lại nhánh SUBSCRIBED.
            onStatus("offline");
        }
    });

    const handleOffline = () => onStatus("offline");
    window.addEventListener("offline", handleOffline);

    return {
        name: "supabase",
        settleMs: SETTLE_MS,
        send: (event, payload) => {
            channel.send({ type: "broadcast", event, payload });
        },
        leave: () => {
            left = true;
            window.removeEventListener("offline", handleOffline);
            // Rời kênh = rời Presence; khi không còn ai, phòng tự biến mất.
            const removal = client
                .removeChannel(channel)
                .catch(() => {})
                .finally(() => {
                    if (pendingRemovals.get(topic) === removal) {
                        pendingRemovals.delete(topic);
                    }
                });
            pendingRemovals.set(topic, removal);
        },
    };
};

export default createSupabaseTransport;
