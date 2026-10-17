import axios from "axios";

// Nguồn phim KKPhim — xem mục "API KKPhim" trong CLAUDE.md.
// Dùng client riêng, KHÔNG dùng apiClient (apiClient gắn token đăng nhập vào header).
export const KK_API_URL = "https://phimapi.com";
export const KK_IMAGE_CDN = "https://phimimg.com";
export const KK_PAGE_SIZE = 24;

const kkClient = axios.create({ baseURL: KK_API_URL, timeout: 15000 });

export const MOVIE_TYPE_LABEL = {
    single: "Phim lẻ",
    series: "Phim bộ",
    hoathinh: "Hoạt hình",
    tvshows: "TV Shows",
};

// Các danh sách /v1/api/danh-sach/{slug}
export const LIST_TYPES = [
    { slug: "phim-le", name: "Phim lẻ" },
    { slug: "phim-bo", name: "Phim bộ" },
    { slug: "hoat-hinh", name: "Hoạt hình" },
    { slug: "tv-shows", name: "TV Shows" },
    { slug: "phim-chieu-rap", name: "Phim chiếu rạp" },
];

export const SORT_LANG_OPTIONS = [
    { value: "vietsub", label: "Vietsub" },
    { value: "thuyet-minh", label: "Thuyết minh" },
    { value: "long-tieng", label: "Lồng tiếng" },
];

export const SORT_FIELD_OPTIONS = [
    { value: "modified.time", label: "Mới cập nhật" },
    { value: "_id", label: "Mới đăng" },
    { value: "year", label: "Năm phát hành" },
];

// Bỏ tham số rỗng, trả về chuỗi query ổn định để làm cache key.
export const buildKKPath = (path, params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params)
        .sort()
        .forEach((key) => {
            const value = params[key];
            if (value !== undefined && value !== null && value !== "") {
                query.set(key, value);
            }
        });
    const queryString = query.toString();
    return queryString ? `${path}?${queryString}` : path;
};

export const kkGet = async (pathWithQuery) => {
    const response = await kkClient.get(pathWithQuery);
    return response.data;
};

export const getKKImageUrl = (path) => {
    if (!path) return "/img-placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${KK_IMAGE_CDN}/${path.replace(/^\/+/, "")}`;
};

// Poster gốc của KKPhim rất lớn (1440×2160+, tới ~800KB). Resize qua proxy ảnh của WordPress (i0.wp.com):
// 494KB còn ~32KB ở w=320. Chỉ áp dụng cho URL http(s); lỗi thì PosterImage tự quay về ảnh gốc.
export const IMAGE_PROXY = "https://i0.wp.com/";

export const getResizedImageUrl = (url, width) => {
    if (!url || !/^https?:\/\//.test(url)) return url;
    return `${IMAGE_PROXY}${url.replace(/^https?:\/\//, "")}?w=${width}`;
};

export const getYoutubeKey = (url = "") => {
    if (!url) return "";
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : "";
};

const toArray = (value) => (Array.isArray(value) ? value : []);

// Bỏ các giá trị giữ chỗ như "Đang cập nhật".
const cleanPeople = (list) =>
    toArray(list).filter(
        (person) => person && !/đang cập nhật/i.test(String(person)),
    );

export const normalizeKKMovie = (movie = {}) => ({
    _id: movie._id,
    slug: movie.slug,
    name: movie.name,
    originName: movie.origin_name,
    posterUrl: getKKImageUrl(movie.poster_url),
    thumbUrl: getKKImageUrl(movie.thumb_url),
    year: movie.year,
    time: movie.time,
    type: movie.type,
    typeLabel: MOVIE_TYPE_LABEL[movie.type] || "",
    quality: movie.quality,
    lang: movie.lang,
    episodeCurrent: movie.episode_current,
    episodeTotal: movie.episode_total,
    status: movie.status,
    content: (movie.content || "").replace(/<[^>]+>/g, "").trim(),
    trailerKey: getYoutubeKey(movie.trailer_url),
    actors: cleanPeople(movie.actor),
    directors: cleanPeople(movie.director),
    categories: toArray(movie.category),
    countries: toArray(movie.country),
    voteAverage: movie.tmdb?.vote_average || 0,
    view: movie.view,
    isCinema: Boolean(movie.chieurap),
});

const normalizeServers = (episodes) =>
    toArray(episodes)
        .map((server) => ({
            name: server.server_name,
            episodes: toArray(server.server_data)
                .filter((ep) => ep.link_m3u8 || ep.link_embed)
                .map((ep) => ({
                    name: ep.name,
                    slug: ep.slug,
                    m3u8: ep.link_m3u8,
                    embed: ep.link_embed,
                })),
        }))
        .filter((server) => server.episodes.length > 0);

// Dùng cho cả dạng cũ ({ items, pagination }) và dạng /v1/api ({ data: { items, params } }).
export const normalizeKKList = (response) => {
    const data = response?.data ?? response ?? {};
    const pagination = data.params?.pagination ?? data.pagination ?? {};
    const perPage = pagination.totalItemsPerPage || KK_PAGE_SIZE;
    const totalItems = pagination.totalItems || 0;

    return {
        items: toArray(data.items).map(normalizeKKMovie),
        title: data.titlePage || "",
        pagination: {
            currentPage: pagination.currentPage || 1,
            totalItems,
            totalPages:
                pagination.totalPages || Math.ceil(totalItems / perPage) || 1,
        },
    };
};

export const normalizeKKDetail = (response) => {
    if (!response?.movie) return null;
    return {
        ...normalizeKKMovie(response.movie),
        servers: normalizeServers(response.episodes),
    };
};

// Thể loại / quốc gia: [{ name, slug }]; năm: [{ name, slug }] với slug = năm.
export const normalizeKKTaxonomy = (response) =>
    toArray(response?.data?.items).map((item) =>
        item.year
            ? { name: String(item.year), slug: String(item.year) }
            : { name: item.name, slug: item.slug },
    );
