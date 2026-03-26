import { z } from 'zod';
import { runAgent } from '../agents/agentExecutor';
import { contentModerationService } from '../services/contentModeration.service';
import { webSocketService } from '../services/websocket.service';

// 约束小程序通过 WebSocket 发送的 chat_message 数据结构。
const chatMessageSchema = z.object({
  input: z.string().trim().min(1, 'input 不能为空'),
  babyId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
});

export class WebSocketController {
  async handleMessage(clientId: string, event: string, data: any) {
    if (event === 'chat_message') {
      // 先校验消息体，避免不合法数据继续进入 Agent 流程。
      const parsed = chatMessageSchema.safeParse(data);

      if (!parsed.success) {
        webSocketService.sendToUser(clientId, 'agent_response', {
          status: 'error',
          message: '消息格式不正确',
          errors: parsed.error.issues,
        });
        return;
      }

      const { input, babyId, userId } = parsed.data;

      // 在调用 Agent 前进行敏感词拦截，命中后直接返回。
      const moderationResult = contentModerationService.validateInput(input);
      if (!moderationResult.ok) {
        webSocketService.sendToUser(clientId, 'agent_response', {
          status: 'error',
          message: moderationResult.message,
          matchedWords: moderationResult.matchedWords,
        });
        return;
      }

      try {
        const response = await runAgent(input, babyId, userId);
        webSocketService.sendToUser(clientId, 'agent_response', {
          status: 'success',
          content: response.content,
          raw: response.raw,
        });
      } catch (error) {
        webSocketService.sendToUser(clientId, 'agent_response', {
          status: 'error',
          message: (error as Error).message,
        });
      }
      return;
    }

    // 非 chat_message 事件先按通用消息处理，便于后续扩展更多事件类型。
    console.log(`收到来自 ${clientId} 的消息，事件: ${event}，数据: ${JSON.stringify(data)}`);
    webSocketService.sendToUser(clientId, 'message_received', { status: 'success' });
  }

  async broadcastStatusUpdate(status: any) {
    webSocketService.broadcast('status_update', status);
  }
}

export const webSocketController = new WebSocketController();
