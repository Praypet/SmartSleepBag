"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventStore = exports.EventStore = void 0;
const pg_1 = require("pg");
const index_config_1 = require("../config/index.config");
const logger_1 = require("../utils/logger");
/**
 * 事件存储服务（PostgreSQL）
 * 用于存储所有原始的宝宝数据事件：
 * - 睡眠日志（保留180天）
 * - 生理事件：心率、体温、呼吸数据（保留90天）
 * - 事件日志：哭闹、换尿布等（保留30天）
 * - 用户配置：宝宝信息、家长偏好（永久保留）
 */
class EventStore {
    constructor() {
        this.pool = new pg_1.Pool({
            host: index_config_1.config.database.host,
            port: index_config_1.config.database.port,
            user: index_config_1.config.database.username,
            password: index_config_1.config.database.password,
            database: index_config_1.config.database.database,
        });
        this.initTables();
    }
    async initTables() {
        const tables = [
            // 宝宝基本信息（永久保留）
            `CREATE TABLE IF NOT EXISTS baby_profile (
        id SERIAL PRIMARY KEY,
        baby_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_date DATE NOT NULL,
        age_months INT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            // 睡眠记录（保留180天）
            `CREATE TABLE IF NOT EXISTS sleep_records (
        id SERIAL PRIMARY KEY,
        baby_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        sleep_quality INT,
        deep_sleep_hours DECIMAL(5,2),
        light_sleep_hours DECIMAL(5,2),
        rem_sleep_hours DECIMAL(5,2),
        total_sleep_hours DECIMAL(5,2),
        wake_count INT,
        wake_reasons TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (baby_id) REFERENCES baby_profile(baby_id) ON DELETE CASCADE
      );`,
            // 生理事件（保留90天）
            `CREATE TABLE IF NOT EXISTS health_events (
        id SERIAL PRIMARY KEY,
        baby_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        temperature DECIMAL(5,2),
        heart_rate INT,
        respiratory_rate INT,
        value DECIMAL(10,2),
        unit VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (baby_id) REFERENCES baby_profile(baby_id) ON DELETE CASCADE
      );`,
            // 事件日志（保留30天）
            `CREATE TABLE IF NOT EXISTS event_logs (
        id SERIAL PRIMARY KEY,
        baby_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (baby_id) REFERENCES baby_profile(baby_id) ON DELETE CASCADE
      );`,
            // 用户配置（永久保留）
            `CREATE TABLE IF NOT EXISTS user_config (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        baby_id VARCHAR(255) NOT NULL,
        notification_enabled BOOLEAN DEFAULT TRUE,
        notification_frequency VARCHAR(50),
        preferred_time_zone VARCHAR(50),
        language VARCHAR(20) DEFAULT 'zh-CN',
        other_settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (baby_id) REFERENCES baby_profile(baby_id) ON DELETE CASCADE
      );`,
        ];
        for (const table of tables) {
            try {
                await this.pool.query(table);
            }
            catch (error) {
                logger_1.logger.error('初始化表失败:', error);
            }
        }
        logger_1.logger.info('事件存储表已初始化');
    }
    /**
     * 存储宝宝基本信息
     */
    async storeBabyProfile(babyId, profile) {
        const query = `
      INSERT INTO baby_profile (baby_id, name, gender, birth_date, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (baby_id) DO UPDATE SET
        name = $2, gender = $3, birth_date = $4, avatar_url = $5, updated_at = CURRENT_TIMESTAMP
    `;
        try {
            await this.pool.query(query, [
                babyId,
                profile.name,
                profile.gender,
                profile.birth_date,
                profile.avatar_url || null,
            ]);
            logger_1.logger.info(`宝宝信息已保存 [ID: ${babyId}]`);
        }
        catch (error) {
            logger_1.logger.error('保存宝宝信息失败:', error);
        }
    }
    /**
     * 存储睡眠记录
     */
    async storeSleepRecord(babyId, userId, record) {
        const query = `
      INSERT INTO sleep_records 
      (baby_id, user_id, date, sleep_quality, deep_sleep_hours, light_sleep_hours, rem_sleep_hours, total_sleep_hours, wake_count, wake_reasons, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
        try {
            await this.pool.query(query, [
                babyId,
                userId,
                record.date,
                record.sleep_quality || null,
                record.deep_sleep_hours || null,
                record.light_sleep_hours || null,
                record.rem_sleep_hours || null,
                record.total_sleep_hours || null,
                record.wake_count || null,
                record.wake_reasons || null,
                record.notes || null,
            ]);
            logger_1.logger.info(`睡眠记录已保存 [宝宝: ${babyId}, 日期: ${record.date}]`);
        }
        catch (error) {
            logger_1.logger.error('保存睡眠记录失败:', error);
        }
    }
    /**
     * 存储生理事件
     */
    async storeHealthEvent(babyId, userId, event) {
        const query = `
      INSERT INTO health_events 
      (baby_id, user_id, event_type, temperature, heart_rate, respiratory_rate, value, unit, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
        try {
            await this.pool.query(query, [
                babyId,
                userId,
                event.event_type,
                event.temperature || null,
                event.heart_rate || null,
                event.respiratory_rate || null,
                event.value || null,
                event.unit || null,
                event.notes || null,
            ]);
            logger_1.logger.info(`生理事件已记录 [宝宝: ${babyId}, 类型: ${event.event_type}]`);
        }
        catch (error) {
            logger_1.logger.error('记录生理事件失败:', error);
        }
    }
    /**
     * 存储日常事件
     */
    async storeEventLog(babyId, userId, event) {
        const query = `
      INSERT INTO event_logs (baby_id, user_id, event_type, description, data)
      VALUES ($1, $2, $3, $4, $5)
    `;
        try {
            await this.pool.query(query, [
                babyId,
                userId,
                event.event_type,
                event.description,
                JSON.stringify(event.data) || null,
            ]);
            logger_1.logger.info(`事件已记录 [宝宝: ${babyId}, 类型: ${event.event_type}]`);
        }
        catch (error) {
            logger_1.logger.error('记录事件失败:', error);
        }
    }
    /**
     * 存储/更新用户配置
     */
    async storeUserConfig(userId, babyId, config) {
        const query = `
      INSERT INTO user_config (user_id, baby_id, notification_enabled, notification_frequency, preferred_time_zone, language, other_settings)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        notification_enabled = $3, notification_frequency = $4, preferred_time_zone = $5, language = $6, other_settings = $7, updated_at = CURRENT_TIMESTAMP
    `;
        try {
            await this.pool.query(query, [
                userId,
                babyId,
                config.notification_enabled ?? true,
                config.notification_frequency || 'daily',
                config.preferred_time_zone || 'Asia/Shanghai',
                config.language || 'zh-CN',
                JSON.stringify(config.other_settings || {}),
            ]);
            logger_1.logger.info(`用户配置已保存 [用户: ${userId}]`);
        }
        catch (error) {
            logger_1.logger.error('保存用户配置失败:', error);
        }
    }
    /**
     * 查询睡眠记录
     */
    async getSleepRecords(babyId, days = 30) {
        const query = `
      SELECT * FROM sleep_records 
      WHERE baby_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('查询睡眠记录失败:', error);
            return [];
        }
    }
    /**
     * 按日期查询睡眠记录。
     */
    async getSleepRecordsByDate(babyId, date) {
        const query = `
      SELECT * FROM sleep_records
      WHERE baby_id = $1 AND date = $2
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId, date]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('按日期查询睡眠记录失败:', error);
            return [];
        }
    }
    /**
     * 查询生理事件
     */
    async getHealthEvents(babyId, days = 7) {
        const query = `
      SELECT * FROM health_events 
      WHERE baby_id = $1 AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('查询生理事件失败:', error);
            return [];
        }
    }
    /**
     * 按日期查询生理事件。
     */
    async getHealthEventsByDate(babyId, date) {
        const query = `
      SELECT * FROM health_events
      WHERE baby_id = $1 AND DATE(created_at) = $2
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId, date]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('按日期查询生理事件失败:', error);
            return [];
        }
    }
    /**
     * 查询事件日志。
     */
    async getEventLogs(babyId, days = 7) {
        const query = `
      SELECT * FROM event_logs
      WHERE baby_id = $1 AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('查询事件日志失败:', error);
            return [];
        }
    }
    /**
     * 按日期查询事件日志。
     */
    async getEventLogsByDate(babyId, date) {
        const query = `
      SELECT * FROM event_logs
      WHERE baby_id = $1 AND DATE(created_at) = $2
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [babyId, date]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('按日期查询事件日志失败:', error);
            return [];
        }
    }
}
exports.EventStore = EventStore;
exports.eventStore = new EventStore();
//# sourceMappingURL=eventStore.js.map