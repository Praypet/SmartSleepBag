"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgent = void 0;
const BabyAgent_1 = require("./BabyAgent");
const memoryStore_1 = require("../memory/memoryStore");
const dataCleanupService_1 = require("../services/dataCleanupService");
const conversationSummaryTool_1 = require("../tools/conversationSummaryTool");
const logger_1 = require("../utils/logger");
/**
 * Agent 实例缓存（每个用户一个实例）。
 */
const agentInstances = {};
// 防止短时间内重复生成摘要。
const lastSummaryTime = {};
const extractAgentText = (result) => {
    if (!result) {
        return '';
    }
    const normalizeContent = (content) => {
        if (typeof content === 'string') {
            return content.trim();
        }
        if (Array.isArray(content)) {
            return content
                .map((item) => {
                if (typeof item === 'string')
                    return item;
                if (typeof item?.text === 'string')
                    return item.text;
                return '';
            })
                .filter(Boolean)
                .join('\n')
                .trim();
        }
        return '';
    };
    // 严格按你当前 BabyAgent 的真实返回结构提取：
    // messages -> 最后一条 AIMessage -> 先取 message.content，再回退到 message.kwargs.content。
    if (Array.isArray(result.messages)) {
        for (let i = result.messages.length - 1; i >= 0; i -= 1) {
            const message = result.messages[i];
            const isAiMessage = message?.constructor?.name === 'AIMessage' ||
                message?._getType?.() === 'ai' ||
                message?.getType?.() === 'ai' ||
                message?.kwargs?.type === 'ai';
            if (!isAiMessage) {
                continue;
            }
            const directContent = normalizeContent(message?.content);
            if (directContent) {
                return directContent;
            }
            const kwargsContent = normalizeContent(message?.kwargs?.content);
            if (kwargsContent) {
                return kwargsContent;
            }
        }
    }
    if (typeof result === 'string') {
        return result.trim();
    }
    return (normalizeContent(result.content) ||
        normalizeContent(result.kwargs?.content) ||
        normalizeContent(result.text));
};
/**
 * 运行 Agent 的统一入口。
 */
const runAgent = async (input, babyId = 'baby_001', userId) => {
    const agentKey = userId || babyId;
    if (!agentInstances[agentKey]) {
        agentInstances[agentKey] = new BabyAgent_1.BabyAgent(babyId, userId);
    }
    const babyAgent = agentInstances[agentKey];
    await babyAgent.waitUntilReady();
    const memoryKey = userId || babyId;
    try {
        logger_1.logger.info(`[Step 1] 开始数据清理检查 [用户: ${memoryKey}]`);
        await dataCleanupService_1.dataCleanupService.executeCleanup(memoryKey);
        logger_1.logger.info(`[Step 2] 检索历史记忆 [用户: ${memoryKey}]`);
        const longTermContext = await memoryStore_1.memoryStore.retrieve(memoryKey, input, 'long');
        const history = await memoryStore_1.memoryStore.retrieve(memoryKey, '', 'short');
        logger_1.logger.info(`[Step 3] 执行 Agent [用户: ${memoryKey}]`);
        const rawResult = await babyAgent.run(input, babyId, history, longTermContext.join('\n'));
        const content = extractAgentText(rawResult);
        logger_1.logger.info(`[Step 3.1] 提取到最终回复文本，长度: ${content.length}`);
        logger_1.logger.info(`[Step 4] 存储对话到短期记忆 [用户: ${memoryKey}]`);
        await memoryStore_1.memoryStore.store(memoryKey, { role: 'user', content: input }, 'short');
        await memoryStore_1.memoryStore.store(memoryKey, { role: 'assistant', content }, 'short');
        const now = Date.now();
        const lastSummary = lastSummaryTime[memoryKey] || 0;
        const summaryInterval = 24 * 60 * 60 * 1000;
        if (now - lastSummary > summaryInterval) {
            logger_1.logger.info(`[Step 5] 生成日摘要 [用户: ${memoryKey}]`);
            try {
                const conversationHistory = (await memoryStore_1.memoryStore.retrieve(memoryKey, '', 'short'));
                if (conversationHistory && conversationHistory.length > 0) {
                    const summaryTool = new conversationSummaryTool_1.ConversationSummaryTool();
                    await summaryTool._call({
                        userId: memoryKey,
                        babyId,
                        conversationHistory,
                        summaryType: 'daily',
                    });
                    lastSummaryTime[memoryKey] = now;
                }
            }
            catch (error) {
                logger_1.logger.error('生成日摘要失败:', error);
            }
        }
        return {
            content,
            raw: rawResult,
        };
    }
    catch (error) {
        logger_1.logger.error('Agent 执行过程出错:', error);
        throw error;
    }
};
exports.runAgent = runAgent;
//# sourceMappingURL=agentExecutor.js.map