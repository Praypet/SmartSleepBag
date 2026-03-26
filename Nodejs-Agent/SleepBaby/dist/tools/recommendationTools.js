"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationTool = void 0;
const tools_1 = require("@langchain/core/tools");
/**
 * 建议生成工具：基于收集到的数据生成简单的个性化建议
 */
class RecommendationTool extends tools_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'recommendation_generator';
        this.description = '根据宝宝的生理、睡眠和环境数据生成育儿建议。';
    }
    async _call(input) {
        // 简化的逻辑：直接返回一个通用的建议框架，
        // 让主 Agent 的 LLM 根据 systemPrompt 中的指令自行发挥。
        console.log(`正在处理建议请求: ${input}`);
        return "请结合宝宝的心率、体温、睡眠分布以及当前环境温湿度，给出2-3条针对性的育儿改进建议。";
    }
}
exports.RecommendationTool = RecommendationTool;
//# sourceMappingURL=recommendationTools.js.map