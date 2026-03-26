"use strict";
const mockSensors = [
  { name: "环境温度", value: 26, unit: "°C", status: "适宜" },
  { name: "心率", value: 128, unit: "bpm", status: "平稳" },
  { name: "呼吸", value: 32, unit: "次/分", status: "正常" },
  { name: "环境湿度", value: 55, unit: "%", status: "舒适" }
];
const generateMockHeartRate = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push(Math.floor(Math.random() * 40 + 60));
  }
  return data;
};
const mockCryAnalysis = {
  isCrying: true,
  possibleReasons: ["饥饿", "尿湿", "疼痛"],
  probabilities: [
    { name: "饥饿", probability: 85 },
    { name: "尿湿", probability: 70 },
    { name: "疼痛", probability: 25 }
  ]
};
const mockTempData = {
  temperatures: [36.8, 36.9, 36.7, 36.8, 36.9, 36.8, 36.7, 36.8, 36.9],
  timeLabels: ["22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"]
};
function getSensorData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSensors,
        message: "获取成功"
      });
    }, 300);
  });
}
function getHeartRateData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: generateMockHeartRate(),
        message: "获取成功"
      });
    }, 200);
  });
}
function getCryAnalysis() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockCryAnalysis,
        message: "获取成功"
      });
    }, 300);
  });
}
function getTempData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockTempData,
        message: "获取成功"
      });
    }, 300);
  });
}
exports.getCryAnalysis = getCryAnalysis;
exports.getHeartRateData = getHeartRateData;
exports.getSensorData = getSensorData;
exports.getTempData = getTempData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/monitor.js.map
