"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SleepSuggestionTool = exports.WakeAnalysisTool = exports.SleepQualityTool = exports.SleepStagesTool = void 0;
const tools_1 = require("@langchain/core/tools");
const dataSync_service_1 = require("../services/dataSync.service");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
// 睡眠阶段分析工具
class SleepStagesTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'sleep_stages_analysis';
        this.description = '获取宝宝的睡眠阶段分布数据（深睡/浅睡/REM/清醒时长）。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(date) {
        logger_1.logger.info(`查询睡眠阶段分布：${date || '今天'}`);
        const data = await dataSync_service_1.dataSyncService.getSleepStages(date);
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data && Array.isArray(data)) {
            try {
                // 计算各阶段时长
                const deepSleep = data.find((stage) => stage.name === '深睡')?.hours || 0;
                const lightSleep = data.find((stage) => stage.name === '浅睡')?.hours || 0;
                const remSleep = data.find((stage) => stage.name === 'REM')?.hours || 0;
                const awake = data.find((stage) => stage.name === '清醒')?.hours || 0;
                const totalSleep = deepSleep + lightSleep + remSleep;
                await memoryStore_1.memoryStore.storeSleepRecord(this.babyId, this.userId, {
                    date: date || new Date().toISOString().split('T')[0],
                    deep_sleep_hours: deepSleep,
                    light_sleep_hours: lightSleep,
                    rem_sleep_hours: remSleep,
                    total_sleep_hours: totalSleep,
                    notes: `清醒时长: ${awake}小时`
                });
                logger_1.logger.info(`睡眠阶段数据已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储睡眠阶段数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.SleepStagesTool = SleepStagesTool;
// 睡眠质量工具
class SleepQualityTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'sleep_quality_score';
        this.description = '获取宝宝的睡眠质量评分和标签。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(date) {
        logger_1.logger.info(`查询睡眠质量评分：${date || '今天'}`);
        const data = await dataSync_service_1.dataSyncService.getQualityScore(date);
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data) {
            try {
                await memoryStore_1.memoryStore.storeSleepRecord(this.babyId, this.userId, {
                    date: date || new Date().toISOString().split('T')[0],
                    sleep_quality: data.score,
                    notes: `质量标签: ${data.tags?.join(', ') || ''}`
                });
                logger_1.logger.info(`睡眠质量数据已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储睡眠质量数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.SleepQualityTool = SleepQualityTool;
// 夜醒分析工具
class WakeAnalysisTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'wake_analysis';
        this.description = '获取宝宝的夜醒次数统计和原因分析。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(date) {
        logger_1.logger.info(`查询夜醒分析：${date || '今天'}`);
        const data = await dataSync_service_1.dataSyncService.getWakeAnalysis(date);
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data) {
            try {
                const reasonsText = data.reasons?.map((r) => `${r.name}:${r.percentage}%`).join('; ') || '';
                await memoryStore_1.memoryStore.storeSleepRecord(this.babyId, this.userId, {
                    date: date || new Date().toISOString().split('T')[0],
                    wake_count: data.totalCount,
                    wake_reasons: reasonsText,
                    notes: `夜醒原因分析: ${reasonsText}`
                });
                logger_1.logger.info(`夜醒分析数据已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储夜醒分析数据失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.WakeAnalysisTool = WakeAnalysisTool;
// 睡眠建议工具
class SleepSuggestionTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'sleep_suggestions';
        this.description = '获取基于睡眠分析的智能建议和改善方案。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(_) {
        logger_1.logger.info('获取睡眠建议');
        const recentSleep = await dataSync_service_1.dataSyncService.getRecentSleep(3);
        const sleepStatus = await dataSync_service_1.dataSyncService.getSleepStatus();
        return JSON.stringify({ recentSleep, sleepStatus });
    }
}
exports.SleepSuggestionTool = SleepSuggestionTool;
//# sourceMappingURL=sleepAnalysisTools.js.map