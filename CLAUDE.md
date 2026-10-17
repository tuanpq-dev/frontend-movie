# CLAUDE.md — frontend-movie

Web xem phim (KLTN). React 18 + Vite 5 + Tailwind 3. Trang admin dùng Ant Design 5. UI người xem đang được làm lại theo phong cách **RoPhim** (rophim1.vip/phimhay).

**Phạm vi người xem:** chỉ xem, lọc, tìm kiếm phim. Nguồn phim là **KKPhim** (`phimapi.com`). Phía người xem **không có** đăng nhập, yêu thích, bình luận, thanh toán. Backend riêng (`VITE_API_URL`) chỉ còn phục vụ admin và `/sign-in` cho admin.

## Quy tắc bắt buộc

1. **Không tạo token mới, không viết mã màu hex cứng** trong UI người xem. Dùng token có sẵn ở [tailwind.config.js](tailwind.config.js), xem bảng bên dưới. Chỉ thêm token khi thật sự chưa có mức tương đương, và phải cập nhật bảng trong file này.
2. **Không viết lại component, hook hay helper đã có.** Trước khi tạo mới, tra mục "Có sẵn" bên dưới, rồi mở rộng bằng props/variant thay vì tạo bản sao.
3. Dữ liệu phim: gọi qua hook `useKK*` trong `src/hooks/useMovieData.js` (có cache), các hook này dùng `kkGet` trong `libs/kkphim.js`. Mọi item đều đi qua `normalizeKKMovie`, nên component chỉ đọc shape đã chuẩn hóa. **Không dùng `apiClient` để gọi KKPhim** (nó gắn token đăng nhập vào header, sẽ lộ token cho bên thứ ba). `apiClient` chỉ dùng cho backend riêng (admin). Không gọi `axios`/`fetch` trực tiếp trong component.
4. Import bằng alias: `@/`, `@components/`, `@pages/`, `@libs/`, `@context/` (khai báo ở [vite.config.js](vite.config.js)).
5. Giữ kiểu xuống dòng (CRLF/LF) của file đang sửa. Code format theo Prettier, thụt 4 space.
6. Breakpoint desktop của header/layout là `min-[1025px]:`, giữ nhất quán.
7. **Hiệu năng** (đã từng là lỗi, đừng làm ngược lại):
   - Poster luôn hiển thị qua `PosterImage`, **không** dùng `<img src={movie.posterUrl}>` trực tiếp, vì ảnh gốc 200–800 KB.
   - Không thêm `backdrop-blur` lên vùng lớn hoặc phần tử sticky (gây giật khi cuộn và khi slide chạy).
   - `html` đang có `scroll-behavior: smooth`, nên muốn nhảy ngay phải dùng `behavior: "instant"` (`"auto"` vẫn cuộn mượt).
   - Section dưới màn hình thì tải lười bằng `useInView`.
   - Danh sách có phân trang/lọc thì dùng `keepPreviousData` thay vì hiện lại skeleton.

## Design tokens (Tailwind)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `surface` | `#191B24` | Nền trang, header, gradient phủ banner (`from-surface/90`) |
| `surface-top` | `#202331` | Drawer menu mobile, nền banner, panel nổi |
| `surface-2` | `#282B3A` | Card, dropdown, panel, khung bình luận |
| `surface-3` | `#2F3346` | Hover nền, skeleton, nút phụ |
| `surface-4` / `surface-5` | `#3E435C` / `#535D8E` | Hover của `surface-3`, viền nhấn |
| `surface-footer` | `#0F111A` | Footer |
| `primary` | `#FFD875` | Màu nhấn duy nhất (nút chính, link active, icon, tiêu đề hover) |
| `primary-hover` | `#FFDE8A` | Hover của `primary` |
| `primary-ink` | `#191B24` | Chữ trên nền `primary` hoặc nền trắng |
| `accent` | `#1667CF` | Badge tập/lồng tiếng trên card (xanh RoPhim) |
| `muted` | `#AAAAAA` | Chữ phụ (năm, thời lượng, meta, tên gốc) |
| `line` | `rgb(255 255 255 / .06)` | Viền mảnh |
| `font-sans` | Inter | Font mặc định (Google Fonts nạp trong [index.html](index.html)) |

- Trong CSS thuần dùng `theme("colors.surface.DEFAULT")`, ví dụ [carousel.css](src/components/FeatureMovies/carousel.css).
- Class tiện ích global ở [src/index.css](src/index.css): `.page-surface`, `.media-section`, `.card-hover`, `.skeleton-shimmer`, `.container`.
- Màu nhấn được giữ cố ý (không đổi sang token): màu like/reply/xóa trong `Comments/Comment.jsx` (component này hiện không dùng).

## Có sẵn — tái sử dụng, không viết lại

**Route người xem** ([src/main.jsx](src/main.jsx), layout `pages/Root.jsx`)

| Route | Trang | Ghi chú |
|---|---|---|
| `/` | `HomePage` | Banner (8 phim mới nhất v3) + các section (`HOME_SECTIONS`) |
| `/phim/:slug` | `MovieDetail` | Thông tin, tập, trailer, phim liên quan (cùng thể loại đầu tiên) |
| `/xem/:slug?sv=&tap=` | `Watch` | `sv` = chỉ số server, `tap` = slug tập; hls.js, lỗi thì chuyển sang iframe `embed` |
| `/danh-sach/:slug` | `Catalog kind="list"` | `slug` thuộc `LIST_TYPES` |
| `/the-loai/:slug`, `/quoc-gia/:slug`, `/nam/:slug` | `Catalog kind="category" / "country" / "year"` | Bộ lọc tương ứng bị khóa (ẩn) |
| `/tim-kiem?keyword=` | `Catalog kind="search"` | |

Bộ lọc và phân trang của `Catalog` nằm trên URL: `?category=&country=&year=&sort_lang=&sort_field=&page=`. Muốn thêm trang danh sách mới thì thêm `kind` vào `KIND_CONFIG` trong [Catalog.jsx](src/pages/Catalog.jsx), **không tạo trang mới**.

**Layout / điều hướng**
- `pages/Root.jsx`: Header, Outlet, Footer, ScrollToTop.
- `components/Header.jsx`: header sticky + drawer mobile. Gồm dropdown `NavDropdown` (Thể loại / Quốc gia lấy từ API) và `NAV_LINKS`. Thêm mục menu thì sửa `NAV_LINKS`.
- `components/HeaderSearch.jsx`: ô tìm kiếm có gợi ý 6 phim (debounce 350ms); Enter hoặc "Xem tất cả" chuyển sang `/tim-kiem`. Props `className`, `onNavigate`.
- `components/ScrollToTop.jsx`, `components/Footer.jsx`.
- `AdminRouter.jsx` + `shared/constants/Permission.js`: bảo vệ route admin, trang `/403`.

**Hiển thị phim** (tất cả nhận movie đã normalize)
- `components/FeatureMovies/` (`index.jsx` + `Movie.jsx`): banner slider dùng `react-multi-carousel`, tự chạy 4 giây. Props `movies`, `loading`.
- `components/MediaList/index.jsx`: `MediaList({ movies, title, viewAllTo })` là section có tiêu đề + link "Xem tất cả"; `MovieGrid({ movies })` là lưới card 2→6 cột (export riêng, dùng ở Catalog).
- `components/MediaList/MovieCard.jsx`: `MovieCard({ movie })` kiểu RoPhim: poster 2:3, badge chất lượng, badge `lang`/`episodeCurrent` ở cạnh dưới, tên Việt + tên gốc.
- `components/EpisodeList.jsx`: `EpisodeList({ movie, activeServer, activeEpisode })` gồm tab server + lưới tập, link sang `/xem`.
- `components/MovieFilter.jsx`: `MovieFilter({ values, onChange(key, value), hidden })` là 5 select (thể loại, quốc gia, năm, ngôn ngữ, sắp xếp).
- `components/Pagination.jsx`: `Pagination({ currentPage, totalPages, onChange })`.
- `components/CircularProgressBar.jsx`: vòng điểm (dùng cho `tmdb.vote_average`).
- `components/PosterImage.jsx`: `PosterImage({ src, alt, widths=[240,360,480], sizes, className, loading })` resize qua proxy, có `srcSet`, lỗi thì quay về ảnh gốc.

**Trạng thái / modal**
- `components/Skeleton.jsx`: `RouteFallback`, `HeroSkeleton`, `MovieGridSkeleton({title,count})`, `DetailSkeleton`, `TableSkeleton`.
- `components/Toast/Toast.jsx`: `toast()`, `showSuccessToast()`, `showErrorToast()`.
- `context/ModalProvider.jsx`: `useModalContext().handlePlayTrailer(youtubeKey)` mở modal trailer. Key lấy từ `movie.trailerKey`.
- `context/UserContext.jsx`: `useUserContext()` (chỉ admin còn dùng).

**Dữ liệu**
- `libs/kkphim.js`:
  - Kết nối: `KK_API_URL`, `KK_IMAGE_CDN`, `KK_PAGE_SIZE` (24), `kkGet(pathWithQuery)`, `buildKKPath(path, params)` (bỏ tham số rỗng).
  - Ảnh: `getKKImageUrl`, `getResizedImageUrl(url, width)` (proxy `IMAGE_PROXY` = `https://i0.wp.com/`).
  - Chuẩn hóa: `getYoutubeKey`, `normalizeKKMovie`, `normalizeKKList`, `normalizeKKDetail`, `normalizeKKTaxonomy`.
  - Hằng số: `MOVIE_TYPE_LABEL`, `LIST_TYPES`, `SORT_LANG_OPTIONS`, `SORT_FIELD_OPTIONS`.
- `hooks/useMovieData.js`:
  - `useKKList(path, params, options)` trả `{ items, title, pagination{currentPage,totalPages,totalItems} }`.
  - `useKKNewest(page)`, `useKKSearch(keyword, params)`, `useKKMovie(slug)` (trả movie kèm `servers`).
  - `useKKCategories()`, `useKKCountries()`, `useKKYears()` trả `[{name, slug}]`, cache 1 giờ.
  - `useGenres` là hook của backend, chỉ admin dùng.
  - Mọi hook trả `{ data, loading, fetching, error }`.
- `hooks/useCachedResource.js` + `libs/requestCache.js` (`invalidateCache(prefix)`, `clearRequestCache`). Cache key của KKPhim có dạng `kk:<path?query>`.
  - Hook không bao giờ trả dữ liệu hay lỗi của key cũ khi key đổi.
  - Option `keepPreviousData: true` giữ dữ liệu cũ trong lúc tải; khi đó hook trả thêm `isPreviousData` để làm mờ nội dung (đang dùng ở Catalog).
- `hooks/useInView.js`: `const [ref, inView] = useInView({ rootMargin })`, khi đã vào viewport thì giữ `true` (dùng cho `HomeSection`).
- `libs/apiClient.js`, `libs/config.js`: chỉ dùng cho backend riêng/admin.
- Admin: `@crema/core/DataTable`, `@crema/core/Form/*`, `@crema/hook/useCallApi`, `shared/utils/*`.

**Shape movie sau `normalizeKKMovie`**: `_id, slug, name (tên Việt), originName (tên gốc), posterUrl, thumbUrl (URL đầy đủ), year, time, type, typeLabel, quality, lang, episodeCurrent, episodeTotal, status, content (đã bỏ HTML), trailerKey, actors[], directors[], categories[{name,slug}], countries[{name,slug}], voteAverage, view, isCinema`. `normalizeKKDetail` thêm `servers[{ name, episodes[{ name, slug, m3u8, embed }] }]`.

## API KKPhim (nguồn phim — đã tích hợp)

Tài liệu: https://kkphim.com/api-document. **Base URL `https://phimapi.com`**, tất cả là `GET`, trả JSON, không cần key. Đã gọi thử thật ngày 2026-10-17.

**Bộ lọc chung `?F`** (dùng cho mọi endpoint `/v1/api/...` dạng danh sách): `page` (mặc định 1), `limit` (mặc định 10, tối đa 64), `category` (slug thể loại), `country` (slug quốc gia), `year` (`2024` hoặc khoảng `2014,2024`), `sort_field` (`modified.time` | `_id` | `year`), `sort_type` (`desc` | `asc`), `sort_lang` (`vietsub` | `thuyet-minh` | `long-tieng`).

### Danh sách / mới cập nhật
| Endpoint | Ghi chú |
|---|---|
| `/danh-sach/phim-moi-cap-nhat?page=` | Item tối giản. Trả `items`, `pathImage`, `pagination{totalItems,totalItemsPerPage,currentPage,totalPages}` |
| `/danh-sach/phim-moi-cap-nhat-v2?page=` | Như trên, thêm `tmdb`, `imdb`, `episode_current` |
| `/danh-sach/phim-moi-cap-nhat-v3?page=` | Đầy đủ nhất: thêm `type`, `time`, `quality`, `lang`, `sub_docquyen`, `category[]`, `country[]`. **Ưu tiên dùng bản này** |
| `/v1/api/home?page=` | Phim hiển thị trang chủ KKPhim trong ngày |
| `/v1/api/danh-sach?F` | Phim mới, có lọc |
| `/v1/api/danh-sach/{type}?F` | `type`: `phim-le` \| `phim-bo` \| `hoat-hinh` \| `tv-shows` \| `phim-chieu-rap` \| `phim-vietsub` \| `phim-thuyet-minh` \| `phim-long-tieng` (đã thử, đều chạy). Bản cũ `/danh-sach/{type}?page=` cũng có |

### Chi tiết phim
| Endpoint | Ghi chú |
|---|---|
| `/phim/{slug}` | Trả `{ movie, episodes }`. Ảnh là URL đầy đủ |
| `/phim/id/{_id}` | Như trên, tra theo `_id` (khớp route `/info/:id`, `/watch/:id` hiện tại) |
| `/tmdb/{movie\|tv}/{tmdbId}`, `/imdb/title/{imdbId}` | Như trên, tra theo id TMDB/IMDB |
| `/v1/api/phim/{slug}` | Trả `data.item` với `episodes` nằm trong item; ảnh là đường dẫn tương đối |
| `/v1/api/phim/{slug}/images` | Backdrop/poster từ TMDB (`image_sizes`, `images[]`) |
| `/v1/api/phim/{slug}/peoples` | Diễn viên/đạo diễn từ TMDB (`profile_sizes`, `peoples[]`) |
| `/v1/api/phim/{slug}/keywords` | Từ khóa TMDB |

Trường của `movie`: `_id, name, slug, origin_name, content, type (single|series|hoathinh|tvshows), status (ongoing|completed|trailer), thumb_url, poster_url, trailer_url, time, episode_current, episode_total, quality, lang, year, view, actor[], director[], category[{id,name,slug}], country[{id,name,slug}], tmdb{id,type,vote_average,vote_count}, imdb{id}, chieurap, sub_docquyen, showtimes, notify`.

`episodes[]`: `{ server_name (vd "Vietsub", "Thuyết Minh"), server_data: [{ name, slug, filename, link_embed, link_m3u8 }] }`.

### Phân loại / tìm kiếm
| Endpoint | Ghi chú |
|---|---|
| `/the-loai` | `data.items[{_id,name,slug}]` |
| `/v1/api/the-loai/{slug}?F` | Phim theo thể loại |
| `/quoc-gia` | `data.items[{_id,name,slug}]` |
| `/v1/api/quoc-gia/{slug}?F` | Phim theo quốc gia |
| `/nam-phat-hanh` | `data.items[{year}]`, từ năm nay về 1911 |
| `/v1/api/nam/{year}?F` | Phim theo năm |
| `/v1/api/tim-kiem?keyword=&F` | Tìm theo tên Việt và tên gốc |

Response của `/v1/api/...` dạng danh sách: `data.items`, `data.params.pagination{totalItems,totalItemsPerPage,currentPage,totalPages}`, `data.titlePage`, `data.seoOnPage`, `data.APP_DOMAIN_CDN_IMAGE` (`https://phimimg.com`).

### Ảnh & video
- **Ảnh**: `thumb_url` là ảnh **ngang** (thường 780×439, khoảng 60 KB), `poster_url` là ảnh **dọc** và rất lớn (1440×2160 trở lên, tới 800 KB). `wsrv.nl` chặn domain phimimg; `phimapi.com/image.php` trả 404; `i0.wp.com` hoạt động (đã chọn dùng). `/v1/api/*` trả đường dẫn tương đối (`uploads/movies/...webp`), cần ghép thành `https://phimimg.com/` + path. `/phim/*` và `phim-moi-cap-nhat-v2/v3` trả URL đầy đủ. Viết **một** helper chuẩn hóa: nếu bắt đầu bằng `http` thì giữ nguyên, ngược lại ghép CDN.
- **Video**: `link_m3u8` phát trực tiếp bằng `hls.js` (đã có trong `pages/Watch.jsx`). `link_embed` là player iframe dự phòng.
- **TMDB**: `https://image.tmdb.org/t/p/{size}/...`. Backdrop: `w300|w780|w1280|original`; poster: `w92…w780|original`; profile: `w45|w185|h632|original`.

### Khác biệt so với backend hiện tại (cần lớp chuyển đổi)
| Backend riêng (`/api/movies`) | KKPhim |
|---|---|
| `originName` | `origin_name` (tên gốc); `name` là tên tiếng Việt |
| `posterUrl`, `thumbUrl` (tên file / URL) | `poster_url`, `thumb_url` |
| `genres[{nameGenre}]` | `category[{name, slug}]` |
| `type: single \| series` | thêm `hoathinh`, `tvshows` |
| `episodes[{video}]` một server | `episodes[server].server_data[{name, link_m3u8}]` nhiều server |
| `trailer` là key YouTube | `trailer_url` là URL YouTube đầy đủ (cần tách `v=`) |

Đã thực hiện: `normalizeKKMovie()` trong `libs/kkphim.js`, hook trong `hooks/useMovieData.js`. CORS của `phimapi.com` và các stream m3u8 đều trả `Access-Control-Allow-Origin: *` (đã kiểm tra), nên gọi thẳng từ trình duyệt được.

## Ghép API với chức năng

| Chức năng | Trang/component hiện có | API KKPhim | Ghi chú |
|---|---|---|---|
| Banner slider trang chủ | `FeatureMovies` | `/danh-sach/phim-moi-cap-nhat-v3?page=1` (lấy ~8 phim) | Dùng `thumb_url` làm nền, `poster_url` cho dải thumbnail |
| Section "Phim lẻ / Phim bộ / Hoạt hình" | `HomePage` → `MediaList` | `/v1/api/danh-sach/{phim-le\|phim-bo\|hoat-hinh}?limit=12` | Mỗi section một request, bỏ việc lọc ở client |
| Section theo quốc gia (Hàn, Trung, Âu Mỹ…) | `MediaList` | `/v1/api/quoc-gia/{han-quoc\|trung-quoc\|au-my}?limit=12` | Lộ trình bước 4 |
| Section "Chủ đề" | (chưa làm) | `/the-loai` + `/v1/api/the-loai/{slug}` | Lộ trình bước 4 |
| Phim chiếu rạp | `MediaList` | `/v1/api/danh-sach/phim-chieu-rap?limit=12` | |
| Badge PĐ/LT/tập trên card | `MovieCard` | Trường `lang`, `episode_current`, `quality` (có ở v3 và v1) | Lộ trình bước 2 |
| Trang Phim lẻ / Phim bộ / Hoạt hình | `Catalog kind="list"` | `/v1/api/danh-sach/{type}?page=&F` | Thêm phân trang theo `pagination` |
| Menu Thể loại / Quốc gia / Năm | `Header` (`NavDropdown`) | `/the-loai`, `/quoc-gia`, `/nam-phat-hanh` | Cache dài (`staleTime` lớn) |
| Trang lọc theo thể loại/quốc gia/năm | `Catalog kind="category/country/year"` | `/v1/api/the-loai/{slug}`, `/quoc-gia/{slug}`, `/nam/{year}` + `?F` | |
| Ô tìm kiếm gợi ý | `HeaderSearch` | `/v1/api/tim-kiem?keyword=&limit=6` | Giữ debounce 350ms |
| Trang tìm kiếm | `Catalog kind="search"` | `/v1/api/tim-kiem?keyword=&page=&F` | |
| Chi tiết phim | `MovieDetail` (`/phim/:slug`) | `/phim/id/{id}` hoặc `/phim/{slug}` | Diễn viên lấy từ `actor[]` hoặc `/v1/api/phim/{slug}/peoples` (có ảnh) |
| Điểm đánh giá | `CircularProgressBar` | `tmdb.vote_average` | |
| Trailer | `ModalProvider.handlePlayTrailer` | `trailer_url` (tách key YouTube) | |
| Xem phim / chọn tập / chọn server | `Watch` (`/xem/:slug`) | `episodes[].server_data[].link_m3u8` (dự phòng `link_embed`) | Thêm tab server (Vietsub/Thuyết minh) |
| Ảnh backdrop chất lượng cao | `MovieDetail`, `FeatureMovies` | `/v1/api/phim/{slug}/images` | Tùy chọn |
| Phim liên quan | `MovieDetail` | `/v1/api/the-loai/{category[0].slug}?limit=12` | |

**Đã bỏ khỏi phía người xem** (theo yêu cầu: chỉ xem/lọc/tìm): đăng nhập, yêu thích, bình luận, thanh toán VNPay. **Top 10 theo lượt xem**: KKPhim không sắp xếp theo `view` được, nên chưa làm.

## Nợ kỹ thuật đã biết (sửa khi đụng tới, đừng nhân bản thêm)

- **File không còn dùng ở phía người xem** (chưa xóa vì có thể cần lại): `components/AuthModal.jsx`, `components/Comments/`, `components/PaymentModal.jsx`, `components/ChangePasswordModal.jsx`, `libs/api.js`, `pages/UserProfile.jsx`, `pages/VNPayReturn.jsx` (route `/profile`, `/VnPayReturn` vẫn còn trong router), `pages/SignUp.jsx`. `pages/SignIn.jsx` vẫn cần để admin đăng nhập.
- Chưa đổi sang token: SignIn, SignUp, UserProfile, ChangePasswordModal (bộ màu teal `#384d6c`/`#77dae6`), PaymentModal (nền sáng), Toast, Spinner, Admin.
- File thừa: `pages/Admin/Movie/ManageMovie.jsx` (router dùng `ManageMovie2`), `pages/SchoolWarehouse/...`. `libs/constants.js` (`TABS`, `MEDIA_TABS`) trỏ API ngoài cũ, hiện không dùng.
- Admin vẫn quản lý phim của backend riêng, không liên quan đến dữ liệu KKPhim đang hiển thị.

## Nhật ký thay đổi UI

- **2026-10-17, bước 1 (token):** thêm bảng màu RoPhim + font Inter vào Tailwind. Thay mã hex trong 18 file người xem (Root, Header*, HeaderSearch, FeatureMovies, MediaList, MovieCard, Footer, AuthModal, Comments, Skeleton, ScrollToTop, ModalProvider, MovieDetail, Watch, index.css, carousel.css). Tập đang chọn ở Watch đổi từ xanh lá sang `primary`.
- **2026-10-17, tích hợp KKPhim:**
  - Thêm `libs/kkphim.js`, các hook `useKK*`, trang `Catalog`, các component `MovieFilter`, `Pagination`, `EpisodeList`.
  - Viết lại `HomePage`, `MovieDetail`, `Watch`, `Header` (bỏ nút Thành viên/AuthModal, thêm dropdown Thể loại/Quốc gia), `HeaderSearch`, `MovieCard` (kiểu RoPhim), `MediaList`.
  - Đổi route: `/info/:id` → `/phim/:slug`, `/watch/:id` → `/xem/:slug`, `/movie|/tv|/cartoon` → `/danh-sach/:slug`, `/search` → `/tim-kiem`. Bỏ `/favorite`.
  - Xóa `SingleMovie`, `TVSeries`, `CartoonMovie`, `SearchPage`, `FavoriteList`, `HeaderLogined`.
- **2026-10-17, tối ưu hiệu năng:**
  - Poster resize qua i0.wp.com bằng `PosterImage`: một section 12 phim giảm từ 2,8 MB xuống 517 KB.
  - Sửa `useCachedResource` hiện nhầm phim cũ khi chuyển trang.
  - Catalog giữ kết quả cũ (làm mờ) khi đổi trang/lọc.
  - Section trang chủ tải lười: từ 8 request lúc vào trang xuống còn khoảng 3.
  - Banner chỉ ưu tiên ảnh đầu; bỏ blur ở banner và header; ScrollToTop nhảy ngay thay vì cuộn mượt từ cuối trang; Watch tự cuộn lên player khi đổi tập.
  - Bỏ font weight 800 không dùng; thêm preconnect tới phimapi/phimimg.
- Trước đó (chưa commit): modal trailer chuyển từ `react-youtube` sang iframe; thêm ScrollToTop; HeaderSearch có dropdown gợi ý.

## Lộ trình theo RoPhim (chưa làm)

2. ~~MovieCard kiểu RoPhim~~ (xong). Còn lại: section trang chủ chuyển từ lưới sang carousel ngang (thêm prop vào `MediaList`, không tạo component mới).
3. Banner cao hơn (~860px), section bên dưới chồng lên (`-mb-[120px]`), thêm dải thumbnail.
4. Section mới: "Chủ đề" (ô gradient theo thể loại, dùng `useKKCategories`). "Top 10" chưa có nguồn dữ liệu.
5. ~~Header: dropdown Thể loại/Quốc gia~~ (xong).

## Lệnh

- `npm run dev`, `npm run build`, `npm run lint`
- Biến môi trường: `VITE_API_URL` (backend riêng cho admin, mặc định `http://localhost:8080`). KKPhim không cần biến môi trường.
