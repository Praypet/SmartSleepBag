import { Tool } from '@langchain/core/tools';
export declare class KnowledgeSearchTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(query: string): Promise<string>;
}
//# sourceMappingURL=knowledgeSearchTool.d.ts.map