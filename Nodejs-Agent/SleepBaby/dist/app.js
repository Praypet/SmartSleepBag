"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 当前小程序走原生 WebSocket，不再通过 Express routes 处理 websocket 入口。
// 这里只保留通用 HTTP 中间件，方便后续扩展普通接口。
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map