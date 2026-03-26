export interface DocumentMetadata {
    id: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    lastModified: number;
    checksum: string;
    indexedAt: number;
    version: number;
}
/**
 * 文档管理器：负责文档的版本控制、更新检测和重新索引
 */
export declare class DocumentManager {
    private documentLoader;
    private knowledgeBase;
    private metadataFile;
    private documentsMetadata;
    constructor(metadataFile?: string);
    /**
     * 加载文档元数据
     */
    private loadMetadata;
    /**
     * 保存文档元数据
     */
    private saveMetadata;
    /**
     * 计算文件校验和
     */
    private calculateChecksum;
    /**
     * 检查文档是否需要更新
     */
    private needsUpdate;
    /**
     * 索引单个文档（带版本控制）
     */
    indexDocument(filePath: string, forceUpdate?: boolean): Promise<void>;
    /**
     * 批量索引目录
     */
    indexDirectory(dirPath: string, forceUpdate?: boolean): Promise<void>;
    /**
     * 移除文档
     */
    removeDocument(filePath: string): Promise<void>;
    /**
     * 获取文档统计信息
     */
    getStats(): {
        totalFiles: number;
        totalSize: number;
        lastUpdated: number;
        documents: DocumentMetadata[];
    };
    /**
     * 清理失效的文档引用
     */
    cleanupInvalidReferences(): number;
}
//# sourceMappingURL=documentManager.d.ts.map