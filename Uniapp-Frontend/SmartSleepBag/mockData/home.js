import { request } from '@/utils/request.js'

/**
 * 首页模块 API
 * @module api/home
 * @description 提供首页相关的数据接口
 */

// Mock 数据 - 宝宝信息
const mockBabyInfo = {
  name: '小糯米',
  age: '6个月',
  gender: '女宝宝',
  avatar: '/static/avatar.png'
}

// Mock 数据 - 当前睡眠状态
const mockSleepStatus = {
  text: '睡眠中',
  isSleeping: true
}

// Mock 数据 - 传感器数据
const mockSensors = [
  { label: '体温', value: 36.8, unit: '°C' },
  { label: '心率', value: 128, unit: 'bpm' },
  { label: '呼吸', value: 32, unit: '次/分' },
  { label: '体动', value: 3, unit: '次' }
]

// Mock 数据 - 最近睡眠记录
const mockRecentSleep = [
  { date: '今天', quality: 85, deepSleep: 4.5, wakeCount: 2 },
  { date: '昨天', quality: 72, deepSleep: 3.8, wakeCount: 4 },
  { date: '前天', quality: 91, deepSleep: 5.2, wakeCount: 1 }
]

// Mock 数据 - 智能提示
const mockSmartTip = '昨晚宝宝哭闹2次，可能因尿湿，建议检查纸尿裤'

/**
 * 获取宝宝信息
 * @returns {Promise} 返回宝宝信息
 */
export function getBabyInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockBabyInfo,
        message: '获取成功'
      })
    }, 200)
  })
}

/**
 * 获取当前睡眠状态
 * @returns {Promise} 返回睡眠状态
 */
export function getSleepStatus() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSleepStatus,
        message: '获取成功'
      })
    }, 200)
  })
}

/**
 * 获取传感器数据
 * @returns {Promise} 返回传感器数据
 */
export function getSensors() {
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
 * 获取最近睡眠记录
 * @returns {Promise} 返回睡眠记录
 */
export function getRecentSleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockRecentSleep,
        message: '获取成功'
      })
    }, 300)
  })
}

/**
 * 获取智能提示
 * @returns {Promise} 返回智能提示
 */
export function getSmartTip() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSmartTip,
        message: '获取成功'
      })
    }, 200)
  })
}
