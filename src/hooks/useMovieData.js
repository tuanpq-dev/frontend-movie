import { useCallback } from "react";
import { apiClient } from "@libs/apiClient";
import {
    KK_PAGE_SIZE,
    buildKKPath,
    kkGet,
    normalizeKKDetail,
    normalizeKKList,
    normalizeKKTaxonomy,
} from "@libs/kkphim";
import { useCachedResource } from "./useCachedResource";

const TAXONOMY_STALE_TIME = 60 * 60 * 1000;

// ---- Backend riêng (chỉ còn admin dùng) ----

export const useGenres = (options = {}) => {
    const fetcher = useCallback(() => apiClient.get("/api/genres"), []);
    return useCachedResource("genres:list", fetcher, options);
};

// ---- KKPhim ----

const useKKResource = (pathWithQuery, transform, options = {}) => {
    const fetcher = useCallback(
        () => kkGet(pathWithQuery).then(transform),
        [pathWithQuery, transform],
    );
    return useCachedResource(`kk:${pathWithQuery}`, fetcher, options);
};

// path: "/v1/api/danh-sach/phim-le", "/v1/api/the-loai/hanh-dong", "/v1/api/tim-kiem"…
// params: page, limit, category, country, year, sort_field, sort_type, sort_lang, keyword
export const useKKList = (path, params = {}, options = {}) =>
    useKKResource(
        buildKKPath(path, { limit: KK_PAGE_SIZE, ...params }),
        normalizeKKList,
        { ...options, enabled: options.enabled !== false && Boolean(path) },
    );

export const useKKNewest = (page = 1, options = {}) =>
    useKKResource(
        buildKKPath("/danh-sach/phim-moi-cap-nhat-v3", { page }),
        normalizeKKList,
        options,
    );

export const useKKSearch = (keyword = "", params = {}, options = {}) => {
    const trimmed = keyword.trim();
    return useKKList(
        "/v1/api/tim-kiem",
        { ...params, keyword: trimmed },
        { ...options, enabled: options.enabled !== false && Boolean(trimmed) },
    );
};

export const useKKMovie = (slug, options = {}) =>
    useKKResource(`/phim/${slug}`, normalizeKKDetail, {
        ...options,
        enabled: options.enabled !== false && Boolean(slug),
    });

export const useKKCategories = () =>
    useKKResource("/the-loai", normalizeKKTaxonomy, {
        staleTime: TAXONOMY_STALE_TIME,
    });

export const useKKCountries = () =>
    useKKResource("/quoc-gia", normalizeKKTaxonomy, {
        staleTime: TAXONOMY_STALE_TIME,
    });

export const useKKYears = () =>
    useKKResource("/nam-phat-hanh", normalizeKKTaxonomy, {
        staleTime: TAXONOMY_STALE_TIME,
    });
