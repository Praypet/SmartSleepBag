export declare const config: {
    llm: {
        baseUrl: string;
        apiKey: string;
        modelName: string;
        embeddingModel: string;
        temperature: number;
        maxTokens: number;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    chroma: {
        collectionName: string;
        url: string;
    };
    backend: {
        javaBackendUrl: string;
        apiTimeout: number;
    };
    app: {
        port: number;
        nodeEnv: string;
    };
};
//# sourceMappingURL=index.config.d.ts.map