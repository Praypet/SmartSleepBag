import { Tool } from '@langchain/core/tools';
import { dataSyncService } from '../services/dataSync.service';
import { memoryStore } from '../memory/memoryStore';
import { logger } from '../utils/logger';

/**
 * 用于分析宝宝哭声的工具
 */
export class CryAnalysisTool extends Tool {
  name = 'cry_analysis';
  description = '获取宝宝的哭声实时分析结果，包括是否哭泣、可能原因和概率分布。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(_: string): Promise<string> {
    logger.info('执行哭声分析');
    const data = await dataSyncService.getCryAnalysis();

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data) {
      try {
        const eventType = data.isCrying ? 'crying_detected' : 'no_crying';
        const description = data.isCrying
          ? `检测到哭声，可能原因: ${data.possibleReasons?.join(', ') || '未知'}`
          : '未检测到哭声';

        const probabilitiesText = data.probabilities?.map((p: any) => `${p.name}:${p.probability}%`).join('; ') || '';

        await memoryStore.storeEvent(this.babyId, this.userId, {
          event_type: eventType,
          description: description,
          data: {
            isCrying: data.isCrying,
            possibleReasons: data.possibleReasons,
            probabilities: data.probabilities,
            probabilitiesText: probabilitiesText
          }
        });
        logger.info(`哭声分析数据已存储 [宝宝: ${this.babyId}, 哭泣: ${data.isCrying}]`);
      } catch (error) {
        logger.error('存储哭声分析数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

