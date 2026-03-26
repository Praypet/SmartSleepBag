import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
declare const MemoryUpdateSchema: z.ZodObject<{
    userId: z.ZodString;
    fact: z.ZodString;
}, z.core.$strip>;
/**
 * 用于将关于宝宝的重要事实存入长期记忆的工具。
 */
export declare class MemoryUpdateTool extends StructuredTool<typeof MemoryUpdateSchema> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        userId: z.ZodString;
        fact: z.ZodString;
    }, z.core.$strip>;
    private babyId?;
    private userId?;
    constructor(babyId?: string, userId?: string);
    _call({ userId, fact }: z.infer<typeof MemoryUpdateSchema>): Promise<string>;
}
export {};
//# sourceMappingURL=memoryUpdateTool.d.ts.map