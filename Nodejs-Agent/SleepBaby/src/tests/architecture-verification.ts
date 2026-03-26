/**
 * SleepBaby 架构重构验证清单
 * 用于确保三层存储系统正常运行
 */

// ==================== 测试场景 ====================

/**
 * 测试 1: 会话上下文存储与检索（Redis）
 * 预期: 短期记忆能存入 Redis，5分钟内可检索，超时自动清理
 */
export const TEST_SHORT_TERM_MEMORY = {
  description: '验证 Redis 短期记忆',
  steps: [
    '1. 用户开启对话',
    '2. 执行 runAgent() 输入"宝宝睡眠很差"',
    '3. 检查 Redis 中 session:{userId}:history 是否有记录',
    '4. 立即检索，确保对话历史完整',
    '5. 等待 1 小时，确认过期自动清理',
  ],
  verification: `
    ✓ Redis 中应有这样的键: session:user_001:history
    ✓ 列表中最多保留 20 条对话
    ✓ 返回数据格式: [{ role: "user", content: "...", timestamp }, ...]
  `,
};

/**
 * 测试 2: 原始事件存储（PostgreSQL EventStore）
 * 预期: 所有宝宝数据（睡眠、生理、事件）都记录到 PostgreSQL
 */
export const TEST_EVENT_STORE = {
  description: '验证 PostgreSQL EventStore',
  steps: [
    '1. 通过工具获取睡眠数据后，调用 memoryStore.storeSleepRecord()',
    '2. 通过工具获取体温数据后，调用 memoryStore.storeHealthEvent()',
    '3. 存储宝宝档案信息',
    '4. 查询 PostgreSQL sleep_records, health_events, baby_profile 表',
  ],
  verification: `
    ✓ sleep_records 表有 180 天的数据
    ✓ health_events 表有 90 天的数据
    ✓ baby_profile 表有永久保留的宝宝信息
    ✓ user_config 表持久化用户配置
  `,
};

/**
 * 测试 3: 长期记忆版本管理（Chroma）
 * 预期: 总结规律存入 Chroma，支持版本追踪和历史演变
 */
export const TEST_LONG_TERM_MEMORY = {
  description: '验证 Chroma 长期记忆版本管理',
  steps: [
    '1. 调用 ConversationSummaryTool 生成日摘要',
    '2. 查询 Chroma 中 daily_summary 分类数据',
    '3. 下一天调用 memoryStore.updateLongTermMemoryVersion() 更新',
    '4. 调用 memoryStore.getLongTermMemoryHistory() 验证历史版本',
  ],
  verification: `
    ✓ Chroma 中存储的数据格式: { id, embeddings, metadatas, documents }
    ✓ metadata 包含: userId, category, created_at, expires_at, version, is_active
    ✓ 日摘要(daily_summary)的 expires_at 为 7 天后
    ✓ 历史版本链完整可查询
  `,
};

/**
 * 测试 4: 数据清理（TTL 清理）
 * 预期: 过期数据自动清理，登录时触发
 */
export const TEST_DATA_CLEANUP = {
  description: '验证 DataCleanupService',
  steps: [
    '1. 创建超过 30 天的事件日志记录',
    '2. 创建超过 90 天的生理事件记录',
    '3. 创建超过 180 天的睡眠记录',
    '4. 调用 dataCleanupService.executeCleanup(userId)',
    '5. 查询数据库确认清理结果',
  ],
  verification: `
    ✓ 执行清理后，过期 event_logs 全部删除（>30天）
    ✓ 执行清理后，过期 health_events 全部删除（>90天）
    ✓ 执行清理后，过期 sleep_records 全部删除（>180天）
    ✓ Chroma 中过期记忆被标记为 is_active=false
  `,
};

/**
 * 测试 5: 对话摘要生成（每24小时一次）
 * 预期: 过去 24 小时的对话自动总结并存入 Chroma
 */
export const TEST_CONVERSATION_SUMMARY = {
  description: '验证 ConversationSummaryTool',
  steps: [
    '1. 进行数次 Agent 交互（5-10 条对话）',
    '2. 等待 24 小时或修改 lastSummaryTime 强制触发',
    '3. 下一次 runAgent() 调用时，应自动生成摘要',
    '4. 检查 Chroma 中新增分类为 "daily_summary" 的记录',
  ],
  verification: `
    ✓ 摘要应包含睡眠、情绪、生理、环境等维度
    ✓ 摘要应存入 Chroma，category="daily_summary"
    ✓ 摘要内容能被后续查询反馈到 longTermContext
  `,
};

/**
 * 测试 6: 完整数据流集成测试
 * 预期: 端到端验证整个三层架构
 */
export const TEST_FULL_INTEGRATION = {
  description: '端到端集成测试',
  steps: [
    '1. 用户登录，触发 dataCleanupService.executeCleanup()',
    '2. 用户提问：「宝宝最近睡眠怎么样」',
    '3. Agent 执行，调用 SleepAnalysisTool',
    '4. 工具从后端拉数据，缓存到 Redis',
    '5. 工具调用 memoryStore.storeSleepRecord() 存入 PostgreSQL',
    '6. Agent 参考 longTermContext（Chroma 规律）生成回答',
    '7. 对话存入 Redis 短期记忆',
    '8. 24小时后，ConversationSummaryTool 诞生日摘要到 Chroma',
    '9. 下次对话时，新的 longTermContext 包含已总结的信息',
  ],
  verification: `
    ✓ 整个流程完整无错误日志
    ✓ Redis 中有会话历史
    ✓ PostgreSQL 中有原始事件记录
    ✓ Chroma 中有长期总结记忆
    ✓ 过期数据按策略清理
  `,
};

// ==================== 快速验证命令 ====================

export const QUICK_CHECKS = {
  // Redis 检查
  redis: `
    redis-cli
    > KEYS session:*
    > KEYS realtime:*
    > TTL session:user_001:history  (应该 > 0)
  `,

  // PostgreSQL 检查  
  postgres: `
    psql -U postgres -d sleep_baby_db
    > SELECT COUNT(*) FROM sleep_records;
    > SELECT COUNT(*) FROM health_events;
    > SELECT COUNT(*) FROM event_logs;
    > SELECT COUNT(*) FROM baby_profile;
    > SELECT * FROM user_config WHERE user_id = 'user_001';
  `,

  // Chroma 检查
  chroma: `
    curl http://localhost:8000/api/v1/collections
    验证返回的集合中是否包含 "baby_memory"
  `,

  // 日志检查
  logs: `
    tail -f logs/*.log | grep -E "\\[Step [1-5]\\]"
    应看到数据清理、记忆检索、Agent执行、对话存储等步骤日志
  `,
};

// ==================== 常见排查 ====================

export const TROUBLESHOOTING = {
  issue1: {
    problem: '短期记忆查不到历史对话',
    cause: '1. Redis 连接失败 2. TTL 已过期 3. memoryKey 不匹配',
    solution: [
      '检查 config.redis 配置是否正确',
      '验证 Redis 连接：redis-cli ping',
      '查看日志中的 "存储短期记忆" 是否成功',
      '确保 userId 和查询时使用的 memoryKey 一致',
    ],
  },

  issue2: {
    problem: '原始事件没有存入 PostgreSQL',
    cause: '1. 数据库连接失败 2. 表未初始化 3. 存储时没有调用 EventStore',
    solution: [
      '检查 config.database 配置是否正确',
      '手工运行 EventStore constructor，查看表是否创建成功',
      '验证工具中是否调用了 memoryStore.storeSleepRecord() 等方法',
      '检查日志中的 "已保存" 消息是否出现',
    ],
  },

  issue3: {
    problem: '长期记忆查不到，longTermContext 为空',
    cause: '1. Chroma 连接失败 2. 没有生成过摘要 3. 查询向量化失败',
    solution: [
      '检查 Chroma 服务是否运行：curl http://localhost:8000/api/v1/collections',
      '验证 ConversationSummaryTool 是否被正确调用',
      '查看 embeddings 模块日志，是否有向量化错误',
      '确保第一次有摘要后，后续查询才会有结果',
    ],
  },

  issue4: {
    problem: '过期数据没有被清理',
    cause: '1. DataCleanupService 未被调用 2. SQL 查询有误 3. 日期判断错误',
    solution: [
      '确保 runAgent() 中 executeCleanup() 被调用',
      '检查日志中的 "开始执行数据清理" 消息',
      '手动执行 dataCleanupService.executeCleanup(userId) 测试',
      '验证 PostgreSQL 中的时间戳是否为 TIMESTAMP 类型',
    ],
  },
};

// ==================== 性能指标参考 ====================

export const PERFORMANCE_BASELINE = {
  redis_write: '< 5ms 存储一条对话',
  redis_read: '< 5ms 检索对话历史',
  postgres_write_event: '< 50ms 存储事件',
  postgres_cleanup: '< 1s 清理 1000 条记录',
  chroma_summary: '< 3s 生成日摘要（包括LLM调用）',
  chroma_retrieve: '< 500ms 语义搜索检索 5 条记录',
};

export default {
  tests: [
    TEST_SHORT_TERM_MEMORY,
    TEST_EVENT_STORE,
    TEST_LONG_TERM_MEMORY,
    TEST_DATA_CLEANUP,
    TEST_CONVERSATION_SUMMARY,
    TEST_FULL_INTEGRATION,
  ],
  QUICK_CHECKS,
  TROUBLESHOOTING,
  PERFORMANCE_BASELINE,
};
