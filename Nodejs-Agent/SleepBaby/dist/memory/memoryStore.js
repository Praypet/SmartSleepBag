"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryStore = exports.MemoryStore = void 0;
const LongTermMemory_1 = require("./LongTermMemory");
const ShortTermMemory_1 = require("./ShortTermMemory");
const eventStore_1 = require("../services/eventStore");
/**
 * 统一内存管理接口
 * 负责协调三层存储：
 * - Redis（ShortTermMemory）：会话上下文、实时数据
 * - PostgreSQL（EventStore）：原始事件、历史数据
 * - Chroma（LongTermMemory）：总结规律、偏好特征
 */
class MemoryStore {
    constructor() {
        this.longTermMemory = new LongTermMemory_1.LongTermMemory();
        this.shortTermMemory = new ShortTermMemory_1.ShortTermMemory();
    }
    /**
     * 存储记忆（短期或长期）
     * @param userId 用户ID
     * @param data 数据内容
     * @param type 'short' | 'long'
     */
    async store(userId, data, type = 'short') {
        if (type === 'long') {
            // 长期记忆：存入 Chroma
            const fact = typeof data === 'string' ? data : JSON.stringify(data);
            await this.longTermMemory.storeMemory(userId, fact, 'behavior_trait');
        }
        else {
            // 短期记忆：存入 Redis（对话历史）
            if (data.role && data.content) {
                await this.shortTermMemory.storeMemory(userId, data);
            }
        }
    }
    /**
     * 检索记忆（短期或长期）
     * @param userId 用户ID
     * @param query 查询文本（长期记忆需要）
     * @param type 'short' | 'long'
     */
    async retrieve(userId, query = '', type = 'short') {
        if (type === 'long') {
            // 长期记忆：从 Chroma 检索
            return await this.longTermMemory.retrieveMemory(userId, query);
        }
        else {
            // 短期记忆：从 Redis 检索
            return await this.shortTermMemory.retrieveMemory(userId);
        }
    }
    /**
     * 存储实时生理数据到 Redis
     * @param userId 用户ID
     * @param dataType 数据类型（temperature, heart_rate, respiratory_rate）
     * @param value 数值
     */
    async storePhysiologicalData(userId, dataType, value) {
        await this.shortTermMemory.storePhysiologicalData(userId, dataType, value);
    }
    /**
     * 获取实时生理数据
     * @param userId 用户ID
     * @param dataType 数据类型
     */
    async getPhysiologicalData(userId, dataType) {
        return await this.shortTermMemory.getPhysiologicalData(userId, dataType);
    }
    /**
     * 清除会话对话历史
     * @param userId 用户ID
     */
    async clearSessionMemory(userId) {
        await this.shortTermMemory.clearMemory(userId);
    }
    /**
     * 存储原始事件到 EventStore（PostgreSQL）
     */
    async storeEvent(babyId, userId, event) {
        await eventStore_1.eventStore.storeEventLog(babyId, userId, event);
    }
    /**
     * 存储睡眠记录到 EventStore
     */
    async storeSleepRecord(babyId, userId, record) {
        await eventStore_1.eventStore.storeSleepRecord(babyId, userId, record);
    }
    /**
     * 存储生理事件到 EventStore
     */
    async storeHealthEvent(babyId, userId, event) {
        await eventStore_1.eventStore.storeHealthEvent(babyId, userId, event);
    }
    /**
     * 存储宝宝档案到 EventStore
     */
    async storeBabyProfile(babyId, profile) {
        await eventStore_1.eventStore.storeBabyProfile(babyId, profile);
    }
    /**
     * 更新长期记忆版本（支持演变跟踪）
     * @param userId 用户ID
     * @param category 分类（daily_summary, weekly_pattern, monthly_summary, behavior_trait）
     * @param newFact 新的事实
     */
    async updateLongTermMemoryVersion(userId, category, newFact) {
        await this.longTermMemory.updateVersion(userId, category, newFact);
    }
    /**
     * 获取长期记忆的历史版本
     */
    async getLongTermMemoryHistory(userId, category) {
        return await this.longTermMemory.getHistoryVersions(userId, category);
    }
}
exports.MemoryStore = MemoryStore;
exports.memoryStore = new MemoryStore();
//# sourceMappingURL=memoryStore.js.map