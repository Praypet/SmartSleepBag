/**
 * 事件存储服务（PostgreSQL）
 * 用于存储所有原始的宝宝数据事件：
 * - 睡眠日志（保留180天）
 * - 生理事件：心率、体温、呼吸数据（保留90天）
 * - 事件日志：哭闹、换尿布等（保留30天）
 * - 用户配置：宝宝信息、家长偏好（永久保留）
 */
export declare class EventStore {
    private pool;
    constructor();
    private initTables;
    /**
     * 存储宝宝基本信息
     */
    storeBabyProfile(babyId: string, profile: {
        name: string;
        gender: string;
        birth_date: string;
        avatar_url?: string;
    }): Promise<void>;
    /**
     * 存储睡眠记录
     */
    storeSleepRecord(babyId: string, userId: string, record: {
        date: string;
        sleep_quality?: number;
        deep_sleep_hours?: number;
        light_sleep_hours?: number;
        rem_sleep_hours?: number;
        total_sleep_hours?: number;
        wake_count?: number;
        wake_reasons?: string;
        notes?: string;
    }): Promise<void>;
    /**
     * 存储生理事件
     */
    storeHealthEvent(babyId: string, userId: string, event: {
        event_type: string;
        temperature?: number;
        heart_rate?: number;
        respiratory_rate?: number;
        value?: number;
        unit?: string;
        notes?: string;
    }): Promise<void>;
    /**
     * 存储日常事件
     */
    storeEventLog(babyId: string, userId: string, event: {
        event_type: string;
        description: string;
        data?: any;
    }): Promise<void>;
    /**
     * 存储/更新用户配置
     */
    storeUserConfig(userId: string, babyId: string, config: any): Promise<void>;
    /**
     * 查询睡眠记录
     */
    getSleepRecords(babyId: string, days?: number): Promise<any[]>;
    /**
     * 按日期查询睡眠记录。
     */
    getSleepRecordsByDate(babyId: string, date: string): Promise<any[]>;
    /**
     * 查询生理事件
     */
    getHealthEvents(babyId: string, days?: number): Promise<any[]>;
    /**
     * 按日期查询生理事件。
     */
    getHealthEventsByDate(babyId: string, date: string): Promise<any[]>;
    /**
     * 查询事件日志。
     */
    getEventLogs(babyId: string, days?: number): Promise<any[]>;
    /**
     * 按日期查询事件日志。
     */
    getEventLogsByDate(babyId: string, date: string): Promise<any[]>;
}
export declare const eventStore: EventStore;
//# sourceMappingURL=eventStore.d.ts.map