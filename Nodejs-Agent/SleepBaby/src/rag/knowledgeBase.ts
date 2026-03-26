import { DocumentLoader } from './documentLoader';
import { VectorStore } from './vectorStore';
import { embeddings } from './embeddings';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';

export class KnowledgeBase {
  private documentLoader: DocumentLoader;
  private vectorStore: VectorStore;

  constructor() {
    this.documentLoader = new DocumentLoader();
    this.vectorStore = new VectorStore();
  }

  async indexDocument(filePath: string) {
    const docs = await this.documentLoader.loadDocument(filePath);
    for (const doc of docs) {
      const vector = await embeddings.embedQuery(doc.pageContent);
      await this.vectorStore.storeVector(vector, doc.metadata, doc.pageContent);
    }
  }

  /**
   * 批量索引目录中的所有文档
   */
  async indexDirectory(dirPath: string) {
    try {
      const docs = await this.documentLoader.loadDirectory(dirPath);
      logger.info(`开始批量索引 ${docs.length} 个文档块`);

      const batchSize = 10; // 每批处理10个文档
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        await this.processBatch(batch);
        logger.info(`已处理 ${Math.min(i + batchSize, docs.length)}/${docs.length} 个文档`);
      }

      logger.info(`批量索引完成，共处理 ${docs.length} 个文档块`);
    } catch (error) {
      logger.error('批量索引目录失败:', error);
    }
  }

  /**
   * 批量处理文档
   */
  private async processBatch(docs: any[]) {
    const promises = docs.map(async (doc) => {
      try {
        const vector = await embeddings.embedQuery(doc.pageContent);
        await this.vectorStore.storeVector(vector, doc.metadata, doc.pageContent);
      } catch (error) {
        logger.error('处理文档块失败:', error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 增强搜索：支持多重排序和过滤
   */
  async searchEnhanced(query: string, options?: {
    nResults?: number;
    minSimilarity?: number;
    includeScores?: boolean;
  }): Promise<{ content: string; score?: number }[]> {
    const cacheKey = `kb_search_enhanced_${createHash('md5').update(query + JSON.stringify(options)).digest('hex')}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const queryVector = await embeddings.embedQuery(query);
      const results = await this.vectorStore.retrieveVector(queryVector, {
        nResults: options?.nResults || 5,
        minSimilarity: options?.minSimilarity || 0.7,
        includeMetadata: options?.includeScores || false,
      });

      const enhancedResults = results.map(content => ({ content }));

      // 缓存结果
      await cacheService.set(cacheKey, JSON.stringify(enhancedResults), 1800);
      return enhancedResults;
    } catch (error) {
      logger.error('增强搜索失败:', error);
      return [];
    }
  }

  /**
   * 获取知识库统计信息
   */
  async getStats() {
    return await this.vectorStore.getStats();
  }

  /**
   * 清理过期知识
   */
  async cleanupExpired(daysOld: number = 90) {
    await this.vectorStore.deleteExpiredEntries(daysOld);
  }
}
