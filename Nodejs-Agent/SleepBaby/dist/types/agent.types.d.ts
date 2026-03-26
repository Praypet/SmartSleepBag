export interface AgentConfig {
    name: string;
    role: string;
    llmConfig: any;
    tools: any[];
}
export interface AgentResponse {
    message: string;
    status: 'success' | 'error';
    data?: any;
}
//# sourceMappingURL=agent.types.d.ts.map