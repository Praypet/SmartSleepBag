import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory';
import { JSONLoader } from '@langchain/classic/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { logger } from '../utils/logger';

export class DocumentLoader {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    // 配置文本分块器：按段落分块，保持上下文连贯性
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,        // 每个块最大1000字符
      chunkOverlap: 200,      // 块间重叠200字符，保持上下文
      separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?'], // 中英文分隔符
    });
  }

  /**
   * 加载单个文本文件
   */
  async loadDocument(filePath: string): Promise<Document[]> {
    try {
      const loader = new TextLoader(filePath);
      const docs = await loader.load();

      // 对文档进行分块处理
      const splitDocs = await this.textSplitter.splitDocuments(docs);

      logger.info(`成功加载文档: ${filePath}, 分割为 ${splitDocs.length} 个块`);
      return splitDocs;
    } catch (error) {
      logger.error(`加载文档失败 ${filePath}:`, error);
      return [];
    }
  }

  /**
   * 批量加载目录中的所有文档
   */
  async loadDirectory(dirPath: string): Promise<Document[]> {
    try {
      const loader = new DirectoryLoader(dirPath, {
        '.txt': (path) => new TextLoader(path),
        '.json': (path) => new JSONLoader(path),
        // 可以扩展支持更多格式：.pdf, .docx, .md 等
      });

      const docs = await loader.load();
      const splitDocs = await this.textSplitter.splitDocuments(docs);

      logger.info(`成功加载目录: ${dirPath}, 共 ${splitDocs.length} 个文档块`);
      return splitDocs;
    } catch (error) {
      logger.error(`加载目录失败 ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * 预处理文档内容（清理和格式化）
   */
  private preprocessContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n')        // 统一换行符
      .replace(/\n{3,}/g, '\n\n')    // 最多两个连续换行
      .replace(/\s{2,}/g, ' ')       // 清理多余空格
      .trim();
  }
}
