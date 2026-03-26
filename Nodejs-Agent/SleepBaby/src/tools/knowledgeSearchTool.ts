import { Tool } from '@langchain/core/tools';
import { KnowledgeBase } from '../rag/knowledgeBase';
import { logger } from '../utils/logger';

const kb = new KnowledgeBase();

export class KnowledgeSearchTool extends Tool {
  name = 'knowledge_search';
  description = '搜索婴儿护理知识库，输入查询字符串，返回相关知识内容。支持精确搜索和模糊匹配。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(query: string): Promise<string> {
    try {
      logger.info(`正在知识库中搜索: ${query}`);

      // 使用增强搜索，设置相似度阈值
      const results = await kb.searchEnhanced(query, {
        nResults: 3,           // 返回前3个最相关结果
        minSimilarity: 0.75,   // 相似度阈值75%
        includeScores: false,  // 不包含相似度分数
      });

      if (results.length === 0) {
        return '抱歉，在知识库中没有找到相关信息。建议咨询专业医生或育儿专家。';
      }

      // 格式化搜索结果
      const formattedResults = results
        .map((result, index) => `[${index + 1}] ${result.content}`)
        .join('\n\n');

      return `根据知识库搜索结果：\n\n${formattedResults}\n\n注意：以上信息仅供参考，具体情况请以专业医嘱为准。`;
    } catch (error) {
      logger.error('知识搜索失败:', error);
      return '知识搜索暂时不可用，请稍后重试。';
    }
  }
}