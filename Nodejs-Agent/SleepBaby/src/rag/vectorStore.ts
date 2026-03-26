import { ChromaClient, Collection } from 'chromadb';
import { config } from '../config/index.config';
import { logger } from '../utils/logger';

export class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;

  constructor() {
    const chromaUrl = new URL(config.chroma.url);

    this.client = new ChromaClient({
      host: chromaUrl.hostname,
      port: Number(chromaUrl.port || (chromaUrl.protocol === 'https:' ? 443 : 80)),
      ssl: chromaUrl.protocol === 'https:',
    });
    this.initCollection();
  }

  private async initCollection() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'knowledge_base',
        // 项目里自行生成和传入向量，不依赖 Chroma 默认 embedding function。
        embeddingFunction: null,
      });
    } catch (error) {
      console.error('初始化 Chroma 知识库集合失败:', error);
    }
  }

  async storeVector(vector: number[], metadata: any, content: string) {
    if (!this.collection) await this.initCollection();
    if (!this.collection) return;

    try {
      const id = `kb_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await this.collection.add({
        ids: [id],
        embeddings: [vector],
        metadatas: [metadata],
        documents: [content],
      });
      console.log(`成功将知识存入 Chroma [ID: ${id}]`);
    } catch (error) {
      console.error('存储知识到 Chroma 失败:', error);
    }
  }

  async retrieveVector(queryVector: number[], options?: {
    nResults?: number;
    minSimilarity?: number;
    includeMetadata?: boolean;
  }): Promise<string[]> {
    if (!this.collection) await this.initCollection();
    if (!this.collection) return [];

    const { nResults = 5, minSimilarity = 0.7, includeMetadata = false } = options || {};

    try {
      const results = await this.collection.query({
        queryEmbeddings: [queryVector],
        nResults: nResults * 2,
        include: includeMetadata ? ['documents', 'metadatas', 'distances'] : ['documents'],
      });

      const documents = results.documents[0] as string[];
      const distances = (results.distances?.[0] as number[]) || [];

      const filteredResults: string[] = [];
      for (let i = 0; i < documents.length; i++) {
        const distance = distances[i] || 0;
        const similarity = 1 - distance;

        if (similarity >= minSimilarity) {
          filteredResults.push(documents[i]);
        }

        if (filteredResults.length >= nResults) break;
      }

      logger.info(`向量检索完成，找到 ${filteredResults.length} 个相关结果 (相似度 >= ${minSimilarity})`);
      return filteredResults;
    } catch (error) {
      logger.error('从 Chroma 检索知识失败:', error);
      return [];
    }
  }

  async deleteExpiredEntries(olderThanDays: number) {
    if (!this.collection) await this.initCollection();
    if (!this.collection) return;

    try {
      logger.info(`清理 ${olderThanDays} 天前的知识条目`);
    } catch (error) {
      logger.error('清理过期条目失败:', error);
    }
  }

  async getStats() {
    if (!this.collection) await this.initCollection();
    if (!this.collection) return null;

    try {
      const count = await this.collection.count();
      return {
        totalDocuments: count,
        collectionName: 'knowledge_base',
      };
    } catch (error) {
      logger.error('获取统计信息失败:', error);
      return null;
    }
  }
}
