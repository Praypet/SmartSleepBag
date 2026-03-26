import { Tool } from '@langchain/core/tools';
export declare class BabyDataQueryTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(_: string): Promise<string>;
}
//# sourceMappingURL=babyDataTools.d.ts.map