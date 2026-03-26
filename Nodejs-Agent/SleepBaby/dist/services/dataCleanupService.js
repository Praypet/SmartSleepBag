"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataCleanupService = exports.DataCleanupService = void 0;
const pg_1 = require("pg");
const index_config_1 = require("../config/index.config");
const LongTermMemory_1 = require("../memory/LongTermMemory");
const logger_1 = require("../utils/logger");
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
class DataCleanupService {
    constructor() {
        this.pool = new pg_1.Pool({
            host: index_config_1.config.database.host,
            port: index_config_1.config.database.port,
            user: index_config_1.config.database.username,
            password: index_config_1.config.database.password,
            database: index_config_1.config.database.database,
        });
        this.longTermMemory = new LongTermMemory_1.LongTermMemory();
    }
    /**
     * 执行完整的数据清理流程（在用户登录时触发）
     * @param userId 用户ID（可选，若提供则只清理该用户的数据）
     */
    async executeCleanup(userId) {
        logger_1.logger.info(`开始执行数据清理 [用户: ${userId || '全部'}]`);
        try {
            // 1. 清理 PostgreSQL 事件日志（30天）
            await this.cleanupEventLogs(userId);
            // 2. 清理 PostgreSQL 生理事件（90天）
            await this.cleanupHealthEvents(userId);
            // 3. 清理 PostgreSQL 睡眠记录（180天）
            await this.cleanupSleepRecords(userId);
            // 4. 清理 Chroma 长期记忆（各分类各自的TTL）
            await this.cleanupChromaMemories(userId);
            logger_1.logger.info(`数据清理完成 [用户: ${userId || '全部'}]`);
        }
        catch (error) {
            logger_1.logger.error('数据清理过程出错:', error);
        }
    }
    /**
     * 清理事件日志（保留 30 天）
     */
    async cleanupEventLogs(userId) {
        try {
            let query = `
        DELETE FROM event_logs 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
      `;
            const params = [];
            if (userId) {
                query += ` AND user_id = $1`;
                params.push(userId);
            }
            const result = await this.pool.query(query, params);
            logger_1.logger.info(`已清理事件日志: ${result.rowCount} 条记录 [用户: ${userId || '全部'}]`);
        }
        catch (error) {
            logger_1.logger.error('清理事件日志失败:', error);
        }
    }
    /**
     * 清理生理事件（保留 90 天）
     */
    async cleanupHealthEvents(userId) {
        try {
            let query = `
        DELETE FROM health_events 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
      `;
            const params = [];
            if (userId) {
                query += ` AND user_id = $1`;
                params.push(userId);
            }
            const result = await this.pool.query(query, params);
            logger_1.logger.info(`已清理生理事件: ${result.rowCount} 条记录 [用户: ${userId || '全部'}]`);
        }
        catch (error) {
            logger_1.logger.error('清理生理事件失败:', error);
        }
    }
    /**
     * 清理睡眠记录（保留 180 天）
     */
    async cleanupSleepRecords(userId) {
        try {
            let query = `
        DELETE FROM sleep_records 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '180 days'
      `;
            const params = [];
            if (userId) {
                query += ` AND user_id = $1`;
                params.push(userId);
            }
            const result = await this.pool.query(query, params);
            logger_1.logger.info(`已清理睡眠记录: ${result.rowCount} 条记录 [用户: ${userId || '全部'}]`);
        }
        catch (error) {
            logger_1.logger.error('清理睡眠记录失败:', error);
        }
    }
    /**
     * 清理 Chroma 中过期的长期记忆
     */
    async cleanupChromaMemories(userId) {
        try {
            if (!userId) {
                // 全局清理：需要获取所有用户ID，然后逐个清理
                const result = await this.pool.query(`SELECT DISTINCT user_id FROM user_config`);
                const userIds = result.rows.map((row) => row.user_id);
                for (const uid of userIds) {
                    await this.longTermMemory.cleanupExpiredMemories(uid);
                }
                logger_1.logger.info(`已清理所有用户的过期长期记忆`);
            }
            else {
                // 仅清理指定用户的记忆
                await this.longTermMemory.cleanupExpiredMemories(userId);
                logger_1.logger.info(`已清理用户 ${userId} 的过期长期记忆`);
            }
        }
        catch (error) {
            logger_1.logger.error('清理 Chroma 记忆失败:', error);
        }
    }
    /**
     * 获取清理统计信息
     */
    async getCleanupStats() {
        try {
            const eventLogsResult = await this.pool.query(`SELECT COUNT(*) FROM event_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'`);
            const healthEventsResult = await this.pool.query(`SELECT COUNT(*) FROM health_events WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'`);
            const sleepRecordsResult = await this.pool.query(`SELECT COUNT(*) FROM sleep_records WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '180 days'`);
            return {
                eventLogsCount: parseInt(eventLogsResult.rows[0].count || 0),
                healthEventsCount: parseInt(healthEventsResult.rows[0].count || 0),
                sleepRecordsCount: parseInt(sleepRecordsResult.rows[0].count || 0),
                chromaMemoriesCount: 0, // Chroma无法直接统计，需要另外实现
            };
        }
        catch (error) {
            logger_1.logger.error('获取清理统计失败:', error);
            return {
                eventLogsCount: 0,
                healthEventsCount: 0,
                sleepRecordsCount: 0,
                chromaMemoriesCount: 0,
            };
        }
    }
}
exports.DataCleanupService = DataCleanupService;
exports.dataCleanupService = new DataCleanupService();
//# sourceMappingURL=dataCleanupService.js.map