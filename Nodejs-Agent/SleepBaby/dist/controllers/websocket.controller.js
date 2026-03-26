"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketController = exports.WebSocketController = void 0;
const zod_1 = require("zod");
const agentExecutor_1 = require("../agents/agentExecutor");
const contentModeration_service_1 = require("../services/contentModeration.service");
const websocket_service_1 = require("../services/websocket.service");
// 约束小程序通过 WebSocket 发送的 chat_message 数据结构。
const chatMessageSchema = zod_1.z.object({
    input: zod_1.z.string().trim().min(1, 'input 不能为空'),
    babyId: zod_1.z.string().trim().min(1).optional(),
    userId: zod_1.z.string().trim().min(1).optional(),
});
class WebSocketController {
    async handleMessage(clientId, event, data) {
        if (event === 'chat_message') {
            // 先校验消息体，避免不合法数据继续进入 Agent 流程。
            const parsed = chatMessageSchema.safeParse(data);
            if (!parsed.success) {
                websocket_service_1.webSocketService.sendToUser(clientId, 'agent_response', {
                    status: 'error',
                    message: '消息格式不正确',
                    errors: parsed.error.issues,
                });
                return;
            }
            const { input, babyId, userId } = parsed.data;
            // 在调用 Agent 前进行敏感词拦截，命中后直接返回。
            const moderationResult = contentModeration_service_1.contentModerationService.validateInput(input);
            if (!moderationResult.ok) {
                websocket_service_1.webSocketService.sendToUser(clientId, 'agent_response', {
                    status: 'error',
                    message: moderationResult.message,
                    matchedWords: moderationResult.matchedWords,
                });
                return;
            }
            try {
                const response = await (0, agentExecutor_1.runAgent)(input, babyId, userId);
                console.log(response.content);
                websocket_service_1.webSocketService.sendToUser(clientId, 'agent_response', {
                    status: 'success',
                    content: response.content,
                    raw: response.raw,
                });
            }
            catch (error) {
                websocket_service_1.webSocketService.sendToUser(clientId, 'agent_response', {
                    status: 'error',
                    message: error.message,
                });
            }
            return;
        }
        // 非 chat_message 事件先按通用消息处理，便于后续扩展更多事件类型。
        console.log(`收到来自 ${clientId} 的消息，事件: ${event}，数据: ${JSON.stringify(data)}`);
        websocket_service_1.webSocketService.sendToUser(clientId, 'message_received', { status: 'success' });
    }
    async broadcastStatusUpdate(status) {
        websocket_service_1.webSocketService.broadcast('status_update', status);
    }
}
exports.WebSocketController = WebSocketController;
exports.webSocketController = new WebSocketController();
//# sourceMappingURL=websocket.controller.js.map