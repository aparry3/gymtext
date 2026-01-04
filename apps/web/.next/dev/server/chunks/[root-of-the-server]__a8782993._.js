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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[externals]/pg [external] (pg, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pg", () => require("pg"));

module.exports = mod;
}),
"[project]/packages/shared/src/server/connections/postgres/factory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database Connection Factory
 *
 * Creates Kysely database instances on-demand. Supports multiple
 * connection strings for environment switching (sandbox/production).
 *
 * Uses internal caching to reuse pools for the same connection string.
 */ __turbopack_context__.s([
    "closeAllPools",
    ()=>closeAllPools,
    "createDatabase",
    ()=>createDatabase,
    "getActiveConnections",
    ()=>getActiveConnections,
    "getPool",
    ()=>getPool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/kysely.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$dialect$2f$postgres$2f$postgres$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/dialect/postgres/postgres-dialect.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$plugin$2f$camel$2d$case$2f$camel$2d$case$2d$plugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/plugin/camel-case/camel-case-plugin.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, cjs)");
;
;
// Cache pools by connection string to avoid creating new pools for same env
const poolCache = new Map();
const dbCache = new Map();
function createDatabase(connectionString) {
    // Return cached instance if available
    if (dbCache.has(connectionString)) {
        return dbCache.get(connectionString);
    }
    // Create or get cached pool
    let pool = poolCache.get(connectionString);
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__cjs$29$__["Pool"]({
            connectionString,
            max: 10
        });
        poolCache.set(connectionString, pool);
    }
    // Create Kysely instance
    const db = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Kysely"]({
        dialect: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$dialect$2f$postgres$2f$postgres$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresDialect"]({
            pool
        }),
        plugins: [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$plugin$2f$camel$2d$case$2f$camel$2d$case$2d$plugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CamelCasePlugin"]()
        ]
    });
    dbCache.set(connectionString, db);
    return db;
}
function getPool(connectionString) {
    let pool = poolCache.get(connectionString);
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__cjs$29$__["Pool"]({
            connectionString,
            max: 10
        });
        poolCache.set(connectionString, pool);
    }
    return pool;
}
async function closeAllPools() {
    const pools = Array.from(poolCache.values());
    await Promise.all(pools.map((pool)=>pool.end()));
    poolCache.clear();
    dbCache.clear();
}
function getActiveConnections() {
    return Array.from(poolCache.keys());
}
}),
"[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * PostgreSQL Connection
 *
 * This module provides the default database connection using the
 * DATABASE_URL environment variable. For environment switching
 * (sandbox/production), use the factory functions instead.
 */ __turbopack_context__.s([
    "pool",
    ()=>pool,
    "postgresDb",
    ()=>postgresDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/factory.ts [app-route] (ecmascript)");
;
;
// Get the database URL from validated server config
const { databaseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseSecrets"])();
const postgresDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDatabase"])(databaseUrl);
const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(databaseUrl);
;
}),
"[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseRepository",
    ()=>BaseRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
;
class BaseRepository {
    db;
    /**
   * Create a repository instance
   * @param db - Optional database instance. If not provided, uses the default singleton.
   */ constructor(db = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]){
        this.db = db;
    }
}
}),
"[project]/packages/shared/src/server/repositories/pageVisitRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageVisitRepository",
    ()=>PageVisitRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class PageVisitRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Record a new page visit
   */ async record(visit) {
        const result = await this.db.insertInto('pageVisits').values(visit).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Get visits within a date range
   */ async getVisitsByDateRange(startDate, endDate, options) {
        let query = this.db.selectFrom('pageVisits').selectAll().where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).orderBy('createdAt', 'desc');
        if (options?.source) {
            query = query.where('source', '=', options.source);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        return query.execute();
    }
    /**
   * Get aggregated visit counts by source
   */ async getVisitCountsBySource(startDate, endDate) {
        const results = await this.db.selectFrom('pageVisits').select([
            'source'
        ]).select((eb)=>eb.fn.count('id').as('count')).where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).groupBy('source').orderBy('count', 'desc').execute();
        return results.map((r)=>({
                source: r.source,
                count: Number(r.count)
            }));
    }
    /**
   * Get total visit count for a date range
   */ async getTotalVisits(startDate, endDate) {
        const result = await this.db.selectFrom('pageVisits').select((eb)=>eb.fn.count('id').as('count')).where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).executeTakeFirst();
        return Number(result?.count ?? 0);
    }
}
}),
"[project]/apps/web/src/app/api/track/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$pageVisitRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/pageVisitRepository.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { page, source } = body;
        if (!page || typeof page !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false
            }, {
                status: 400
            });
        }
        // Extract visitor metadata from headers
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? request.headers.get('x-real-ip') ?? null;
        const userAgent = request.headers.get('user-agent') ?? null;
        const referrer = request.headers.get('referer') ?? null;
        // Fire-and-forget: record the visit but don't wait for it
        const repository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$pageVisitRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageVisitRepository"]();
        repository.record({
            page,
            ipAddress,
            userAgent,
            referrer,
            source: source ?? null,
            utmSource: null,
            utmMedium: null,
            utmCampaign: null,
            utmContent: null,
            utmTerm: null
        }).catch((err)=>console.error('[Tracking] Error recording page visit:', err));
        // Return immediately
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('[Tracking] Error in track endpoint:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a8782993._.js.map