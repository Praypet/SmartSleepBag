"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongTermMemory = void 0;
const chromadb_1 = require("chromadb");
const index_config_1 = require("../config/index.config");
const embeddings_1 = require("../rag/embeddings");
const logger_1 = require("../utils/logger");
/**
 * 长期记忆存储（Chroma 向量数据库）。
 */
class LongTermMemory {
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
                name: index_config_1.config.chroma.collectionName,
                // 项目里自行生成和传入向量，不依赖 Chroma 默认 embedding function。
                embeddingFunction: null,
            });
            logger_1.logger.info('Chroma 长期记忆集合已初始化');
        }
        catch (error) {
            logger_1.logger.error('初始化 Chroma 集合失败:', error);
        }
    }
    /**
     * 存储长期记忆事实。
     */
    async storeMemory(userId, fact, category, expiresAt) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return;
        try {
            const vector = await embeddings_1.embeddings.embedQuery(fact);
            const id = `${userId}_${category}_${Date.now()}`;
            let ttlDays = 7;
            if (category === 'weekly_pattern')
                ttlDays = 30;
            else if (category === 'monthly_summary')
                ttlDays = 90;
            else if (category === 'behavior_trait')
                ttlDays = 180;
            const defaultExpiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
            await this.collection.add({
                ids: [id],
                embeddings: [vector],
                metadatas: [
                    {
                        userId,
                        category,
                        created_at: Date.now(),
                        expires_at: expiresAt || defaultExpiresAt,
                        version: 1,
                        is_active: true,
                    },
                ],
                documents: [fact],
            });
            logger_1.logger.info(`成功将事实存入长期记忆 [ID: ${id}, 分类: ${category}, 有效期: ${ttlDays}天]`);
        }
        catch (error) {
            logger_1.logger.error('存储长期记忆到 Chroma 失败:', error);
        }
    }
    /**
     * 检索与查询相关的长期记忆。
     */
    async retrieveMemory(userId, query, category, onlyActive = true) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return [];
        try {
            const queryVector = await embeddings_1.embeddings.embedQuery(query);
            // 显式构建 Where 条件数组，避免 undefined 污染类型
            const andConditions = [{ userId: { $eq: userId } }];
            if (category) {
                andConditions.push({ category: { $eq: category } });
            }
            if (onlyActive) {
                andConditions.push({ is_active: { $eq: true } });
            }
            // 如果只有一个条件，直接使用该条件对象；否则包裹在 $and 中
            const whereCondition = andConditions.length === 1
                ? andConditions[0]
                : { $and: andConditions };
            const results = await this.collection.query({
                queryEmbeddings: [queryVector],
                nResults: 5,
                where: whereCondition,
                include: ['documents', 'metadatas'],
            });
            const documents = results.documents[0] || [];
            const metadatas = results.metadatas?.[0] || [];
            // 同类摘要只保留最新一条
            const latestByCategory = new Map();
            documents.forEach((document, index) => {
                const metadata = metadatas[index] || {};
                const categoryKey = typeof metadata.category === 'string' ? metadata.category : `unknown_${index}`;
                const createdAt = typeof metadata.created_at === 'number' ? metadata.created_at : 0;
                const current = latestByCategory.get(categoryKey);
                if (!current || createdAt >= current.createdAt) {
                    latestByCategory.set(categoryKey, {
                        content: document,
                        createdAt,
                    });
                }
            });
            return Array.from(latestByCategory.values()).map((item) => item.content);
        }
        catch (error) {
            logger_1.logger.error('从 Chroma 检索长期记忆失败:', error);
            return [];
        }
    }
    /**
     * 获取某分类的历史版本。
     */
    async getHistoryVersions(userId, category) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return [];
        try {
            // 修复：显式构建 $and 结构，并断言类型以避免 TS 报错
            const whereCondition = {
                $and: [
                    { userId: { $eq: userId } },
                    { category: { $eq: category } }
                ]
            };
            const results = await this.collection.get({
                where: whereCondition,
            });
            return (results.documents || []).map((doc, idx) => ({
                id: results.ids[idx],
                fact: doc,
                version: results.metadatas[idx].version || 1,
                created_at: results.metadatas[idx].created_at || Date.now(),
            }));
        }
        catch (error) {
            logger_1.logger.error('获取历史版本失败:', error);
            return [];
        }
    }
    /**
     * 更新长期记忆版本，旧版本标记为非活跃，新版本写入集合。
     */
    async updateVersion(userId, category, newFact) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return;
        try {
            // 修复：显式构建 $and 结构，解决 "got 3" 运行时错误和 TS 类型错误
            const whereCondition = {
                $and: [
                    { userId: { $eq: userId } },
                    { category: { $eq: category } },
                    { is_active: { $eq: true } }
                ]
            };
            const activeResults = await this.collection.get({
                where: whereCondition,
            });
            if (activeResults.ids.length > 0) {
                const oldId = activeResults.ids[0];
                const oldMetadata = activeResults.metadatas[0];
                await this.collection.update({
                    ids: [oldId],
                    metadatas: [
                        {
                            ...oldMetadata,
                            is_active: false,
                            version: oldMetadata.version + 1,
                        },
                    ],
                });
            }
            const vector = await embeddings_1.embeddings.embedQuery(newFact);
            const newId = `${userId}_${category}_${Date.now()}`;
            let ttlDays = 7;
            if (category === 'weekly_pattern')
                ttlDays = 30;
            else if (category === 'monthly_summary')
                ttlDays = 90;
            else if (category === 'behavior_trait')
                ttlDays = 180;
            await this.collection.add({
                ids: [newId],
                embeddings: [vector],
                metadatas: [
                    {
                        userId,
                        category,
                        created_at: Date.now(),
                        expires_at: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
                        version: activeResults.metadatas[0]?.version + 1 || 1,
                        is_active: true,
                    },
                ],
                documents: [newFact],
            });
            logger_1.logger.info(`长期记忆已更新版本 [用户: ${userId}, 分类: ${category}]`);
        }
        catch (error) {
            logger_1.logger.error('更新长期记忆版本失败:', error);
        }
    }
    /**
     * 清理过期长期记忆。
     */
    async cleanupExpiredMemories(userId, category) {
        if (!this.collection)
            await this.initCollection();
        if (!this.collection)
            return;
        try {
            // 修复：动态构建条件数组，确保类型安全
            const andConditions = [{ userId: { $eq: userId } }];
            if (category) {
                andConditions.push({ category: { $eq: category } });
            }
            const whereCondition = andConditions.length === 1
                ? andConditions[0]
                : { $and: andConditions };
            const results = await this.collection.get({
                where: whereCondition,
            });
            const now = Date.now();
            const expiredIds = [];
            results.metadatas.forEach((metadata, idx) => {
                if (metadata.expires_at && metadata.expires_at < now) {
                    expiredIds.push(results.ids[idx]);
                }
            });
            if (expiredIds.length > 0) {
                await this.collection.delete({
                    ids: expiredIds,
                });
                logger_1.logger.info(`已清理 ${expiredIds.length} 条过期长期记忆 [用户: ${userId}]`);
            }
        }
        catch (error) {
            logger_1.logger.error('清理过期长期记忆失败:', error);
        }
    }
}
exports.LongTermMemory = LongTermMemory;
//# sourceMappingURL=LongTermMemory.js.map