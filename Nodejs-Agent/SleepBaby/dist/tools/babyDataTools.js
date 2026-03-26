"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabyDataQueryTool = void 0;
const tools_1 = require("@langchain/core/tools");
const dataSync_service_1 = require("../services/dataSync.service");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
class BabyDataQueryTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'baby_data_query';
        this.description = '查询宝宝的基础信息，如姓名、年龄和性别（home/baby-info）。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(_) {
        logger_1.logger.info('正在通过 HTTP 从后端获取宝宝基础信息');
        const data = await dataSync_service_1.dataSyncService.getBabyInfo();
        // 存储到 PostgreSQL（eventStore）
        if (this.babyId && this.userId && data) {
            try {
                await memoryStore_1.memoryStore.storeBabyProfile(this.babyId, {
                    name: data.name,
                    gender: data.gender,
                    birth_date: new Date().toISOString().split('T')[0], // 需要从年龄计算出生日期
                    avatar_url: data.avatar
                });
                logger_1.logger.info(`宝宝档案已存储 [宝宝: ${this.babyId}]`);
            }
            catch (error) {
                logger_1.logger.error('存储宝宝档案失败:', error);
            }
        }
        return JSON.stringify(data);
    }
}
exports.BabyDataQueryTool = BabyDataQueryTool;
//# sourceMappingURL=babyDataTools.js.map