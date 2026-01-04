export declare function getDatabaseSecrets(): {
    databaseUrl: string;
    sessionEncryptionKey: string | undefined;
};
export declare function getTwilioSecrets(): {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
};
export declare function getStripeSecrets(): {
    secretKey: string;
    webhookSecret: string;
};
export declare function getAiSecrets(): {
    openaiApiKey: string;
    googleApiKey: string;
    xaiApiKey: string | undefined;
};
export declare function getPineconeSecrets(): {
    apiKey: string;
    indexName: string;
};
export declare function getCronSecrets(): {
    cronSecret: string | undefined;
    inngestEventKey: string | undefined;
    inngestSigningKey: string | undefined;
};
//# sourceMappingURL=secrets.d.ts.map