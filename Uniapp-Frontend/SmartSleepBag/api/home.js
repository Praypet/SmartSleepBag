import { request } from '@/utils/request.js'

/**
 * 首页模块 API
 * @module api/home
 * @description 提供首页相关的数据接口
 */

/**
 * 获取宝宝信息
 * @returns {Promise} 返回宝宝信息
 */
export function getBabyInfo() {
	return request({ url:'/home/baby-info' })
}

/**
 * 获取当前睡眠状态
 * @returns {Promise} 返回睡眠状态
 */
export function getSleepStatus() {
	return request({ url:'/home/sleep-status' })
}

/**
 * 获取传感器数据
 * @returns {Promise} 返回传感器数据
 */
export function getSensors() {
	return request({ url:'/home/sensors' })
}

/**
 * 获取最近睡眠记录
 * @returns {Promise} 返回睡眠记录
 */
export function getRecentSleep() {
	return request({ url:'/home/recent-sleep' })
}

/**
 * 获取智能提示
 * @returns {Promise} 返回智能提示
 */
export function getSmartTip() {
	return request({ url:'/home/smart-tip' })
}
