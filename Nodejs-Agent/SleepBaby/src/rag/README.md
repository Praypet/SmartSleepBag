# RAG (Retrieval-Augmented Generation) 系统

## 概述

RAG 系统为 SleepBaby 提供智能知识检索能力，通过向量搜索从婴儿护理知识库中检索相关信息，增强 AI 助手的回答质量。

## 核心组件

### 1. DocumentLoader (`documentLoader.ts`)
**功能**: 文档加载和预处理
- 支持文本文件和 JSON 格式
- 自动文本分块（1000字符/块，重叠200字符）
- 支持中英文分隔符
- 批量目录加载

### 2. Embeddings (`embeddings.ts`)
**功能**: 文本向量化
- 使用 OpenAI Embeddings API
- 支持自定义 API 端点
- 统一的向量生成接口

### 3. VectorStore (`vectorStore.ts`)
**功能**: 向量存储和检索
- 基于 ChromaDB 的向量数据库
- 支持相似度阈值过滤
- 提供集合统计信息
- 支持过期数据清理

### 4. KnowledgeBase (`knowledgeBase.ts`)
**功能**: 知识库管理
- 文档索引和搜索
- Redis 缓存支持
- 批量处理能力
- 增强搜索选项

### 5. DocumentManager (`documentManager.ts`) ⭐ **新增**
**功能**: 文档版本控制
- 文件变更检测（基于校验和）
- 自动版本管理
- 增量更新支持
- 文档统计和清理

## 使用方法

### 初始化知识库

```bash
# 编译项目
npm run build

# 初始化知识库
npx ts-node scripts/init-knowledge-base.ts
```

### 在代码中使用

```typescript
import { KnowledgeBase } from './src/rag/knowledgeBase';
import { DocumentManager } from './src/rag/documentManager';

const kb = new KnowledgeBase();

// 基础搜索
const results = await kb.search('婴儿睡眠指导');

// 增强搜索（带相似度控制）
const enhancedResults = await kb.searchEnhanced('新生儿喂养', {
  nResults: 5,
  minSimilarity: 0.8,
  includeScores: true
});

// 文档管理
const docManager = new DocumentManager();
await docManager.indexDocument('./data/knowledge/new_guide.txt');
const stats = docManager.getStats();
```

### 工具集成

KnowledgeSearchTool 已集成到 Agent 系统中：

```typescript
// Agent 会自动调用知识搜索
const response = await runAgent('宝宝多大开始添加辅食？', babyId, userId);
// 自动搜索相关知识并融入回答
```

## 配置说明

### ChromaDB 配置
在 `config/index.config.ts` 中配置：
```typescript
chroma: {
  url: 'http://localhost:8000',
  collectionName: 'baby_care_knowledge'
}
```

### 知识库文件
放置在 `data/knowledge/` 目录：
- `infant_care.txt` - 婴儿护理基础知识
- `sleep_guidance.txt` - 睡眠指导
- `health_indicators.txt` - 健康指标

## 性能优化

### 缓存策略
- 搜索结果缓存 30 分钟（Redis）
- 向量计算结果自动缓存
- 文档元数据持久化存储

### 分块策略
- 块大小：1000 字符
- 重叠大小：200 字符
- 支持中英文智能分隔

### 相似度控制
- 默认相似度阈值：0.75
- 可配置返回结果数量
- 自动过滤低质量结果

## 维护命令

```bash
# 查看知识库统计
node -e "
const { KnowledgeBase } = require('./dist/src/rag/knowledgeBase.js');
const kb = new KnowledgeBase();
kb.getStats().then(console.log);
"

# 清理过期文档
node -e "
const { DocumentManager } = require('./dist/src/rag/documentManager.js');
const dm = new DocumentManager();
dm.cleanupInvalidReferences();
"
```

## 扩展计划

- [ ] 支持 PDF、Word 文档格式
- [ ] 添加文档分类和标签系统
- [ ] 实现文档的增量更新算法
- [ ] 添加知识图谱功能
- [ ] 支持多语言知识库