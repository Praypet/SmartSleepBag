export declare class BabyAgent {
    private agent;
    private initPromise;
    private babyId;
    private userId?;
    constructor(babyId?: string, userId?: string);
    /**
     * 等待 Agent 初始化完成
     */
    waitUntilReady(): Promise<void>;
    private initialize;
    /**
     * 执行 Agent 任务
     * @param input 用户输入
     * @param babyId 宝宝 ID
     * @param history 对话历史记录
     * @param longTermMemoryContext 长期记忆中检索到的相关上下文
     */
    run(input: string, babyId?: string, history?: any[], longTermMemoryContext?: string): Promise<any>;
}
//# sourceMappingURL=BabyAgent.d.ts.map