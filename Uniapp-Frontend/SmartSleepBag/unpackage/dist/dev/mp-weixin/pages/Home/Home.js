"use strict";
const common_vendor = require("../../common/vendor.js");
const api_home = require("../../api/home.js");
const utils_date = require("../../utils/date.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + Chat)();
}
const Chat = () => "../../components/chat.js";
const _sfc_main = {
  __name: "Home",
  setup(__props) {
    const currentDate = common_vendor.ref("");
    const babyInfo = common_vendor.ref({ name: "", age: "", gender: "", avatar: "" });
    const sleepStatus = common_vendor.ref({ text: "", isSleeping: true });
    const sensors = common_vendor.ref([]);
    const recentSleep = common_vendor.ref([]);
    const smartTip = common_vendor.ref("");
    const loading = common_vendor.ref({
      babyInfo: false,
      sleepStatus: false,
      sensors: false,
      recentSleep: false,
      smartTip: false
    });
    const chatComponent = common_vendor.ref(null);
    let reminderInterval = null;
    const getSensorColor = (label) => {
      const colorMap = {
        "环境温度": "#ff69b4",
        "心率": "#87cefa",
        "呼吸": "#ffb6c1",
        "环境湿度": "#98d8c8"
      };
      return colorMap[label] || "#ff69b4";
    };
    const formatSensorValue = (sensor) => {
      return `${sensor.value}${sensor.unit}`;
    };
    const loadBabyInfo = async () => {
      loading.value.babyInfo = true;
      try {
        const res = await api_home.getBabyInfo();
        if (res.code === 200) {
          babyInfo.value = res.data;
          if (chatComponent.value) {
            chatComponent.value.updateChatData({ babyInfo: babyInfo.value });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:173", "获取宝宝信息失败:", error);
        common_vendor.index.showToast({ title: "获取宝宝信息失败", icon: "none" });
      } finally {
        loading.value.babyInfo = false;
      }
    };
    const loadSleepStatus = async () => {
      loading.value.sleepStatus = true;
      try {
        const res = await api_home.getSleepStatus();
        if (res.code === 200) {
          sleepStatus.value = res.data;
          if (chatComponent.value) {
            chatComponent.value.updateChatData({ sleepStatus: sleepStatus.value });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:192", "获取睡眠状态失败:", error);
      } finally {
        loading.value.sleepStatus = false;
      }
    };
    const loadSensors = async () => {
      loading.value.sensors = true;
      try {
        const res = await api_home.getSensors();
        if (res.code === 200) {
          sensors.value = res.data;
          if (chatComponent.value) {
            chatComponent.value.updateChatData({ sensors: sensors.value });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:210", "获取传感器数据失败:", error);
        common_vendor.index.showToast({ title: "获取传感器失败", icon: "none" });
      } finally {
        loading.value.sensors = false;
      }
    };
    const loadRecentSleep = async () => {
      loading.value.recentSleep = true;
      try {
        const res = await api_home.getRecentSleep();
        if (res.code === 200) {
          recentSleep.value = res.data;
          if (chatComponent.value) {
            chatComponent.value.updateChatData({ recentSleep: recentSleep.value });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:229", "获取睡眠记录失败:", error);
        common_vendor.index.showToast({ title: "获取睡眠记录失败", icon: "none" });
      } finally {
        loading.value.recentSleep = false;
      }
    };
    const loadSmartTip = async () => {
      loading.value.smartTip = true;
      try {
        const res = await api_home.getSmartTip();
        if (res.code === 200) {
          smartTip.value = res.data.content;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:245", "获取智能提示失败:", error);
      } finally {
        loading.value.smartTip = false;
      }
    };
    const loadAllData = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        await Promise.all([
          loadBabyInfo(),
          loadSleepStatus(),
          loadSensors(),
          loadRecentSleep(),
          loadSmartTip()
        ]);
        common_vendor.index.hideLoading();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/Home/Home.vue:268", "加载所有数据失败:", error);
      }
    };
    const goToProfile = () => {
      common_vendor.index.switchTab({ url: "/pages/profile/profile" });
    };
    const goToMonitor = () => {
      common_vendor.index.switchTab({ url: "/pages/monitor/monitor" });
    };
    const goToReport = () => {
      common_vendor.index.switchTab({ url: "/pages/report/report" });
    };
    const goToAnalysis = () => {
      common_vendor.index.switchTab({ url: "/pages/analysis/analysis" });
    };
    common_vendor.onMounted(() => {
      currentDate.value = utils_date.updateDate();
      loadAllData();
      setInterval(() => {
        loadSensors();
        loadSleepStatus();
      }, 3e4);
      reminderInterval = setInterval(() => {
        if (chatComponent.value) {
          chatComponent.value.showReminder();
        }
      }, 9e4);
    });
    common_vendor.onUnmounted(() => {
      if (reminderInterval)
        clearInterval(reminderInterval);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(currentDate.value),
        b: babyInfo.value.avatar,
        c: common_vendor.o(goToProfile),
        d: common_vendor.t(babyInfo.value.name),
        e: common_vendor.t(babyInfo.value.age),
        f: common_vendor.t(babyInfo.value.gender),
        g: common_vendor.t(sleepStatus.value.text),
        h: common_vendor.n(sleepStatus.value.isSleeping ? "sleep" : "awake"),
        i: common_vendor.f(sensors.value, (sensor, k0, i0) => {
          return {
            a: common_vendor.t(sensor.label),
            b: common_vendor.t(formatSensorValue(sensor)),
            c: getSensorColor(sensor.label),
            d: sensor.label,
            e: common_vendor.o(goToMonitor, sensor.label)
          };
        }),
        j: common_vendor.p({
          type: "arrowright",
          size: "14",
          color: "#87cefa"
        }),
        k: common_vendor.o(goToReport),
        l: common_vendor.f(recentSleep.value, (record, k0, i0) => {
          return {
            a: "7ffebbf4-1-" + i0,
            b: common_vendor.t(record.date),
            c: "7ffebbf4-2-" + i0,
            d: common_vendor.p({
              type: record.quality > 80 ? "checkmarkempty" : "info",
              size: "14",
              color: "#fff"
            }),
            e: common_vendor.t(record.quality > 80 ? "良好" : "注意"),
            f: common_vendor.n(record.quality > 80 ? "good" : "warning"),
            g: record.quality + "%",
            h: record.quality > 80 ? "#ff69b4" : "#87cefa",
            i: "7ffebbf4-3-" + i0,
            j: common_vendor.t(record.deepSleep),
            k: "7ffebbf4-4-" + i0,
            l: common_vendor.t(record.wakeCount),
            m: record.date
          };
        }),
        m: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#ff69b4"
        }),
        n: common_vendor.p({
          type: "smallcircle-filled",
          size: "14",
          color: "#999"
        }),
        o: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999"
        }),
        p: common_vendor.p({
          type: "info",
          size: "24",
          color: "#ff69b4"
        }),
        q: common_vendor.t(smartTip.value),
        r: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#ff69b4"
        }),
        s: common_vendor.o(goToAnalysis),
        t: common_vendor.sr(chatComponent, "7ffebbf4-7", {
          "k": "chatComponent"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7ffebbf4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Home/Home.js.map
