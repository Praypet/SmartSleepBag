// models/index.model.ts
// 该文件整合了整个 models 目录下的所有接口类型，方便统一管理与引用。

// ---------------------- 宝宝基础数据 ----------------------
export interface BabyInfo {
  name: string;
  age: string;
  gender: string;
  avatar: string;
}

export interface SmartTip {
  tip: string;
}

// ---------------------- 睡眠数据 ----------------------
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

// ---------------------- 环境传感器数据 ----------------------
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

// ---------------------- 生理监测数据 ----------------------
export interface TempData {
  temperatures: number[];
  timeLabels: string[];
}

export interface HeartRateData {
  data: number[];
}

// ---------------------- 哭声分析数据 ----------------------
export interface CryAnalysisData {
  isCrying: boolean;
  possibleReasons: string[];
  probabilities: Array<{
    name: string;
    probability: number;
  }>;
}
