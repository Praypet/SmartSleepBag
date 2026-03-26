export declare class VectorStore {
    private client;
    private collection;
    constructor();
    private initCollection;
    storeVector(vector: number[], metadata: any, content: string): Promise<void>;
    retrieveVector(queryVector: number[], options?: {
        nResults?: number;
        minSimilarity?: number;
        includeMetadata?: boolean;
    }): Promise<string[]>;
    deleteExpiredEntries(olderThanDays: number): Promise<void>;
    getStats(): Promise<{
        totalDocuments: number;
        collectionName: string;
    } | null>;
}
//# sourceMappingURL=vectorStore.d.ts.map