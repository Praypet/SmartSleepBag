"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSyncService = exports.DataSyncService = void 0;
const axios_1 = __importDefault(require("axios"));
const index_config_1 = require("../config/index.config");
const cache_service_1 = require("./cache.service");
class DataSyncService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: index_config_1.config.backend.javaBackendUrl,
            timeout: index_config_1.config.backend.apiTimeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    extractData(response) {
        if (response?.data?.code === 200) {
            return response.data.data;
        }
        return null;
    }
    // =========== 宝宝信息相关接口 ===========
    async getBabyInfo() {
        const cacheKey = 'home_baby_info';
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        try {
            const response = await this.client.get('/home/baby-info');
            const data = this.extractData(response);
            await cache_service_1.cacheService.set(cacheKey, JSON.stringify(data), 1800);
            return data;
        }
        catch (error) {
            console.error('获取宝宝信息失败', error);
            return null;
        }
    }
    async getSmartTip() {
        try {
            const response = await this.client.get('/home/smart-tip');
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取智能提示失败', error);
            return '';
        }
    }
    // =========== 睡眠相关接口 ===========
    async getSleepStatus() {
        const cacheKey = 'home_sleep_status';
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        try {
            const response = await this.client.get('/home/sleep-status');
            const data = this.extractData(response);
            await cache_service_1.cacheService.set(cacheKey, JSON.stringify(data), 60);
            return data;
        }
        catch (error) {
            console.error('获取睡眠状态失败', error);
            return null;
        }
    }
    async getRecentSleep(days = 3) {
        try {
            const response = await this.client.get('/home/recent-sleep', { params: { days } });
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取最近睡眠记录失败', error);
            return [];
        }
    }
    async getQualityScore(date) {
        try {
            const response = await this.client.get('/analysis/quality-score', { params: { date } });
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取睡眠质量评分失败', error);
            return null;
        }
    }
    async getSleepStages(date) {
        try {
            const response = await this.client.get('/analysis/sleep-stages', { params: { date } });
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取睡眠阶段分布失败', error);
            return [];
        }
    }
    async getWakeAnalysis(date) {
        try {
            const response = await this.client.get('/analysis/wake-analysis', { params: { date } });
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取夜醒分析失败', error);
            return null;
        }
    }
    // =========== 环境数据相关接口 ===========
    async getSensors() {
        const cacheKey = 'home_sensors';
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        try {
            const response = await this.client.get('/home/sensors');
            const data = this.extractData(response);
            await cache_service_1.cacheService.set(cacheKey, JSON.stringify(data), 30);
            return data;
        }
        catch (error) {
            console.error('获取传感器数据失败', error);
            return [];
        }
    }
    async getMonitorSensors() {
        const cacheKey = 'monitor_sensors';
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        try {
            const response = await this.client.get('/monitor/sensors');
            const data = this.extractData(response);
            await cache_service_1.cacheService.set(cacheKey, JSON.stringify(data), 30);
            return data;
        }
        catch (error) {
            console.error('获取监测传感器数据失败', error);
            return [];
        }
    }
    // =========== 宝宝生理监测相关接口 ===========
    async getTempData(hours = 8) {
        try {
            const response = await this.client.get('/monitor/temperature', { params: { hours } });
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取体温变化数据失败', error);
            return null;
        }
    }
    // =========== 哭声分析相关接口 ===========
    async getCryAnalysis() {
        try {
            const response = await this.client.get('/monitor/cry-analysis');
            return this.extractData(response);
        }
        catch (error) {
            console.error('获取哭声分析数据失败', error);
            return null;
        }
    }
}
exports.DataSyncService = DataSyncService;
exports.dataSyncService = new DataSyncService();
//# sourceMappingURL=dataSync.service.js.map