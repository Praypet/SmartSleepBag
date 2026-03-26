"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryUpdateTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const memoryStore_1 = require("../memory/memoryStore");
const logger_1 = require("../utils/logger");
const MemoryUpdateSchema = zod_1.z.object({
    userId: zod_1.z.string().describe('进行操作的用户或宝宝的唯一标识符'),
    fact: zod_1.z.string().describe('需要存入长期记忆的、关于宝宝的一个明确事实或观察结果。'),
});
/**
 * 用于将关于宝宝的重要事实存入长期记忆的工具。
 */
class MemoryUpdateTool extends tools_1.StructuredTool {
    constructor(babyId, userId) {
        super();
        this.name = 'memory_update';
        this.description = '当发现关于宝宝的新的、重要的、可长期参考的信息时（如偏好、习惯、健康状况、重要事件），使用此工具进行记录。';
        this.schema = MemoryUpdateSchema;
        this.babyId = babyId;
        this.userId = userId;
    }
    async _call({ userId, fact }) {
        try {
            logger_1.logger.info(`正在将事实存入长期记忆 [用户: ${userId}]: "${fact}"`);
            await memoryStore_1.memoryStore.store(userId, fact, 'long');
            return `成功将事实 "${fact}" 存入长期记忆。`;
        }
        catch (error) {
            logger_1.logger.error('长期记忆存储失败:', error);
            return '无法存储该信息，请稍后重试。';
        }
    }
}
exports.MemoryUpdateTool = MemoryUpdateTool;
//# sourceMappingURL=memoryUpdateTool.js.map