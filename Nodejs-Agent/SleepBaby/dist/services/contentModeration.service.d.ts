export declare class ContentModerationService {
    private sensitiveWords;
    constructor(words?: string[]);
    static fromEnv(): ContentModerationService;
    findSensitiveWords(text: string): string[];
    validateInput(text: string): {
        ok: true;
        matchedWords: string[];
        message?: undefined;
    } | {
        ok: false;
        matchedWords: string[];
        message: string;
    };
}
export declare const contentModerationService: ContentModerationService;
//# sourceMappingURL=contentModeration.service.d.ts.map