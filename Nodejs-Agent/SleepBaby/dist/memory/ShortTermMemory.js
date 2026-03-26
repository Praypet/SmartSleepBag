"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortTermMemory = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_config_1 = require("../config/index.config");
const logger_1 = require("../utils/logger");
/**
 * 短期记忆存储（Redis 实现，使用 ioredis）
 * 用于存储当前会话的对话历史和实时生理数据
 * - 对话历史：1小时自动过期
 * - 实时生理数据：5分钟自动过期
 * - 保留最近 20 条对话记录
 */
class ShortTermMemory {
    constructor() {
        this.client = new ioredis_1.default({
            host: index_config_1.config.redis.host,
            port: index_config_1.config.redis.port,
            password: index_config_1.config.redis.password,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.client.on('error', (err) => {
            logger_1.logger.error('Redis 客户端错误:', err);
        });
        this.client.on('connect', () => {
            logger_1.logger.info('Redis 短期记忆已连接');
        });
    }
    /**
     * 存储对话记忆到 Redis
     * @param userId 用户ID
     * @param data 对话数据 { role, content }
     * @param ttlSeconds 过期时间（秒），默认3600秒（1小时）
     */
    async storeMemory(userId, data, ttlSeconds = 3600) {
        try {
            const key = `session:${userId}:history`;
            const entry = JSON.stringify({
                role: data.role,
                content: data.content,
                timestamp: Date.now(),
            });
            // 获取当前列表长度
            const currentLength = await this.client.llen(key);
            // 保持列表最多 20 条记录
            if (currentLength >= 20) {
                // 删除最早的一条（列表左端）
                await this.client.lpop(key);
            }
            // 添加新记忆到列表右端
            await this.client.rpush(key, entry);
            // 设置过期时间
            await this.client.expire(key, ttlSeconds);
            logger_1.logger.info(`成功存储短期记忆 [用户: ${userId}, TTL: ${ttlSeconds}s]`);
        }
        catch (error) {
            logger_1.logger.error('存储短期记忆失败:', error);
        }
    }
    /**
     * 存储实时生理数据到 Redis
     * @param userId 用户ID
     * @param dataType 数据类型（temperature、heart_rate等）
     * @param value 数值
     */
    async storePhysiologicalData(userId, dataType, value) {
        try {
            const key = `realtime:${userId}:${dataType}`;
            const data = JSON.stringify({
                value,
                timestamp: Date.now(),
            });
            await this.client.setex(key, 300, data); // 5分钟过期
            logger_1.logger.info(`存储实时数据 [用户: ${userId}, 类型: ${dataType}]`);
        }
        catch (error) {
            logger_1.logger.error('存储实时数据失败:', error);
        }
    }
    /**
     * 检索对话历史
     * @param userId 用户ID
     */
    async retrieveMemory(userId) {
        try {
            const key = `session:${userId}:history`;
            const data = await this.client.lrange(key, 0, -1);
            const memories = (data || []).map((item) => {
                try {
                    return JSON.parse(item);
                }
                catch {
                    return { role: '', content: '' };
                }
            });
            return memories;
        }
        catch (error) {
            logger_1.logger.error('检索短期记忆失败:', error);
            return [];
        }
    }
    /**
     * 获取实时生理数据
     * @param userId 用户ID
     * @param dataType 数据类型
     */
    async getPhysiologicalData(userId, dataType) {
        try {
            const key = `realtime:${userId}:${dataType}`;
            const data = await this.client.get(key);
            if (data) {
                try {
                    return JSON.parse(data);
                }
                catch {
                    return null;
                }
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('获取实时数据失败:', error);
            return null;
        }
    }
    /**
     * 清除对话历史
     * @param userId 用户ID
     */
    async clearMemory(userId) {
        try {
            const key = `session:${userId}:history`;
            await this.client.del(key);
            logger_1.logger.info(`已清除用户 ${userId} 的对话历史`);
        }
        catch (error) {
            logger_1.logger.error('清除短期记忆失败:', error);
        }
    }
}
exports.ShortTermMemory = ShortTermMemory;
//# sourceMappingURL=ShortTermMemory.js.map