// 默认敏感词。若 .env 中配置了 SENSITIVE_WORDS，则优先使用配置值。
const DEFAULT_SENSITIVE_WORDS = ['傻逼', '妈的', '操', '去死'];

// 支持通过逗号分隔的方式在环境变量中维护敏感词列表。
const splitWords = (words: string) =>
  words
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);

export class ContentModerationService {
  private sensitiveWords: string[];

  constructor(words: string[] = []) {
    this.sensitiveWords = words.length > 0 ? words : DEFAULT_SENSITIVE_WORDS;
  }

  static fromEnv() {
    const configuredWords = process.env.SENSITIVE_WORDS
      ? splitWords(process.env.SENSITIVE_WORDS)
      : [];

    return new ContentModerationService(configuredWords);
  }

  // 返回输入文本中命中的敏感词，供拦截和排查使用。
  findSensitiveWords(text: string) {
    if (!text.trim()) {
      return [];
    }

    const normalizedText = text.toLowerCase();

    return this.sensitiveWords.filter((word) =>
      normalizedText.includes(word.toLowerCase()),
    );
  }

  // 对外暴露统一校验结果，控制器可直接根据结果决定是否放行。
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

export const contentModerationService = ContentModerationService.fromEnv();
