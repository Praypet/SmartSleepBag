export declare class CacheService {
    private redis;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cache.service.d.ts.map