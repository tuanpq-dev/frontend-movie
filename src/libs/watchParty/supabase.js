import { createClient } from "@supabase/supabase-js";

// Chỉ dùng anon key (công khai). Không bao giờ đặt service_role key ở frontend.
// Watch party chỉ cần Realtime (Broadcast + Presence), không đọc/ghi bảng nào.
let client = null;

export const getRealtimeClient = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    if (!client) {
        client = createClient(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
            realtime: { params: { eventsPerSecond: 10 } },
        });
    }
    return client;
};
