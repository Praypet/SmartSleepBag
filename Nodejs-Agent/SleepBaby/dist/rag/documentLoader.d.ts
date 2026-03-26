import { Document } from '@langchain/core/documents';
export declare class DocumentLoader {
    private textSplitter;
    constructor();
    /**
     * 加载单个文本文件
     */
    loadDocument(filePath: string): Promise<Document[]>;
    /**
     * 批量加载目录中的所有文档
     */
    loadDirectory(dirPath: string): Promise<Document[]>;
    /**
     * 预处理文档内容（清理和格式化）
     */
    private preprocessContent;
}
//# sourceMappingURL=documentLoader.d.ts.map