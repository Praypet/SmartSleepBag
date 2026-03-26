import { Tool } from '@langchain/core/tools';
export declare class SleepStagesTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(date?: string): Promise<string>;
}
export declare class SleepQualityTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(date?: string): Promise<string>;
}
export declare class WakeAnalysisTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(date?: string): Promise<string>;
}
export declare class SleepSuggestionTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(_: string): Promise<string>;
}
//# sourceMappingURL=sleepAnalysisTools.d.ts.map