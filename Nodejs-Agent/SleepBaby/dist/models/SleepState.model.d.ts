export interface SleepState {
    id: string;
    babyId: string;
    startTime: Date;
    endTime?: Date;
    state: 'awake' | 'light_sleep' | 'deep_sleep' | 'rem';
    isCrying: boolean;
    qualityScore?: number;
}
//# sourceMappingURL=SleepState.model.d.ts.map