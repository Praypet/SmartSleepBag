import { Tool } from '@langchain/core/tools';
export declare class HomeSensorsTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(_: string): Promise<string>;
}
export declare class MonitorSensorsTool extends Tool {
    name: string;
    description: string;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call(_: string): Promise<string>;
}
//# sourceMappingURL=environmentTools.d.ts.map