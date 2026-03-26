"use strict";
const common_vendor = require("../../common/vendor.js");
const api_report = require("../../api/report.js");
const utils_date = require("../../utils/date.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "Report",
  setup(__props) {
    const exporting = common_vendor.ref(false);
    const currentRangeIndex = common_vendor.ref(0);
    const reportData = common_vendor.reactive({
      statistics: [],
      weeklyData: [],
      abnormalEvents: [],
      previewData: []
    });
    const statistics = common_vendor.computed(() => reportData.statistics);
    const weeklyData = common_vendor.computed(() => reportData.weeklyData);
    const abnormalEvents = common_vendor.computed(() => reportData.abnormalEvents);
    const previewData = common_vendor.computed(() => reportData.previewData);
    const dateRange = common_vendor.computed(() => {
      return utils_date.getDateRange(currentRangeIndex.value);
    });
    const getStatColor = (label) => {
      const colorMap = {
        "平均睡眠": "#ff69b4",
        "深睡比例": "#87cefa",
        "夜醒次数": "#98d8c8",
        "异常体温": "#ffb6c1"
      };
      return colorMap[label] || "#ff69b4";
    };
    const getTrendColor = (trend) => {
      return trend > 0 ? "#ff69b4" : "#87cefa";
    };
    const getEventColor = (event) => {
      if (event.severity === "high")
        return "#ff4444";
      if (event.severity === "medium")
        return "#ff69b4";
      if (event.severity === "low")
        return "#87cefa";
      const typeColorMap = {
        "体温偏高": "#ff69b4",
        "长时间哭闹": "#87cefa",
        "呼吸异常": "#98d8c8"
      };
      return typeColorMap[event.type] || "#ff69b4";
    };
    const getEventIcon = (type) => {
      const iconMap = {
        "体温偏高": "alert",
        "长时间哭闹": "alert",
        "呼吸异常": "alert"
      };
      return iconMap[type] || "alert";
    };
    const formatStatValue = (stat) => {
      return `${stat.value}${stat.unit}`;
    };
    const loadReportData = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const res = await api_report.getReportData({ dateRange: currentRangeIndex.value, eventsLimit: 5 });
        common_vendor.index.__f__("log", "at pages/Report/Report.vue:218", res);
        reportData.statistics = res[0].data.statistics;
        reportData.previewData = res[1].data.previewData;
        reportData.weeklyData = res[1].data.weeklyData;
        reportData.abnormalEvents = res[2].data.abnormalEvents;
      } catch (error) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/Report/Report.vue:226", "获取报告数据失败:", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleExport = async () => {
      exporting.value = true;
      common_vendor.index.showLoading({ title: "生成报告中...", mask: true });
      try {
        const res = await api_report.exportReport({ dateRange: dateRange.value });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "导出成功", icon: "success" });
          common_vendor.index.__f__("log", "at pages/Report/Report.vue:241", "导出文件:", res.data);
          common_vendor.index.downloadFile({
            url: res.data.url,
            success: (downloadRes) => {
              common_vendor.index.openDocument({
                filePath: downloadRes.tempFilePath,
                success: () => {
                  common_vendor.index.__f__("log", "at pages/Report/Report.vue:250", "打开文档成功");
                }
              });
            }
          });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "导出失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/Report/Report.vue:258", "导出失败:", error);
      } finally {
        common_vendor.index.hideLoading();
        exporting.value = false;
      }
    };
    const openDatePicker = () => {
      common_vendor.index.showActionSheet({
        itemList: utils_date.dateRanges,
        success: async (res) => {
          currentRangeIndex.value = res.tapIndex;
          await loadReportData();
        },
        fail: () => {
          common_vendor.index.__f__("log", "at pages/Report/Report.vue:274", "取消选择");
        }
      });
    };
    common_vendor.onMounted(() => {
      loadReportData();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(dateRange.value.start + " ~ " + dateRange.value.end),
        b: common_vendor.p({
          type: "arrowdown",
          size: "16",
          color: "#ff69b4"
        }),
        c: common_vendor.o(openDatePicker),
        d: common_vendor.f(statistics.value, (stat, k0, i0) => {
          return {
            a: common_vendor.t(stat.label),
            b: common_vendor.t(formatStatValue(stat)),
            c: getStatColor(stat.label),
            d: "c3fb2e18-1-" + i0,
            e: common_vendor.p({
              type: stat.trend > 0 ? "arrowup" : "arrowdown",
              size: "14",
              color: getTrendColor(stat.trend)
            }),
            f: common_vendor.t(Math.abs(stat.trend)),
            g: getTrendColor(stat.trend),
            h: stat.label
          };
        }),
        e: common_vendor.p({
          type: "bars",
          size: "22",
          color: "#ff69b4"
        }),
        f: common_vendor.f(weeklyData.value, (day, index, i0) => {
          return {
            a: common_vendor.t(day.sleepDuration),
            b: day.sleepDuration / 12 * 200 + "rpx",
            c: common_vendor.t(day.remSleep),
            d: day.remSleep / 12 * 200 + "rpx",
            e: common_vendor.t(day.day),
            f: day.day
          };
        }),
        g: common_vendor.p({
          type: "alert",
          size: "22",
          color: "#ff69b4"
        }),
        h: common_vendor.f(abnormalEvents.value, (event, k0, i0) => {
          return {
            a: "c3fb2e18-4-" + i0,
            b: common_vendor.p({
              type: getEventIcon(event.type),
              color: getEventColor(event),
              size: "24"
            }),
            c: getEventColor(event) + "20",
            d: common_vendor.t(event.type),
            e: common_vendor.t(event.value),
            f: getEventColor(event),
            g: common_vendor.t(event.date),
            h: common_vendor.t(event.time),
            i: event.date + event.time
          };
        }),
        i: common_vendor.p({
          type: "list",
          size: "22",
          color: "#ff69b4"
        }),
        j: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#ff69b4"
        }),
        k: common_vendor.f(previewData.value, (value, index, i0) => {
          return {
            a: index,
            b: value / 100 * 80 + "rpx"
          };
        }),
        l: common_vendor.t(exporting.value ? "导出中..." : "导出完整报告"),
        m: common_vendor.o(handleExport),
        n: exporting.value
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c3fb2e18"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Report/Report.js.map
