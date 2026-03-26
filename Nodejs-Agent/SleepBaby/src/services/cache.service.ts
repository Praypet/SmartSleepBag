import Redis from 'ioredis';
import { config } from '../config/index.config';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redis);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl: number = 3600) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}

export const cacheService = new CacheService();
