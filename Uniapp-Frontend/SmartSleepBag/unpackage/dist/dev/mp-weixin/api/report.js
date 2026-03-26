"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const getReportStatistics = (dateRange) => {
  common_vendor.index.__f__("log", "at api/report.js:56", dateRange);
  return utils_request.request({
    url: "/report/statistics",
    data: { dateRange }
  });
};
const getSleepTrend = (dateRange) => {
  return utils_request.request({
    url: "/report/trend",
    data: { dateRange }
  });
};
const getAbnormalEvents = (dateRange, limit = 5) => {
  const data = {};
  if (dateRange !== void 0)
    data.dateRange = dateRange;
  if (limit !== void 0)
    data.limit = limit;
  return utils_request.request({
    url: "/report/events",
    data
  });
};
const exportReport = (dateRange) => {
  return utils_request.request({
    url: "/report/export",
    method: "POST",
    data: { dateRange }
  });
};
function getReportData(param = {}) {
  return Promise.all([
    getReportStatistics(param.dateRange),
    getSleepTrend(param.dateRange),
    getAbnormalEvents(param.dateRange, param.eventsLimit)
  ]);
}
exports.exportReport = exportReport;
exports.getReportData = getReportData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/report.js.map
