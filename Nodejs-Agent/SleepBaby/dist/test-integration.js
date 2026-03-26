"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agentExecutor_1 = require("./agents/agentExecutor");
const logger_1 = require("./utils/logger");
async function testEventStoreIntegration() {
    try {
        logger_1.logger.info('开始测试 eventStore 集成...');
        // 测试运行 Agent（这会触发工具调用和数据存储）
        const result = await (0, agentExecutor_1.runAgent)('宝宝今天睡得怎么样？请帮我分析一下睡眠数据', 'test_baby_001', 'test_user_001');
        logger_1.logger.info('Agent 执行成功');
        logger_1.logger.info('响应内容:', result.content.substring(0, 200) + '...');
        logger_1.logger.info('eventStore 集成测试完成！');
    }
    catch (error) {
        logger_1.logger.error('测试失败:', error);
    }
}
// 只有在直接运行此文件时才执行测试
if (require.main === module) {
    testEventStoreIntegration();
}
//# sourceMappingURL=test-integration.js.map