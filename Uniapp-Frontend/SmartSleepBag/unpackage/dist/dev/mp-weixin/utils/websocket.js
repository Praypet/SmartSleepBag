"use strict";
const common_vendor = require("../common/vendor.js");
const api_chat = require("../api/chat.js");
let socketTask = null;
let heartbeatTimer = null;
function connectBabySocket() {
  socketTask = common_vendor.wx$1.connectSocket({
    url: "ws://172.18.176.1:3001/ws",
    success() {
      common_vendor.index.__f__("log", "at utils/websocket.js:9", "开始连接 WebSocket");
    }
  });
  socketTask.onOpen(() => {
    common_vendor.index.__f__("log", "at utils/websocket.js:14", "WebSocket 已连接");
  });
  socketTask.onMessage((res) => {
    const message = JSON.parse(res.data);
    common_vendor.index.__f__("log", "at utils/websocket.js:19", "收到服务端消息:", message);
    if (message.event === "connected") {
      startHeartbeat();
    }
    if (message.event === "ping") {
      sendSocketMessage("pong", {
        clientTime: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (message.event === "agent_response") {
      common_vendor.index.__f__("log", "at utils/websocket.js:32", "AI 返回结果:", message.data);
      api_chat.addMessage("assistant", message.data.content);
    }
  });
  socketTask.onError((err) => {
    common_vendor.index.__f__("error", "at utils/websocket.js:38", "WebSocket 错误:", err);
  });
  socketTask.onClose(() => {
    common_vendor.index.__f__("log", "at utils/websocket.js:42", "WebSocket 已关闭");
    stopHeartbeat();
  });
}
function sendSocketMessage(event, data) {
  if (!socketTask)
    return;
  socketTask.send({
    data: JSON.stringify({
      event,
      data
    })
  });
}
function sendChatMessage(input, babyId, userId) {
  api_chat.addMessage("user", input);
  sendSocketMessage("chat_message", {
    input,
    babyId,
    userId
  });
}
function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    sendSocketMessage("ping", {
      clientTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, 3e4);
}
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}
exports.connectBabySocket = connectBabySocket;
exports.sendChatMessage = sendChatMessage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/websocket.js.map
