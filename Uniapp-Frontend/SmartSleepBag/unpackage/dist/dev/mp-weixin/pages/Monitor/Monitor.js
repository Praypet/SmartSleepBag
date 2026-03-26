"use strict";
const common_vendor = require("../../common/vendor.js");
const api_monitor = require("../../api/monitor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "Monitor",
  setup(__props) {
    common_vendor.ref(true);
    const sensors = common_vendor.ref([]);
    const heartRateData = common_vendor.ref([]);
    const crying = common_vendor.ref(false);
    const possibleReasons = common_vendor.ref([]);
    const probabilities = common_vendor.ref([]);
    const tempData = common_vendor.ref([]);
    const timeLabels = common_vendor.ref([]);
    let heartRateTimer = null;
    let sensorsTimer = null;
    const getSensorColor = (sensorName) => {
      const colorMap = {
        "环境温度": "#ff69b4",
        "心率": "#87cefa",
        "呼吸": "#ffb6c1",
        "环境湿度": "#98d8c8"
      };
      return colorMap[sensorName] || "#ff69b4";
    };
    const getReasonColor = (reason) => {
      const colorMap = {
        "饥饿": "#ff69b4",
        "尿湿": "#87cefa",
        "疼痛": "#98d8c8"
      };
      return colorMap[reason] || "#ff69b4";
    };
    const loadSensorData = async () => {
      try {
        const res = await api_monitor.getSensorData();
        if (res.code === 200) {
          sensors.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Monitor/Monitor.vue:190", "获取传感器数据失败:", error);
      }
    };
    const loadHeartRateData = async () => {
      try {
        const res = await api_monitor.getHeartRateData();
        if (res.code === 200) {
          heartRateData.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Monitor/Monitor.vue:202", "获取心率数据失败:", error);
      }
    };
    const loadCryAnalysis = async () => {
      try {
        const res = await api_monitor.getCryAnalysis();
        if (res.code === 200) {
          crying.value = res.data.isCrying;
          possibleReasons.value = res.data.possibleReasons;
          probabilities.value = res.data.probabilities;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Monitor/Monitor.vue:216", "获取哭声分析失败:", error);
      }
    };
    const loadTempData = async () => {
      try {
        const res = await api_monitor.getTempData();
        if (res.code === 200) {
          tempData.value = res.data.temperatures;
          timeLabels.value = res.data.timeLabels;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Monitor/Monitor.vue:229", "获取体温数据失败:", error);
      }
    };
    const startMonitoring = () => {
      heartRateTimer = setInterval(async () => {
        await loadHeartRateData();
      }, 2e3);
      sensorsTimer = setInterval(async () => {
        await loadSensorData();
      }, 1e4);
    };
    const stopMonitoring = () => {
      if (heartRateTimer) {
        clearInterval(heartRateTimer);
        heartRateTimer = null;
      }
      if (sensorsTimer) {
        clearInterval(sensorsTimer);
        sensorsTimer = null;
      }
    };
    const initData = async () => {
      await Promise.all([
        loadSensorData(),
        loadHeartRateData(),
        loadCryAnalysis(),
        loadTempData()
      ]);
      startMonitoring();
    };
    common_vendor.onMounted(() => {
      initData();
    });
    common_vendor.onUnmounted(() => {
      stopMonitoring();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "thermometer",
          size: "22",
          color: "#ff69b4"
        }),
        b: common_vendor.f(sensors.value, (sensor, k0, i0) => {
          return {
            a: common_vendor.t(sensor.name),
            b: common_vendor.t(sensor.value),
            c: common_vendor.t(sensor.unit),
            d: getSensorColor(sensor.name),
            e: common_vendor.t(sensor.status),
            f: getSensorColor(sensor.name) + "20",
            g: getSensorColor(sensor.name),
            h: sensor.name
          };
        }),
        c: common_vendor.p({
          type: "heart-filled",
          size: "22",
          color: "#ff69b4"
        }),
        d: common_vendor.f(heartRateData.value, (value, index, i0) => {
          return {
            a: index,
            b: value + "%"
          };
        }),
        e: common_vendor.p({
          type: "sound",
          size: "22",
          color: "#ff69b4"
        }),
        f: common_vendor.t(crying.value ? "检测到哭声" : "安静"),
        g: common_vendor.n(crying.value ? "crying" : "quiet"),
        h: crying.value
      }, crying.value ? {
        i: common_vendor.f(possibleReasons.value, (reason, k0, i0) => {
          return {
            a: common_vendor.t(reason),
            b: reason,
            c: getReasonColor(reason)
          };
        }),
        j: common_vendor.f(probabilities.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: common_vendor.t(item.probability),
            c: item.probability + "%",
            d: getReasonColor(item.name),
            e: item.name
          };
        })
      } : {}, {
        k: common_vendor.p({
          type: "thermometer",
          size: "22",
          color: "#ff69b4"
        }),
        l: common_vendor.f(tempData.value, (temp, index, i0) => {
          return {
            a: common_vendor.t(temp),
            b: index,
            c: index / (tempData.value.length - 1) * 100 + "%",
            d: (temp - 36) / 1.5 * 100 + "%"
          };
        }),
        m: common_vendor.f(timeLabels.value, (time, k0, i0) => {
          return {
            a: common_vendor.t(time),
            b: time
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6afcbdb9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Monitor/Monitor.js.map
