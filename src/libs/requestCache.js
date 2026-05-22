const DEFAULT_STALE_TIME = 60 * 1000;

const cache = new Map();
const pending = new Map();

export const normalizeCacheKey = (key) =>
    Array.isArray(key) ? key.filter(Boolean).join(":") : String(key || "");

export const peekCache = (key) => {
    const entry = cache.get(normalizeCacheKey(key));
    return entry?.data;
};

export const getCached = async (key, fetcher, options = {}) => {
    const cacheKey = normalizeCacheKey(key);
    const staleTime = options.staleTime ?? DEFAULT_STALE_TIME;
    const now = Date.now();
    const entry = cache.get(cacheKey);

    if (!options.force && entry && now - entry.updatedAt < staleTime) {
        return entry.data;
    }

    if (!options.force && pending.has(cacheKey)) {
        return pending.get(cacheKey);
    }

    const request = Promise.resolve()
        .then(fetcher)
        .then((data) => {
            cache.set(cacheKey, { data, updatedAt: Date.now() });
            return data;
        })
        .finally(() => {
            pending.delete(cacheKey);
        });

    pending.set(cacheKey, request);
    return request;
};

export const invalidateCache = (prefix) => {
    const cachePrefix = normalizeCacheKey(prefix);
    [...cache.keys()].forEach((key) => {
        if (key.startsWith(cachePrefix)) cache.delete(key);
    });
    [...pending.keys()].forEach((key) => {
        if (key.startsWith(cachePrefix)) pending.delete(key);
    });
};

export const clearRequestCache = () => {
    cache.clear();
    pending.clear();
};
