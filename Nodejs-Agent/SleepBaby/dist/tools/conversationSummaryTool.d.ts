import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
declare const ConversationSummarySchema: z.ZodObject<{
    userId: z.ZodString;
    babyId: z.ZodString;
    conversationHistory: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>>;
    summaryType: z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
    }>;
}, z.core.$strip>;
/**
 * 对话摘要生成工具
 * 用于总结历史对话，提取关键信息，存入长期记忆（Chroma）
 * 支持日、周、月多个维度的总结
 */
export declare class ConversationSummaryTool extends StructuredTool<typeof ConversationSummarySchema> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        userId: z.ZodString;
        babyId: z.ZodString;
        conversationHistory: z.ZodArray<z.ZodObject<{
            role: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>>;
        summaryType: z.ZodEnum<{
            daily: "daily";
            weekly: "weekly";
            monthly: "monthly";
        }>;
    }, z.core.$strip>;
    private llm;
    private longTermMemory;
    constructor();
    _call({ userId, babyId, conversationHistory, summaryType, }: z.infer<typeof ConversationSummarySchema>): Promise<string>;
    /**
     * 构建摘要生成提示词
     */
    private buildSummaryPrompt;
}
export {};
//# sourceMappingURL=conversationSummaryTool.d.ts.map