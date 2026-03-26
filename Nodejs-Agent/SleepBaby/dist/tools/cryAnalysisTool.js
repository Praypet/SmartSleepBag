"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryAnalysisTool = void 0;
const tools_1 = require("@langchain/core/tools");
const dataSync_service_1 = require("../services/dataSync.service");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
/**
 * 用于分析宝宝哭声的工具
 */
class CryAnalysisTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'cry_analysis';
        this.description = '获取宝宝的哭声实时分析结果，包括是否哭泣、可能原因和概率分布。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(_) {
        logger_1.logger.info('执行哭声分析');
        const data = await dataSync_service_1.dataSyncService.getCryAnalysis();
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data) {
            try {
                const eventType = data.isCrying ? 'crying_detected' : 'no_crying';
                const description = data.isCrying
                    ? `检测到哭声，可能原因: ${data.possibleReasons?.join(', ') || '未知'}`
                    : '未检测到哭声';
                const probabilitiesText = data.probabilities?.map((p) => `${p.name}:${p.probability}%`).join('; ') || '';
                await memoryStore_1.memoryStore.storeEvent(this.babyId, this.userId, {
                    event_type: eventType,
                    description: description,
                    data: {
                        isCrying: data.isCrying,
                        possibleReasons: data.possibleReasons,
                        probabilities: data.probabilities,
                        probabilitiesText: probabilitiesText
                    }
                });
                logger_1.logger.info(`哭声分析数据已存储 [宝宝: ${this.babyId}, 哭泣: ${data.isCrying}]`);
            }
            catch (error) {
                logger_1.logger.error('存储哭声分析数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.CryAnalysisTool = CryAnalysisTool;
//# sourceMappingURL=cryAnalysisTool.js.map