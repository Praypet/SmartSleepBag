"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureTool = void 0;
const tools_1 = require("@langchain/core/tools");
const dataSync_service_1 = require("../services/dataSync.service");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
/**
 * 用于查询宝宝体温变化趋势的工具。
 */
class TemperatureTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'temperature_monitoring';
        this.description = '获取宝宝历史体温变化数据，用于分析体温趋势。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(hours) {
        // LLM 工具调用可能传入非数字文本，这里统一兜底为 8 小时，避免请求参数变成 NaN。
        const parsedHours = hours ? Number(hours) : 8;
        const h = Number.isFinite(parsedHours) && parsedHours > 0 ? parsedHours : 8;
        logger_1.logger.info(`获取过去 ${h} 小时的体温数据`);
        const data = await dataSync_service_1.dataSyncService.getTempData(h);
        // 将最新体温数据同步到事件存储，供后续分析使用。
        if (this.babyId && this.userId && data && data.temperatures && Array.isArray(data.temperatures)) {
            try {
                const latestTemp = data.temperatures[data.temperatures.length - 1];
                if (latestTemp) {
                    await memoryStore_1.memoryStore.storeHealthEvent(this.babyId, this.userId, {
                        event_type: 'temperature',
                        temperature: latestTemp,
                        unit: '°C',
                        notes: `过去 ${h} 小时体温监测数据`,
                    });
                    logger_1.logger.info(`体温数据已存储 [宝宝: ${this.babyId}, 温度: ${latestTemp}°C]`);
                }
            }
            catch (error) {
                logger_1.logger.error('存储体温数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.TemperatureTool = TemperatureTool;
//# sourceMappingURL=physiologicalMonitoringTool.js.map