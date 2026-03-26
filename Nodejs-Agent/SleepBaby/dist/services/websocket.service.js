"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = exports.WebSocketService = void 0;
const crypto_1 = require("crypto");
const ws_1 = require("ws");
const websocket_controller_1 = require("../controllers/websocket.controller");
class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.heartbeatTimer = null;
        this.heartbeatIntervalMs = Number(process.env.WS_HEARTBEAT_INTERVAL_MS || 30000);
        this.heartbeatTimeoutMs = Number(process.env.WS_HEARTBEAT_TIMEOUT_MS || 90000);
    }
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws',
        });
        // 启动应用层心跳巡检，定期清理长时间未活跃的连接。
        this.startHeartbeat();
        console.log('WebSocket 服务已初始化，路径: /ws');
        this.wss.on('connection', (socket) => {
            const clientId = (0, crypto_1.randomUUID)();
            this.clients.set(clientId, {
                socket,
                lastSeenAt: Date.now(),
            });
            console.log(`WebSocket 客户端已连接: ${clientId}`);
            this.send(socket, {
                event: 'connected',
                clientId,
                data: {
                    clientId,
                    heartbeatIntervalMs: this.heartbeatIntervalMs,
                },
                timestamp: new Date().toISOString(),
            });
            socket.on('message', async (rawMessage) => {
                await this.handleIncomingMessage(clientId, rawMessage.toString());
            });
            socket.on('close', () => {
                this.clients.delete(clientId);
                console.log(`WebSocket 客户端已断开: ${clientId}`);
            });
            socket.on('error', (error) => {
                console.error(`WebSocket 错误 ${clientId}:`, error);
            });
        });
    }
    async handleIncomingMessage(clientId, rawMessage) {
        let message;
        try {
            message = JSON.parse(rawMessage);
        }
        catch (error) {
            this.sendToUser(clientId, 'error', {
                status: 'error',
                message: '无效的 JSON 消息格式',
            });
            console.error(`来自 ${clientId} 的 WebSocket JSON 无效:`, error);
            return;
        }
        this.markClientAlive(clientId);
        if (!message.event) {
            this.sendToUser(clientId, 'error', {
                status: 'error',
                message: '缺少 event 字段',
            });
            return;
        }
        // 小程序定时发送 ping，服务端直接回 pong，并刷新最后活跃时间。
        if (message.event === 'ping') {
            this.sendToUser(clientId, 'pong', {
                status: 'success',
                serverTime: new Date().toISOString(),
            });
            return;
        }
        if (message.event === 'pong') {
            return;
        }
        await websocket_controller_1.webSocketController.handleMessage(clientId, message.event, message.data);
    }
    markClientAlive(clientId) {
        const session = this.clients.get(clientId);
        if (!session) {
            return;
        }
        session.lastSeenAt = Date.now();
    }
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        this.heartbeatTimer = setInterval(() => {
            const now = Date.now();
            for (const [clientId, session] of this.clients.entries()) {
                const isStale = now - session.lastSeenAt > this.heartbeatTimeoutMs;
                if (isStale) {
                    console.warn(`WebSocket 客户端心跳超时: ${clientId}`);
                    session.socket.close(4000, 'Heartbeat timeout');
                    this.clients.delete(clientId);
                    continue;
                }
                this.send(session.socket, {
                    event: 'ping',
                    clientId,
                    data: { serverTime: new Date().toISOString() },
                    timestamp: new Date().toISOString(),
                });
            }
        }, this.heartbeatIntervalMs);
    }
    send(socket, payload) {
        if (socket.readyState !== ws_1.WebSocket.OPEN) {
            return;
        }
        socket.send(JSON.stringify(payload));
    }
    broadcast(event, data) {
        const payload = {
            event,
            data,
            timestamp: new Date().toISOString(),
        };
        for (const session of this.clients.values()) {
            this.send(session.socket, payload);
        }
    }
    sendToUser(clientId, event, data) {
        const session = this.clients.get(clientId);
        if (!session) {
            return;
        }
        this.send(session.socket, {
            event,
            clientId,
            data,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.WebSocketService = WebSocketService;
exports.webSocketService = new WebSocketService();
//# sourceMappingURL=websocket.service.js.map