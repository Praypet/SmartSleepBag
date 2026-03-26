import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { eventStore } from '../services/eventStore';
import { logger } from '../utils/logger';

const HistoricalDataQuerySchema = z.object({
  date: z.string().optional().describe('要查询的具体日期，格式为 YYYY-MM-DD。若查询昨天，请先换算成具体日期再传入。'),
  days: z.number().int().positive().max(30).optional().describe('查询最近几天的数据。提供 date 时可不传。'),
  dataType: z
    .enum(['all', 'sleep', 'health', 'events'])
    .optional()
    .describe('要查询的数据类型：sleep 睡眠记录，health 生理事件，events 事件日志，all 为全部。'),
});

/**
 * 用于查询 PostgreSQL 中已经沉淀的历史睡眠、生理和事件数据。
 */
export class HistoricalDataQueryTool extends StructuredTool<typeof HistoricalDataQuerySchema> {
  name = 'historical_data_query';
  description =
    '查询 PostgreSQL(EventStore) 中的历史婴儿数据，适用于用户询问昨天、前几天、某一天的睡眠、生理指标或事件记录。';
  schema = HistoricalDataQuerySchema;
  private babyId?: string;

  constructor(babyId?: string) {
    super();
    this.babyId = babyId;
  }

  async _call({
    date,
    days,
    dataType = 'all',
  }: z.infer<typeof HistoricalDataQuerySchema>): Promise<string> {
    if (!this.babyId) {
      return JSON.stringify({ error: '缺少 babyId，无法查询历史数据。' });
    }

    const rangeDays = days && Number.isFinite(days) ? days : 7;
    logger.info(
      `查询历史数据 [宝宝: ${this.babyId}, 类型: ${dataType}, 日期: ${date || '未指定'}, 最近天数: ${rangeDays}]`,
    );

    const result: Record<string, unknown> = {
      babyId: this.babyId,
      query: {
        date: date || null,
        days: date ? null : rangeDays,
        dataType,
      },
    };

    if (dataType === 'all' || dataType === 'sleep') {
      result.sleepRecords = date
        ? await eventStore.getSleepRecordsByDate(this.babyId, date)
        : await eventStore.getSleepRecords(this.babyId, rangeDays);
    }

    if (dataType === 'all' || dataType === 'health') {
      result.healthEvents = date
        ? await eventStore.getHealthEventsByDate(this.babyId, date)
        : await eventStore.getHealthEvents(this.babyId, rangeDays);
    }

    if (dataType === 'all' || dataType === 'events') {
      result.eventLogs = date
        ? await eventStore.getEventLogsByDate(this.babyId, date)
        : await eventStore.getEventLogs(this.babyId, rangeDays);
    }

    return JSON.stringify(result);
  }
}
