// Giao thức "Xem chung": hằng số, kiểm tra payload và các phép tính thuần (không phụ thuộc React/Supabase).
// Mọi dữ liệu nhận từ kênh realtime đều là dữ liệu KHÔNG tin cậy: phải đi qua sanitize* trước khi dùng.

// Tên sự kiện trên kênh realtime (dùng chung cho mọi transport).
export const ROOM_EVENTS = ["state", "request-state", "host", "kick", "chat"];

export const HEARTBEAT_MS = 4000; // host gửi trạng thái định kỳ
export const DRIFT_THRESHOLD = 1.5; // lệch quá số giây này thì seek lại
export const MAX_LATENCY_S = 5; // trần bù trễ, chống đồng hồ hai máy lệch nhau
export const CHAT_MAX_LENGTH = 300;
export const CHAT_HISTORY = 100;
export const NICKNAME_MAX = 24;
export const MAX_PAYLOAD_CHARS = 2000;
export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Tốc độ từ <video> (menu trình duyệt có thể khác) làm tròn về mức hợp lệ gần nhất.
export const nearestRate = (rate) =>
    PLAYBACK_RATES.reduce((best, item) =>
        Math.abs(item - rate) < Math.abs(best - rate) ? item : best,
    );

const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;
const SLUG_RE = /^[A-Za-z0-9_-]{1,150}$/;
// Ký tự điều khiển (trừ xuống dòng) và ký tự định hướng bidi dùng để giả mạo hiển thị.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS_RE = /[\u0000-\u0009\u000B-\u001F\u007F‪-‮⁦-⁩]/g;

export const isId = (value) => typeof value === "string" && ID_RE.test(value);
export const isSlug = (value) =>
    typeof value === "string" && SLUG_RE.test(value);
const isFiniteNumber = (value) =>
    typeof value === "number" && Number.isFinite(value);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Chuỗi người dùng nhập: bỏ ký tự điều khiển, gộp khoảng trắng thừa, cắt độ dài.
// Hiển thị luôn qua JSX (tự escape), không bao giờ dùng dangerouslySetInnerHTML.
export const cleanText = (value, max, { multiline = false } = {}) => {
    if (typeof value !== "string") return "";
    let text = value.replace(UNSAFE_CHARS_RE, "");
    text = multiline
        ? text.replace(/\n{3,}/g, "\n\n")
        : text.replace(/\s+/g, " ");
    return text.trim().slice(0, max);
};

const isTooLarge = (raw) => {
    try {
        return JSON.stringify(raw).length > MAX_PAYLOAD_CHARS;
    } catch {
        return true;
    }
};

const isPlainObject = (raw) =>
    raw !== null && typeof raw === "object" && !Array.isArray(raw);

const sanitizeHue = (value) =>
    isFiniteNumber(value) ? Math.round(clamp(value, 0, 359)) : 0;

// Bản tin trạng thái phát: { episode, currentTime, isPlaying, rate, sentAt } + thông tin host/phim.
export const sanitizeState = (raw) => {
    if (!isPlainObject(raw) || isTooLarge(raw)) return null;
    const {
        from,
        hostId,
        epoch,
        movieSlug,
        server,
        episode,
        currentTime,
        isPlaying,
        rate,
        allowAll,
        sentAt,
    } = raw;
    if (!isId(from) || !isId(hostId) || !isSlug(movieSlug)) return null;
    if (episode !== null && !isSlug(episode)) return null;
    if (!isFiniteNumber(currentTime) || !isFiniteNumber(sentAt)) return null;
    if (!isFiniteNumber(rate) || !PLAYBACK_RATES.includes(rate)) return null;
    if (!isFiniteNumber(epoch) || !isFiniteNumber(server)) return null;
    return {
        from,
        hostId,
        epoch: Math.max(0, Math.floor(epoch)),
        movieSlug,
        server: clamp(Math.floor(server), 0, 50),
        episode,
        currentTime: clamp(currentTime, 0, 24 * 3600),
        isPlaying: isPlaying === true,
        rate,
        allowAll: allowAll === true,
        sentAt,
        kind: raw.kind === "action" ? "action" : "heartbeat",
    };
};

export const sanitizeChat = (raw) => {
    if (!isPlainObject(raw) || isTooLarge(raw)) return null;
    const text = cleanText(raw.text, CHAT_MAX_LENGTH, { multiline: true });
    const nickname = cleanText(raw.nickname, NICKNAME_MAX);
    if (!isId(raw.id) || !isId(raw.from) || !text || !nickname) return null;
    return {
        id: raw.id,
        type: "chat",
        clientId: raw.from,
        nickname,
        hue: sanitizeHue(raw.hue),
        text,
        sentAt: isFiniteNumber(raw.sentAt) ? raw.sentAt : Date.now(),
    };
};

// Lệnh có người gửi + đích: request-state, host (chuyển quyền), kick.
export const sanitizeCommand = (raw) => {
    if (!isPlainObject(raw) || isTooLarge(raw) || !isId(raw.from)) return null;
    return {
        from: raw.from,
        target: isId(raw.target) ? raw.target : null,
        epoch: isFiniteNumber(raw.epoch) ? Math.floor(raw.epoch) : 0,
    };
};

export const sanitizeMember = (meta) => {
    if (!isPlainObject(meta) || !isId(meta.clientId)) return null;
    const nickname = cleanText(meta.nickname, NICKNAME_MAX);
    if (!nickname || !isFiniteNumber(meta.joinedAt)) return null;
    return {
        clientId: meta.clientId,
        nickname,
        hue: sanitizeHue(meta.hue),
        joinedAt: meta.joinedAt,
    };
};

// presenceState() của Supabase: { [key]: [meta, ...] }. Mỗi key lấy meta hợp lệ đầu tiên,
// key phải trùng clientId trong meta (chống một client khai thay người khác).
export const membersFromPresence = (presenceState) => {
    if (!isPlainObject(presenceState)) return [];
    const members = [];
    Object.entries(presenceState).forEach(([key, metas]) => {
        if (!Array.isArray(metas)) return;
        const member = metas
            .map(sanitizeMember)
            .find((item) => item && item.clientId === key);
        if (member) members.push(member);
    });
    return members.sort(compareSeniority);
};

// Vào sớm hơn đứng trước; trùng joinedAt thì so clientId để mọi máy ra cùng một thứ tự.
export const compareSeniority = (a, b) =>
    a.joinedAt - b.joinedAt || (a.clientId < b.clientId ? -1 : 1);

// Host mới = người vào phòng sớm nhất còn ở lại (bỏ qua id trong `exclude`).
export const pickHost = (members, exclude = []) => {
    const candidates = members.filter(
        (member) => !exclude.includes(member.clientId),
    );
    if (!candidates.length) return null;
    return [...candidates].sort(compareSeniority)[0].clientId;
};

// Hai client cùng nhận là host: epoch lớn hơn thắng; bằng nhau thì người vào phòng sớm hơn
// thắng (người mới vào chưa thấy ai nên tự nhận host sẽ không cướp được quyền của host thật);
// vẫn bằng nhau thì clientId nhỏ hơn. `members` dùng để tra joinedAt.
export const isNewerHost = (incoming, current, members = []) => {
    if (!current?.id) return true;
    if (incoming.epoch !== current.epoch) return incoming.epoch > current.epoch;
    const joinedAt = (id) =>
        members.find((member) => member.clientId === id)?.joinedAt ?? Infinity;
    const diff = joinedAt(incoming.id) - joinedAt(current.id);
    if (diff !== 0 && Number.isFinite(diff)) return diff < 0;
    return incoming.id < current.id;
};

// Vị trí lẽ ra đang phát theo bản tin, đã bù độ trễ mạng.
export const expectedTime = (state, now = Date.now()) => {
    if (!state.isPlaying) return state.currentTime;
    const latency = clamp((now - state.sentAt) / 1000, 0, MAX_LATENCY_S);
    return state.currentTime + latency * state.rate;
};

export const needsResync = (
    localTime,
    targetTime,
    threshold = DRIFT_THRESHOLD,
) => Math.abs(localTime - targetTime) > threshold;

export const canMemberControl = (clientId, { hostId, allowAll, members }) =>
    clientId === hostId ||
    (allowAll && members.some((member) => member.clientId === clientId));

// Giới hạn tần suất theo cửa sổ trượt: trả về true nếu còn được phép.
export const createRateLimiter = (limit, windowMs) => {
    let stamps = [];
    return (now = Date.now()) => {
        stamps = stamps.filter((stamp) => now - stamp < windowMs);
        if (stamps.length >= limit) return false;
        stamps.push(now);
        return true;
    };
};
