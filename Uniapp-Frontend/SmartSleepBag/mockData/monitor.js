/**
 * 监测模块 API
 * @module api/monitor
 * @description 提供实时监测相关的数据接口
 */

// Mock 数据 - 传感器数据
const mockSensors = [
  { name: '环境温度', value: 26, unit: '°C', status: '适宜' },
  { name: '心率', value: 128, unit: 'bpm', status: '平稳' },
  { name: '呼吸', value: 32, unit: '次/分', status: '正常' },
  { name: '环境湿度', value: 55, unit: '%', status: '舒适' }
]

// Mock 数据 - 心率波形数据
const generateMockHeartRate = () => {
  const data = []
  for (let i = 0; i < 30; i++) {
    data.push(Math.floor(Math.random() * 40 + 60))
  }
  return data
}

// Mock 数据 - 哭声分析数据
const mockCryAnalysis = {
  isCrying: true,
  possibleReasons: ['饥饿', '尿湿', '疼痛'],
  probabilities: [
    { name: '饥饿', probability: 85 },
    { name: '尿湿', probability: 70 },
    { name: '疼痛', probability: 25 }
  ]
}

// Mock 数据 - 体温变化数据
const mockTempData = {
  temperatures: [36.8, 36.9, 36.7, 36.8, 36.9, 36.8, 36.7, 36.8, 36.9],
  timeLabels: ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00']
}

/**
 * 获取传感器数据
 * @returns {Promise} 返回传感器数据
 */
export function getSensorData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSensors,
        message: '获取成功'
      })
    }, 300)
  })
}

/**
 * 获取心率波形数据
 * @returns {Promise} 返回心率波形数据
 */
export function getHeartRateData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: generateMockHeartRate(),
        message: '获取成功'
      })
    }, 200)
  })
}

/**
 * 获取哭声分析数据
 * @returns {Promise} 返回哭声分析数据
 */
export function getCryAnalysis() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockCryAnalysis,
        message: '获取成功'
      })
    }, 300)
  })
}

/**
 * 获取体温变化数据
 * @returns {Promise} 返回体温变化数据
 */
export function getTempData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockTempData,
        message: '获取成功'
      })
    }, 300)
  })
}