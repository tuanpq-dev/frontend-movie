import { useCallback, useMemo } from "react";
import { apiClient } from "@libs/apiClient";
import { useCachedResource } from "./useCachedResource";

const normalizeSearch = (value = "") => value.trim();

export const useMovies = (options = {}) => {
    const fetcher = useCallback(() => apiClient.get("/api/movies"), []);
    return useCachedResource("movies:list", fetcher, options);
};

export const useMovie = (id, options = {}) => {
    const fetcher = useCallback(() => apiClient.get(`/api/movies/${id}`), [id]);
    return useCachedResource(`movies:detail:${id}`, fetcher, {
        ...options,
        enabled: options.enabled !== false && Boolean(id),
    });
};

export const useSearchMovies = (searchText, options = {}) => {
    const keyword = useMemo(() => normalizeSearch(searchText), [searchText]);
    const fetcher = useCallback(
        () =>
            apiClient.get("/api/movies", {
                params: { originName: keyword },
            }),
        [keyword],
    );

    return useCachedResource(`movies:search:${keyword}`, fetcher, {
        ...options,
        enabled: options.enabled !== false && Boolean(keyword),
    });
};

export const useGenres = (options = {}) => {
    const fetcher = useCallback(() => apiClient.get("/api/genres"), []);
    return useCachedResource("genres:list", fetcher, options);
};

export const usePaymentStatus = (userId, options = {}) => {
    const fetcher = useCallback(
        () => apiClient.get(`/api/payment/payment-status/${userId}`),
        [userId],
    );

    return useCachedResource(`payment:status:${userId}`, fetcher, {
        ...options,
        enabled: options.enabled !== false && Boolean(userId),
    });
};
