export type AgentExecutionResult = {
    content: string;
    raw: unknown;
};
/**
 * 运行 Agent 的统一入口。
 */
export declare const runAgent: (input: string, babyId?: string, userId?: string) => Promise<AgentExecutionResult>;
//# sourceMappingURL=agentExecutor.d.ts.map