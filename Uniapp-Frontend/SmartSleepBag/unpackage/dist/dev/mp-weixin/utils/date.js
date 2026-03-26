"use strict";
const common_vendor = require("../common/vendor.js");
const generateWeekOptions = () => {
  const options = [];
  for (let i = 0; i < 10; i++) {
    options.push(i === 0 ? "本周" : `${i}周前`);
  }
  return options;
};
const dateRanges = generateWeekOptions();
const getWeekRange = (date) => {
  const day = date.day();
  const monday = date.subtract(day === 0 ? 6 : day - 1, "day");
  const sunday = monday.add(6, "day");
  return {
    start: monday.format("YYYY-MM-DD"),
    end: sunday.format("YYYY-MM-DD")
  };
};
const getDateRange = (rangeIndex) => {
  const now = common_vendor.dayjs();
  switch (dateRanges[rangeIndex]) {
    case "本周":
      return getWeekRange(now);
    case "上周":
      return getWeekRange(now.subtract(7, "day"));
    default:
      return getWeekRange(now.subtract(7 * rangeIndex, "day"));
  }
};
const updateDate = () => {
  const date = /* @__PURE__ */ new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
};
exports.dateRanges = dateRanges;
exports.getDateRange = getDateRange;
exports.updateDate = updateDate;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/date.js.map
