/**
 * 统一内存管理接口
 * 负责协调三层存储：
 * - Redis（ShortTermMemory）：会话上下文、实时数据
 * - PostgreSQL（EventStore）：原始事件、历史数据
 * - Chroma（LongTermMemory）：总结规律、偏好特征
 */
export declare class MemoryStore {
    private longTermMemory;
    private shortTermMemory;
    constructor();
    /**
     * 存储记忆（短期或长期）
     * @param userId 用户ID
     * @param data 数据内容
     * @param type 'short' | 'long'
     */
    store(userId: string, data: any, type?: 'long' | 'short'): Promise<void>;
    /**
     * 检索记忆（短期或长期）
     * @param userId 用户ID
     * @param query 查询文本（长期记忆需要）
     * @param type 'short' | 'long'
     */
    retrieve(userId: string, query?: string, type?: 'long' | 'short'): Promise<string[] | {
        role: string;
        content: string;
    }[]>;
    /**
     * 存储实时生理数据到 Redis
     * @param userId 用户ID
     * @param dataType 数据类型（temperature, heart_rate, respiratory_rate）
     * @param value 数值
     */
    storePhysiologicalData(userId: string, dataType: string, value: any): Promise<void>;
    /**
     * 获取实时生理数据
     * @param userId 用户ID
     * @param dataType 数据类型
     */
    getPhysiologicalData(userId: string, dataType: string): Promise<any>;
    /**
     * 清除会话对话历史
     * @param userId 用户ID
     */
    clearSessionMemory(userId: string): Promise<void>;
    /**
     * 存储原始事件到 EventStore（PostgreSQL）
     */
    storeEvent(babyId: string, userId: string, event: {
        event_type: string;
        description: string;
        data?: any;
    }): Promise<void>;
    /**
     * 存储睡眠记录到 EventStore
     */
    storeSleepRecord(babyId: string, userId: string, record: any): Promise<void>;
    /**
     * 存储生理事件到 EventStore
     */
    storeHealthEvent(babyId: string, userId: string, event: any): Promise<void>;
    /**
     * 存储宝宝档案到 EventStore
     */
    storeBabyProfile(babyId: string, profile: any): Promise<void>;
    /**
     * 更新长期记忆版本（支持演变跟踪）
     * @param userId 用户ID
     * @param category 分类（daily_summary, weekly_pattern, monthly_summary, behavior_trait）
     * @param newFact 新的事实
     */
    updateLongTermMemoryVersion(userId: string, category: 'daily_summary' | 'weekly_pattern' | 'monthly_summary' | 'behavior_trait', newFact: string): Promise<void>;
    /**
     * 获取长期记忆的历史版本
     */
    getLongTermMemoryHistory(userId: string, category: string): Promise<{
        id: string;
        fact: string;
        version: number;
        created_at: number;
    }[]>;
}
export declare const memoryStore: MemoryStore;
//# sourceMappingURL=memoryStore.d.ts.map