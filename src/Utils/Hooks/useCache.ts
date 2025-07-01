export default function useCache() {
    const cache = new Map<string, { value: any; expires: number }>();

    const set = (key: string, value: any, ttl: number = 3600000) => {
        const expires = Date.now() + ttl;
        cache.set(key, { value, expires });
    };

    const get = (key: string) => {
        const cached = cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expires) {
            cache.delete(key);
            return null;
        }
        return cached.value;
    };

    const remove = (key: string) => {
        cache.delete(key);
    };

    const clear = () => {
        cache.clear();
    };

    // Optional: clean expired entries periodically (every minute)
    setInterval(() => {
        const now = Date.now();
        for (const [key, { expires }] of cache.entries()) {
            if (expires < now) {
                cache.delete(key);
            }
        }
    }, 60 * 1000);

    return { set, get, remove, clear };
}
