import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
declare const HistoricalDataQuerySchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
    days: z.ZodOptional<z.ZodNumber>;
    dataType: z.ZodOptional<z.ZodEnum<{
        all: "all";
        sleep: "sleep";
        health: "health";
        events: "events";
    }>>;
}, z.core.$strip>;
/**
 * 用于查询 PostgreSQL 中已经沉淀的历史睡眠、生理和事件数据。
 */
export declare class HistoricalDataQueryTool extends StructuredTool<typeof HistoricalDataQuerySchema> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        date: z.ZodOptional<z.ZodString>;
        days: z.ZodOptional<z.ZodNumber>;
        dataType: z.ZodOptional<z.ZodEnum<{
            all: "all";
            sleep: "sleep";
            health: "health";
            events: "events";
        }>>;
    }, z.core.$strip>;
    private babyId?;
    constructor(babyId?: string);
    _call({ date, days, dataType, }: z.infer<typeof HistoricalDataQuerySchema>): Promise<string>;
}
export {};
//# sourceMappingURL=historicalDataTool.d.ts.map