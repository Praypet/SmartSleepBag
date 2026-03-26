import { Tool } from '@langchain/core/tools';
/**
 * 建议生成工具：基于收集到的数据生成简单的个性化建议
 */
export declare class RecommendationTool extends Tool {
    name: string;
    description: string;
    _call(input: string): Promise<string>;
}
//# sourceMappingURL=recommendationTools.d.ts.map