"use strict";
const utils_request = require("../utils/request.js");
function getQualityScore(params = {}) {
  return utils_request.request({ url: "/analysis/quality-score" });
}
function getSleepStages(params = {}) {
  return utils_request.request({ url: "/analysis/sleep-stages" });
}
function getWakeAnalysis(params = {}) {
  return utils_request.request({ url: "/analysis/wake-analysis" });
}
function getAdvices(params = {}) {
  return utils_request.request({ url: "/analysis/advices" });
}
exports.getAdvices = getAdvices;
exports.getQualityScore = getQualityScore;
exports.getSleepStages = getSleepStages;
exports.getWakeAnalysis = getWakeAnalysis;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/analysis.js.map
