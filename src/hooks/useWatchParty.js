import { useCallback, useEffect, useRef, useState } from "react";
import { createMessageId } from "@libs/watchParty/room";
import { createTransport } from "@libs/watchParty/transport";
import {
    CHAT_HISTORY,
    CHAT_MAX_LENGTH,
    HEARTBEAT_MS,
    cleanText,
    createRateLimiter,
    isNewerHost,
    pickHost,
    sanitizeChat,
    sanitizeCommand,
    sanitizeState,
} from "@libs/watchParty/protocol";

const NO_HOST = { id: null, epoch: 0 };

/**
 * Phòng xem chung trên một lớp truyền tin (P2P Trystero hoặc Supabase, xem libs/watchParty/transport.js).
 *
 * - getSnapshot(): trạng thái phát hiện tại của máy này
 *   { movieSlug, server, episode, currentTime, isPlaying, rate } hoặc null.
 * - onRemoteState(state): nhận bản tin đã được kiểm tra và được phép điều khiển.
 * - onKicked(): host mời máy này ra khỏi phòng.
 *
 * Quyền host chỉ được kiểm tra ở client (không có server), xem docs/WATCH_PARTY.md.
 */
const useWatchParty = ({
    roomId,
    identity,
    getSnapshot,
    onRemoteState,
    onKicked,
}) => {
    const me = identity.clientId;
    const [status, setStatus] = useState("connecting");
    const [members, setMembers] = useState([]);
    const [host, setHostState] = useState(NO_HOST);
    const [allowAll, setAllowAllState] = useState(false);
    const [messages, setMessages] = useState([]);
    const [transportName, setTransportName] = useState(null);

    const transportRef = useRef(null);
    const statusRef = useRef("connecting");
    const membersRef = useRef([]);
    const hostRef = useRef(NO_HOST);
    const allowAllRef = useRef(false);
    const settledRef = useRef(false);
    const callbacksRef = useRef({});
    callbacksRef.current = { getSnapshot, onRemoteState, onKicked };

    const nicknameOf = (clientId) =>
        membersRef.current.find((member) => member.clientId === clientId)
            ?.nickname || "Một người";

    const pushMessage = useCallback((message) => {
        setMessages((list) => [...list, message].slice(-CHAT_HISTORY));
    }, []);

    const pushSystem = useCallback(
        (text) =>
            pushMessage({
                id: createMessageId(),
                type: "system",
                text,
                sentAt: Date.now(),
            }),
        [pushMessage],
    );

    const send = useCallback((event, payload) => {
        const transport = transportRef.current;
        if (!transport || statusRef.current !== "online") return false;
        transport.send(event, payload);
        return true;
    }, []);

    const setHost = useCallback((next) => {
        hostRef.current = next;
        setHostState(next);
    }, []);

    // Gửi trạng thái phát. Host gửi bất cứ lúc nào; người khác chỉ khi host bật "mọi người điều khiển".
    const publishState = useCallback(
        (kind = "action", override = null) => {
            const isHost = hostRef.current.id === me;
            if (!isHost && (kind !== "action" || !allowAllRef.current)) {
                return false;
            }
            const snapshot = override || callbacksRef.current.getSnapshot?.();
            if (!snapshot) return false;
            return send("state", {
                ...snapshot,
                from: me,
                hostId: hostRef.current.id,
                epoch: hostRef.current.epoch,
                allowAll: allowAllRef.current,
                sentAt: Date.now(),
                kind,
            });
        },
        [me, send],
    );

    useEffect(() => {
        const profile = {
            clientId: me,
            nickname: identity.nickname,
            hue: identity.hue,
            joinedAt: Date.now(),
        };
        const replyLimiter = createRateLimiter(4, 1000);
        const chatLimiters = new Map();
        let hasBeenOnline = false;
        let disposed = false;
        let settleTimer = null;

        // Host hiện tại không còn trong phòng: mọi máy cùng chọn người vào sớm nhất, epoch + 1.
        const reconcileHost = (previousMembers) => {
            if (!settledRef.current) return;
            const list = membersRef.current;
            const current = hostRef.current;
            if (!list.some((member) => member.clientId === me)) return;
            if (current.id && list.some((m) => m.clientId === current.id)) {
                return;
            }
            const next = pickHost(list);
            if (!next) return;
            setHost({ id: next, epoch: current.epoch + 1 });
            const nextName = next === me ? "Bạn" : nicknameOf(next);
            if (current.id) {
                const oldName =
                    previousMembers.find((m) => m.clientId === current.id)
                        ?.nickname || "Host";
                pushSystem(`${oldName} đã rời phòng. ${nextName} là host mới.`);
            } else if (next === me && list.length === 1) {
                pushSystem("Bạn là host. Gửi link mời để xem cùng bạn bè.");
            } else {
                pushSystem(`${nextName} là host.`);
            }
            if (next === me) publishState("heartbeat");
        };

        const handleState = (payload) => {
            const state = sanitizeState(payload);
            if (!state || state.from === me) return;
            const current = hostRef.current;

            if (state.from === state.hostId) {
                const claim = { id: state.hostId, epoch: state.epoch };
                if (claim.id === current.id) {
                    if (claim.epoch > current.epoch) setHost(claim);
                } else if (
                    isNewerHost(claim, current, membersRef.current) ||
                    !membersRef.current.some((m) => m.clientId === current.id)
                ) {
                    setHost(claim);
                    if (current.id === me) {
                        pushSystem(`${nicknameOf(claim.id)} đang là host.`);
                    }
                } else {
                    // Host cũ (vd. vừa nối lại mạng) chưa biết đã có host mới: nhắc lại.
                    if (current.id === me && replyLimiter()) {
                        publishState("heartbeat");
                    }
                    return;
                }
                settledRef.current = true;
                allowAllRef.current = state.allowAll;
                setAllowAllState(state.allowAll);
            } else {
                // Người không phải host chỉ được điều khiển khi host bật chế độ cho phép.
                const isMember = membersRef.current.some(
                    (m) => m.clientId === state.from,
                );
                if (
                    !allowAllRef.current ||
                    state.kind !== "action" ||
                    !isMember
                ) {
                    return;
                }
            }
            callbacksRef.current.onRemoteState?.(state);
        };

        const handleRequestState = (payload) => {
            const command = sanitizeCommand(payload);
            if (!command || hostRef.current.id !== me) return;
            if (replyLimiter()) publishState("heartbeat");
        };

        const handleHostTransfer = (payload) => {
            const command = sanitizeCommand(payload);
            const current = hostRef.current;
            if (!command?.target || command.from !== current.id) return;
            if (command.epoch <= current.epoch) return;
            setHost({ id: command.target, epoch: command.epoch });
            const targetName =
                command.target === me ? "bạn" : nicknameOf(command.target);
            pushSystem(
                `${nicknameOf(command.from)} đã chuyển quyền host cho ${targetName}.`,
            );
            if (command.target === me) publishState("heartbeat");
        };

        const handleKick = (payload) => {
            const command = sanitizeCommand(payload);
            if (!command?.target || command.from !== hostRef.current.id) return;
            if (command.target === me) {
                callbacksRef.current.onKicked?.();
            } else {
                pushSystem(
                    `${nicknameOf(command.target)} đã bị mời ra khỏi phòng.`,
                );
            }
        };

        const handleChat = (payload) => {
            const message = sanitizeChat(payload);
            if (!message || message.clientId === me) return;
            if (!chatLimiters.has(message.clientId)) {
                chatLimiters.set(message.clientId, createRateLimiter(8, 10000));
            }
            if (!chatLimiters.get(message.clientId)()) return;
            pushMessage({ ...message, sentAt: Date.now() });
        };

        const eventHandlers = {
            state: handleState,
            "request-state": handleRequestState,
            host: handleHostTransfer,
            kick: handleKick,
            chat: handleChat,
        };

        const handleMembers = (list) => {
            if (disposed) return;
            const previous = membersRef.current;
            membersRef.current = list;
            setMembers(list);

            const before = new Set(previous.map((m) => m.clientId));
            const after = new Set(list.map((m) => m.clientId));
            const joined = list.filter(
                (m) => !before.has(m.clientId) && m.clientId !== me,
            );
            if (settledRef.current) {
                joined.forEach((m) =>
                    pushSystem(`${m.nickname} đã vào phòng.`),
                );
                previous.forEach((m) => {
                    if (
                        !after.has(m.clientId) &&
                        m.clientId !== me &&
                        m.clientId !== hostRef.current.id
                    ) {
                        pushSystem(`${m.nickname} đã rời phòng.`);
                    }
                });
            }
            // Có người mới: host gửi ngay trạng thái (với P2P, lúc họ gửi request-state có thể chưa nối xong).
            if (joined.length && hostRef.current.id === me) {
                publishState("heartbeat");
            }
            reconcileHost(previous);
        };

        // Mỗi lần (nối lại) online: host phát lại trạng thái, người khác xin trạng thái.
        const handleOnline = () => {
            const transport = transportRef.current;
            if (disposed || !transport) return;
            if (hostRef.current.id === me) publishState("heartbeat");
            else send("request-state", { from: me });
            if (!hasBeenOnline) {
                hasBeenOnline = true;
                settleTimer = setTimeout(() => {
                    settledRef.current = true;
                    reconcileHost(membersRef.current);
                }, transport.settleMs);
            } else {
                pushSystem("Đã kết nối lại.");
            }
        };

        const handleStatus = (next) => {
            if (disposed || statusRef.current === next) return;
            statusRef.current = next;
            setStatus(next);
            if (next === "online") handleOnline();
        };

        let transport = null;
        createTransport({
            roomId,
            profile,
            onEvent: (event, payload) => {
                if (!disposed) eventHandlers[event]?.(payload);
            },
            onMembers: handleMembers,
            onStatus: handleStatus,
        })
            .then((created) => {
                transport = created;
                if (disposed) {
                    created.leave();
                    return;
                }
                transportRef.current = created;
                setTransportName(created.name);
                // Transport có thể đã báo online trước khi được gán vào ref.
                if (statusRef.current === "online") handleOnline();
            })
            .catch(() => {
                if (disposed) return;
                statusRef.current = "offline";
                setStatus("offline");
                pushSystem("Không kết nối được phòng. Hãy tải lại trang.");
            });

        return () => {
            disposed = true;
            clearTimeout(settleTimer);
            transport?.leave();
            transportRef.current = null;
            statusRef.current = "connecting";
            membersRef.current = [];
            hostRef.current = NO_HOST;
            allowAllRef.current = false;
            settledRef.current = false;
        };
        // identity chỉ đọc lúc vào phòng; đổi nickname thì vào lại phòng.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, me]);

    const isHost = host.id === me && status === "online";

    // Host gửi trạng thái định kỳ để mọi người tự sửa độ lệch.
    useEffect(() => {
        if (!isHost) return undefined;
        const timer = setInterval(
            () => publishState("heartbeat"),
            HEARTBEAT_MS,
        );
        return () => clearInterval(timer);
    }, [isHost, publishState]);

    const sendLimiterRef = useRef(null);
    if (!sendLimiterRef.current) {
        sendLimiterRef.current = createRateLimiter(5, 10000);
    }

    const sendChat = useCallback(
        (rawText) => {
            const text = cleanText(rawText, CHAT_MAX_LENGTH, {
                multiline: true,
            });
            if (!text) return { ok: false };
            if (statusRef.current !== "online") {
                return { ok: false, error: "Mất kết nối, chưa gửi được." };
            }
            if (!sendLimiterRef.current()) {
                return { ok: false, error: "Bạn gửi hơi nhanh, đợi chút nhé." };
            }
            const message = {
                id: createMessageId(),
                from: me,
                nickname: identity.nickname,
                hue: identity.hue,
                text,
                sentAt: Date.now(),
            };
            send("chat", message);
            pushMessage({
                ...message,
                type: "chat",
                clientId: me,
            });
            return { ok: true };
        },
        [identity.hue, identity.nickname, me, pushMessage, send],
    );

    const transferHost = useCallback(
        (target) => {
            const current = hostRef.current;
            if (current.id !== me || target === me) return;
            const epoch = current.epoch + 1;
            if (!send("host", { from: me, target, epoch })) return;
            setHost({ id: target, epoch });
            pushSystem(`Bạn đã chuyển quyền host cho ${nicknameOf(target)}.`);
        },

        [me, pushSystem, send, setHost],
    );

    const kick = useCallback(
        (target) => {
            if (hostRef.current.id !== me || target === me) return;
            if (send("kick", { from: me, target })) {
                pushSystem(`Bạn đã mời ${nicknameOf(target)} ra khỏi phòng.`);
            }
        },

        [me, pushSystem, send],
    );

    const setAllowAll = useCallback(
        (value) => {
            if (hostRef.current.id !== me) return;
            allowAllRef.current = value;
            setAllowAllState(value);
            publishState("action");
            pushSystem(
                value
                    ? "Mọi người đều có thể điều khiển video."
                    : "Chỉ host được điều khiển video.",
            );
        },
        [me, publishState, pushSystem],
    );

    return {
        status,
        transportName,
        members,
        hostId: host.id,
        isHost,
        allowAll,
        canControl: isHost || (allowAll && status === "online"),
        messages,
        publishState,
        sendChat,
        transferHost,
        kick,
        setAllowAll,
    };
};

export default useWatchParty;
