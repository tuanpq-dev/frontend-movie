# Xem chung (Watch Party)

Xem phim cùng lúc với bạn bè: đồng bộ play/pause/seek/tốc độ/tập, chat, danh sách người xem.
Không có server riêng, không cần đăng ký dịch vụ.

## 1. Kênh truyền tin

| | P2P, mặc định | Supabase, tùy chọn |
|---|---|---|
| Thư viện | `trystero` (WebRTC) | `@supabase/supabase-js` (Broadcast + Presence) |
| Cấu hình | Không cần | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Cách chạy | Relay Nostr công cộng chỉ giúp các trình duyệt tìm thấy nhau. Lệnh và chat đi thẳng giữa các máy, có mã hóa (DTLS) | Mọi tin đi qua server Supabase |
| Mạng khó (4G, wifi công ty, NAT đối xứng) | Có thể không nối được (không có TURN server) | Chạy được |
| Thời gian thấy nhau | Vài giây (test: ~2,5 giây) | ~1 giây |

`libs/watchParty/transport.js` tự chọn: có đủ 2 biến Supabase thì dùng Supabase, không thì dùng P2P.
Cả hai được import động, chỉ tải khi vào phòng.

Id phòng là chuỗi ngẫu nhiên (`nanoid`), không dùng IP. Trình duyệt không tự biết IP của mình, và nhiều máy chung một mạng có cùng IP public.

### Bật Supabase (không bắt buộc)

1. https://supabase.com → New project (gói Free). Không cần tạo bảng.
2. **Project Settings → API Keys**: `Project URL` → `VITE_SUPABASE_URL`; `anon`/`publishable` key → `VITE_SUPABASE_ANON_KEY`. **Không dùng `service_role`/`secret` key.**
3. Nếu **Realtime → Settings** đang chỉ cho kênh private, bật lại public access.
4. Thêm 2 biến vào `.env.development` (xem `.env.example`) rồi khởi động lại `npm run dev`.

## 2. Test thủ công bằng 2 tab

1. `npm run dev`, mở một phim, vào `/xem/:slug`, bấm **Xem chung**, nhập biệt danh → **Vào phòng**.
   Khoảng 5 giây sau (P2P), chat báo "Bạn là host".
2. Bấm **Sao chép link mời**, dán vào **tab mới**, cửa sổ ẩn danh hoặc máy khác.
   Không dùng "Nhân bản tab": Chrome sao chép cả sessionStorage nên hai tab trùng `clientId`.
3. Kiểm tra:
   - Tab Người xem: thấy 2 người, tab đầu có nhãn Host.
   - Host play/pause/tua/đổi tốc độ → tab kia làm theo. Badge chuyển "Đang bắt kịp..." rồi "Đã đồng bộ".
   - Khách tự bấm pause → video quay lại trạng thái host, hiện "Chỉ host được điều khiển video".
   - Host bật **Cho phép mọi người điều khiển** → khách điều khiển được.
   - Host chọn tập khác → khách chuyển theo; URL cập nhật `?tap=`.
   - Chat hai chiều. Gửi quá 5 tin trong 10 giây thì bị chặn. `<img src=x onerror=alert(1)>` hiển thị nguyên văn.
   - Vương miện cạnh tên khách → chuyển host. Đóng tab host → khách tự thành host.
   - Host bấm "Mời ra" → tab kia hiện màn hình bị mời ra.
   - Người vào muộn (host đã phát một lúc) nhảy đúng vị trí đang phát.
   - DevTools → Network → Offline vài giây rồi bật lại → "Mất kết nối" → "Đã kết nối lại".

Các kịch bản trên (trừ offline và đổi tập) đã chạy tự động bằng 2 Chrome headless trên bản build P2P: 19/19 pass.

## 3. Cách hoạt động

| Sự kiện | Ai gửi | Nội dung |
|---|---|---|
| `state` | Host (mỗi 4 giây, mỗi thao tác, khi có người mới, trả lời `request-state`); người khác chỉ khi host bật "mọi người điều khiển" | `{ movieSlug, server, episode, currentTime, isPlaying, rate, allowAll, hostId, epoch, from, sentAt, kind }` |
| `request-state` | Người mới vào / vừa nối lại | `{ from }` |
| `host` | Host | `{ from, target, epoch }`: chuyển quyền |
| `kick` | Host | `{ from, target }` |
| `chat` | Mọi người | `{ id, from, nickname, hue, text, sentAt }` |

Danh sách người xem: `{ clientId, nickname, hue, joinedAt }`. Supabase lấy qua Presence; P2P lấy qua bản tin `hello` trao đổi khi hai máy nối được với nhau. Với P2P, `from` của mọi bản tin phải khớp người đã chào trên đúng kết nối đó.

- **Bù trễ:** `expected = currentTime + clamp(now - sentAt, 0, 5s) × rate` nếu đang phát; lệch > 1,5 giây thì seek.
- **Chống vòng lặp:** khi áp dụng lệnh từ xa, player bật cờ `isRemoteUpdate` (700 ms) và ghi nhớ vị trí seek đang chờ, nên các sự kiện `play/pause/seeked/ratechange` sinh ra không bị gửi ngược.
- **Chọn host:** mỗi máy giữ `(hostId, epoch)`.
  - Chưa có ai trả lời sau thời gian chờ (Supabase 1,5 giây, P2P 5 giây): chọn người vào sớm nhất.
  - Host rời: mọi máy cùng chọn người vào sớm nhất còn lại, `epoch + 1`.
  - Chuyển host: `epoch + 1`.
  - Hai bên cùng nhận là host: `epoch` lớn hơn thắng. Bằng nhau thì **người vào phòng trước** thắng, nên người mới vào chưa kịp nối P2P mà tự nhận host cũng không cướp được quyền.
- **Phòng tự biến mất:** không lưu gì ở đâu cả; người cuối rời là phòng hết tồn tại.

## 4. Giới hạn

- **Bảo mật chỉ ở client.** Không có backend nên quyền host chỉ được kiểm tra trong trình duyệt.
  - Đã giảm thiểu: mọi lệnh gắn `from`/`hostId`/`epoch`; bỏ qua lệnh của người không phải host khi ở chế độ host-only; validate mọi payload (kiểu, độ dài, ≤ 2000 ký tự); chat cắt 300 ký tự, bỏ ký tự điều khiển/bidi, rate limit gửi và nhận, hiển thị qua JSX (tự escape).
  - Vẫn có thể bị giả mạo: một client sửa code có thể tự xưng `clientId` của host.
  - Ai có link mời đều vào được phòng. Không có dữ liệu nhạy cảm trên kênh.
- **Kick mềm:** chỉ tab bị mời ra tự rời phòng và ghi nhớ trong sessionStorage. Người đó vẫn vào lại được bằng cửa sổ mới.
- **P2P:**
  - Phụ thuộc relay Nostr công cộng để tìm nhau.
  - Mạng chặn WebRTC thì không nối được. Khi đó dùng Supabase, hoặc thêm TURN server qua `turnConfig` trong `transportP2P.js`.
  - Mỗi người nối với mọi người (mesh), hợp với phòng nhỏ (≤ ~10 người).
- **Player iframe (`link_embed`)** của bên thứ ba không điều khiển được. Tập chỉ có embed (hoặc hls.js lỗi) thì phòng chỉ đồng bộ phim/tập, không đồng bộ giây.
- **Đồng hồ lệch giữa các máy:** bù trễ dựa trên `Date.now()` của bên gửi, chặn tối đa 5 giây. Sai số còn lại được heartbeat sửa trong ≤ 4 giây.
- **Autoplay:** nếu trình duyệt chặn tự phát, hiện nút "Nhấn để phát cùng phòng".
- **Host F5** = rời rồi vào lại: quyền host chuyển cho người vào sớm nhất còn lại.
- **Gói Free Supabase** (nếu bật; kiểm tra lại trang pricing): giới hạn kết nối đồng thời (~200), tin nhắn/tháng (~2 triệu), project bị tạm dừng khi lâu không dùng.

## 5. Gợi ý cải tiến

- Reaction nổi (emoji bay trên video): thêm sự kiện `reaction` vào `ROOM_EVENTS`.
- Voice chat: với P2P, Trystero có sẵn `room.addStream`. Với Supabase, dùng kênh làm signaling WebRTC.
- Hàng đợi phim: `queue` do host quản lý, tự chuyển khi `ended`.
- Bảo mật chặt hơn: Supabase Anonymous Auth + kênh private với RLS trên `realtime.messages`, lưu `host_id` của phòng trong bảng. Với P2P, dùng `password` của Trystero (chia sẻ trong link mời) để người ngoài không vào được phòng.
- Đo độ trễ thật (Trystero có `room.ping`) để bù trễ chính xác hơn.
