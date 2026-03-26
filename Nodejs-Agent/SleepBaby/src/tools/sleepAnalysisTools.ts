import { Tool } from '@langchain/core/tools';
import { dataSyncService } from '../services/dataSync.service';
import { memoryStore } from '../memory/memoryStore';
import { logger } from '../utils/logger';

// 睡眠阶段分析工具
export class SleepStagesTool extends Tool {
  name = 'sleep_stages_analysis';
  description = '获取宝宝的睡眠阶段分布数据（深睡/浅睡/REM/清醒时长）。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(date?: string): Promise<string> {
    logger.info(`查询睡眠阶段分布：${date || '今天'}`);
    const data = await dataSyncService.getSleepStages(date);

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data && Array.isArray(data)) {
      try {
        // 计算各阶段时长
        const deepSleep = data.find((stage: any) => stage.name === '深睡')?.hours || 0;
        const lightSleep = data.find((stage: any) => stage.name === '浅睡')?.hours || 0;
        const remSleep = data.find((stage: any) => stage.name === 'REM')?.hours || 0;
        const awake = data.find((stage: any) => stage.name === '清醒')?.hours || 0;
        const totalSleep = deepSleep + lightSleep + remSleep;

        await memoryStore.storeSleepRecord(this.babyId, this.userId, {
          date: date || new Date().toISOString().split('T')[0],
          deep_sleep_hours: deepSleep,
          light_sleep_hours: lightSleep,
          rem_sleep_hours: remSleep,
          total_sleep_hours: totalSleep,
          notes: `清醒时长: ${awake}小时`
        });
        logger.info(`睡眠阶段数据已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储睡眠阶段数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

// 睡眠质量工具
export class SleepQualityTool extends Tool {
  name = 'sleep_quality_score';
  description = '获取宝宝的睡眠质量评分和标签。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(date?: string): Promise<string> {
    logger.info(`查询睡眠质量评分：${date || '今天'}`);
    const data = await dataSyncService.getQualityScore(date);

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data) {
      try {
        await memoryStore.storeSleepRecord(this.babyId, this.userId, {
          date: date || new Date().toISOString().split('T')[0],
          sleep_quality: data.score,
          notes: `质量标签: ${data.tags?.join(', ') || ''}`
        });
        logger.info(`睡眠质量数据已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储睡眠质量数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

// 夜醒分析工具
export class WakeAnalysisTool extends Tool {
  name = 'wake_analysis';
  description = '获取宝宝的夜醒次数统计和原因分析。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(date?: string): Promise<string> {
    logger.info(`查询夜醒分析：${date || '今天'}`);
    const data = await dataSyncService.getWakeAnalysis(date);

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data) {
      try {
        const reasonsText = data.reasons?.map((r: any) => `${r.name}:${r.percentage}%`).join('; ') || '';
        await memoryStore.storeSleepRecord(this.babyId, this.userId, {
          date: date || new Date().toISOString().split('T')[0],
          wake_count: data.totalCount,
          wake_reasons: reasonsText,
          notes: `夜醒原因分析: ${reasonsText}`
        });
        logger.info(`夜醒分析数据已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储夜醒分析数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

// 睡眠建议工具
export class SleepSuggestionTool extends Tool {
  name = 'sleep_suggestions';
  description = '获取基于睡眠分析的智能建议和改善方案。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(_: string): Promise<string> {
    logger.info('获取睡眠建议');
    const recentSleep = await dataSyncService.getRecentSleep(3);
    const sleepStatus = await dataSyncService.getSleepStatus();
    return JSON.stringify({ recentSleep, sleepStatus });
  }
}

