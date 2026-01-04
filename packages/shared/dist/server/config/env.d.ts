/**
 * Server Environment Variables
 *
 * THE ONLY place in the codebase that validates server-side secrets.
 * App config overrides are handled by shared/config.
 */
import { z } from 'zod';
declare const ServerEnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    SESSION_ENCRYPTION_KEY: z.ZodOptional<z.ZodString>;
    TWILIO_ACCOUNT_SID: z.ZodString;
    TWILIO_AUTH_TOKEN: z.ZodString;
    TWILIO_NUMBER: z.ZodString;
    STRIPE_SECRET_KEY: z.ZodString;
    STRIPE_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    OPENAI_API_KEY: z.ZodString;
    GOOGLE_API_KEY: z.ZodString;
    XAI_API_KEY: z.ZodOptional<z.ZodString>;
    PINECONE_API_KEY: z.ZodString;
    PINECONE_INDEX: z.ZodString;
    CRON_SECRET: z.ZodOptional<z.ZodString>;
    INNGEST_EVENT_KEY: z.ZodOptional<z.ZodString>;
    INNGEST_SIGNING_KEY: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    APP_ENV: z.ZodOptional<z.ZodEnum<["development", "staging", "production"]>>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_NUMBER: string;
    STRIPE_SECRET_KEY: string;
    OPENAI_API_KEY: string;
    GOOGLE_API_KEY: string;
    PINECONE_API_KEY: string;
    PINECONE_INDEX: string;
    NODE_ENV: "production" | "development" | "test";
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SESSION_ENCRYPTION_KEY?: string | undefined;
    XAI_API_KEY?: string | undefined;
    CRON_SECRET?: string | undefined;
    INNGEST_EVENT_KEY?: string | undefined;
    INNGEST_SIGNING_KEY?: string | undefined;
    APP_ENV?: "production" | "development" | "staging" | undefined;
}, {
    DATABASE_URL: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_NUMBER: string;
    STRIPE_SECRET_KEY: string;
    OPENAI_API_KEY: string;
    GOOGLE_API_KEY: string;
    PINECONE_API_KEY: string;
    PINECONE_INDEX: string;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    NODE_ENV?: "production" | "development" | "test" | undefined;
    SESSION_ENCRYPTION_KEY?: string | undefined;
    XAI_API_KEY?: string | undefined;
    CRON_SECRET?: string | undefined;
    INNGEST_EVENT_KEY?: string | undefined;
    INNGEST_SIGNING_KEY?: string | undefined;
    APP_ENV?: "production" | "development" | "staging" | undefined;
}>;
/**
 * Get validated server environment variables.
 * Caches the result for subsequent calls.
 */
export declare function getServerEnv(): {
    DATABASE_URL: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_NUMBER: string;
    STRIPE_SECRET_KEY: string;
    OPENAI_API_KEY: string;
    GOOGLE_API_KEY: string;
    PINECONE_API_KEY: string;
    PINECONE_INDEX: string;
    NODE_ENV: "production" | "development" | "test";
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SESSION_ENCRYPTION_KEY?: string | undefined;
    XAI_API_KEY?: string | undefined;
    CRON_SECRET?: string | undefined;
    INNGEST_EVENT_KEY?: string | undefined;
    INNGEST_SIGNING_KEY?: string | undefined;
    APP_ENV?: "production" | "development" | "staging" | undefined;
};
/**
 * Reset env cache (useful for testing).
 */
export declare function resetServerEnv(): void;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export {};
//# sourceMappingURL=env.d.ts.map