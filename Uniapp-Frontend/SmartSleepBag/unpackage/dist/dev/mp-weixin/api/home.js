"use strict";
const utils_request = require("../utils/request.js");
function getBabyInfo() {
  return utils_request.request({ url: "/home/baby-info" });
}
function getSleepStatus() {
  return utils_request.request({ url: "/home/sleep-status" });
}
function getSensors() {
  return utils_request.request({ url: "/home/sensors" });
}
function getRecentSleep() {
  return utils_request.request({ url: "/home/recent-sleep" });
}
function getSmartTip() {
  return utils_request.request({ url: "/home/smart-tip" });
}
exports.getBabyInfo = getBabyInfo;
exports.getRecentSleep = getRecentSleep;
exports.getSensors = getSensors;
exports.getSleepStatus = getSleepStatus;
exports.getSmartTip = getSmartTip;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/home.js.map
