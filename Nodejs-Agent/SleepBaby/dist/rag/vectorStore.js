"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
const chromadb_1 = require("chromadb");
const index_config_1 = require("../config/index.config");
const logger_1 = require("../utils/logger");
class VectorStore {
    constructor() {
        this.collection = null;
        const chromaUrl = new URL(index_config_1.config.chroma.url);
        this.client = new chromadb_1.ChromaClient({
            host: chromaUrl.hostname,
            port: Number(chromaUrl.port || (chromaUrl.protocol === 'https:' ? 443 : 80)),
            ssl: chromaUrl.protocol === 'https:',
        });
        this.initCollection();
    }
    async initCollection() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: 'knowledge_base',
                // 项目里自行生成和传入向量，不依赖 Chroma 默认 embedding function。
                embeddingFunction: null,
            });
        }
        catch (error) {
            console.error('初始化 Chroma 知识库集合失败:', error);
        }
    }
    async storeVector(vector, metadata, content) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return;
        try {
            const id = `kb_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await this.collection.add({
                ids: [id],
                embeddings: [vector],
                metadatas: [metadata],
                documents: [content],
            });
            console.log(`成功将知识存入 Chroma [ID: ${id}]`);
        }
        catch (error) {
            console.error('存储知识到 Chroma 失败:', error);
        }
    }
    async retrieveVector(queryVector, options) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return [];
        const { nResults = 5, minSimilarity = 0.7, includeMetadata = false } = options || {};
        try {
            const results = await this.collection.query({
                queryEmbeddings: [queryVector],
                nResults: nResults * 2,
                include: includeMetadata ? ['documents', 'metadatas', 'distances'] : ['documents'],
            });
            const documents = results.documents[0];
            const distances = results.distances?.[0] || [];
            const filteredResults = [];
            for (let i = 0; i < documents.length; i++) {
                const distance = distances[i] || 0;
                const similarity = 1 - distance;
                if (similarity >= minSimilarity) {
                    filteredResults.push(documents[i]);
                }
                if (filteredResults.length >= nResults)
                    break;
            }
            logger_1.logger.info(`向量检索完成，找到 ${filteredResults.length} 个相关结果 (相似度 >= ${minSimilarity})`);
            return filteredResults;
        }
        catch (error) {
            logger_1.logger.error('从 Chroma 检索知识失败:', error);
            return [];
        }
    }
    async deleteExpiredEntries(olderThanDays) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return;
        try {
            logger_1.logger.info(`清理 ${olderThanDays} 天前的知识条目`);
        }
        catch (error) {
            logger_1.logger.error('清理过期条目失败:', error);
        }
    }
    async getStats() {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return null;
        try {
            const count = await this.collection.count();
            return {
                totalDocuments: count,
                collectionName: 'knowledge_base',
            };
        }
        catch (error) {
            logger_1.logger.error('获取统计信息失败:', error);
            return null;
        }
    }
}
exports.VectorStore = VectorStore;
//# sourceMappingURL=vectorStore.js.map