import http from 'http';
import app from './app';
import { webSocketService } from './services/websocket.service';

const PORT = process.env.PORT;

const server = http.createServer(app);

// 初始化原生 WebSocket 服务，供小程序客户端连接。
webSocketService.initialize(server);

server.listen(PORT, () => {
  console.log(`HTTP server and WebSocket server running on port ${PORT}`);
});
