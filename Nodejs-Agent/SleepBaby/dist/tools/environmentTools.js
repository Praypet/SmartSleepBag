"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorSensorsTool = exports.HomeSensorsTool = void 0;
const tools_1 = require("@langchain/core/tools");
const dataSync_service_1 = require("../services/dataSync.service");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
// 首页传感器数据工具
class HomeSensorsTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'home_sensors';
        this.description = '获取首页显示的宝宝周围传感器数据（温度、心率、呼吸、体动）。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(_) {
        logger_1.logger.info('获取首页传感器数据');
        const data = await dataSync_service_1.dataSyncService.getSensors();
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data && Array.isArray(data)) {
            try {
                for (const sensor of data) {
                    let eventType = 'unknown';
                    let value = sensor.value;
                    let unit = sensor.unit;
                    // 根据传感器类型映射事件类型
                    switch (sensor.label) {
                        case '体温':
                            eventType = 'temperature';
                            break;
                        case '心率':
                            eventType = 'heart_rate';
                            break;
                        case '呼吸':
                            eventType = 'respiratory_rate';
                            break;
                        case '体动':
                            eventType = 'body_movement';
                            break;
                    }
                    await memoryStore_1.memoryStore.storeHealthEvent(this.babyId, this.userId, {
                        event_type: eventType,
                        value: value,
                        unit: unit,
                        notes: `首页传感器数据: ${sensor.label}`
                    });
                }
                logger_1.logger.info(`首页传感器数据已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储首页传感器数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.HomeSensorsTool = HomeSensorsTool;
// 监测传感器数据工具
class MonitorSensorsTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'monitor_sensors';
        this.description = '获取环境监测的各项传感器实时数据（环境温度、心率、呼吸、环境湿度）。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(_) {
        logger_1.logger.info('获取监测传感器数据');
        const data = await dataSync_service_1.dataSyncService.getMonitorSensors();
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data && Array.isArray(data)) {
            try {
                for (const sensor of data) {
                    let eventType = 'unknown';
                    let value = sensor.value;
                    let unit = sensor.unit;
                    // 根据传感器类型映射事件类型
                    switch (sensor.name) {
                        case '环境温度':
                            eventType = 'environment_temperature';
                            break;
                        case '心率':
                            eventType = 'heart_rate';
                            break;
                        case '呼吸':
                            eventType = 'respiratory_rate';
                            break;
                        case '环境湿度':
                            eventType = 'environment_humidity';
                            break;
                    }
                    await memoryStore_1.memoryStore.storeHealthEvent(this.babyId, this.userId, {
                        event_type: eventType,
                        value: value,
                        unit: unit,
                        notes: `环境监测传感器: ${sensor.name} - ${sensor.status}`
                    });
                }
                logger_1.logger.info(`监测传感器数据已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储监测传感器数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.MonitorSensorsTool = MonitorSensorsTool;
//# sourceMappingURL=environmentTools.js.map