"use strict";
const common_vendor = require("../common/vendor.js");
const utils_websocket = require("../utils/websocket.js");
const chatConfig = common_vendor.reactive({
  avatar: "/static/chat.jpg",
  // 可爱云朵宝宝形象
  name: "安安"
});
const chatState = common_vendor.reactive({
  visible: false,
  messages: [],
  unreadCount: 0,
  showReminder: false,
  reminderMessage: "",
  isTyping: false
});
let babyInfo = {
  id: 1,
  name: "宝宝",
  age: "",
  gender: ""
};
let sensorsData = {
  体温: { value: 36.5, unit: "℃" },
  心率: { value: 120, unit: "次/分" },
  呼吸: { value: 28, unit: "次/分" },
  体动: { value: 8, unit: "次" }
};
let sleepStatus = {
  isSleeping: true,
  text: "睡眠中"
};
const updateBabyInfo = (info) => {
  if (info)
    babyInfo = { ...babyInfo, ...info };
};
const updateSensors = (sensors) => {
  if (sensors && sensors.length) {
    sensors.forEach((s) => {
      if (sensorsData[s.label]) {
        sensorsData[s.label] = { value: s.value, unit: s.unit };
      }
    });
  }
};
const updateSleepStatus = (status) => {
  if (status)
    sleepStatus = { ...sleepStatus, ...status };
};
const updateRecentSleep = (records) => {
  if (records && records.length)
    ;
};
const getSmartReminderMessage = () => {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const isSleeping = sleepStatus.isSleeping;
  const babyName = babyInfo.name || "宝宝";
  if (hour >= 21 || hour < 6) {
    return `晚安~ ${babyName}睡得香吗？明天可以和我聊聊睡眠情况哦`;
  } else if (hour >= 12 && hour <= 14) {
    return `${babyName}午睡时间到啦，记得观察呼吸和体温哦`;
  } else if (!isSleeping && (hour >= 7 && hour <= 10)) {
    return `早上好！${babyName}醒了没？今天的精神状态怎么样？`;
  } else {
    const reminders = [
      `来聊聊${babyName}最近的变化吧~`,
      `想看看${babyName}这周的睡眠报告吗？`,
      `最近${babyName}的饮食怎么样？`,
      `和我说说${babyName}今天的小趣事吧~`,
      `${babyName}今天的活动量如何？`,
      `需要我帮你记录${babyName}的成长点滴吗？`
    ];
    return reminders[Math.floor(Math.random() * reminders.length)];
  }
};
const addMessage = (role, content) => {
  if (role === "assistant") {
    const loadingIndex = chatState.messages.findIndex((m) => m.loading);
    if (loadingIndex !== -1)
      chatState.messages.splice(loadingIndex, 1);
  }
  chatState.messages.push({
    role,
    content,
    time: Date.now(),
    id: Date.now() + Math.random()
  });
};
const openChat = () => {
  chatState.visible = true;
  chatState.showReminder = false;
  chatState.reminderMessage = "";
  chatState.unreadCount = 0;
  utils_websocket.connectBabySocket();
  if (chatState.messages.length === 0) {
    setTimeout(() => {
      addMessage("assistant", `嗨！我是${chatConfig.name}，${babyInfo.name || "宝宝"}的健康小助手~ 有任何问题或想分享的都可以和我说哦！`);
    }, 300);
  }
};
const closeChat = () => {
  chatState.visible = false;
};
const triggerReminder = () => {
  if (chatState.visible)
    return;
  chatState.reminderMessage = getSmartReminderMessage();
  chatState.showReminder = true;
  chatState.unreadCount += 1;
  setTimeout(() => {
    if (chatState.showReminder) {
      chatState.showReminder = false;
    }
  }, 8e3);
};
const clearReminder = () => {
  chatState.showReminder = false;
  chatState.reminderMessage = "";
};
exports.addMessage = addMessage;
exports.chatConfig = chatConfig;
exports.chatState = chatState;
exports.clearReminder = clearReminder;
exports.closeChat = closeChat;
exports.openChat = openChat;
exports.triggerReminder = triggerReminder;
exports.updateBabyInfo = updateBabyInfo;
exports.updateRecentSleep = updateRecentSleep;
exports.updateSensors = updateSensors;
exports.updateSleepStatus = updateSleepStatus;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chat.js.map
