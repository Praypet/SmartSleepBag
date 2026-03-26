"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLoader = void 0;
const text_1 = require("@langchain/classic/document_loaders/fs/text");
const directory_1 = require("@langchain/classic/document_loaders/fs/directory");
const json_1 = require("@langchain/classic/document_loaders/fs/json");
const textsplitters_1 = require("@langchain/textsplitters");
const logger_1 = require("../utils/logger");
class DocumentLoader {
    constructor() {
        // 配置文本分块器：按段落分块，保持上下文连贯性
        this.textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000, // 每个块最大1000字符
            chunkOverlap: 200, // 块间重叠200字符，保持上下文
            separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?'], // 中英文分隔符
        });
    }
    /**
     * 加载单个文本文件
     */
    async loadDocument(filePath) {
        try {
            const loader = new text_1.TextLoader(filePath);
            const docs = await loader.load();
            // 对文档进行分块处理
            const splitDocs = await this.textSplitter.splitDocuments(docs);
            logger_1.logger.info(`成功加载文档: ${filePath}, 分割为 ${splitDocs.length} 个块`);
            return splitDocs;
        }
        catch (error) {
            logger_1.logger.error(`加载文档失败 ${filePath}:`, error);
            return [];
        }
    }
    /**
     * 批量加载目录中的所有文档
     */
    async loadDirectory(dirPath) {
        try {
            const loader = new directory_1.DirectoryLoader(dirPath, {
                '.txt': (path) => new text_1.TextLoader(path),
                '.json': (path) => new json_1.JSONLoader(path),
                // 可以扩展支持更多格式：.pdf, .docx, .md 等
            });
            const docs = await loader.load();
            const splitDocs = await this.textSplitter.splitDocuments(docs);
            logger_1.logger.info(`成功加载目录: ${dirPath}, 共 ${splitDocs.length} 个文档块`);
            return splitDocs;
        }
        catch (error) {
            logger_1.logger.error(`加载目录失败 ${dirPath}:`, error);
            return [];
        }
    }
    /**
     * 预处理文档内容（清理和格式化）
     */
    preprocessContent(content) {
        return content
            .replace(/\r\n/g, '\n') // 统一换行符
            .replace(/\n{3,}/g, '\n\n') // 最多两个连续换行
            .replace(/\s{2,}/g, ' ') // 清理多余空格
            .trim();
    }
}
exports.DocumentLoader = DocumentLoader;
//# sourceMappingURL=documentLoader.js.map