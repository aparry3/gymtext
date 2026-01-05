module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/packages/shared/src/server/config/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server Environment Variables
 *
 * THE ONLY place in the codebase that validates server-side secrets.
 * App config overrides are handled by shared/config.
 */ __turbopack_context__.s([
    "getServerEnv",
    ()=>getServerEnv,
    "resetServerEnv",
    ()=>resetServerEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
// =============================================================================
// Zod Schema - Server Secrets Only
// =============================================================================
const ServerEnvSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    // -------------------------------------------------------------------------
    // Database
    // -------------------------------------------------------------------------
    DATABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'DATABASE_URL is required'),
    SESSION_ENCRYPTION_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    // -------------------------------------------------------------------------
    // Twilio
    // -------------------------------------------------------------------------
    TWILIO_ACCOUNT_SID: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'TWILIO_ACCOUNT_SID is required'),
    TWILIO_AUTH_TOKEN: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'TWILIO_AUTH_TOKEN is required'),
    TWILIO_NUMBER: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'TWILIO_NUMBER is required'),
    // -------------------------------------------------------------------------
    // Stripe
    // -------------------------------------------------------------------------
    STRIPE_SECRET_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_WEBHOOK_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    // -------------------------------------------------------------------------
    // AI - validated but LangChain reads these directly from process.env
    // -------------------------------------------------------------------------
    OPENAI_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'OPENAI_API_KEY is required'),
    GOOGLE_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'GOOGLE_API_KEY is required'),
    XAI_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    // -------------------------------------------------------------------------
    // Pinecone
    // -------------------------------------------------------------------------
    PINECONE_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'PINECONE_API_KEY is required'),
    PINECONE_INDEX: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, 'PINECONE_INDEX is required'),
    // -------------------------------------------------------------------------
    // Background Jobs
    // -------------------------------------------------------------------------
    CRON_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    INNGEST_EVENT_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    INNGEST_SIGNING_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    // -------------------------------------------------------------------------
    // Environment (for server-side env detection)
    // -------------------------------------------------------------------------
    NODE_ENV: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'development',
        'test',
        'production'
    ]).default('development'),
    APP_ENV: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'development',
        'staging',
        'production'
    ]).optional()
});
// =============================================================================
// Validation
// =============================================================================
function validateServerEnv() {
    const result = ServerEnvSchema.safeParse(process.env);
    if (!result.success) {
        const errors = result.error.errors.map((e)=>`  - ${e.path.join('.')}: ${e.message}`).join('\n');
        throw new Error(`Server environment validation failed:\n${errors}\n\n` + `Ensure all required environment variables are set.`);
    }
    return result.data;
}
// Singleton - validated once at startup
let _serverEnv = null;
function getServerEnv() {
    if (!_serverEnv) {
        _serverEnv = validateServerEnv();
    }
    return _serverEnv;
}
function resetServerEnv() {
    _serverEnv = null;
}
}),
"[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server Secrets
 *
 * Grouped accessors for secret environment variables.
 * All secrets are validated at import time via getServerEnv().
 */ __turbopack_context__.s([
    "getAiSecrets",
    ()=>getAiSecrets,
    "getCronSecrets",
    ()=>getCronSecrets,
    "getDatabaseSecrets",
    ()=>getDatabaseSecrets,
    "getPineconeSecrets",
    ()=>getPineconeSecrets,
    "getStripeSecrets",
    ()=>getStripeSecrets,
    "getTwilioSecrets",
    ()=>getTwilioSecrets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/env.ts [app-route] (ecmascript)");
;
function getDatabaseSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        databaseUrl: env.DATABASE_URL,
        sessionEncryptionKey: env.SESSION_ENCRYPTION_KEY
    };
}
function getTwilioSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        phoneNumber: env.TWILIO_NUMBER
    };
}
function getStripeSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        secretKey: env.STRIPE_SECRET_KEY,
        // webhookSecret may be undefined in development, but required for webhook route
        webhookSecret: env.STRIPE_WEBHOOK_SECRET
    };
}
function getAiSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        openaiApiKey: env.OPENAI_API_KEY,
        googleApiKey: env.GOOGLE_API_KEY,
        xaiApiKey: env.XAI_API_KEY
    };
}
function getPineconeSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        apiKey: env.PINECONE_API_KEY,
        indexName: env.PINECONE_INDEX
    };
}
function getCronSecrets() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        cronSecret: env.CRON_SECRET,
        inngestEventKey: env.INNGEST_EVENT_KEY,
        inngestSigningKey: env.INNGEST_SIGNING_KEY
    };
}
}),
"[project]/packages/shared/src/server/config/settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server Settings
 *
 * Non-secret server-only settings.
 * For app config (admin, urls, etc.), use shared/config instead.
 */ __turbopack_context__.s([
    "getEnvironmentSettings",
    ()=>getEnvironmentSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/env.ts [app-route] (ecmascript)");
;
function getEnvironmentSettings() {
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerEnv"])();
    return {
        nodeEnv: env.NODE_ENV,
        appEnv: env.APP_ENV,
        isDevelopment: env.NODE_ENV === 'development',
        isProduction: env.NODE_ENV === 'production',
        isTest: env.NODE_ENV === 'test'
    };
}
}),
"[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Server Configuration
 *
 * This module protects server-only config from client bundles.
 * Any attempt to import this from client code will fail at build time.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
// Re-export everything
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/settings.ts [app-route] (ecmascript)");
;
;
;
;
}),
"[project]/packages/shared/src/shared/config/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminConfigSchema",
    ()=>AdminConfigSchema,
    "AppConfigSchema",
    ()=>AppConfigSchema,
    "ChatConfigSchema",
    ()=>ChatConfigSchema,
    "ContextConfigSchema",
    ()=>ContextConfigSchema,
    "ConversationConfigSchema",
    ()=>ConversationConfigSchema,
    "FeatureFlagsSchema",
    ()=>FeatureFlagsSchema,
    "MessagingConfigSchema",
    ()=>MessagingConfigSchema,
    "MessagingProviderSchema",
    ()=>MessagingProviderSchema,
    "ShortLinksConfigSchema",
    ()=>ShortLinksConfigSchema,
    "StripeConfigSchema",
    ()=>StripeConfigSchema,
    "UrlsConfigSchema",
    ()=>UrlsConfigSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
// ============================================================================
// Environment Detection (for smart defaults)
// ============================================================================
const isDev = ("TURBOPACK compile-time value", "development") === 'development';
const isProd = ("TURBOPACK compile-time value", "development") === 'production';
const ContextConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    messageHistoryLimit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(5),
    includeSystemMessages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(true),
    maxContextTokens: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(1000),
    reserveTokensForResponse: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(1500),
    conversationGapMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(30),
    enableCaching: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(true),
    // Longer cache in production
    cacheTTLSeconds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().nonnegative().default(("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 300)
});
const ChatConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    smsMaxLength: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(1600),
    contextMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(10)
});
const MessagingProviderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
    'twilio',
    'local'
]);
const MessagingConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    // Use local provider in development, twilio in production
    provider: MessagingProviderSchema.default(("TURBOPACK compile-time truthy", 1) ? 'local' : "TURBOPACK unreachable")
});
const FeatureFlagsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    // Enable agent logging in development by default
    agentLogging: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(isDev),
    enableConversationStorage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(true)
});
const ConversationConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    timeoutMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(30),
    maxLength: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(100),
    inactiveThresholdDays: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(7)
});
const ShortLinksConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    defaultExpiryDays: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(7),
    domain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional()
});
const StripeConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    priceId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1)
});
const AdminConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    phoneNumbers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).default([]),
    maxRequestsPerWindow: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(3),
    rateLimitWindowMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(15),
    codeExpiryMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(10),
    codeLength: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().positive().default(6),
    devBypassCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional()
});
const UrlsConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    publicBaseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional()
});
const AppConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    environment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'development',
        'staging',
        'production'
    ]),
    context: ContextConfigSchema,
    chat: ChatConfigSchema,
    messaging: MessagingConfigSchema,
    features: FeatureFlagsSchema,
    conversation: ConversationConfigSchema,
    shortLinks: ShortLinksConfigSchema,
    stripe: StripeConfigSchema,
    admin: AdminConfigSchema,
    urls: UrlsConfigSchema
});
}),
"[project]/packages/shared/src/shared/config/loader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConfig",
    ()=>getConfig,
    "getEnvironment",
    ()=>getEnvironment,
    "loadConfig",
    ()=>loadConfig,
    "resetConfig",
    ()=>resetConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/schema.ts [app-route] (ecmascript)");
;
function getEnvironment() {
    const appEnv = process.env.APP_ENV;
    const nodeEnv = ("TURBOPACK compile-time value", "development");
    if (appEnv === 'staging') return 'staging';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return 'development';
}
/**
 * Parse comma-separated phone numbers from env var.
 */ function parsePhoneNumbers(envValue) {
    if (!envValue) return [];
    return envValue.split(',').map((num)=>num.trim()).filter((num)=>num.length > 0);
}
/**
 * Parse optional integer from env var.
 */ function parseOptionalInt(value) {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
}
/**
 * Parse optional boolean from env var.
 * Treats 'true' as true, 'false' as false, undefined as undefined.
 */ function parseOptionalBool(value) {
    if (value === undefined) return undefined;
    return value === 'true';
}
function loadConfig() {
    const env = getEnvironment();
    // Build raw config from env vars - undefined values let Zod defaults apply
    const rawConfig = {
        environment: env,
        context: {
            messageHistoryLimit: parseOptionalInt(process.env.CONTEXT_MESSAGE_HISTORY_LIMIT),
            includeSystemMessages: parseOptionalBool(process.env.CONTEXT_INCLUDE_SYSTEM_MESSAGES),
            maxContextTokens: parseOptionalInt(process.env.CONTEXT_MAX_TOKENS),
            reserveTokensForResponse: parseOptionalInt(process.env.CONTEXT_RESERVE_TOKENS),
            conversationGapMinutes: parseOptionalInt(process.env.CONTEXT_CONVERSATION_GAP_MINUTES),
            enableCaching: parseOptionalBool(process.env.CONTEXT_ENABLE_CACHING),
            cacheTTLSeconds: parseOptionalInt(process.env.CONTEXT_CACHE_TTL)
        },
        chat: {
            smsMaxLength: parseOptionalInt(process.env.SMS_MAX_LENGTH),
            contextMinutes: parseOptionalInt(process.env.CHAT_CONTEXT_MINUTES)
        },
        messaging: {
            provider: process.env.MESSAGING_PROVIDER
        },
        features: {
            agentLogging: parseOptionalBool(process.env.AGENT_LOGGING),
            enableConversationStorage: parseOptionalBool(process.env.ENABLE_CONVERSATION_STORAGE)
        },
        conversation: {
            timeoutMinutes: parseOptionalInt(process.env.CONVERSATION_TIMEOUT_MINUTES),
            maxLength: parseOptionalInt(process.env.MAX_CONVERSATION_LENGTH),
            inactiveThresholdDays: parseOptionalInt(process.env.INACTIVE_THRESHOLD_DAYS)
        },
        shortLinks: {
            defaultExpiryDays: parseOptionalInt(process.env.SHORT_LINK_DEFAULT_EXPIRY_DAYS),
            domain: process.env.SHORT_LINK_DOMAIN
        },
        stripe: {
            priceId: process.env.STRIPE_PRICE_ID
        },
        admin: {
            phoneNumbers: process.env.ADMIN_PHONE_NUMBERS ? parsePhoneNumbers(process.env.ADMIN_PHONE_NUMBERS) : undefined,
            devBypassCode: process.env.DEV_BYPASS_CODE
        },
        urls: {
            baseUrl: process.env.BASE_URL,
            publicBaseUrl: ("TURBOPACK compile-time value", "http://localhost:3001")
        }
    };
    // Validate with Zod - applies defaults and throws on failure
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppConfigSchema"].safeParse(rawConfig);
    if (!result.success) {
        const errors = result.error.errors.map((e)=>`  - ${e.path.join('.')}: ${e.message}`).join('\n');
        throw new Error(`Configuration validation failed:\n${errors}\n\n` + `Environment: ${env}\n` + `Check your environment variables.`);
    }
    return result.data;
}
// Singleton config instance
let _config = null;
function getConfig() {
    if (!_config) {
        _config = loadConfig();
    }
    return _config;
}
function resetConfig() {
    _config = null;
}
}),
"[project]/packages/shared/src/shared/config/public.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Public Configuration
 *
 * Safe for client-side usage. All NEXT_PUBLIC_* values are validated here.
 */ __turbopack_context__.s([
    "getAnalyticsConfig",
    ()=>getAnalyticsConfig,
    "getPublicStripeConfig",
    ()=>getPublicStripeConfig,
    "getPublicUrls",
    ()=>getPublicUrls,
    "isDevelopmentEnvironment",
    ()=>isDevelopmentEnvironment,
    "isProductionEnvironment",
    ()=>isProductionEnvironment,
    "resetPublicEnv",
    ()=>resetPublicEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
// =============================================================================
// Public Environment Schema
// =============================================================================
const PublicEnvSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    NEXT_PUBLIC_BASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    NEXT_PUBLIC_ANALYTICS_WRITE_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional()
});
// =============================================================================
// Validation & Caching
// =============================================================================
let _publicEnv = null;
function getPublicEnv() {
    if (!_publicEnv) {
        const result = PublicEnvSchema.safeParse({
            NEXT_PUBLIC_BASE_URL: ("TURBOPACK compile-time value", "http://localhost:3001"),
            NEXT_PUBLIC_ANALYTICS_WRITE_KEY: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ("TURBOPACK compile-time value", "pk_test_51RqaN150HqmWGti9QDJylVzg1gPUV7Q5cq7UVYjfiCela27bbaluQsXcLPaTUZYNMyBAZ7SBptLQgdrmqzAeVeQ600R9SKwQMC")
        });
        if (!result.success) {
            console.warn('Public environment validation warnings:', result.error.errors);
        }
        _publicEnv = result.data ?? {};
    }
    return _publicEnv;
}
function resetPublicEnv() {
    _publicEnv = null;
}
function getPublicUrls() {
    const env = getPublicEnv();
    return {
        baseUrl: env.NEXT_PUBLIC_BASE_URL
    };
}
function getAnalyticsConfig() {
    const env = getPublicEnv();
    return {
        writeKey: env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
        isEnabled: Boolean(env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY)
    };
}
function getPublicStripeConfig() {
    const env = getPublicEnv();
    return {
        publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    };
}
function isProductionEnvironment() {
    return ("TURBOPACK compile-time value", "development") === 'production';
}
function isDevelopmentEnvironment() {
    return ("TURBOPACK compile-time value", "development") === 'development';
}
}),
"[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Application Configuration
 *
 * This module provides type-safe, validated configuration for the application.
 * Config values are loaded once at startup and cached.
 *
 * Usage:
 *   import { config } from '@/shared/config';
 *   console.log(config.chat.smsMaxLength);
 *
 * Or use section accessors:
 *   import { getChatConfig, getFeatureFlags } from '@/shared/config';
 *   const { smsMaxLength } = getChatConfig();
 */ __turbopack_context__.s([
    "config",
    ()=>config,
    "getAdminConfig",
    ()=>getAdminConfig,
    "getChatConfig",
    ()=>getChatConfig,
    "getContextConfig",
    ()=>getContextConfig,
    "getConversationConfig",
    ()=>getConversationConfig,
    "getFeatureFlags",
    ()=>getFeatureFlags,
    "getMessagingConfig",
    ()=>getMessagingConfig,
    "getShortLinksConfig",
    ()=>getShortLinksConfig,
    "getStripeConfig",
    ()=>getStripeConfig,
    "getUrlsConfig",
    ()=>getUrlsConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/loader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/public.ts [app-route] (ecmascript)");
;
;
;
;
// ============================================================================
// Lazy config getter to avoid issues during build/module loading
// ============================================================================
let _cachedConfig = null;
function getCachedConfig() {
    if (!_cachedConfig) {
        _cachedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])();
    }
    return _cachedConfig;
}
const config = new Proxy({}, {
    get (_target, prop) {
        return getCachedConfig()[prop];
    }
});
function getContextConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().context;
}
function getChatConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().chat;
}
function getMessagingConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().messaging;
}
function getFeatureFlags() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().features;
}
function getConversationConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().conversation;
}
function getShortLinksConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().shortLinks;
}
function getStripeConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().stripe;
}
function getAdminConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().admin;
}
function getUrlsConfig() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])().urls;
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/packages/shared/src/server/connections/twilio/factory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Twilio Client Factory
 *
 * Creates Twilio client instances on-demand. Supports multiple
 * credentials for environment switching (sandbox/production).
 */ __turbopack_context__.s([
    "clearTwilioClients",
    ()=>clearTwilioClients,
    "createTwilioClient",
    ()=>createTwilioClient,
    "getActiveTwilioAccounts",
    ()=>getActiveTwilioAccounts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$twilio$40$5$2e$5$2e$2$2f$node_modules$2f$twilio$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/twilio@5.5.2/node_modules/twilio/lib/index.js [app-route] (ecmascript)");
;
// Cache clients by account SID
const clientCache = new Map();
function createTwilioClient(credentials, statusCallbackUrl) {
    const cacheKey = credentials.accountSid;
    // Return cached instance if available
    if (clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey);
    }
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$twilio$40$5$2e$5$2e$2$2f$node_modules$2f$twilio$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(credentials.accountSid, credentials.authToken);
    const fromNumber = credentials.phoneNumber;
    const twilioClient = {
        async sendSMS (to, message, mediaUrls) {
            try {
                const messageType = mediaUrls && mediaUrls.length > 0 ? 'MMS' : 'SMS';
                console.log(`Sending ${messageType} from:`, fromNumber, 'to:', to);
                if (mediaUrls && mediaUrls.length > 0) {
                    console.log('Media URLs:', mediaUrls);
                }
                if (!message && (!mediaUrls || mediaUrls.length === 0)) {
                    throw new Error('Must provide either message text or media URLs');
                }
                const response = await client.messages.create({
                    ...message && {
                        body: message
                    },
                    from: fromNumber,
                    to: to,
                    statusCallback: statusCallbackUrl,
                    ...mediaUrls && mediaUrls.length > 0 && {
                        mediaUrl: mediaUrls
                    }
                });
                return response;
            } catch (error) {
                console.error('Error sending SMS/MMS:', error);
                throw error;
            }
        },
        async sendMMS (to, message, mediaUrls) {
            return this.sendSMS(to, message, mediaUrls);
        },
        async getMessageStatus (messageSid) {
            return await client.messages(messageSid).fetch();
        },
        getFromNumber () {
            return fromNumber;
        }
    };
    clientCache.set(cacheKey, twilioClient);
    return twilioClient;
}
function clearTwilioClients() {
    clientCache.clear();
}
function getActiveTwilioAccounts() {
    return Array.from(clientCache.keys());
}
}),
"[project]/packages/shared/src/server/connections/twilio/twilio.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Twilio Connection
 *
 * This module provides the default Twilio client using environment
 * variables. For environment switching (sandbox/production), use
 * the factory functions instead.
 */ __turbopack_context__.s([
    "twilioClient",
    ()=>twilioClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/twilio/factory.ts [app-route] (ecmascript)");
;
;
;
// Get credentials from validated server config
const credentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTwilioSecrets"])();
// Build status callback URL if BASE_URL is configured
const { baseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUrlsConfig"])();
const statusCallbackUrl = baseUrl ? `${baseUrl}/api/twilio/status` : undefined;
const twilioClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTwilioClient"])({
    accountSid: credentials.accountSid,
    authToken: credentials.authToken,
    phoneNumber: credentials.phoneNumber
}, statusCallbackUrl);
;
}),
"[project]/packages/shared/src/server/connections/messaging/twilioClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Twilio Messaging Client
 *
 * Implements IMessagingClient for Twilio SMS delivery.
 * Wraps the Twilio API and provides a standardized messaging interface.
 */ __turbopack_context__.s([
    "TwilioMessagingClient",
    ()=>TwilioMessagingClient,
    "twilioMessagingClient",
    ()=>twilioMessagingClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$twilio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/twilio/twilio.ts [app-route] (ecmascript) <locals>");
;
class TwilioMessagingClient {
    provider = 'twilio';
    async sendMessage(user, message, mediaUrls) {
        try {
            const twilioResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$twilio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["twilioClient"].sendSMS(user.phoneNumber, message, mediaUrls);
            return {
                messageId: twilioResponse.sid,
                status: this.mapTwilioStatus(twilioResponse.status),
                provider: this.provider,
                to: twilioResponse.to,
                from: twilioResponse.from,
                timestamp: twilioResponse.dateCreated,
                metadata: {
                    twilioSid: twilioResponse.sid,
                    twilioStatus: twilioResponse.status,
                    errorCode: twilioResponse.errorCode,
                    errorMessage: twilioResponse.errorMessage,
                    mediaUrls
                }
            };
        } catch (error) {
            console.error('TwilioMessagingClient: Failed to send message', error);
            throw error;
        }
    }
    /**
   * Maps Twilio status to standardized message status
   */ mapTwilioStatus(twilioStatus) {
        switch(twilioStatus){
            case 'sent':
            case 'delivered':
                return 'delivered';
            case 'queued':
            case 'accepted':
            case 'sending':
                return 'queued';
            case 'failed':
            case 'undelivered':
                return 'failed';
            default:
                return 'sent';
        }
    }
}
const twilioMessagingClient = new TwilioMessagingClient();
}),
"[project]/packages/shared/src/server/connections/messaging/localClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Local Messaging Client
 *
 * Implements IMessagingClient for local development and testing.
 * Uses EventEmitter to broadcast messages to connected SSE clients.
 * Does not actually send SMS - instead emits events for local consumption.
 */ __turbopack_context__.s([
    "LocalMessagingClient",
    ()=>LocalMessagingClient,
    "localMessagingClient",
    ()=>localMessagingClient
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/events [external] (events, cjs)");
;
class LocalMessagingClient {
    provider = 'local';
    eventEmitter;
    messageCounter = 0;
    constructor(){
        this.eventEmitter = new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]();
        // Increase max listeners for SSE connections
        this.eventEmitter.setMaxListeners(100);
    }
    async sendMessage(user, message, mediaUrls) {
        const messageId = `local-${Date.now()}-${++this.messageCounter}`;
        const timestamp = new Date();
        const to = user.phoneNumber;
        const localMessage = {
            messageId,
            to,
            from: 'local-system',
            content: message || '[MMS only - no text]',
            timestamp
        };
        // Emit the message event for SSE listeners
        this.eventEmitter.emit('message', localMessage);
        console.log(`[LocalMessagingClient] Message sent (not actual SMS):`, {
            messageId,
            to,
            userId: user.id,
            preview: message ? message.substring(0, 50) : '[MMS only]',
            mediaUrls
        });
        return {
            messageId,
            status: 'sent',
            provider: this.provider,
            to,
            from: 'local-system',
            timestamp,
            metadata: {
                userId: user.id,
                phoneNumber: to,
                contentLength: message?.length || 0,
                mediaUrls
            }
        };
    }
    /**
   * Subscribe to message events (for SSE connections)
   */ onMessage(listener) {
        this.eventEmitter.on('message', listener);
    }
    /**
   * Unsubscribe from message events
   */ offMessage(listener) {
        this.eventEmitter.off('message', listener);
    }
    /**
   * Get current number of active listeners
   */ getListenerCount() {
        return this.eventEmitter.listenerCount('message');
    }
}
const localMessagingClient = new LocalMessagingClient();
}),
"[project]/packages/shared/src/server/connections/messaging/factory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Messaging Client Factory
 *
 * Provides a centralized way to get the appropriate messaging client
 * based on environment configuration.
 */ __turbopack_context__.s([
    "getMessagingClient",
    ()=>getMessagingClient,
    "getMessagingClientByProvider",
    ()=>getMessagingClientByProvider,
    "messagingClient",
    ()=>messagingClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$twilioClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/twilioClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/localClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
;
;
;
function getMessagingClient() {
    const { provider } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getMessagingConfig"])();
    switch(provider){
        case 'local':
            console.log('[MessagingFactory] Using LocalMessagingClient (no SMS will be sent)');
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"];
        case 'twilio':
        default:
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$twilioClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["twilioMessagingClient"];
    }
}
function getMessagingClientByProvider(provider) {
    switch(provider){
        case 'local':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"];
        case 'twilio':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$twilioClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["twilioMessagingClient"];
        default:
            throw new Error(`Unknown messaging provider: ${provider}`);
    }
}
const messagingClient = getMessagingClient();
}),
"[project]/packages/shared/src/server/connections/messaging/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Messaging Module Exports
 *
 * Central export point for all messaging-related types, clients, and utilities.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$twilioClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/twilioClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/localClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/factory.ts [app-route] (ecmascript)");
;
;
;
}),
"[project]/apps/admin/src/app/api/messages/stream/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Message Stream API (Server-Sent Events)
 *
 * Provides real-time message streaming for local development and admin chat.
 * Clients can subscribe to receive messages as they are sent.
 */ __turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/localClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
;
;
const dynamic = 'force-dynamic';
const runtime = 'nodejs';
async function GET(request) {
    // Only allow SSE when using local messaging provider
    const { provider } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getMessagingConfig"])();
    if (provider !== 'local') {
        return new Response('SSE is only available with MESSAGING_PROVIDER=local', {
            status: 400
        });
    }
    // Optional: Filter by phoneNumber from query params
    const { searchParams } = new URL(request.url);
    const filterPhoneNumber = searchParams.get('phoneNumber');
    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start (controller) {
            // Send initial connection message
            const connectMessage = `data: ${JSON.stringify({
                type: 'connected',
                timestamp: new Date()
            })}\n\n`;
            controller.enqueue(encoder.encode(connectMessage));
            // Set up message listener
            const messageListener = (message)=>{
                // Filter by phone number if specified
                if (filterPhoneNumber && message.to !== filterPhoneNumber) {
                    return;
                }
                const data = {
                    type: 'message',
                    message: {
                        id: message.messageId,
                        to: message.to,
                        from: message.from,
                        content: message.content,
                        timestamp: message.timestamp
                    }
                };
                const sseMessage = `data: ${JSON.stringify(data)}\n\n`;
                try {
                    controller.enqueue(encoder.encode(sseMessage));
                } catch (error) {
                    console.error('Error sending SSE message:', error);
                }
            };
            // Subscribe to messages
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"].onMessage(messageListener);
            console.log('[SSE] Client connected', {
                filterPhoneNumber,
                activeListeners: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"].getListenerCount()
            });
            // Clean up on connection close
            const cleanup = ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"].offMessage(messageListener);
                console.log('[SSE] Client disconnected', {
                    activeListeners: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$localClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localMessagingClient"].getListenerCount()
                });
            };
            // Handle connection close
            request.signal.addEventListener('abort', ()=>{
                cleanup();
                try {
                    controller.close();
                } catch  {
                // Controller might already be closed - ignore error
                }
            });
        }
    });
    // Return SSE response
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__887e18a6._.js.map