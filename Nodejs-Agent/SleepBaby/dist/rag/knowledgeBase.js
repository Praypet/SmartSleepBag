"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBase = void 0;
const documentLoader_1 = require("./documentLoader");
const vectorStore_1 = require("./vectorStore");
const embeddings_1 = require("./embeddings");
const cache_service_1 = require("../services/cache.service");
const logger_1 = require("../utils/logger");
const crypto_1 = require("crypto");
class KnowledgeBase {
    constructor() {
        this.documentLoader = new documentLoader_1.DocumentLoader();
        this.vectorStore = new vectorStore_1.VectorStore();
    }
    async indexDocument(filePath) {
        const docs = await this.documentLoader.loadDocument(filePath);
        for (const doc of docs) {
            const vector = await embeddings_1.embeddings.embedQuery(doc.pageContent);
            await this.vectorStore.storeVector(vector, doc.metadata, doc.pageContent);
        }
    }
    /**
     * 批量索引目录中的所有文档
     */
    async indexDirectory(dirPath) {
        try {
            const docs = await this.documentLoader.loadDirectory(dirPath);
            logger_1.logger.info(`开始批量索引 ${docs.length} 个文档块`);
            const batchSize = 10; // 每批处理10个文档
            for (let i = 0; i < docs.length; i += batchSize) {
                const batch = docs.slice(i, i + batchSize);
                await this.processBatch(batch);
                logger_1.logger.info(`已处理 ${Math.min(i + batchSize, docs.length)}/${docs.length} 个文档`);
            }
            logger_1.logger.info(`批量索引完成，共处理 ${docs.length} 个文档块`);
        }
        catch (error) {
            logger_1.logger.error('批量索引目录失败:', error);
        }
    }
    /**
     * 批量处理文档
     */
    async processBatch(docs) {
        const promises = docs.map(async (doc) => {
            try {
                const vector = await embeddings_1.embeddings.embedQuery(doc.pageContent);
                await this.vectorStore.storeVector(vector, doc.metadata, doc.pageContent);
            }
            catch (error) {
                logger_1.logger.error('处理文档块失败:', error);
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * 增强搜索：支持多重排序和过滤
     */
    async searchEnhanced(query, options) {
        const cacheKey = `kb_search_enhanced_${(0, crypto_1.createHash)('md5').update(query + JSON.stringify(options)).digest('hex')}`;
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        try {
            const queryVector = await embeddings_1.embeddings.embedQuery(query);
            const results = await this.vectorStore.retrieveVector(queryVector, {
                nResults: options?.nResults || 5,
                minSimilarity: options?.minSimilarity || 0.7,
                includeMetadata: options?.includeScores || false,
            });
            const enhancedResults = results.map(content => ({ content }));
            // 缓存结果
            await cache_service_1.cacheService.set(cacheKey, JSON.stringify(enhancedResults), 1800);
            return enhancedResults;
        }
        catch (error) {
            logger_1.logger.error('增强搜索失败:', error);
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
    async cleanupExpired(daysOld = 90) {
        await this.vectorStore.deleteExpiredEntries(daysOld);
    }
}
exports.KnowledgeBase = KnowledgeBase;
//# sourceMappingURL=knowledgeBase.js.map