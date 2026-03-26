import { request } from '@/utils/request.js'

/**
 * 获取睡眠质量评分
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回睡眠质量评分数据
 */
export function getQualityScore(params = {}) {
	return request({url:'/analysis/quality-score'})
}

/**
 * 获取睡眠阶段分布
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回睡眠阶段分布数据
 */
export function getSleepStages(params = {}) {
	return request({url:'/analysis/sleep-stages'})
}

/**
 * 获取夜醒分析数据
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回夜醒分析数据
 */
export function getWakeAnalysis(params = {}) {
	return request({url:'/analysis/wake-analysis'})
}

/**
 * 获取智能建议
 * @param {Object} params - 请求参数
 * @param {string} params.date - 日期 YYYY-MM-DD
 * @returns {Promise} 返回智能建议数据
 */
export function getAdvices(params = {}) {
	return request({url:'/analysis/advices'})
}