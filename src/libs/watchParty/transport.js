// Lớp truyền tin của phòng xem chung. Hai bản cài đặt cùng một interface:
//
//   createTransport({ roomId, profile, onEvent(event, payload), onMembers(list), onStatus(status) })
//     → Promise<{ name, settleMs, send(event, payload), leave() }>
//
// - profile: { clientId, nickname, hue, joinedAt } của máy này.
// - onMembers: danh sách đầy đủ (gồm cả mình), đã sanitize, xếp theo thứ tự vào phòng.
// - onStatus: "online" | "offline"; mỗi lần "online" lại, hook sẽ resync.
//
// Mặc định P2P (Trystero, không cần cấu hình). Có VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
// thì dùng Supabase Realtime. Cả hai được import động để không vào bundle chính.

export const TRANSPORT_NAME =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
        ? "supabase"
        : "p2p";

export const createTransport = async (options) => {
    const module =
        TRANSPORT_NAME === "supabase"
            ? await import("./transportSupabase")
            : await import("./transportP2P");
    return module.default(options);
};
