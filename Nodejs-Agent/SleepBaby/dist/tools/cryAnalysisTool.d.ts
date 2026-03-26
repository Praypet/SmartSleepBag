import { Tool } from '@langchain/core/tools';
/**
 * 用于分析宝宝哭声的工具
 */
export declare class CryAnalysisTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(_: string): Promise<string>;
}
//# sourceMappingURL=cryAnalysisTool.d.ts.map