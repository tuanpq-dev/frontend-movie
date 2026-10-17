import { useCallback, useEffect, useMemo, useState } from "react";
import { getCached, invalidateCache, normalizeCacheKey, peekCache } from "@libs/requestCache";

const EMPTY_OPTIONS = {};

// options: enabled, staleTime, keepPreviousData (giữ dữ liệu của key cũ trong lúc tải key mới — dùng cho phân trang/lọc)
export const useCachedResource = (key, fetcher, options = EMPTY_OPTIONS) => {
    const cacheKey = useMemo(() => normalizeCacheKey(key), [key]);
    const enabled = options.enabled !== false && Boolean(cacheKey);
    const staleTime = options.staleTime;
    const keepPreviousData = Boolean(options.keepPreviousData);

    // Lưu kèm key để không bao giờ trả nhầm dữ liệu của key trước (vd chuyển từ phim A sang phim B).
    const [entry, setEntry] = useState(() => ({
        key: cacheKey,
        value: enabled ? peekCache(cacheKey) : undefined,
    }));
    const [errorEntry, setErrorEntry] = useState({ key: null, error: null });
    const [fetching, setFetching] = useState(false);
    const [version, setVersion] = useState(0);

    const reload = useCallback(
        ({ force = true } = {}) => {
            if (force) invalidateCache(cacheKey);
            setVersion((current) => current + 1);
        },
        [cacheKey],
    );

    useEffect(() => {
        let active = true;

        if (!enabled) {
            setFetching(false);
            return () => {
                active = false;
            };
        }

        const currentCache = peekCache(cacheKey);
        if (currentCache !== undefined) {
            setEntry({ key: cacheKey, value: currentCache });
        }

        setFetching(true);
        setErrorEntry({ key: null, error: null });

        getCached(cacheKey, fetcher, { staleTime })
            .then((response) => {
                if (active) {
                    setEntry({ key: cacheKey, value: response });
                }
            })
            .catch((err) => {
                if (active) {
                    setErrorEntry({ key: cacheKey, error: err });
                }
            })
            .finally(() => {
                if (active) {
                    setFetching(false);
                }
            });

        return () => {
            active = false;
        };
    }, [cacheKey, enabled, fetcher, staleTime, version]);

    const isCurrent = entry.key === cacheKey;
    const error = errorEntry.key === cacheKey ? errorEntry.error : null;
    const cached = enabled ? peekCache(cacheKey) : undefined;
    const data = isCurrent
        ? entry.value
        : cached !== undefined
          ? cached
          : keepPreviousData
            ? entry.value
            : undefined;
    const loading = enabled && !error && (isCurrent ? entry.value === undefined : cached === undefined);

    return {
        data,
        error,
        loading,
        fetching: fetching || (enabled && !isCurrent),
        isPreviousData: !isCurrent && cached === undefined && keepPreviousData,
        reload,
        hasData: data !== undefined && data !== null,
    };
};
