import { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { MovieGrid } from "@components/MediaList";
import MovieFilter from "@components/MovieFilter";
import Pagination from "@components/Pagination";
import { MovieGridSkeleton } from "@components/Skeleton";
import { LIST_TYPES } from "@libs/kkphim";
import {
    useKKCategories,
    useKKCountries,
    useKKList,
} from "@/hooks/useMovieData";

const FILTER_KEYS = ["category", "country", "year", "sort_lang", "sort_field"];

// kind ↔ route: list=/danh-sach/:slug, category=/the-loai/:slug,
// country=/quoc-gia/:slug, year=/nam/:slug, search=/tim-kiem?keyword=
const KIND_CONFIG = {
    list: { apiPath: (slug) => `/v1/api/danh-sach/${slug}` },
    category: { apiPath: (slug) => `/v1/api/the-loai/${slug}`, locked: "category" },
    country: { apiPath: (slug) => `/v1/api/quoc-gia/${slug}`, locked: "country" },
    year: { apiPath: (slug) => `/v1/api/nam/${slug}`, locked: "year" },
    search: { apiPath: () => "/v1/api/tim-kiem" },
};

const findName = (items, slug) =>
    (items || []).find((item) => item.slug === slug)?.name;

const Catalog = ({ kind = "list" }) => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: categories } = useKKCategories();
    const { data: countries } = useKKCountries();

    const config = KIND_CONFIG[kind];
    const keyword = (searchParams.get("keyword") || "").trim();
    const page = Number(searchParams.get("page")) || 1;

    const filterValues = useMemo(
        () =>
            Object.fromEntries(
                FILTER_KEYS.map((key) => [key, searchParams.get(key) || ""]),
            ),
        [searchParams],
    );

    const isSearch = kind === "search";
    const { data, loading, error, isPreviousData } = useKKList(
        config.apiPath(slug),
        { ...filterValues, page, keyword: isSearch ? keyword : undefined },
        {
            enabled: !isSearch || Boolean(keyword),
            keepPreviousData: true,
        },
    );

    // Chỉ cuộn khi đổi trang (lần mount đã có ScrollToTop lo).
    const isFirstPageRender = useRef(true);
    useEffect(() => {
        if (isFirstPageRender.current) {
            isFirstPageRender.current = false;
            return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const title = (() => {
        if (isSearch) {
            return keyword ? `Kết quả tìm kiếm: "${keyword}"` : "Tìm kiếm phim";
        }
        if (kind === "list") return findName(LIST_TYPES, slug) || data?.title;
        if (kind === "category") return `Phim ${findName(categories, slug) || ""}`;
        if (kind === "country") return `Phim ${findName(countries, slug) || ""}`;
        if (kind === "year") return `Phim năm ${slug}`;
        return data?.title;
    })();

    const updateParams = (changes) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
        });
        setSearchParams(next);
    };

    const items = data?.items || [];
    const pagination = data?.pagination;

    return (
        <div className="page-surface px-3 py-6 sm:px-5 min-[1025px]:px-8 min-[1025px]:py-8">
            <div className="mx-auto max-w-[1900px] text-white">
                <h1 className="mb-1 text-2xl font-bold sm:text-3xl">{title}</h1>
                {pagination?.totalItems > 0 && (
                    <p className="mb-5 text-sm text-muted">
                        {pagination.totalItems.toLocaleString("vi-VN")} phim
                    </p>
                )}

                <MovieFilter
                    values={filterValues}
                    hidden={config.locked ? [config.locked] : []}
                    onChange={(key, value) =>
                        updateParams({ [key]: value, page: "" })
                    }
                />

                <div
                    className={`mt-6 transition-opacity duration-200 ${
                        isPreviousData ? "pointer-events-none opacity-50" : ""
                    }`}
                    aria-busy={loading}
                >
                    {isSearch && !keyword ? (
                        <p className="py-16 text-center text-muted">
                            Nhập tên phim vào ô tìm kiếm phía trên để bắt đầu.
                        </p>
                    ) : loading && !data ? (
                        <MovieGridSkeleton title={false} count={18} />
                    ) : error ? (
                        <p className="py-16 text-center text-muted">
                            Không tải được danh sách phim. Vui lòng thử lại.
                        </p>
                    ) : items.length === 0 ? (
                        <p className="py-16 text-center text-muted">
                            Không có phim phù hợp.
                        </p>
                    ) : (
                        <MovieGrid movies={items} />
                    )}
                </div>

                <Pagination
                    currentPage={pagination?.currentPage || page}
                    totalPages={pagination?.totalPages || 1}
                    onChange={(nextPage) =>
                        updateParams({ page: nextPage > 1 ? nextPage : "" })
                    }
                />
            </div>
        </div>
    );
};

export default Catalog;
