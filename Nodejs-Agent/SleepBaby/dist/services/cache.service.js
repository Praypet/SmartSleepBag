"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_config_1 = require("../config/index.config");
class CacheService {
    constructor() {
        this.redis = new ioredis_1.default(index_config_1.config.redis);
    }
    async get(key) {
        return await this.redis.get(key);
    }
    async set(key, value, ttl = 3600) {
        await this.redis.set(key, value, 'EX', ttl);
    }
    async delete(key) {
        await this.redis.del(key);
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.service.js.map