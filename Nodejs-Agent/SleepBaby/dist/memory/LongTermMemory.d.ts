/**
 * 长期记忆存储（Chroma 向量数据库）。
 */
export declare class LongTermMemory {
    private client;
    private collection;
    constructor();
    private initCollection;
    /**
     * 存储长期记忆事实。
     */
    storeMemory(userId: string, fact: string, category: 'daily_summary' | 'weekly_pattern' | 'monthly_summary' | 'behavior_trait', expiresAt?: number): Promise<void>;
    /**
     * 检索与查询相关的长期记忆。
     */
    retrieveMemory(userId: string, query: string, category?: string, onlyActive?: boolean): Promise<string[]>;
    /**
     * 获取某分类的历史版本。
     */
    getHistoryVersions(userId: string, category: string): Promise<Array<{
        id: string;
        fact: string;
        version: number;
        created_at: number;
    }>>;
    /**
     * 更新长期记忆版本，旧版本标记为非活跃，新版本写入集合。
     */
    updateVersion(userId: string, category: string, newFact: string): Promise<void>;
    /**
     * 清理过期长期记忆。
     */
    cleanupExpiredMemories(userId: string, category?: string): Promise<void>;
}
//# sourceMappingURL=LongTermMemory.d.ts.map