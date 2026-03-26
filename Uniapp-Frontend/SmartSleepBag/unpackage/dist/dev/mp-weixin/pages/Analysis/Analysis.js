"use strict";
const common_vendor = require("../../common/vendor.js");
const api_analysis = require("../../api/analysis.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "Analysis",
  setup(__props) {
    const qualityScore = common_vendor.ref(0);
    const qualityTags = common_vendor.ref([]);
    const sleepStages = common_vendor.ref([]);
    const wakeTotalCount = common_vendor.ref(0);
    const wakeReasons = common_vendor.ref([]);
    const advices = common_vendor.ref([]);
    const loading = common_vendor.ref({
      quality: false,
      stages: false,
      wake: false,
      advices: false
    });
    const getStageColor = (stageName) => {
      const colorMap = {
        "深睡": "#ff69b4",
        "浅睡": "#87cefa",
        "REM": "#98d8c8",
        "清醒": "#ffb6c1"
      };
      return colorMap[stageName] || "#ff69b4";
    };
    const getTagIcon = (tagText) => {
      const iconMap = {
        "深睡充足": "moon",
        "夜醒较少": "eye",
        "体温平稳": "thermometer"
      };
      return iconMap[tagText] || "info";
    };
    const getTagGradient = (index) => {
      const gradients = [
        "linear-gradient(145deg, #87cefa, #7bb9e2)",
        "linear-gradient(145deg, #ff69b4, #ff88b0)",
        "linear-gradient(145deg, #98d8c8, #7bc0b0)"
      ];
      return gradients[index % gradients.length];
    };
    const getReasonColor = (reasonName) => {
      const colorMap = {
        "尿湿": "#87cefa",
        "饥饿": "#ff69b4",
        "温度不适": "#98d8c8"
      };
      return colorMap[reasonName] || "#ff69b4";
    };
    const getAdviceIcon = (title) => {
      const iconMap = {
        "睡眠环境": "thermometer",
        "作息调整": "moon",
        "注意事项": "info"
      };
      return iconMap[title] || "info";
    };
    const getAdviceColor = (title) => {
      const colorMap = {
        "睡眠环境": "#87cefa",
        "作息调整": "#ff69b4",
        "注意事项": "#98d8c8"
      };
      return colorMap[title] || "#ff69b4";
    };
    const totalHours = common_vendor.computed(() => {
      const sum = sleepStages.value.reduce((sum2, stage) => sum2 + stage.hours, 0);
      return Math.round(sum * 100) / 100;
    });
    const getStagePercentage = (hours) => {
      if (totalHours.value === 0)
        return 0;
      return Math.round(hours / totalHours.value * 100);
    };
    const getSegmentAngle = (hours) => {
      if (totalHours.value === 0)
        return 0;
      return hours / totalHours.value * 360;
    };
    const getSegmentRotation = (index) => {
      var _a;
      let rotation = 0;
      for (let i = 0; i < index; i++) {
        rotation += getSegmentAngle(((_a = sleepStages.value[i]) == null ? void 0 : _a.hours) || 0);
      }
      return rotation;
    };
    const loadQualityScore = async () => {
      loading.value.quality = true;
      try {
        const res = await api_analysis.getQualityScore();
        if (res.code === 200) {
          qualityScore.value = res.data.score;
          qualityTags.value = res.data.tags;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Analysis/Analysis.vue:255", "获取质量评分失败:", error);
        common_vendor.index.showToast({ title: "获取质量评分失败", icon: "none" });
      } finally {
        loading.value.quality = false;
      }
    };
    const loadSleepStages = async () => {
      loading.value.stages = true;
      try {
        const res = await api_analysis.getSleepStages();
        if (res.code === 200) {
          sleepStages.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Analysis/Analysis.vue:271", "获取睡眠阶段失败:", error);
        common_vendor.index.showToast({ title: "获取睡眠阶段失败", icon: "none" });
      } finally {
        loading.value.stages = false;
      }
    };
    const loadWakeAnalysis = async () => {
      loading.value.wake = true;
      try {
        const res = await api_analysis.getWakeAnalysis();
        if (res.code === 200) {
          wakeTotalCount.value = res.data.totalCount;
          wakeReasons.value = res.data.reasons;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Analysis/Analysis.vue:288", "获取夜醒分析失败:", error);
        common_vendor.index.showToast({ title: "获取夜醒分析失败", icon: "none" });
      } finally {
        loading.value.wake = false;
      }
    };
    const loadAdvices = async () => {
      loading.value.advices = true;
      try {
        const res = await api_analysis.getAdvices();
        if (res.code === 200) {
          advices.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Analysis/Analysis.vue:304", "获取智能建议失败:", error);
        common_vendor.index.showToast({ title: "获取智能建议失败", icon: "none" });
      } finally {
        loading.value.advices = false;
      }
    };
    const loadAllData = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        await Promise.all([
          loadQualityScore(),
          loadSleepStages(),
          loadWakeAnalysis(),
          loadAdvices()
        ]);
        common_vendor.index.hideLoading();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/Analysis/Analysis.vue:326", "加载所有数据失败:", error);
      }
    };
    common_vendor.onMounted(() => {
      loadAllData();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "heart-filled",
          size: "22",
          color: "#ff69b4"
        }),
        b: common_vendor.t(qualityScore.value),
        c: common_vendor.f(qualityTags.value, (tag, index, i0) => {
          return {
            a: "7f5f8c0b-1-" + i0,
            b: common_vendor.p({
              type: getTagIcon(tag),
              size: "14",
              color: "#fff"
            }),
            c: common_vendor.t(tag),
            d: tag,
            e: getTagGradient(index)
          };
        }),
        d: common_vendor.p({
          type: "pie",
          size: "22",
          color: "#ff69b4"
        }),
        e: common_vendor.t(totalHours.value),
        f: common_vendor.f(sleepStages.value, (stage, index, i0) => {
          return {
            a: stage.name,
            b: `rotate(${getSegmentRotation(index)}deg)`,
            c: `conic-gradient(${getStageColor(stage.name)} 0deg ${getSegmentAngle(stage.hours)}deg, transparent 0deg)`
          };
        }),
        g: common_vendor.t(totalHours.value),
        h: common_vendor.f(sleepStages.value, (stage, k0, i0) => {
          return {
            a: getStageColor(stage.name),
            b: common_vendor.t(stage.name),
            c: common_vendor.t(stage.hours),
            d: common_vendor.t(getStagePercentage(stage.hours)),
            e: stage.name
          };
        }),
        i: common_vendor.p({
          type: "eye",
          size: "22",
          color: "#ff69b4"
        }),
        j: common_vendor.t(wakeTotalCount.value),
        k: common_vendor.f(wakeReasons.value, (reason, k0, i0) => {
          return {
            a: getReasonColor(reason.name),
            b: common_vendor.t(reason.name),
            c: common_vendor.t(reason.percentage),
            d: reason.percentage + "%",
            e: getReasonColor(reason.name),
            f: reason.name
          };
        }),
        l: common_vendor.p({
          type: "info",
          size: "22",
          color: "#ff69b4"
        }),
        m: common_vendor.f(advices.value, (advice, k0, i0) => {
          return {
            a: "7f5f8c0b-5-" + i0,
            b: common_vendor.p({
              type: getAdviceIcon(advice.title),
              color: getAdviceColor(advice.title),
              size: "24"
            }),
            c: getAdviceColor(advice.title) + "20",
            d: common_vendor.t(advice.title),
            e: common_vendor.t(advice.content),
            f: advice.title
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7f5f8c0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Analysis/Analysis.js.map
