import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config/index.config';
import { LongTermMemory } from '../memory/LongTermMemory';
import { logger } from '../utils/logger';

const ConversationSummarySchema = z.object({
  userId: z.string().describe('用户或宝宝的唯一标识符'),
  babyId: z.string().describe('宝宝的唯一标识符'),
  conversationHistory: z.array(
    z.object({
      role: z.string().describe('消息角色 (user 或 assistant)'),
      content: z.string().describe('消息内容'),
    })
  ).describe('要总结的对话历史'),
  summaryType: z.enum(['daily', 'weekly', 'monthly']).describe('摘要类型'),
});

/**
 * 对话摘要生成工具
 * 用于总结历史对话，提取关键信息，存入长期记忆（Chroma）
 * 支持日、周、月多个维度的总结
 */
export class ConversationSummaryTool extends StructuredTool<typeof ConversationSummarySchema> {
  name = 'conversation_summary';
  description = '总结过往对话历史，提取宝宝行为规律和家长偏好，存入长期记忆库。支持日摘要、周统计、月总结等多个维度。';
  schema = ConversationSummarySchema;

  private llm: ChatOpenAI;
  private longTermMemory: LongTermMemory;

  constructor() {
    super();
    this.llm = new ChatOpenAI({
      apiKey: config.llm.apiKey,
      modelName: config.llm.modelName,
      temperature: 0.5, // 摘要需要相对较低的创意度
      configuration: {
        baseURL: config.llm.baseUrl,
      },
    });
    this.longTermMemory = new LongTermMemory();
  }

  async _call({
    userId,
    babyId,
    conversationHistory,
    summaryType,
  }: z.infer<typeof ConversationSummarySchema>): Promise<string> {
    try {
      logger.info(
        `开始生成${summaryType}摘要 [用户: ${userId}, 宝宝: ${babyId}, 对话条数: ${conversationHistory.length}]`
      );

      // 构建对话总结提示词
      const conversationText = conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = this.buildSummaryPrompt(conversationText, summaryType);

      // 调用 LLM 生成摘要
      const response = await this.llm.invoke([
        {
          role: 'user' as const,
          content: summaryPrompt,
        },
      ]);

      const summary = response.content as string;

      // 确定存储分类
      let category: 'daily_summary' | 'weekly_pattern' | 'monthly_summary' = 'daily_summary';
      if (summaryType === 'weekly') category = 'weekly_pattern';
      else if (summaryType === 'monthly') category = 'monthly_summary';

      // 同一类摘要只保留一个 active 版本，避免后续检索时被重复拼接。
      await this.longTermMemory.updateVersion(userId, category, summary);

      logger.info(`${summaryType}摘要已生成并保存 [用户: ${userId}]`);
      return `成功生成并保存${summaryType}摘要。\n摘要内容：\n${summary}`;
    } catch (error) {
      logger.error('生成对话摘要失败:', error);
      return '无法生成对话摘要，请稍后重试。';
    }
  }

  /**
   * 构建摘要生成提示词
   */
  private buildSummaryPrompt(conversationText: string, type: string): string {
    const basePrompt = `你是一个婴儿护理专家助手。请根据以下对话历史，生成${type}摘要。

对话内容：
---
${conversationText}
---

请基于以下维度进行总结：`;

    const prompts: Record<string, string> = {
      daily: `
**日摘要要求：**
1. 宝宝睡眠规律（入睡时间、睡眠质量、夜醒情况）
2. 宝宝情绪表现（哭闹频率、情绪状态）
3. 生理指标异常（体温、心率、呼吸）
4. 环境因素影响（温度、湿度、噪音）
5. 家长提出的主要问题和AI给出的建议摘要
6. 需要后续监测的重点

格式：清晰的列表形式，便于快速查阅。`,

      weekly: `
**周统计要求：**
1. 睡眠周趋势（周均睡眠时长、睡眠质量评分、规律性评估）
2. 情绪周期（一周内情绪波动、已识别的触发因素）
3. 生理数据汇总（体温、心率波动范围、异常事件）
4. 环境优化效果（过去一周实施的改善措施、效果评估）
5. 家长关键问题汇总（5条以内）
6. 下周关注重点

格式：用柱状数据和趋势描述。`,

      monthly: `
**月总结要求：**
1. 宝宝成长阶段评估（年龄进步、习惯变化）
2. 睡眠进展（与上月对比、规律改善度）
3. 情绪稳定性（一个月内的整体评分、关键事件）
4. 生理发育趋势（健康指标是否在正常范围）
5. 家长参与度和执行效果（建议采纳率、改善明显的方面）
6. 推荐的下月关注领域

格式：用对比分析和趋势预测的方式呈现。`,
    };

    return basePrompt + (prompts[type] || prompts['daily']);
  }
}
