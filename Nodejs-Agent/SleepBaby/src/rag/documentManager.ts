import { DocumentLoader } from './documentLoader';
import { KnowledgeBase } from './knowledgeBase';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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
export class DocumentManager {
  private documentLoader: DocumentLoader;
  private knowledgeBase: KnowledgeBase;
  private metadataFile: string;
  private documentsMetadata: Map<string, DocumentMetadata> = new Map();

  constructor(metadataFile: string = './data/knowledge/metadata.json') {
    this.documentLoader = new DocumentLoader();
    this.knowledgeBase = new KnowledgeBase();
    this.metadataFile = metadataFile;
    this.loadMetadata();
  }

  /**
   * 加载文档元数据
   */
  private loadMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const data = fs.readFileSync(this.metadataFile, 'utf-8');
        const metadata = JSON.parse(data);
        this.documentsMetadata = new Map(Object.entries(metadata));
      }
    } catch (error) {
      logger.error('加载文档元数据失败:', error);
    }
  }

  /**
   * 保存文档元数据
   */
  private saveMetadata() {
    try {
      const metadata = Object.fromEntries(this.documentsMetadata);
      const dir = path.dirname(this.metadataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      logger.error('保存文档元数据失败:', error);
    }
  }

  /**
   * 计算文件校验和
   */
  private calculateChecksum(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath);
      return createHash('md5').update(content).digest('hex');
    } catch (error) {
      logger.error(`计算文件校验和失败 ${filePath}:`, error);
      return '';
    }
  }

  /**
   * 检查文档是否需要更新
   */
  private needsUpdate(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      const existing = this.documentsMetadata.get(filePath);

      if (!existing) return true;

      const currentChecksum = this.calculateChecksum(filePath);
      return existing.checksum !== currentChecksum ||
             existing.lastModified !== stats.mtime.getTime();
    } catch (error) {
      logger.error(`检查文档更新状态失败 ${filePath}:`, error);
      return true;
    }
  }

  /**
   * 索引单个文档（带版本控制）
   */
  async indexDocument(filePath: string, forceUpdate: boolean = false) {
    try {
      if (!forceUpdate && !this.needsUpdate(filePath)) {
        logger.info(`文档无需更新: ${filePath}`);
        return;
      }

      const stats = fs.statSync(filePath);
      const checksum = this.calculateChecksum(filePath);
      const existing = this.documentsMetadata.get(filePath);

      // 加载并索引文档
      const docs = await this.documentLoader.loadDocument(filePath);

      // 如果是更新，先清理旧版本
      if (existing) {
        await this.removeDocument(filePath);
      }

      // 索引新版本
      for (const doc of docs) {
        const vector = await (await import('./embeddings.js')).embeddings.embedQuery(doc.pageContent);
        await (await import('./vectorStore.js')).VectorStore.prototype.storeVector.call(
          new (await import('./vectorStore.js')).VectorStore(),
          vector,
          { ...doc.metadata, filePath, version: (existing?.version || 0) + 1 },
          doc.pageContent
        );
      }

      // 更新元数据
      const metadata: DocumentMetadata = {
        id: createHash('md5').update(filePath).digest('hex'),
        filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        lastModified: stats.mtime.getTime(),
        checksum,
        indexedAt: Date.now(),
        version: (existing?.version || 0) + 1,
      };

      this.documentsMetadata.set(filePath, metadata);
      this.saveMetadata();

      logger.info(`文档索引完成: ${filePath} (版本 ${metadata.version})`);
    } catch (error) {
      logger.error(`索引文档失败 ${filePath}:`, error);
    }
  }

  /**
   * 批量索引目录
   */
  async indexDirectory(dirPath: string, forceUpdate: boolean = false) {
    try {
      const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.txt') || file.endsWith('.json'))
        .map(file => path.join(dirPath, file));

      logger.info(`开始批量索引目录: ${dirPath}, 共 ${files.length} 个文件`);

      for (const file of files) {
        await this.indexDocument(file, forceUpdate);
      }

      logger.info(`目录索引完成: ${dirPath}`);
    } catch (error) {
      logger.error(`批量索引目录失败 ${dirPath}:`, error);
    }
  }

  /**
   * 移除文档
   */
  async removeDocument(filePath: string) {
    // 注意：ChromaDB 不支持按文件路径删除，这里需要应用层处理
    // 可以考虑添加删除标记或重新索引
    this.documentsMetadata.delete(filePath);
    this.saveMetadata();
    logger.info(`文档已标记为删除: ${filePath}`);
  }

  /**
   * 获取文档统计信息
   */
  getStats() {
    const totalFiles = this.documentsMetadata.size;
    const totalSize = Array.from(this.documentsMetadata.values())
      .reduce((sum, meta) => sum + meta.fileSize, 0);

    return {
      totalFiles,
      totalSize,
      lastUpdated: Math.max(...Array.from(this.documentsMetadata.values())
        .map(meta => meta.indexedAt)),
      documents: Array.from(this.documentsMetadata.values()),
    };
  }

  /**
   * 清理失效的文档引用
   */
  cleanupInvalidReferences() {
    const toRemove: string[] = [];

    for (const [filePath, metadata] of this.documentsMetadata) {
      if (!fs.existsSync(filePath)) {
        toRemove.push(filePath);
      }
    }

    toRemove.forEach(filePath => {
      this.documentsMetadata.delete(filePath);
      logger.info(`清理失效文档引用: ${filePath}`);
    });

    if (toRemove.length > 0) {
      this.saveMetadata();
    }

    return toRemove.length;
  }
}