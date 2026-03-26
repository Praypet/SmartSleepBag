export interface BabyInfo {
    name: string;
    age: string;
    gender: string;
    avatar: string;
}
export interface SmartTip {
    tip: string;
}
export interface SleepStatus {
    text: string;
    isSleeping: boolean;
}
export interface RecentSleepRecord {
    date: string;
    quality: number;
    deepSleep: number;
    wakeCount: number;
}
export interface QualityScore {
    score: number;
    tags: string[];
}
export interface SleepStage {
    name: string;
    hours: number;
}
export interface WakeAnalysis {
    totalCount: number;
    reasons: Array<{
        name: string;
        percentage: number;
    }>;
}
export interface HomeSensor {
    label: string;
    value: number;
    unit: string;
}
export interface MonitorSensor {
    name: string;
    value: number;
    unit: string;
    status: string;
}
export interface TempData {
    temperatures: number[];
    timeLabels: string[];
}
export interface HeartRateData {
    data: number[];
}
export interface CryAnalysisData {
    isCrying: boolean;
    possibleReasons: string[];
    probabilities: Array<{
        name: string;
        probability: number;
    }>;
}
//# sourceMappingURL=index.model.d.ts.map