const DEFAULT_SENSITIVE_WORDS = ['傻逼', '妈的', '操', '去死'];

const splitWords = (words: string) =>
  words
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);

export class MessageGuardService {
  private sensitiveWords: string[];

  constructor(words: string[] = []) {
    this.sensitiveWords = words.length > 0 ? words : DEFAULT_SENSITIVE_WORDS;
  }

  static fromEnv() {
    const configuredWords = process.env.SENSITIVE_WORDS
      ? splitWords(process.env.SENSITIVE_WORDS)
      : [];

    return new MessageGuardService(configuredWords);
  }

  findSensitiveWords(text: string) {
    if (!text.trim()) {
      return [];
    }

    const normalizedText = text.toLowerCase();

    return this.sensitiveWords.filter((word) =>
      normalizedText.includes(word.toLowerCase()),
    );
  }

  validateInput(text: string) {
    const matchedWords = this.findSensitiveWords(text);

    if (matchedWords.length === 0) {
      return { ok: true as const, matchedWords: [] as string[] };
    }

    return {
      ok: false as const,
      matchedWords,
      message: '输入内容包含敏感词，请调整后再试',
    };
  }
}

export const messageGuardService = MessageGuardService.fromEnv();
