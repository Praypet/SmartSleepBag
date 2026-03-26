import { BabyAgent } from './BabyAgent';
import { memoryStore } from '../memory/memoryStore';
import { dataCleanupService } from '../services/dataCleanupService';
import { ConversationSummaryTool } from '../tools/conversationSummaryTool';
import { logger } from '../utils/logger';

/**
 * Agent 实例缓存（每个用户一个实例）。
 */
const agentInstances: Record<string, BabyAgent> = {};

// 防止短时间内重复生成摘要。
const lastSummaryTime: Record<string, number> = {};

export type AgentExecutionResult = {
  content: string;
  raw: unknown;
};

const extractAgentText = (result: any): string => {
  if (!result) {
    return '';
  }

  const normalizeContent = (content: unknown): string => {
    if (typeof content === 'string') {
      return content.trim();
    }

    if (Array.isArray(content)) {
      return content
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (typeof item?.text === 'string') return item.text;
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
      const isAiMessage =
        message?.constructor?.name === 'AIMessage' ||
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

  return (
    normalizeContent(result.content) ||
    normalizeContent(result.kwargs?.content) ||
    normalizeContent(result.text)
  );
};

/**
 * 运行 Agent 的统一入口。
 */
export const runAgent = async (
  input: string,
  babyId: string = 'baby_001',
  userId?: string,
): Promise<AgentExecutionResult> => {
  const agentKey = userId || babyId;
  if (!agentInstances[agentKey]) {
    agentInstances[agentKey] = new BabyAgent(babyId, userId);
  }
  const babyAgent = agentInstances[agentKey];

  await babyAgent.waitUntilReady();

  const memoryKey = userId || babyId;

  try {
    logger.info(`[Step 1] 开始数据清理检查 [用户: ${memoryKey}]`);
    await dataCleanupService.executeCleanup(memoryKey);

    logger.info(`[Step 2] 检索历史记忆 [用户: ${memoryKey}]`);
    const longTermContext = await memoryStore.retrieve(memoryKey, input, 'long');
    const history = await memoryStore.retrieve(memoryKey, '', 'short');

    logger.info(`[Step 3] 执行 Agent [用户: ${memoryKey}]`);
    const rawResult = await babyAgent.run(
      input,
      babyId,
      history as any,
      longTermContext.join('\n'),
    );
    const content = extractAgentText(rawResult);
    logger.info(`[Step 3.1] 提取到最终回复文本，长度: ${content.length}`);

    logger.info(`[Step 4] 存储对话到短期记忆 [用户: ${memoryKey}]`);
    await memoryStore.store(memoryKey, { role: 'user', content: input }, 'short');
    await memoryStore.store(memoryKey, { role: 'assistant', content }, 'short');

    const now = Date.now();
    const lastSummary = lastSummaryTime[memoryKey] || 0;
    const summaryInterval = 24 * 60 * 60 * 1000;

    if (now - lastSummary > summaryInterval) {
      logger.info(`[Step 5] 生成日摘要 [用户: ${memoryKey}]`);

      try {
        const conversationHistory = (await memoryStore.retrieve(memoryKey, '', 'short')) as any[];

        if (conversationHistory && conversationHistory.length > 0) {
          const summaryTool = new ConversationSummaryTool();
          await summaryTool._call({
            userId: memoryKey,
            babyId,
            conversationHistory,
            summaryType: 'daily',
          });

          lastSummaryTime[memoryKey] = now;
        }
      } catch (error) {
        logger.error('生成日摘要失败:', error);
      }
    }

    return {
      content,
      raw: rawResult,
    };
  } catch (error) {
    logger.error('Agent 执行过程出错:', error);
    throw error;
  }
};
