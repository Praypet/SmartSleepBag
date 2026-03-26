export declare class MessageGuardService {
    private sensitiveWords;
    constructor(words?: string[]);
    static fromEnv(): MessageGuardService;
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
export declare const messageGuardService: MessageGuardService;
//# sourceMappingURL=messageGuard.service.d.ts.map