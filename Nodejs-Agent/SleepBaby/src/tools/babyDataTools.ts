import { Tool } from '@langchain/core/tools';
import { dataSyncService } from '../services/dataSync.service';
import { memoryStore } from '../memory/memoryStore';
import { logger } from '../utils/logger';

export class BabyDataQueryTool extends Tool {
  name = 'baby_data_query';
  description = '查询宝宝的基础信息，如姓名、年龄和性别（home/baby-info）。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(_: string): Promise<string> {
    logger.info('正在通过 HTTP 从后端获取宝宝基础信息');
    const data = await dataSyncService.getBabyInfo();

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data) {
      try {
        await memoryStore.storeBabyProfile(this.babyId, {
          name: data.name,
          gender: data.gender,
          birth_date: new Date().toISOString().split('T')[0], // 需要从年龄计算出生日期
          avatar_url: data.avatar
        });
        logger.info(`宝宝档案已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储宝宝档案失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}
