"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const websocket_service_1 = require("./services/websocket.service");
const PORT = process.env.PORT;
const server = http_1.default.createServer(app_1.default);
// 初始化原生 WebSocket 服务，供小程序客户端连接。
websocket_service_1.webSocketService.initialize(server);
server.listen(PORT, () => {
    console.log(`HTTP server and WebSocket server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map