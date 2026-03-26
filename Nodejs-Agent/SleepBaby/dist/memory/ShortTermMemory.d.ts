/**
 * 短期记忆存储（Redis 实现，使用 ioredis）
 * 用于存储当前会话的对话历史和实时生理数据
 * - 对话历史：1小时自动过期
 * - 实时生理数据：5分钟自动过期
 * - 保留最近 20 条对话记录
 */
export declare class ShortTermMemory {
    private client;
    constructor();
    /**
     * 存储对话记忆到 Redis
     * @param userId 用户ID
     * @param data 对话数据 { role, content }
     * @param ttlSeconds 过期时间（秒），默认3600秒（1小时）
     */
    storeMemory(userId: string, data: {
        role: string;
        content: string;
    }, ttlSeconds?: number): Promise<void>;
    /**
     * 存储实时生理数据到 Redis
     * @param userId 用户ID
     * @param dataType 数据类型（temperature、heart_rate等）
     * @param value 数值
     */
    storePhysiologicalData(userId: string, dataType: string, value: any): Promise<void>;
    /**
     * 检索对话历史
     * @param userId 用户ID
     */
    retrieveMemory(userId: string): Promise<Array<{
        role: string;
        content: string;
    }>>;
    /**
     * 获取实时生理数据
     * @param userId 用户ID
     * @param dataType 数据类型
     */
    getPhysiologicalData(userId: string, dataType: string): Promise<any>;
    /**
     * 清除对话历史
     * @param userId 用户ID
     */
    clearMemory(userId: string): Promise<void>;
}
//# sourceMappingURL=ShortTermMemory.d.ts.map