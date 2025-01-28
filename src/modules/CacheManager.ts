import Logger from './Logger';

export interface CacheOptions {
    maxSize?: number;
    ttl?: number;
}

export interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

export class CacheManager<T = any> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number;
    private ttl: number;

    constructor(options: CacheOptions = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 1000;
        this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default TTL
    }

    public set(key: string, value: T): void {
        this.clearExpired();

        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.findOldestEntry();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    public get(key: string): T | undefined {
        this.clearExpired();

        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    public has(key: string): boolean {
        this.clearExpired();
        return this.cache.has(key);
    }

    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }

    public size(): number {
        this.clearExpired();
        return this.cache.size;
    }

    public getAll(): Map<string, T> {
        this.clearExpired();
        const result = new Map<string, T>();
        
        this.cache.forEach((entry, key) => {
            result.set(key, entry.value);
        });

        return result;
    }

    public async getOrSet(
        key: string, 
        fetchFn: () => Promise<T>
    ): Promise<T> {
        const cachedValue = this.get(key);
        if (cachedValue !== undefined) {
            return cachedValue;
        }

        try {
            const value = await fetchFn();
            this.set(key, value);
            return value;
        } catch (error) {
            Logger.error(`Cache fetch error for key ${key}: ${(error as Error).message}`);
            throw error;
        }
    }

    private isExpired(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp > this.ttl;
    }

    private clearExpired(): void {
        this.cache.forEach((entry, key) => {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
            }
        });
    }

    private findOldestEntry(): string | undefined {
        let oldestKey: string | undefined;
        let oldestTime = Infinity;

        this.cache.forEach((entry, key) => {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        });

        return oldestKey;
    }

    public setTTL(ttl: number): void {
        this.ttl = ttl;
    }

    public getTTL(): number {
        return this.ttl;
    }
}

// Memory Cache singleton for global use
export class MemoryCache {
    private static instance: CacheManager;

    private constructor() {}

    public static getInstance<T>(options?: CacheOptions): CacheManager<T> {
        if (!MemoryCache.instance) {
            MemoryCache.instance = new CacheManager<T>(options);
        }
        return MemoryCache.instance as CacheManager<T>;
    }
}

export default CacheManager;