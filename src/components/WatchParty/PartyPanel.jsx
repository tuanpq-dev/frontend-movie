import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCrown,
    faPaperPlane,
    faUserXmark,
} from "@fortawesome/free-solid-svg-icons";
import { CHAT_MAX_LENGTH } from "@libs/watchParty/protocol";

// Màu avatar sinh từ hue của từng người (dữ liệu, không phải màu giao diện).
export const Avatar = ({ nickname, hue, className = "h-8 w-8 text-sm" }) => (
    <span
        aria-hidden="true"
        className={`flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ${className}`}
        style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
        {(nickname || "?").charAt(0).toUpperCase()}
    </span>
);

const ChatTab = ({ messages, me, sendChat }) => {
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const listRef = useRef(null);

    // Cuộn trong khung chat (không dùng scrollIntoView để trang không bị kéo theo).
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages.length]);

    const submit = (event) => {
        event.preventDefault();
        const result = sendChat(text);
        if (result.ok) {
            setText("");
            setError("");
        } else if (result.error) {
            setError(result.error);
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ul
                ref={listRef}
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
            >
                {messages.length === 0 && (
                    <li className="py-6 text-center text-sm text-muted">
                        Chưa có tin nhắn. Chào mọi người một câu nhé!
                    </li>
                )}
                {messages.map((message) =>
                    message.type === "system" ? (
                        <li
                            key={message.id}
                            className="text-center text-xs text-muted"
                        >
                            {message.text}
                        </li>
                    ) : (
                        <li key={message.id} className="flex gap-2.5">
                            <Avatar
                                nickname={message.nickname}
                                hue={message.hue}
                            />
                            <div className="min-w-0">
                                <p className="flex items-baseline gap-2 text-xs">
                                    <span
                                        className={`truncate font-semibold ${
                                            message.clientId === me
                                                ? "text-primary"
                                                : "text-white"
                                        }`}
                                    >
                                        {message.nickname}
                                    </span>
                                    <time className="shrink-0 text-muted">
                                        {dayjs(message.sentAt).format("HH:mm")}
                                    </time>
                                </p>
                                <p className="whitespace-pre-wrap break-words text-sm text-gray-200">
                                    {message.text}
                                </p>
                            </div>
                        </li>
                    ),
                )}
            </ul>
            <form onSubmit={submit} className="border-t border-line p-3">
                <div className="flex items-center gap-2">
                    <input
                        value={text}
                        onChange={(event) => {
                            setText(event.target.value);
                            setError("");
                        }}
                        maxLength={CHAT_MAX_LENGTH}
                        placeholder="Nhắn gì đó..."
                        aria-label="Tin nhắn"
                        className="min-w-0 flex-1 rounded-full bg-surface-3 px-4 py-2 text-sm text-white outline-none placeholder:text-muted focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        aria-label="Gửi"
                        disabled={!text.trim()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
                <p className="mt-1.5 flex justify-between px-1 text-xs text-muted">
                    <span className="text-red-400">{error}</span>
                    <span>
                        {text.length}/{CHAT_MAX_LENGTH}
                    </span>
                </p>
            </form>
        </div>
    );
};

const MembersTab = ({ members, hostId, me, isHost, transferHost, kick }) => (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        <ul className="space-y-2">
            {members.map((member) => {
                const isMemberHost = member.clientId === hostId;
                const isMe = member.clientId === me;
                return (
                    <li
                        key={member.clientId}
                        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-3"
                    >
                        <Avatar nickname={member.nickname} hue={member.hue} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                                {member.nickname}
                                {isMe && (
                                    <span className="ml-1 text-muted">
                                        (bạn)
                                    </span>
                                )}
                            </p>
                            {isMemberHost && (
                                <p className="flex items-center gap-1 text-xs text-primary">
                                    <FontAwesomeIcon icon={faCrown} />
                                    Host
                                </p>
                            )}
                        </div>
                        {isHost && !isMe && (
                            <div className="flex shrink-0 gap-1">
                                <button
                                    type="button"
                                    title="Chuyển quyền host"
                                    aria-label={`Chuyển quyền host cho ${member.nickname}`}
                                    onClick={() =>
                                        transferHost(member.clientId)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-4 hover:text-primary"
                                >
                                    <FontAwesomeIcon icon={faCrown} />
                                </button>
                                <button
                                    type="button"
                                    title="Mời ra khỏi phòng"
                                    aria-label={`Mời ${member.nickname} ra khỏi phòng`}
                                    onClick={() => kick(member.clientId)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-4 hover:text-red-400"
                                >
                                    <FontAwesomeIcon icon={faUserXmark} />
                                </button>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
        {isHost && members.length > 1 && (
            <p className="mt-4 text-xs leading-5 text-muted">
                &quot;Mời ra&quot; chỉ có tác dụng trên trình duyệt của người
                đó. Không có máy chủ để chặn, nên họ vẫn có thể vào lại bằng
                link mời.
            </p>
        )}
    </div>
);

const PartyPanel = ({
    messages,
    members,
    hostId,
    me,
    isHost,
    sendChat,
    transferHost,
    kick,
    className = "",
}) => {
    const [tab, setTab] = useState("chat");
    const tabs = [
        { key: "chat", label: "Trò chuyện" },
        { key: "members", label: `Người xem (${members.length})` },
    ];

    return (
        <aside
            className={`flex flex-col overflow-hidden rounded-xl bg-surface-2 ${className}`}
        >
            <div className="flex border-b border-line" role="tablist">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.key}
                        onClick={() => setTab(item.key)}
                        className={`flex-1 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                            tab === item.key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted hover:text-white"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            {tab === "chat" ? (
                <ChatTab messages={messages} me={me} sendChat={sendChat} />
            ) : (
                <MembersTab
                    members={members}
                    hostId={hostId}
                    me={me}
                    isHost={isHost}
                    transferHost={transferHost}
                    kick={kick}
                />
            )}
        </aside>
    );
};

export default PartyPanel;
