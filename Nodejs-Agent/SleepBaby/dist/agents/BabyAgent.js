"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabyAgent = void 0;
const openai_1 = require("@langchain/openai");
const langchain_1 = require("langchain");
const index_config_1 = require("../config/index.config");
const tools_1 = require("../tools");
const agentPrompts_1 = require("./agentPrompts");
class BabyAgent {
    constructor(babyId = 'baby_001', userId) {
        this.agent = null;
        this.babyId = babyId;
        this.userId = userId;
        this.initPromise = this.initialize();
    }
    /**
     * 等待 Agent 初始化完成
     */
    async waitUntilReady() {
        return this.initPromise;
    }
    async initialize() {
        const llm = new openai_1.ChatOpenAI({
            apiKey: index_config_1.config.llm.apiKey,
            modelName: index_config_1.config.llm.modelName,
            temperature: index_config_1.config.llm.temperature,
            configuration: {
                baseURL: index_config_1.config.llm.baseUrl,
            },
        });
        const tools = [
            new tools_1.BabyDataQueryTool(this.babyId, this.userId),
            new tools_1.SleepStagesTool(this.babyId, this.userId),
            new tools_1.SleepQualityTool(this.babyId, this.userId),
            new tools_1.WakeAnalysisTool(this.babyId, this.userId),
            new tools_1.SleepSuggestionTool(this.babyId, this.userId),
            new tools_1.HomeSensorsTool(this.babyId, this.userId),
            new tools_1.MonitorSensorsTool(this.babyId, this.userId),
            new tools_1.TemperatureTool(this.babyId, this.userId),
            new tools_1.HistoricalDataQueryTool(this.babyId),
            new tools_1.CryAnalysisTool(this.babyId, this.userId),
            new tools_1.MemoryUpdateTool(this.babyId, this.userId),
            new tools_1.KnowledgeSearchTool(this.babyId, this.userId),
        ];
        const combinedSystemPrompt = `${agentPrompts_1.systemPrompt}\n\n在生成最终回复时，请务必严格遵守以下模板：\n${agentPrompts_1.finalResponseTemplate}`;
        this.agent = (0, langchain_1.createAgent)({
            model: llm,
            tools,
            systemPrompt: combinedSystemPrompt,
        });
    }
    /**
     * 执行 Agent 任务
     * @param input 用户输入
     * @param babyId 宝宝 ID
     * @param history 对话历史记录
     * @param longTermMemoryContext 长期记忆中检索到的相关上下文
     */
    async run(input, babyId = 'baby_001', history = [], longTermMemoryContext = '') {
        await this.waitUntilReady();
        let systemMessage = `当前正在服务的宝宝 ID 是: ${babyId}。在调用数据查询工具时，请务必使用此 ID。`;
        if (longTermMemoryContext) {
            systemMessage += `\n\n在回应前，请参考以下从长期记忆中检索到的相关信息：\n${longTermMemoryContext}`;
        }
        return this.agent.invoke({
            messages: [
                ...history,
                { role: 'user', content: input },
                { role: 'system', content: systemMessage }
            ],
        });
    }
}
exports.BabyAgent = BabyAgent;
//# sourceMappingURL=BabyAgent.js.map