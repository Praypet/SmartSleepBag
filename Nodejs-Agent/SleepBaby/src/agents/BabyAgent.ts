import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { config } from '../config/index.config';
import {
  BabyDataQueryTool,
  SleepStagesTool,
  SleepQualityTool,
  WakeAnalysisTool,
  SleepSuggestionTool,
  HomeSensorsTool,
  MonitorSensorsTool,
  TemperatureTool,
  HistoricalDataQueryTool,
  CryAnalysisTool,
  MemoryUpdateTool,
  KnowledgeSearchTool,
} from '../tools';
import { systemPrompt, finalResponseTemplate } from './agentPrompts';

export class BabyAgent {
  private agent: any = null;
  private initPromise: Promise<void>;
  private babyId: string;
  private userId?: string;

  constructor(babyId: string = 'baby_001', userId?: string) {
    this.babyId = babyId;
    this.userId = userId;
    this.initPromise = this.initialize();
  }

  /**
   * 等待 Agent 初始化完成
   */
  public async waitUntilReady() {
    return this.initPromise;
  }

  private async initialize() {
    const llm = new ChatOpenAI({
      apiKey: config.llm.apiKey,
      modelName: config.llm.modelName,
      temperature: config.llm.temperature,
      configuration: {
        baseURL: config.llm.baseUrl,
      },
    });

    const tools = [
      new BabyDataQueryTool(this.babyId, this.userId),
      new SleepStagesTool(this.babyId, this.userId),
      new SleepQualityTool(this.babyId, this.userId),
      new WakeAnalysisTool(this.babyId, this.userId),
      new SleepSuggestionTool(this.babyId, this.userId),
      new HomeSensorsTool(this.babyId, this.userId),
      new MonitorSensorsTool(this.babyId, this.userId),
      new TemperatureTool(this.babyId, this.userId),
      new HistoricalDataQueryTool(this.babyId),
      new CryAnalysisTool(this.babyId, this.userId),
      new MemoryUpdateTool(this.babyId, this.userId),
      new KnowledgeSearchTool(this.babyId, this.userId),
    ];

    const combinedSystemPrompt = `${systemPrompt}\n\n在生成最终回复时，请务必严格遵守以下模板：\n${finalResponseTemplate}`;

    this.agent = createAgent({
      model: llm,
      tools,
      systemPrompt: combinedSystemPrompt,
    });
  }

  /**
   * 执行 Agent 任务
   * @param input 用户输入
   * @param babyId 宝宝 ID
   * @param history 对话历史记录
   * @param longTermMemoryContext 长期记忆中检索到的相关上下文
   */
  async run(input: string, babyId: string = 'baby_001', history: any[] = [], longTermMemoryContext: string = '') {
    await this.waitUntilReady();

    let systemMessage = `当前正在服务的宝宝 ID 是: ${babyId}。在调用数据查询工具时，请务必使用此 ID。`;
    if (longTermMemoryContext) {
      systemMessage += `\n\n在回应前，请参考以下从长期记忆中检索到的相关信息：\n${longTermMemoryContext}`;
    }

    return this.agent.invoke({
      messages: [
        ...history,
        { role: 'user', content: input },
        { role: 'system', content: systemMessage }
      ],
    });
  }
}
