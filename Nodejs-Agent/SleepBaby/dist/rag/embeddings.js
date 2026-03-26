"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddings = void 0;
const openai_1 = require("@langchain/openai");
const index_config_1 = require("../config/index.config");
exports.embeddings = new openai_1.OpenAIEmbeddings({
    apiKey: index_config_1.config.llm.apiKey,
    model: index_config_1.config.llm.embeddingModel,
    configuration: {
        baseURL: index_config_1.config.llm.baseUrl,
    },
});
//# sourceMappingURL=embeddings.js.map