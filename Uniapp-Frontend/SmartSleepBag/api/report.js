import { request } from '@/utils/request.js'
/**
 * 报告模块 API
 * @module api/report
 * @description 提供报告相关的数据接口
 */

// Mock 数据 - 统计卡片
const mockStatistics = [
  { label: '平均睡眠', value: 8.5, unit: 'h', trend: 5.2 },
  { label: '深睡比例', value: 45, unit: '%', trend: -2.1 },
  { label: '夜醒次数', value: 3, unit: '次', trend: -15.3 },
  { label: '异常体温', value: 0, unit: '次', trend: 0 }
]

// Mock 数据 - 7天睡眠趋势
const mockWeeklyData = [
  { day: '周一', sleepDuration: 8.2, remSleep: 3.5 },
  { day: '周二', sleepDuration: 7.8, remSleep: 3.2 },
  { day: '周三', sleepDuration: 8.5, remSleep: 4.0 },
  { day: '周四', sleepDuration: 9.0, remSleep: 4.2 },
  { day: '周五', sleepDuration: 8.7, remSleep: 3.8 },
  { day: '周六', sleepDuration: 9.2, remSleep: 4.5 },
  { day: '周日', sleepDuration: 8.8, remSleep: 4.1 }
]

// Mock 数据 - 异常事件
const mockAbnormalEvents = [
  { 
    type: '体温偏高', 
    date: '2024-01-06', 
    time: '02:30', 
    value: '37.8°C',
    severity: 'medium'
  },
  { 
    type: '长时间哭闹', 
    date: '2024-01-05', 
    time: '23:15', 
    value: '持续15分钟',
    severity: 'low'
  },
  { 
    type: '呼吸异常', 
    date: '2024-01-04', 
    time: '01:20', 
    value: '呼吸频率降低',
    severity: 'high'
  }
]

// Mock 数据 - 预览数据
const mockPreviewData = [65, 72, 68, 75, 80, 78, 82]

export const getReportStatistics = (dateRange) => {
	console.log(dateRange)
  return request({
    url: '/report/statistics',
    data: { dateRange }
  })
}

/**
 * 2. 获取睡眠趋势数据
 * @param {number} dateRange - 日期范围索引（可选）
 * @returns {Promise}
 */
export const getSleepTrend = (dateRange) => {
  return request({
    url: '/report/trend',
    data: { dateRange } 
  })
}

/**
 * 3. 获取异常事件记录
 * @param {number} dateRange - 日期范围索引（可选）
 * @param {number} limit - 返回条数限制（可选，默认5）
 * @returns {Promise}
 */
export const getAbnormalEvents = (dateRange, limit = 5) => {
  const data = {}
  if (dateRange !== undefined) data.dateRange = dateRange
  if (limit !== undefined) data.limit = limit
  
  return request({
    url: '/report/events',
    data
  })
}

/**
 * 4. 导出报告
 * @param {Object} dateRange - 日期范围 {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}
 * @returns {Promise}
 */
export const exportReport = (dateRange) => {
  return request({
    url: '/report/export',
    method: 'POST',
    data: { dateRange }
  })
}



/**
 * 获取报告数据
 * @param {Object} params - 请求参数
 * @param {Object} params.dateRange - 日期范围 { start, end }
 * @returns {Promise} 返回报告数据
 */
export function getReportData(param = {}) {
  return Promise.all([
		getReportStatistics(param.dateRange),
		getSleepTrend(param.dateRange),
		getAbnormalEvents(param.dateRange, param.eventsLimit)
	])
}