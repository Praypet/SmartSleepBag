export declare class DataSyncService {
    private client;
    constructor();
    private extractData;
    getBabyInfo(): Promise<any>;
    getSmartTip(): Promise<any>;
    getSleepStatus(): Promise<any>;
    getRecentSleep(days?: number): Promise<any>;
    getQualityScore(date?: string): Promise<any>;
    getSleepStages(date?: string): Promise<any>;
    getWakeAnalysis(date?: string): Promise<any>;
    getSensors(): Promise<any>;
    getMonitorSensors(): Promise<any>;
    getTempData(hours?: number): Promise<any>;
    getCryAnalysis(): Promise<any>;
}
export declare const dataSyncService: DataSyncService;
//# sourceMappingURL=dataSync.service.d.ts.map