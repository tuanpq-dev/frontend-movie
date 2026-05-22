import { useCallback, useEffect, useMemo, useState } from "react";
import { getCached, invalidateCache, normalizeCacheKey, peekCache } from "@libs/requestCache";

const EMPTY_OPTIONS = {};

export const useCachedResource = (key, fetcher, options = EMPTY_OPTIONS) => {
    const cacheKey = useMemo(() => normalizeCacheKey(key), [key]);
    const enabled = options.enabled !== false && Boolean(cacheKey);
    const staleTime = options.staleTime;
    const cachedData = enabled ? peekCache(cacheKey) : undefined;

    const [data, setData] = useState(cachedData);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(enabled && cachedData === undefined);
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
            setLoading(false);
            setFetching(false);
            return () => {
                active = false;
            };
        }

        const currentCache = peekCache(cacheKey);
        if (currentCache !== undefined) {
            setData(currentCache);
            setLoading(false);
        } else {
            setLoading(true);
        }

        setFetching(true);
        setError(null);

        getCached(cacheKey, fetcher, { staleTime })
            .then((response) => {
                if (active) {
                    setData(response);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                    setFetching(false);
                }
            });

        return () => {
            active = false;
        };
    }, [cacheKey, enabled, fetcher, staleTime, version]);

    return {
        data,
        error,
        loading,
        fetching,
        reload,
        hasData: data !== undefined && data !== null,
    };
};
