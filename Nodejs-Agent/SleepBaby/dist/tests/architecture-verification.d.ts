/**
 * SleepBaby 架构重构验证清单
 * 用于确保三层存储系统正常运行
 */
/**
 * 测试 1: 会话上下文存储与检索（Redis）
 * 预期: 短期记忆能存入 Redis，5分钟内可检索，超时自动清理
 */
export declare const TEST_SHORT_TERM_MEMORY: {
    description: string;
    steps: string[];
    verification: string;
};
/**
 * 测试 2: 原始事件存储（PostgreSQL EventStore）
 * 预期: 所有宝宝数据（睡眠、生理、事件）都记录到 PostgreSQL
 */
export declare const TEST_EVENT_STORE: {
    description: string;
    steps: string[];
    verification: string;
};
/**
 * 测试 3: 长期记忆版本管理（Chroma）
 * 预期: 总结规律存入 Chroma，支持版本追踪和历史演变
 */
export declare const TEST_LONG_TERM_MEMORY: {
    description: string;
    steps: string[];
    verification: string;
};
/**
 * 测试 4: 数据清理（TTL 清理）
 * 预期: 过期数据自动清理，登录时触发
 */
export declare const TEST_DATA_CLEANUP: {
    description: string;
    steps: string[];
    verification: string;
};
/**
 * 测试 5: 对话摘要生成（每24小时一次）
 * 预期: 过去 24 小时的对话自动总结并存入 Chroma
 */
export declare const TEST_CONVERSATION_SUMMARY: {
    description: string;
    steps: string[];
    verification: string;
};
/**
 * 测试 6: 完整数据流集成测试
 * 预期: 端到端验证整个三层架构
 */
export declare const TEST_FULL_INTEGRATION: {
    description: string;
    steps: string[];
    verification: string;
};
export declare const QUICK_CHECKS: {
    redis: string;
    postgres: string;
    chroma: string;
    logs: string;
};
export declare const TROUBLESHOOTING: {
    issue1: {
        problem: string;
        cause: string;
        solution: string[];
    };
    issue2: {
        problem: string;
        cause: string;
        solution: string[];
    };
    issue3: {
        problem: string;
        cause: string;
        solution: string[];
    };
    issue4: {
        problem: string;
        cause: string;
        solution: string[];
    };
};
export declare const PERFORMANCE_BASELINE: {
    redis_write: string;
    redis_read: string;
    postgres_write_event: string;
    postgres_cleanup: string;
    chroma_summary: string;
    chroma_retrieve: string;
};
declare const _default: {
    tests: {
        description: string;
        steps: string[];
        verification: string;
    }[];
    QUICK_CHECKS: {
        redis: string;
        postgres: string;
        chroma: string;
        logs: string;
    };
    TROUBLESHOOTING: {
        issue1: {
            problem: string;
            cause: string;
            solution: string[];
        };
        issue2: {
            problem: string;
            cause: string;
            solution: string[];
        };
        issue3: {
            problem: string;
            cause: string;
            solution: string[];
        };
        issue4: {
            problem: string;
            cause: string;
            solution: string[];
        };
    };
    PERFORMANCE_BASELINE: {
        redis_write: string;
        redis_read: string;
        postgres_write_event: string;
        postgres_cleanup: string;
        chroma_summary: string;
        chroma_retrieve: string;
    };
};
export default _default;
//# sourceMappingURL=architecture-verification.d.ts.map