export interface BabyProfile {
    id: string;
    name: string;
    birthDate: Date;
    gender: 'boy' | 'girl';
    weight: number;
    height?: number;
}
export interface DailySummary {
    babyId: string;
    totalSleepTime: number;
    totalFeedings: number;
    totalDiaperChanges: number;
    summaryDate: Date;
}
//# sourceMappingURL=baby.types.d.ts.map