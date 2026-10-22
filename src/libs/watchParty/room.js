import { customAlphabet, nanoid } from "nanoid";
import { NICKNAME_MAX, cleanText, isId } from "./protocol";

// Nhẹ, không kéo thư viện realtime vào bundle: trang Watch chỉ cần file này để tạo phòng.

const roomIdAlphabet = customAlphabet("0123456789abcdefghijkmnpqrstuvwxyz", 10);
export const createRoomId = () => roomIdAlphabet();
export const createMessageId = () => nanoid(12);

export const buildRoomPath = (roomId, { movieSlug, server, episode } = {}) => {
    const query = new URLSearchParams();
    if (movieSlug) query.set("phim", movieSlug);
    if (server) query.set("sv", String(server));
    if (episode) query.set("tap", episode);
    const search = query.toString();
    return `/watch-party/${roomId}${search ? `?${search}` : ""}`;
};

const NICKNAME_KEY = "watchParty:nickname";
const HUE_KEY = "watchParty:hue";
const CLIENT_KEY = "watchParty:clientId";

// storage là "localStorage" | "sessionStorage"; truy cập bên trong try vì
// chỉ đọc biến window.localStorage cũng có thể ném lỗi khi trình duyệt chặn.
const readStorage = (storage, key) => {
    try {
        return window[storage].getItem(key);
    } catch {
        return null;
    }
};
const writeStorage = (storage, key, value) => {
    try {
        window[storage].setItem(key, value);
    } catch {
        // Chế độ ẩn danh/chặn storage: vẫn dùng được trong phiên hiện tại.
    }
};

// clientId lưu theo tab (sessionStorage) để hai tab cùng trình duyệt là hai người khác nhau,
// F5 vẫn giữ id cũ. Nickname + màu lưu localStorage để lần sau không phải nhập lại.
export const loadIdentity = () => {
    let clientId = readStorage("sessionStorage", CLIENT_KEY);
    if (!isId(clientId)) {
        clientId = nanoid(16);
        writeStorage("sessionStorage", CLIENT_KEY, clientId);
    }
    const storedHue = readStorage("localStorage", HUE_KEY);
    let hue = Number(storedHue);
    if (storedHue === null || !Number.isInteger(hue) || hue < 0 || hue > 359) {
        hue = Math.floor(Math.random() * 360);
        writeStorage("localStorage", HUE_KEY, String(hue));
    }
    const nickname = cleanText(
        readStorage("localStorage", NICKNAME_KEY) || "",
        NICKNAME_MAX,
    );
    return { clientId, hue, nickname };
};

export const saveNickname = (nickname) => {
    writeStorage("localStorage", NICKNAME_KEY, nickname);
};

// "Kick mềm": chỉ ghi nhớ ở tab bị mời ra, không có server để chặn thật.
const kickedKey = (roomId) => `watchParty:kicked:${roomId}`;
export const markKicked = (roomId) =>
    writeStorage("sessionStorage", kickedKey(roomId), "1");
export const wasKicked = (roomId) =>
    readStorage("sessionStorage", kickedKey(roomId)) === "1";
