/**
 * 分析模块 API
 * @module api/analysis
 * @description 提供睡眠分析相关的数据接口
 */

// Mock 数据 - 睡眠质量评分
const mockQualityScore = {
  score: 92,
  tags: ['深睡充足', '夜醒较少', '体温平稳']
}

// Mock 数据 - 睡眠阶段分布
const mockSleepStages = [
  { name: '深睡', hours: 4.5 },
  { name: '浅睡', hours: 3.2 },
  { name: 'REM', hours: 1.8 },
  { name: '清醒', hours: 0.5 }
]

// Mock 数据 - 夜醒分析
const mockWakeAnalysis = {
  totalCount: 1,
  reasons: [
    { name: '尿湿', percentage: 45 },
    { name: '饥饿', percentage: 30 },
    { name: '温度不适', percentage: 15 }
  ]
}

// Mock 数据 - 智能建议
const mockAdvices = [
  { 
    title: '睡眠环境', 
    content: '建议保持室温24-26℃，湿度50-60%'
  },
  { 
    title: '作息调整', 
    content: '白天适当增加活动量，有助于夜间深睡'
  },
  { 
    title: '注意事项', 
    content: '连续2天深睡时间<1小时，建议观察是否有积食'
  }
]

/**
 * 获取睡眠质量评分
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回睡眠质量评分数据
 */
export function getQualityScore(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          score: mockQualityScore.score,
          tags: mockQualityScore.tags
        },
        message: '获取成功'
      })
    }, 300)
  })
}

/**
 * 获取睡眠阶段分布
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回睡眠阶段分布数据
 */
export function getSleepStages(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSleepStages,
        message: '获取成功'
      })
    }, 400)
  })
}

/**
 * 获取夜醒分析数据
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回夜醒分析数据
 */
export function getWakeAnalysis(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockWakeAnalysis,
        message: '获取成功'
      })
    }, 350)
  })
}

/**
 * 获取智能建议
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回智能建议数据
 */
export function getAdvices(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockAdvices,
        message: '获取成功'
      })
    }, 300)
  })
}

/**
 * 获取所有分析数据（一次性）
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回所有分析数据
 */
export function getAllAnalysisData(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          qualityScore: {
            score: mockQualityScore.score,
            tags: mockQualityScore.tags
          },
          sleepStages: mockSleepStages,
          wakeAnalysis: mockWakeAnalysis,
          advices: mockAdvices
        },
        message: '获取成功'
      })
    }, 500)
  })
}