import { DocumentManager } from '../src/rag/documentManager';
import { KnowledgeBase } from '../src/rag/knowledgeBase';
import { logger } from '../src/utils/logger';
import * as path from 'path';

/**
 * 知识库初始化脚本
 * 执行知识库的初始化和索引
 */
async function initializeKnowledgeBase() {
  try {
    logger.info('开始初始化知识库...');

    // 1. 创建文档管理器
    const docManager = new DocumentManager();

    // 2. 索引知识库目录
    const knowledgeDir = path.join(__dirname, '../../data/knowledge');
    logger.info(`索引知识库目录: ${knowledgeDir}`);

    await docManager.indexDirectory(knowledgeDir, false); // 不强制更新

    // 3. 获取统计信息
    const stats = docManager.getStats();
    logger.info(`知识库初始化完成: 总文件数=${stats.totalFiles}, 总大小=${(stats.totalSize / 1024).toFixed(2)}KB, 最后更新=${new Date(stats.lastUpdated).toLocaleString()}`);

    // 4. 清理失效引用
    const cleanedCount = docManager.cleanupInvalidReferences();
    if (cleanedCount > 0) {
      logger.info(`清理了 ${cleanedCount} 个失效的文档引用`);
    }

    // 5. 测试搜索功能
    const kb = new KnowledgeBase();
    const testResults = await kb.searchEnhanced('婴儿睡眠');
    logger.info(`测试搜索 "婴儿睡眠": 找到 ${testResults.length} 个结果`);

    logger.info('✅ 知识库初始化成功！');

  } catch (error) {
    logger.error('❌ 知识库初始化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  initializeKnowledgeBase();
}

export { initializeKnowledgeBase };