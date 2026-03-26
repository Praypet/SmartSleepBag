import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../config/index.config';

export const embeddings = new OpenAIEmbeddings({
  apiKey: config.llm.apiKey,
  model: config.llm.embeddingModel,
  configuration: {
    baseURL: config.llm.baseUrl,
  },
});
