import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 当前小程序走原生 WebSocket，不再通过 Express routes 处理 websocket 入口。
// 这里只保留通用 HTTP 中间件，方便后续扩展普通接口。
app.use(errorHandler);

export default app;
