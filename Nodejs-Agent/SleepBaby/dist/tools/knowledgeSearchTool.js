"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSearchTool = void 0;
const tools_1 = require("@langchain/core/tools");
const knowledgeBase_1 = require("../rag/knowledgeBase");
const logger_1 = require("../utils/logger");
const kb = new knowledgeBase_1.KnowledgeBase();
class KnowledgeSearchTool extends tools_1.Tool {
    constructor(babyId, userId) {
        super();
        this.name = 'knowledge_search';
        this.description = '搜索婴儿护理知识库，输入查询字符串，返回相关知识内容。支持精确搜索和模糊匹配。';
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call(query) {
        try {
            logger_1.logger.info(`正在知识库中搜索: ${query}`);
            // 使用增强搜索，设置相似度阈值
            const results = await kb.searchEnhanced(query, {
                nResults: 3, // 返回前3个最相关结果
                minSimilarity: 0.75, // 相似度阈值75%
                includeScores: false, // 不包含相似度分数
            });
            if (results.length === 0) {
                return '抱歉，在知识库中没有找到相关信息。建议咨询专业医生或育儿专家。';
            }
            // 格式化搜索结果
            const formattedResults = results
                .map((result, index) => `[${index + 1}] ${result.content}`)
                .join('\n\n');
            return `根据知识库搜索结果：\n\n${formattedResults}\n\n注意：以上信息仅供参考，具体情况请以专业医嘱为准。`;
        }
        catch (error) {
            logger_1.logger.error('知识搜索失败:', error);
            return '知识搜索暂时不可用，请稍后重试。';
        }
    }
}
exports.KnowledgeSearchTool = KnowledgeSearchTool;
//# sourceMappingURL=knowledgeSearchTool.js.map