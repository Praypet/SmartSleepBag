import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { memoryStore } from '../memory/memoryStore';
import { logger } from '../utils/logger';

const MemoryUpdateSchema = z.object({
  userId: z.string().describe('进行操作的用户或宝宝的唯一标识符'),
  fact: z.string().describe('需要存入长期记忆的、关于宝宝的一个明确事实或观察结果。'),
});

/**
 * 用于将关于宝宝的重要事实存入长期记忆的工具。
 */
export class MemoryUpdateTool extends StructuredTool<typeof MemoryUpdateSchema> {
  name = 'memory_update';
  description = '当发现关于宝宝的新的、重要的、可长期参考的信息时（如偏好、习惯、健康状况、重要事件），使用此工具进行记录。';
  schema = MemoryUpdateSchema;
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call({ userId, fact }: z.infer<typeof MemoryUpdateSchema>): Promise<string> {
    try {
      logger.info(`正在将事实存入长期记忆 [用户: ${userId}]: "${fact}"`);
      await memoryStore.store(userId, fact, 'long');
      return `成功将事实 "${fact}" 存入长期记忆。`;
    } catch (error) {
      logger.error('长期记忆存储失败:', error);
      return '无法存储该信息，请稍后重试。';
    }
  }
}
