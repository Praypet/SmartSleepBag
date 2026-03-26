/**
 * 数据清理服务
 * 根据 TTL 策略定期清理过期数据
 *
 * 清理策略：
 * - PostgreSQL event_logs: 30天
 * - PostgreSQL health_events: 90天
 * - PostgreSQL sleep_records: 180天
 * - Chroma daily_summary: 7天
 * - Chroma weekly_pattern: 30天
 * - Chroma monthly_summary: 90天
 * - Chroma behavior_trait: 180天
 */
export declare class DataCleanupService {
    private pool;
    private longTermMemory;
    constructor();
    /**
     * 执行完整的数据清理流程（在用户登录时触发）
     * @param userId 用户ID（可选，若提供则只清理该用户的数据）
     */
    executeCleanup(userId?: string): Promise<void>;
    /**
     * 清理事件日志（保留 30 天）
     */
    private cleanupEventLogs;
    /**
     * 清理生理事件（保留 90 天）
     */
    private cleanupHealthEvents;
    /**
     * 清理睡眠记录（保留 180 天）
     */
    private cleanupSleepRecords;
    /**
     * 清理 Chroma 中过期的长期记忆
     */
    private cleanupChromaMemories;
    /**
     * 获取清理统计信息
     */
    getCleanupStats(): Promise<{
        eventLogsCount: number;
        healthEventsCount: number;
        sleepRecordsCount: number;
        chromaMemoriesCount: number;
    }>;
}
export declare const dataCleanupService: DataCleanupService;
//# sourceMappingURL=dataCleanupService.d.ts.map