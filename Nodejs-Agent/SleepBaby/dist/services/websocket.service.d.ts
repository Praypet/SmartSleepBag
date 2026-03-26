import { Server as HttpServer } from 'http';
export declare class WebSocketService {
    private wss;
    private clients;
    private heartbeatTimer;
    private readonly heartbeatIntervalMs;
    private readonly heartbeatTimeoutMs;
    initialize(server: HttpServer): void;
    private handleIncomingMessage;
    private markClientAlive;
    private startHeartbeat;
    private send;
    broadcast(event: string, data: unknown): void;
    sendToUser(clientId: string, event: string, data: unknown): void;
}
export declare const webSocketService: WebSocketService;
//# sourceMappingURL=websocket.service.d.ts.map