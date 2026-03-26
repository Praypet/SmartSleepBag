import { Tool } from '@langchain/core/tools';
/**
 * 用于查询宝宝体温变化趋势的工具。
 */
export declare class TemperatureTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(hours?: string): Promise<string>;
}
//# sourceMappingURL=physiologicalMonitoringTool.d.ts.map