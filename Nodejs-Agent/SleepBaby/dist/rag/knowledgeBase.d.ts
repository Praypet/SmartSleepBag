export declare class KnowledgeBase {
    private documentLoader;
    private vectorStore;
    constructor();
    indexDocument(filePath: string): Promise<void>;
    /**
     * 批量索引目录中的所有文档
     */
    indexDirectory(dirPath: string): Promise<void>;
    /**
     * 批量处理文档
     */
    private processBatch;
    /**
     * 增强搜索：支持多重排序和过滤
     */
    searchEnhanced(query: string, options?: {
        nResults?: number;
        minSimilarity?: number;
        includeScores?: boolean;
    }): Promise<{
        content: string;
        score?: number;
    }[]>;
    /**
     * 获取知识库统计信息
     */
    getStats(): Promise<{
        totalDocuments: number;
        collectionName: string;
    } | null>;
    /**
     * 清理过期知识
     */
    cleanupExpired(daysOld?: number): Promise<void>;
}
//# sourceMappingURL=knowledgeBase.d.ts.map