import { joinRoom } from "trystero";
import {
    ROOM_EVENTS,
    compareSeniority,
    isId,
    sanitizeMember,
} from "./protocol";

// P2P qua WebRTC (Trystero). Relay Nostr công cộng chỉ dùng để các máy tìm thấy nhau;
// lệnh/chat đi thẳng giữa trình duyệt, có mã hóa. Không cần key hay server riêng.
const APP_ID = "kltn-frontend-movie-watch-party";
const SETTLE_MS = 5000; // tìm peer qua relay chậm hơn Supabase
const pendingLeaves = new Map();

const createP2PTransport = async ({
    roomId,
    profile,
    onEvent,
    onMembers,
    onStatus,
}) => {
    // joinRoom trả lại phòng cũ nếu phòng đó chưa rời xong (StrictMode, vào lại nhanh).
    await pendingLeaves.get(roomId);

    const room = joinRoom(
        { appId: APP_ID, maxReceiveBytes: 64 * 1024 },
        roomId,
    );
    const peers = new Map(); // peerId của WebRTC → member (đã sanitize)
    let left = false;

    const emitMembers = () => {
        if (left) return;
        onMembers([profile, ...peers.values()].sort(compareSeniority));
    };

    const hello = room.makeAction("hello");
    hello.onMessage = (data, { peerId }) => {
        const member = sanitizeMember(data);
        if (!member || member.clientId === profile.clientId) return;
        // Một clientId chỉ gắn với một kết nối (F5 = kết nối mới thay kết nối cũ).
        peers.forEach((other, otherPeerId) => {
            if (other.clientId === member.clientId) peers.delete(otherPeerId);
        });
        peers.set(peerId, member);
        emitMembers();
    };

    const actions = {};
    ROOM_EVENTS.forEach((event) => {
        const action = room.makeAction(event);
        action.onMessage = (data, { peerId }) => {
            // `from` phải khớp người đã chào trên đúng kết nối này.
            const owner = peers.get(peerId);
            if (!owner || !isId(data?.from) || data.from !== owner.clientId) {
                return;
            }
            onEvent(event, data);
        };
        actions[event] = action;
    });

    room.onPeerJoin = (peerId) => {
        hello.send(profile, { target: peerId }).catch(() => {});
    };
    room.onPeerLeave = (peerId) => {
        if (peers.delete(peerId)) emitMembers();
    };

    const handleOnline = () => onStatus("online");
    const handleOffline = () => onStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    emitMembers();
    onStatus(navigator.onLine === false ? "offline" : "online");

    return {
        name: "p2p",
        settleMs: SETTLE_MS,
        send: (event, payload) => {
            actions[event]?.send(payload).catch(() => {});
        },
        leave: () => {
            left = true;
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            const leaving = room
                .leave()
                .catch(() => {})
                .finally(() => {
                    if (pendingLeaves.get(roomId) === leaving) {
                        pendingLeaves.delete(roomId);
                    }
                });
            pendingLeaves.set(roomId, leaving);
        },
    };
};

export default createP2PTransport;
