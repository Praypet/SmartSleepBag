"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const api_chat = require("../api/chat.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_component_transition + _easycom_uni_icons2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "chat",
  setup(__props, { expose: __expose }) {
    const inputMessage = common_vendor.ref("");
    const scrollToView = common_vendor.ref("");
    const isLoadingMessages = common_vendor.ref(false);
    const quickReplies = common_vendor.ref(["睡眠怎么样？", "体温正常吗？", "今日提醒", "成长记录"]);
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    common_vendor.watch(
      () => api_chat.chatState.messages.length,
      async () => {
        await common_vendor.nextTick$1();
        if (api_chat.chatState.messages.length > 0) {
          scrollToView.value = `msg-${api_chat.chatState.messages.length - 1}`;
        }
      }
    );
    const handleOpenChat = async () => {
      isLoadingMessages.value = true;
      api_chat.openChat();
      api_chat.clearReminder();
      setTimeout(() => {
        isLoadingMessages.value = false;
      }, 500);
    };
    const handleCloseChat = () => {
      api_chat.closeChat();
    };
    const handleSendMessage = async () => {
      if (!inputMessage.value.trim())
        return;
      const message = inputMessage.value;
      inputMessage.value = "";
      await api_chat.sendUserMessage(message);
    };
    const handleQuickReply = (reply) => {
      inputMessage.value = reply;
      handleSendMessage();
    };
    const onInputFocus = () => {
      common_vendor.nextTick$1(() => {
        scrollToView.value = `msg-${api_chat.chatState.messages.length - 1}`;
      });
    };
    const onInputBlur = () => {
    };
    const handleVoiceInput = () => {
      common_vendor.index.showToast({
        title: "语音功能开发中",
        icon: "none",
        duration: 1500
      });
    };
    const updateChatData = (data) => {
      if (data.babyInfo)
        api_chat.updateBabyInfo(data.babyInfo);
      if (data.sensors)
        api_chat.updateSensors(data.sensors);
      if (data.sleepStatus)
        api_chat.updateSleepStatus(data.sleepStatus);
      if (data.recentSleep)
        api_chat.updateRecentSleep(data.recentSleep);
    };
    const showReminder = () => {
      api_chat.triggerReminder();
    };
    __expose({
      updateChatData,
      showReminder
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(api_chat.chatConfig).avatar,
        b: common_vendor.unref(api_chat.chatState).unreadCount > 0
      }, common_vendor.unref(api_chat.chatState).unreadCount > 0 ? {
        c: common_vendor.t(common_vendor.unref(api_chat.chatState).unreadCount > 99 ? "99+" : common_vendor.unref(api_chat.chatState).unreadCount)
      } : {}, {
        d: !common_vendor.unref(api_chat.chatState).visible ? 1 : "",
        e: common_vendor.unref(api_chat.chatState).showReminder && common_vendor.unref(api_chat.chatState).reminderMessage
      }, common_vendor.unref(api_chat.chatState).showReminder && common_vendor.unref(api_chat.chatState).reminderMessage ? {
        f: common_vendor.t(common_vendor.unref(api_chat.chatState).reminderMessage),
        g: common_vendor.o(handleOpenChat)
      } : {}, {
        h: common_vendor.p({
          name: "bubble-fade"
        }),
        i: common_vendor.o(handleOpenChat),
        j: common_vendor.unref(api_chat.chatState).showReminder ? 1 : "",
        k: common_vendor.unref(api_chat.chatState).visible
      }, common_vendor.unref(api_chat.chatState).visible ? common_vendor.e({
        l: common_vendor.unref(api_chat.chatState).visible
      }, common_vendor.unref(api_chat.chatState).visible ? common_vendor.e({
        m: common_vendor.unref(api_chat.chatConfig).avatar,
        n: common_vendor.t(common_vendor.unref(api_chat.chatConfig).name),
        o: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#ff88b0"
        }),
        p: common_vendor.o(handleCloseChat),
        q: isLoadingMessages.value
      }, isLoadingMessages.value ? {} : {}, {
        r: common_vendor.f(common_vendor.unref(api_chat.chatState).messages, (msg, idx, i0) => {
          return common_vendor.e({
            a: msg.role === "assistant"
          }, msg.role === "assistant" ? {
            b: common_vendor.unref(api_chat.chatConfig).avatar
          } : {}, {
            c: common_vendor.t(msg.content),
            d: common_vendor.n(msg.role),
            e: common_vendor.t(formatTime(msg.time)),
            f: msg.role === "user"
          }, msg.role === "user" ? {
            g: common_assets._imports_0
          } : {}, {
            h: common_vendor.n(msg.role),
            i: "3b03e103-4-" + i0 + ",3b03e103-2",
            j: msg.id || idx,
            k: "msg-" + idx
          });
        }),
        s: common_vendor.p({
          name: "message-fade",
          appear: true
        }),
        t: common_vendor.unref(api_chat.chatState).isTyping
      }, common_vendor.unref(api_chat.chatState).isTyping ? {
        v: common_vendor.unref(api_chat.chatConfig).avatar
      } : {}, {
        w: common_vendor.p({
          name: "typing-fade"
        }),
        x: scrollToView.value,
        y: quickReplies.value.length > 0
      }, quickReplies.value.length > 0 ? {
        z: common_vendor.f(quickReplies.value, (reply, k0, i0) => {
          return {
            a: common_vendor.t(reply),
            b: reply,
            c: common_vendor.o(($event) => handleQuickReply(reply), reply)
          };
        })
      } : {}, {
        A: common_vendor.o(handleSendMessage),
        B: common_vendor.o(onInputFocus),
        C: common_vendor.o(onInputBlur),
        D: inputMessage.value,
        E: common_vendor.o(($event) => inputMessage.value = $event.detail.value),
        F: common_vendor.p({
          type: "mic",
          size: "22",
          color: "#ff88b0"
        }),
        G: common_vendor.o(handleVoiceInput),
        H: common_vendor.p({
          type: "paperplane",
          size: "20",
          color: "#fff"
        }),
        I: inputMessage.value.trim() ? 1 : "",
        J: common_vendor.o(handleSendMessage),
        K: common_vendor.o(() => {
        })
      }) : {}, {
        L: common_vendor.p({
          name: "drawer-slide"
        }),
        M: common_vendor.o(handleCloseChat)
      }) : {}, {
        N: common_vendor.p({
          name: "drawer-fade"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b03e103"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/chat.js.map
