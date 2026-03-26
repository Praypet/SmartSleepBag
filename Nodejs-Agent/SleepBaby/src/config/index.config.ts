import dotenv from 'dotenv';
dotenv.config();

export const config = {
  llm: {
    baseUrl: process.env.LLM_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.LLM_API_KEY || 'f713a3d7-841f-4a41-a3ba-7a477d0709f3',
    modelName: process.env.LLM_MODEL || 'deepseek-v3-2-251201',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-v3',
    temperature: 0.7,
    maxTokens: 1000,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  database: {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'sleep_baby_db',
  },
  chroma: {
    collectionName: process.env.CHROMA_COLLECTION || 'baby_memory',
    url: process.env.CHROMA_URL || 'http://chroma:8000',
  },
  backend: {
    javaBackendUrl: process.env.JAVA_BACKEND_URL || 'http://localhost:8086',
    apiTimeout: parseInt(process.env.API_TIMEOUT || '5000'),
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
