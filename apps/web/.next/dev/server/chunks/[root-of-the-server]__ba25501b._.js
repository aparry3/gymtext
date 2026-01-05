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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

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
"[project]/packages/shared/src/server/repositories/referralRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferralRepository",
    ()=>ReferralRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/raw-builder/sql.js [app-route] (ecmascript)");
;
;
class ReferralRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new referral record
   * Called when a referee signs up using a referral code
   */ async create(referrerId, refereeId) {
        const result = await this.db.insertInto('referrals').values({
            referrerId,
            refereeId,
            creditApplied: false,
            creditAmountCents: 0,
            createdAt: new Date()
        }).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Find a referral by referee ID
   * Used by webhook to find the referral when crediting the referrer
   */ async findByRefereeId(refereeId) {
        const result = await this.db.selectFrom('referrals').selectAll().where('refereeId', '=', refereeId).executeTakeFirst();
        return result || null;
    }
    /**
   * Find all referrals for a referrer
   * Used for displaying referral stats on the /me page
   */ async findByReferrerId(referrerId) {
        return await this.db.selectFrom('referrals').selectAll().where('referrerId', '=', referrerId).orderBy('createdAt', 'desc').execute();
    }
    /**
   * Mark a referral as credited
   * Called after successfully applying credit to the referrer's Stripe account
   */ async markCreditApplied(id, amountCents) {
        const result = await this.db.updateTable('referrals').set({
            creditApplied: true,
            creditAmountCents: amountCents,
            creditedAt: new Date()
        }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Count credits earned by a referrer
   * Only counts referrals where credit was actually applied
   */ async countCreditsEarned(referrerId) {
        const result = await this.db.selectFrom('referrals').select(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`count(*)`.as('count')).where('referrerId', '=', referrerId).where('creditApplied', '=', true).executeTakeFirst();
        return Number(result?.count || 0);
    }
    /**
   * Count total referrals by a referrer (regardless of credit status)
   */ async countByReferrer(referrerId) {
        const result = await this.db.selectFrom('referrals').select(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`count(*)`.as('count')).where('referrerId', '=', referrerId).executeTakeFirst();
        return Number(result?.count || 0);
    }
    /**
   * Check if a user has already been referred
   * Each user can only be referred once
   */ async hasBeenReferred(refereeId) {
        const result = await this.db.selectFrom('referrals').select('id').where('refereeId', '=', refereeId).executeTakeFirst();
        return !!result;
    }
}
}),
"[project]/packages/shared/src/shared/utils/phoneUtils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized phone number utilities for US-based phone numbers
 * 
 * GymText assumes all users are US-based, so all phone numbers
 * should be normalized to +1XXXXXXXXXX format.
 */ /**
 * Normalizes a phone number input to US E.164 format (+1XXXXXXXXXX)
 * 
 * Supported input formats:
 * - 3392223571 → +13392223571 (10 digits, adds +1 prefix)
 * - 13392223571 → +13392223571 (11 digits starting with 1, adds + prefix)
 * - +13392223571 → +13392223571 (already formatted, no change)
 * 
 * @param input - Phone number in various formats
 * @returns Normalized phone number or null if invalid
 */ __turbopack_context__.s([
    "createNormalizedUSPhone",
    ()=>createNormalizedUSPhone,
    "formatUSPhoneForDisplay",
    ()=>formatUSPhoneForDisplay,
    "isUSPhoneNumber",
    ()=>isUSPhoneNumber,
    "normalizeUSPhoneNumber",
    ()=>normalizeUSPhoneNumber,
    "validateUSPhoneNumber",
    ()=>validateUSPhoneNumber
]);
function normalizeUSPhoneNumber(input) {
    if (!input || typeof input !== 'string') {
        return null;
    }
    // Remove all non-numeric characters
    const digits = input.replace(/\D/g, '');
    if (!digits) {
        return null;
    }
    // Handle different input formats
    if (digits.length === 10) {
        // US number without country code: 3392223571
        // Validate that it starts with a valid area code (2-9 for first digit)
        if (digits[0] >= '2' && digits[0] <= '9') {
            return `+1${digits}`;
        }
    } else if (digits.length === 11 && digits.startsWith('1')) {
        // US number with country code: 13392223571
        // Validate that area code starts with valid digit (2-9 for 4th digit)
        if (digits[1] >= '2' && digits[1] <= '9') {
            return `+${digits}`;
        }
    } else if (input.startsWith('+1') && digits.length === 11 && digits.startsWith('1')) {
        // Already formatted: +13392223571
        // Validate format
        if (digits[1] >= '2' && digits[1] <= '9') {
            return input;
        }
    }
    // Invalid format or length
    return null;
}
function validateUSPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    // Must be in E.164 format for US: +1XXXXXXXXXX
    // Area code (first 3 digits after +1) must start with 2-9
    // Exchange code (next 3 digits) must start with 2-9
    const e164USRegex = /^\+1[2-9]\d{2}[2-9]\d{6}$/;
    return e164USRegex.test(phone);
}
function isUSPhoneNumber(phone) {
    return typeof phone === 'string' && phone.startsWith('+1');
}
function formatUSPhoneForDisplay(phone) {
    if (!validateUSPhoneNumber(phone)) {
        return phone;
    }
    // Remove +1 and format as (XXX) XXX-XXXX
    const digits = phone.slice(2); // Remove +1
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
function createNormalizedUSPhone(phone) {
    if (validateUSPhoneNumber(phone)) {
        return phone;
    }
    return null;
}
}),
"[project]/packages/shared/src/shared/types/user/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityDataSchema",
    ()=>ActivityDataSchema,
    "AvailabilitySchema",
    ()=>AvailabilitySchema,
    "CardioDataSchema",
    ()=>CardioDataSchema,
    "ConstraintSchema",
    ()=>ConstraintSchema,
    "CreateFitnessProfileSchema",
    ()=>CreateFitnessProfileSchema,
    "CreateUserSchema",
    ()=>CreateUserSchema,
    "EquipmentAccessSchema",
    ()=>EquipmentAccessSchema,
    "FitnessProfileSchema",
    ()=>FitnessProfileSchema,
    "GoalsSchema",
    ()=>GoalsSchema,
    "ProfileUpdatePatchSchema",
    ()=>ProfileUpdatePatchSchema,
    "ProfileUpdateRequestSchema",
    ()=>ProfileUpdateRequestSchema,
    "StrengthDataSchema",
    ()=>StrengthDataSchema,
    "TemporaryEnvironmentChangeSchema",
    ()=>TemporaryEnvironmentChangeSchema,
    "UpdateUserSchema",
    ()=>UpdateUserSchema,
    "UserMetricsSchema",
    ()=>UserMetricsSchema,
    "UserSchema",
    ()=>UserSchema,
    "WeightSchema",
    ()=>WeightSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/phoneUtils.ts [app-route] (ecmascript)");
;
;
const UserSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().uuid(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().email().nullable(),
    phoneNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().transform(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeUSPhoneNumber"]).refine(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateUSPhoneNumber"], {
        message: 'Must be a valid US phone number'
    }),
    age: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(120).nullable(),
    gender: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullable(),
    stripeCustomerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullable(),
    preferredSendHour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(0).max(23),
    timezone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].date(),
    updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].date()
});
const AvailabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    daysPerWeek: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(7),
    minutesPerSession: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(15).max(240),
    preferredTimes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'morning',
        'afternoon',
        'evening'
    ])).nullish(),
    schedule: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
});
const TemporaryEnvironmentChangeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    equipmentAvailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
    equipmentUnavailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish()
});
const EquipmentAccessSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    gymAccess: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean(),
    gymType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'commercial',
        'home',
        'community',
        'none'
    ]).nullish(),
    homeEquipment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
    limitations: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
    temporaryChanges: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(TemporaryEnvironmentChangeSchema).nullish()
});
const WeightSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().positive(),
    unit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'lbs',
        'kg'
    ]),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
});
const UserMetricsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().positive().nullish(),
    weight: WeightSchema.nullish(),
    bodyComposition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(1).max(50).nullish(),
    fitnessLevel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active'
    ]).nullish()
});
const ConstraintSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'injury',
        'mobility',
        'medical',
        'preference'
    ]),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    severity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'mild',
        'moderate',
        'severe'
    ]).nullish(),
    affectedMovements: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'active',
        'resolved'
    ]),
    startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    isTemporary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(false)
});
const StrengthDataSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].literal('strength'),
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    experience: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'beginner',
        'intermediate',
        'advanced'
    ]),
    currentProgram: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    keyLifts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number()).nullish(),
    preferences: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        workoutStyle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
        likedExercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
        dislikedExercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish()
    }).nullish(),
    trainingFrequency: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(7)
});
const CardioDataSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].literal('cardio'),
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    experience: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'beginner',
        'intermediate',
        'advanced'
    ]),
    primaryActivities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()),
    keyMetrics: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        weeklyDistance: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().positive().nullish(),
        longestSession: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().positive().nullish(),
        averagePace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
        preferredIntensity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
            'low',
            'moderate',
            'high'
        ]).nullish()
    }).nullish(),
    preferences: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        indoor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().nullish(),
        outdoor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().nullish(),
        groupVsIndividual: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
            'group',
            'individual',
            'both'
        ]).nullish(),
        timeOfDay: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish()
    }).nullish(),
    frequency: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(7).nullish()
});
const ActivityDataSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].union([
    StrengthDataSchema,
    CardioDataSchema
]));
const GoalsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    primary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    timeline: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(104).nullish(),
    specific: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    motivation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
});
const FitnessProfileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    goals: GoalsSchema,
    // Overall experience level - single source of truth for fitness experience
    // Can be derived from primary activity or set explicitly
    experienceLevel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'beginner',
        'intermediate',
        'advanced'
    ]).nullish(),
    equipmentAccess: EquipmentAccessSchema.nullish(),
    availability: AvailabilitySchema.nullish(),
    constraints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(ConstraintSchema).nullish(),
    metrics: UserMetricsSchema.nullish(),
    activities: ActivityDataSchema.nullish()
});
const CreateUserSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().email().nullish(),
    phoneNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().transform(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeUSPhoneNumber"]).refine(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateUSPhoneNumber"], {
        message: 'Must be a valid US phone number'
    }),
    age: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(1).max(120).nullish(),
    gender: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().nullish().default(true),
    isAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().nullish().default(false),
    stripeCustomerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    preferredSendHour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(0).max(23).nullish(),
    timezone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
});
const UpdateUserSchema = CreateUserSchema.partial();
const CreateFitnessProfileSchema = FitnessProfileSchema.partial();
const ProfileUpdatePatchSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    field: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    oldValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].unknown().nullable(),
    newValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].unknown().nullable(),
    timestamp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].date()
});
const ProfileUpdateRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    updates: FitnessProfileSchema.partial(),
    source: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'chat',
        'form',
        'admin',
        'api',
        'system'
    ]),
    reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional().nullable()
});
}),
"[project]/packages/shared/src/shared/types/user/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$user$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/user/schemas.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/shared/src/server/models/user.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Re-export types from shared (Zod schemas and inferred types)
__turbopack_context__.s([
    "UserModel",
    ()=>UserModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$user$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/user/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/phoneUtils.ts [app-route] (ecmascript)");
;
;
class UserModel {
    static fromDb(user) {
        return user ? {
            ...user
        } : undefined;
    }
    /**
   * Convert DB result with joined profile to UserWithProfile
   * Used when fetching user with profiles table joined
   */ static fromDbWithProfile(dbResult) {
        const { profile, ...userData } = dbResult;
        return {
            ...userData,
            profile: profile || null
        };
    }
    /**
   * Validates user data for creation
   * @param userData - User data to validate
   * @throws Error if validation fails
   */ static validateUserData(userData) {
        if (!userData.name || userData.name.trim().length < 2) {
            throw new Error('User name must be at least 2 characters long');
        }
        if (!userData.phoneNumber || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateUSPhoneNumber"])(userData.phoneNumber)) {
            throw new Error('Valid US phone number is required');
        }
        if (userData.email && !this.isValidEmail(userData.email)) {
            throw new Error('Invalid email format');
        }
    }
    /**
   * Validates user update data
   * @param updates - Update data to validate
   * @throws Error if validation fails
   */ static validateUserUpdates(updates) {
        if (updates.name && updates.name.trim().length < 2) {
            throw new Error('User name must be at least 2 characters long');
        }
        if (updates.phoneNumber && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$phoneUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateUSPhoneNumber"])(updates.phoneNumber)) {
            throw new Error('Valid US phone number is required');
        }
        if (updates.email && !this.isValidEmail(updates.email)) {
            throw new Error('Invalid email format');
        }
        if (updates.preferredSendHour !== undefined && (updates.preferredSendHour < 0 || updates.preferredSendHour > 23)) {
            throw new Error('Preferred send hour must be between 0 and 23');
        }
        if (updates.age !== undefined && updates.age !== null && (updates.age < 1 || updates.age > 120)) {
            throw new Error('Age must be between 1 and 120');
        }
    }
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
}),
"[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Date & Time Utilities
 *
 * Single source of truth for all date/time operations across the application.
 * Handles timezone conversions, formatting for UI/AI/API, and date comparisons.
 *
 * Uses Luxon for timezone-aware operations.
 *
 * @example
 * ```typescript
 * import { formatForUI, formatForAI, parseDate } from '@/shared/utils/date';
 *
 * // Format for UI display
 * const displayDate = formatForUI(new Date(), 'short');
 *
 * // Format for AI prompts
 * const aiDate = formatForAI(new Date(), 'America/New_York');
 *
 * // Parse safely
 * const parsed = parseDate('2025-01-20');
 * ```
 */ __turbopack_context__.s([
    "DAY_NAMES",
    ()=>DAY_NAMES,
    "addDays",
    ()=>addDays,
    "addWeeks",
    ()=>addWeeks,
    "convertToTimezone",
    ()=>convertToTimezone,
    "convertToUTC",
    ()=>convertToUTC,
    "diffInDays",
    ()=>diffInDays,
    "diffInWeeks",
    ()=>diffInWeeks,
    "endOfDay",
    ()=>endOfDay,
    "endOfWeek",
    ()=>endOfWeek,
    "formatDate",
    ()=>formatDate,
    "formatForAI",
    ()=>formatForAI,
    "formatForAICustom",
    ()=>formatForAICustom,
    "formatForAPI",
    ()=>formatForAPI,
    "formatForDatabase",
    ()=>formatForDatabase,
    "formatForUI",
    ()=>formatForUI,
    "formatRelative",
    ()=>formatRelative,
    "getDayOfWeek",
    ()=>getDayOfWeek,
    "getDayOfWeekName",
    ()=>getDayOfWeekName,
    "getLocalHour",
    ()=>getLocalHour,
    "getNextWeekStart",
    ()=>getNextWeekStart,
    "getTimezonesAtLocalTime",
    ()=>getTimezonesAtLocalTime,
    "getWeekday",
    ()=>getWeekday,
    "isFuture",
    ()=>isFuture,
    "isPast",
    ()=>isPast,
    "isSameDay",
    ()=>isSameDay,
    "isToday",
    ()=>isToday,
    "isValidDate",
    ()=>isValidDate,
    "isValidTimezone",
    ()=>isValidTimezone,
    "isWeekdayInTimezone",
    ()=>isWeekdayInTimezone,
    "now",
    ()=>now,
    "parseDate",
    ()=>parseDate,
    "startOfDay",
    ()=>startOfDay,
    "startOfWeek",
    ()=>startOfWeek,
    "subtractDays",
    ()=>subtractDays,
    "subtractWeeks",
    ()=>subtractWeeks,
    "toISODate",
    ()=>toISODate,
    "today",
    ()=>today
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$luxon$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/luxon.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/datetime.js [app-route] (ecmascript) <export default as DateTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$zones$2f$IANAZone$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__IANAZone$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/zones/IANAZone.js [app-route] (ecmascript) <export default as IANAZone>");
;
const DAY_NAMES = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
];
function parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
        // If it already has time component (ISO 8601), parse directly
        if (value.includes('T')) {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }
        // SQL date format (YYYY-MM-DD) - add UTC midnight to prevent timezone shifts
        const date = new Date(value + 'T00:00:00Z');
        return isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
function now(timezone) {
    if (timezone && isValidTimezone(timezone)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].now().setZone(timezone);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].now();
}
function today(timezone) {
    return now(timezone).startOf('day').toJSDate();
}
function startOfDay(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to startOfDay');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.startOf('day').toJSDate();
}
function endOfDay(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to endOfDay');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.endOf('day').toJSDate();
}
function isValidTimezone(timezone) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$zones$2f$IANAZone$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__IANAZone$3e$__["IANAZone"].isValidZone(timezone);
}
function convertToTimezone(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to convertToTimezone');
    }
    if (!isValidTimezone(timezone)) {
        throw new Error(`Invalid timezone: ${timezone}`);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed, {
        zone: 'utc'
    }).setZone(timezone);
}
function convertToUTC(localDate, timezone) {
    const parsed = parseDate(localDate);
    if (!parsed) {
        throw new Error('Invalid date provided to convertToUTC');
    }
    if (!isValidTimezone(timezone)) {
        throw new Error(`Invalid timezone: ${timezone}`);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed, {
        zone: timezone
    }).toUTC().toJSDate();
}
function getLocalHour(utcDate, timezone) {
    const dt = convertToTimezone(utcDate, timezone);
    return dt.hour;
}
function formatForUI(date, format = 'short', timezone) {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid date';
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    switch(format){
        case 'short':
            return dt.toLocaleString({
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        case 'long':
            return dt.toLocaleString({
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        case 'time':
            return dt.toLocaleString(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].TIME_SIMPLE);
        case 'datetime':
            return dt.toLocaleString(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].DATETIME_MED);
        case 'relative':
            return formatRelative(parsed);
        default:
            return dt.toLocaleString({
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
    }
}
function formatRelative(date) {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid date';
    const dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    const nowDt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].now();
    const diff = dt.diff(nowDt, [
        'years',
        'months',
        'days',
        'hours',
        'minutes'
    ]).toObject();
    // Future dates
    if (dt > nowDt) {
        if (Math.abs(diff.years || 0) >= 1) {
            return `in ${Math.round(Math.abs(diff.years || 0))} year${Math.abs(diff.years || 0) !== 1 ? 's' : ''}`;
        }
        if (Math.abs(diff.months || 0) >= 1) {
            return `in ${Math.round(Math.abs(diff.months || 0))} month${Math.abs(diff.months || 0) !== 1 ? 's' : ''}`;
        }
        if (Math.abs(diff.days || 0) >= 1) {
            return `in ${Math.round(Math.abs(diff.days || 0))} day${Math.abs(diff.days || 0) !== 1 ? 's' : ''}`;
        }
        if (Math.abs(diff.hours || 0) >= 1) {
            return `in ${Math.round(Math.abs(diff.hours || 0))} hour${Math.abs(diff.hours || 0) !== 1 ? 's' : ''}`;
        }
        return `in ${Math.round(Math.abs(diff.minutes || 0))} minute${Math.abs(diff.minutes || 0) !== 1 ? 's' : ''}`;
    }
    // Past dates
    if (Math.abs(diff.years || 0) >= 1) {
        return `${Math.round(Math.abs(diff.years || 0))} year${Math.abs(diff.years || 0) !== 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diff.months || 0) >= 1) {
        return `${Math.round(Math.abs(diff.months || 0))} month${Math.abs(diff.months || 0) !== 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diff.days || 0) >= 1) {
        return `${Math.round(Math.abs(diff.days || 0))} day${Math.abs(diff.days || 0) !== 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diff.hours || 0) >= 1) {
        return `${Math.round(Math.abs(diff.hours || 0))} hour${Math.abs(diff.hours || 0) !== 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diff.minutes || 0) >= 1) {
        return `${Math.round(Math.abs(diff.minutes || 0))} minute${Math.abs(diff.minutes || 0) !== 1 ? 's' : ''} ago`;
    }
    return 'just now';
}
function formatForAI(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid date';
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.toLocaleString({
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}
function formatForAICustom(date, timezone, options = {}) {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid date';
    const { includeDay = true, includeYear = true } = options;
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    const formatOptions = {
        month: 'long',
        day: 'numeric'
    };
    if (includeDay) {
        formatOptions.weekday = 'long';
    }
    if (includeYear) {
        formatOptions.year = 'numeric';
    }
    return dt.toLocaleString(formatOptions);
}
function formatForAPI(date) {
    const parsed = parseDate(date);
    if (!parsed) return null;
    return parsed.toISOString();
}
function formatForDatabase(date) {
    return parseDate(date);
}
function isValidDate(value) {
    const parsed = parseDate(value);
    return parsed !== null;
}
function isSameDay(date1, date2, timezone) {
    const parsed1 = parseDate(date1);
    const parsed2 = parseDate(date2);
    if (!parsed1 || !parsed2) return false;
    let dt1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed1);
    let dt2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed2);
    if (timezone && isValidTimezone(timezone)) {
        dt1 = dt1.setZone(timezone);
        dt2 = dt2.setZone(timezone);
    }
    return dt1.hasSame(dt2, 'day');
}
function isToday(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) return false;
    const nowDt = now(timezone);
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.hasSame(nowDt, 'day');
}
function isPast(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) return false;
    const nowDt = now(timezone);
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt < nowDt;
}
function isFuture(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) return false;
    const nowDt = now(timezone);
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt > nowDt;
}
function diffInDays(date1, date2) {
    const parsed1 = parseDate(date1);
    const parsed2 = parseDate(date2);
    if (!parsed1 || !parsed2) return 0;
    const dt1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed1);
    const dt2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed2);
    return Math.round(dt1.diff(dt2, 'days').days);
}
function addDays(date, days, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to addDays');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.plus({
        days
    }).toJSDate();
}
function subtractDays(date, days, timezone) {
    return addDays(date, -days, timezone);
}
function getDayOfWeek(date, timezone) {
    let dt;
    if (date === undefined) {
        // Use current date/time in the specified timezone
        dt = now(timezone);
    } else {
        const parsed = parseDate(date);
        if (!parsed) {
            throw new Error('Invalid date provided to getDayOfWeek');
        }
        dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
        if (timezone && isValidTimezone(timezone)) {
            dt = dt.setZone(timezone);
        }
    }
    // Luxon weekday is 1-7 (Monday-Sunday), DAY_NAMES is 0-indexed (Monday-Sunday)
    return DAY_NAMES[dt.weekday - 1];
}
function getWeekday(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to getWeekday');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.weekday; // 1=Monday, 7=Sunday
}
function isWeekdayInTimezone(utcDate, timezone, weekday) {
    if (!isValidTimezone(timezone)) {
        throw new Error(`Invalid timezone: ${timezone}`);
    }
    if (weekday < 1 || weekday > 7) {
        throw new Error(`Invalid weekday: ${weekday}. Must be 1-7 (1=Monday, 7=Sunday)`);
    }
    const parsed = parseDate(utcDate);
    if (!parsed) {
        throw new Error('Invalid date provided to isWeekdayInTimezone');
    }
    const dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed, {
        zone: 'utc'
    }).setZone(timezone);
    return dt.weekday === weekday;
}
function getTimezonesAtLocalTime(utcDate, targetLocalHour, weekday) {
    const parsed = parseDate(utcDate);
    if (!parsed) {
        throw new Error('Invalid date provided to getTimezonesAtLocalTime');
    }
    if (targetLocalHour < 0 || targetLocalHour > 23) {
        throw new Error(`Invalid target hour: ${targetLocalHour}. Must be 0-23`);
    }
    if (weekday !== undefined && (weekday < 1 || weekday > 7)) {
        throw new Error(`Invalid weekday: ${weekday}. Must be 1-7 (1=Monday, 7=Sunday)`);
    }
    const matchingTimezones = [];
    // Get all IANA timezones (browser/Node.js built-in)
    const allTimezones = Intl.supportedValuesOf('timeZone');
    for (const timezone of allTimezones){
        try {
            // Check if this timezone is at the target local hour
            const localHour = getLocalHour(parsed, timezone);
            if (localHour !== targetLocalHour) {
                continue;
            }
            // If weekday is specified, check if it matches
            if (weekday !== undefined) {
                const isMatchingWeekday = isWeekdayInTimezone(parsed, timezone, weekday);
                if (!isMatchingWeekday) {
                    continue;
                }
            }
            matchingTimezones.push(timezone);
        } catch  {
            continue;
        }
    }
    return matchingTimezones;
}
function startOfWeek(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to startOfWeek');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.startOf('week').toJSDate();
}
function endOfWeek(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to endOfWeek');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.endOf('week').toJSDate();
}
function addWeeks(date, weeks, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to addWeeks');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.plus({
        weeks
    }).toJSDate();
}
function subtractWeeks(date, weeks, timezone) {
    return addWeeks(date, -weeks, timezone);
}
function getNextWeekStart(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to getNextWeekStart');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.plus({
        weeks: 1
    }).startOf('week').toJSDate();
}
function diffInWeeks(date1, date2, timezone) {
    const parsed1 = parseDate(date1);
    const parsed2 = parseDate(date2);
    if (!parsed1 || !parsed2) return 0;
    let dt1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed1);
    let dt2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed2);
    if (timezone && isValidTimezone(timezone)) {
        dt1 = dt1.setZone(timezone);
        dt2 = dt2.setZone(timezone);
    }
    return Math.floor(dt1.diff(dt2, 'weeks').weeks);
}
function getDayOfWeekName(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to getDayOfWeekName');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.toFormat('EEEE');
}
function toISODate(date, timezone) {
    const parsed = parseDate(date);
    if (!parsed) {
        throw new Error('Invalid date provided to toISODate');
    }
    let dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(parsed);
    if (timezone && isValidTimezone(timezone)) {
        dt = dt.setZone(timezone);
    }
    return dt.toISODate() || '';
}
function formatDate(date, options) {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid date';
    return parsed.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        ...options
    });
}
}),
"[project]/packages/shared/src/server/utils/timezone.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Timezone utilities for handling IANA timezone validation and conversions
 */ __turbopack_context__.s([
    "COMMON_TIMEZONES",
    ()=>COMMON_TIMEZONES,
    "convertPreferredHourToUTC",
    ()=>convertPreferredHourToUTC,
    "formatTimezoneForDisplay",
    ()=>formatTimezoneForDisplay,
    "getAllUTCHoursForLocalHour",
    ()=>getAllUTCHoursForLocalHour,
    "getCommonTimezones",
    ()=>getCommonTimezones,
    "getLocalHourForTimezone",
    ()=>getLocalHourForTimezone,
    "isValidIANATimezone",
    ()=>isValidIANATimezone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$luxon$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/luxon.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/datetime.js [app-route] (ecmascript) <export default as DateTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$zones$2f$IANAZone$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__IANAZone$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/zones/IANAZone.js [app-route] (ecmascript) <export default as IANAZone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
const COMMON_TIMEZONES = [
    // Americas
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Moscow',
    // Asia Pacific
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Seoul',
    'Asia/Mumbai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland'
];
function isValidIANATimezone(timezone) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$zones$2f$IANAZone$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__IANAZone$3e$__["IANAZone"].isValidZone(timezone);
}
function getLocalHourForTimezone(utcDate, timezone) {
    if (!isValidIANATimezone(timezone)) {
        throw new Error(`Invalid IANA timezone: ${timezone}`);
    }
    const dt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromJSDate(utcDate, {
        zone: 'utc'
    }).setZone(timezone);
    return dt.hour;
}
function convertPreferredHourToUTC(localHour, timezone) {
    if (!isValidIANATimezone(timezone)) {
        throw new Error(`Invalid IANA timezone: ${timezone}`);
    }
    if (localHour < 0 || localHour > 23) {
        throw new Error(`Invalid hour: ${localHour}. Must be between 0 and 23`);
    }
    // Get current date in the target timezone
    const nowDt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(timezone);
    // Set to the desired local hour
    const targetTime = nowDt.set({
        hour: localHour,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    // Convert to UTC and get the hour
    const utcTime = targetTime.setZone('utc');
    return utcTime.hour;
}
function getAllUTCHoursForLocalHour(localHour, timezone) {
    if (!isValidIANATimezone(timezone)) {
        throw new Error(`Invalid IANA timezone: ${timezone}`);
    }
    const hours = new Set();
    const nowDt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])();
    // Check for the next 365 days to cover all DST transitions
    for(let i = 0; i < 365; i++){
        const date = nowDt.plus({
            days: i
        }).setZone(timezone);
        const targetTime = date.set({
            hour: localHour,
            minute: 0,
            second: 0,
            millisecond: 0
        });
        const utcTime = targetTime.setZone('utc');
        hours.add(utcTime.hour);
    }
    return Array.from(hours).sort((a, b)=>a - b);
}
function formatTimezoneForDisplay(timezone) {
    if (!isValidIANATimezone(timezone)) {
        return timezone;
    }
    try {
        const nowDt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(timezone);
        const offset = nowDt.toFormat('ZZZ'); // e.g., "EST" or "-05:00"
        // Extract city name from timezone
        const parts = timezone.split('/');
        const city = parts[parts.length - 1].replace(/_/g, ' ');
        return `${city} (${offset})`;
    } catch  {
        return timezone;
    }
}
function getCommonTimezones() {
    return COMMON_TIMEZONES;
}
}),
"[project]/packages/shared/src/server/repositories/userRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserRepository",
    ()=>UserRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/user.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/timezone.ts [app-route] (ecmascript)");
;
;
;
class UserRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    async list(params) {
        const { q, createdFrom, createdTo, page = 1, pageSize = 20, sort = 'createdAt:desc' } = params;
        const [sortField, sortDir] = sort.split(':');
        let query = this.db.selectFrom('users').selectAll('users');
        if (q) {
            const like = `%${q}%`;
            query = query.where((eb)=>eb.or([
                    eb('users.name', 'ilike', like),
                    eb('users.email', 'ilike', like),
                    eb('users.phoneNumber', 'ilike', like)
                ]));
        }
        if (createdFrom) {
            query = query.where('users.createdAt', '>=', new Date(createdFrom));
        }
        if (createdTo) {
            query = query.where('users.createdAt', '<=', new Date(createdTo));
        }
        // hasProfile filter checks for existence in profiles table
        if (params.hasProfile === true) {
            query = query.where((eb)=>eb.exists(eb.selectFrom('profiles').whereRef('profiles.clientId', '=', 'users.id').select('profiles.id')));
        } else if (params.hasProfile === false) {
            query = query.where((eb)=>eb.not(eb.exists(eb.selectFrom('profiles').whereRef('profiles.clientId', '=', 'users.id').select('profiles.id'))));
        }
        let countBuilder = this.db.selectFrom('users');
        if (q) {
            const like = `%${q}%`;
            countBuilder = countBuilder.where((eb)=>eb.or([
                    eb('users.name', 'ilike', like),
                    eb('users.email', 'ilike', like),
                    eb('users.phoneNumber', 'ilike', like)
                ]));
        }
        if (createdFrom) countBuilder = countBuilder.where('users.createdAt', '>=', new Date(createdFrom));
        if (createdTo) countBuilder = countBuilder.where('users.createdAt', '<=', new Date(createdTo));
        // hasProfile filter checks for existence in profiles table
        if (params.hasProfile === true) {
            countBuilder = countBuilder.where((eb)=>eb.exists(eb.selectFrom('profiles').whereRef('profiles.clientId', '=', 'users.id').select('profiles.id')));
        } else if (params.hasProfile === false) {
            countBuilder = countBuilder.where((eb)=>eb.not(eb.exists(eb.selectFrom('profiles').whereRef('profiles.clientId', '=', 'users.id').select('profiles.id'))));
        }
        const totalResult = await countBuilder.select((eb)=>eb.fn.countAll().as('count')).executeTakeFirst();
        const total = Number(totalResult?.count || 0);
        const usersRows = await query// @ts-expect-error dynamic orderBy
        .orderBy(`users.${sortField}`, sortDir === 'asc' ? 'asc' : 'desc').offset((page - 1) * pageSize).limit(pageSize).execute();
        const users = usersRows.map((u)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(u)).filter((u)=>u !== undefined);
        return {
            users,
            total
        };
    }
    async create(userData) {
        const user = await this.db.insertInto('users').values({
            name: userData.name,
            phoneNumber: userData.phoneNumber,
            age: userData.age || null,
            gender: userData.gender || null,
            email: userData.email || null,
            stripeCustomerId: userData.stripeCustomerId || null,
            timezone: userData.timezone,
            preferredSendHour: userData.preferredSendHour,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returningAll().executeTakeFirstOrThrow();
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(user);
    }
    async findById(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.selectFrom('users').where('id', '=', id).selectAll().executeTakeFirst());
    }
    async findByPhoneNumber(phoneNumber) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.selectFrom('users').where('phoneNumber', '=', phoneNumber).selectAll().executeTakeFirst());
    }
    async findByEmail(email) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.selectFrom('users').where('email', '=', email).selectAll().executeTakeFirst());
    }
    async findByStripeCustomerId(stripeCustomerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.selectFrom('users').where('stripeCustomerId', '=', stripeCustomerId).selectAll().executeTakeFirst());
    }
    async update(id, userData) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.updateTable('users').set({
            ...userData,
            updatedAt: new Date()
        }).where('id', '=', id).returningAll().executeTakeFirst());
    }
    /**
   * Find user with latest profile
   * Performs LEFT JOIN with profiles table to get most recent profile
   */ async findWithProfile(userId) {
        const result = await this.db.selectFrom('users').leftJoin('profiles', (join)=>join.onRef('profiles.clientId', '=', 'users.id').on((eb)=>{
                // Only join the most recent profile for this user
                const subquery = eb.selectFrom('profiles as p2').select((eb)=>eb.fn.max('p2.createdAt').as('maxCreated')).whereRef('p2.clientId', '=', 'users.id');
                return eb('profiles.createdAt', '=', subquery);
            })).selectAll('users').select('profiles.profile').where('users.id', '=', userId).executeTakeFirst();
        if (!result) {
            return undefined;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDbWithProfile(result);
    }
    async updatePreferences(userId, preferences) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.updateTable('users').set({
            ...preferences,
            updatedAt: new Date()
        }).where('id', '=', userId).returningAll().executeTakeFirstOrThrow());
    }
    async findUsersForHour(currentUtcHour) {
        // This query finds all users with active subscriptions whose local hour is at or past their preferred send hour
        // Only users with status='active' receive messages (excludes 'cancel_pending' and 'canceled')
        // Note: This returns candidates - the caller should also filter by workout existence to avoid duplicates
        const users = await this.db.selectFrom('users').innerJoin('subscriptions', 'users.id', 'subscriptions.clientId').where('subscriptions.status', '=', 'active').selectAll('users').execute();
        // Filter users whose local hour is at or past their preferred send hour
        const matchingUsers = [];
        const currentUtcDate = new Date();
        currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);
        for (const user of users){
            try {
                const localHour = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalHourForTimezone"])(currentUtcDate, user.timezone);
                if (localHour >= user.preferredSendHour) {
                    matchingUsers.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(user));
                }
            } catch (error) {
                console.error(`Error processing user ${user.id} timezone:`, error);
            // Skip users with invalid timezone data
            }
        }
        return matchingUsers;
    }
    async findUsersByTimezones(timezones) {
        // Return empty array if no timezones provided
        if (timezones.length === 0) {
            return [];
        }
        // Query users with active subscriptions in the specified timezones
        // Only users with status='active' receive messages (excludes 'cancel_pending' and 'canceled')
        const users = await this.db.selectFrom('users').innerJoin('subscriptions', 'users.id', 'subscriptions.clientId').where('subscriptions.status', '=', 'active').where('timezone', 'in', timezones).selectAll('users').execute();
        return users.map((u)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(u)).filter((u)=>u !== undefined);
    }
    async findActiveUsersWithPreferences() {
        return await this.db.selectFrom('users').innerJoin('subscriptions', 'users.id', 'subscriptions.clientId').where('subscriptions.status', '=', 'active').selectAll('users').execute();
    }
    async delete(id) {
        // First, clean up admin_activity_logs which has no FK constraint
        // Delete where user is the target or the actor
        await this.db.deleteFrom('adminActivityLogs').where((eb)=>eb.or([
                eb('targetClientId', '=', id),
                eb('actorClientId', '=', id)
            ])).execute();
        // Now delete the user - CASCADE will handle all other related tables:
        // profile_updates, subscriptions, conversations, messages, fitness_plans,
        // microcycles, workout_instances, user_onboarding, profiles, short_links, message_queues
        const result = await this.db.deleteFrom('users').where('id', '=', id).executeTakeFirst();
        return Number(result.numDeletedRows) > 0;
    }
    // ============================================
    // Referral Code Methods
    // ============================================
    /**
   * Generate a random 6-character referral code
   * Uses uppercase letters and numbers, excluding confusing characters (O/0, I/1, L)
   */ generateReferralCode() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        for(let i = 0; i < 6; i++){
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    /**
   * Get or create a referral code for a user
   * If the user already has a code, returns it; otherwise generates and saves a new one
   */ async getOrCreateReferralCode(userId) {
        // First check if user already has a code
        const user = await this.db.selectFrom('users').select([
            'id',
            'referralCode'
        ]).where('id', '=', userId).executeTakeFirst();
        if (!user) {
            return null;
        }
        if (user.referralCode) {
            return user.referralCode;
        }
        // Generate a new code with retry logic for uniqueness
        let attempts = 0;
        const maxAttempts = 10;
        while(attempts < maxAttempts){
            const newCode = this.generateReferralCode();
            try {
                const updated = await this.db.updateTable('users').set({
                    referralCode: newCode,
                    updatedAt: new Date()
                }).where('id', '=', userId).where('referralCode', 'is', null) // Only update if still null (race condition protection)
                .returningAll().executeTakeFirst();
                if (updated) {
                    return newCode;
                }
                // If no rows updated, the user might have gotten a code from another request
                const refreshedUser = await this.db.selectFrom('users').select('referralCode').where('id', '=', userId).executeTakeFirst();
                if (refreshedUser?.referralCode) {
                    return refreshedUser.referralCode;
                }
            } catch (error) {
                // Unique constraint violation - try again with a new code
                attempts++;
                if (attempts >= maxAttempts) {
                    console.error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
                    throw error;
                }
            }
        }
        return null;
    }
    /**
   * Find a user by their referral code
   * Used to validate referral codes during signup
   */ async findByReferralCode(code) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].fromDb(await this.db.selectFrom('users').where('referralCode', '=', code.toUpperCase()).selectAll().executeTakeFirst());
    }
}
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
            publicBaseUrl: ("TURBOPACK compile-time value", "http://localhost:3000")
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
            NEXT_PUBLIC_BASE_URL: ("TURBOPACK compile-time value", "http://localhost:3000"),
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
"[project]/packages/shared/src/server/models/referral.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Referral Model
 *
 * Represents a referral relationship between two users.
 * Tracks when a user signs up via another user's referral link
 * and whether the referrer has been credited.
 */ __turbopack_context__.s([
    "MAX_REFERRAL_CREDITS",
    ()=>MAX_REFERRAL_CREDITS,
    "REFERRAL_CREDIT_AMOUNT_CENTS",
    ()=>REFERRAL_CREDIT_AMOUNT_CENTS
]);
const MAX_REFERRAL_CREDITS = 12;
const REFERRAL_CREDIT_AMOUNT_CENTS = 1999;
}),
"[project]/packages/shared/src/server/services/referral/referralService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferralService",
    ()=>ReferralService,
    "referralService",
    ()=>referralService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$14$2e$25$2e$0$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/stripe@14.25.0/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$referralRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/referralRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/userRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/referral.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const { secretKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStripeSecrets"])();
const stripe = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$14$2e$25$2e$0$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](secretKey, {
    apiVersion: '2023-10-16'
});
// Stripe coupon ID for referee's first month free
const REFERRAL_COUPON_ID = 'REFERRAL_FREE_MONTH';
class ReferralService {
    static instance;
    referralRepo;
    userRepo;
    constructor(){
        this.referralRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$referralRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReferralRepository"]();
        this.userRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRepository"]();
    }
    static getInstance() {
        if (!ReferralService.instance) {
            ReferralService.instance = new ReferralService();
        }
        return ReferralService.instance;
    }
    /**
   * Get or create a user's referral code
   */ async getOrCreateReferralCode(userId) {
        return this.userRepo.getOrCreateReferralCode(userId);
    }
    /**
   * Get referral stats for displaying on the /me page
   */ async getReferralStats(userId) {
        const referralCode = await this.userRepo.getOrCreateReferralCode(userId);
        if (!referralCode) {
            return null;
        }
        const { publicBaseUrl, baseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUrlsConfig"])();
        const resolvedBaseUrl = publicBaseUrl || baseUrl;
        const referralLink = `${resolvedBaseUrl}/r/${referralCode}`;
        const completedReferrals = await this.referralRepo.countByReferrer(userId);
        const creditsEarned = await this.referralRepo.countCreditsEarned(userId);
        const creditsRemaining = Math.max(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_REFERRAL_CREDITS"] - creditsEarned);
        return {
            referralCode,
            referralLink,
            completedReferrals,
            creditsEarned,
            creditsRemaining
        };
    }
    /**
   * Validate a referral code before signup
   * Checks that the code exists and prevents self-referral
   */ async validateReferralCode(code, signupPhone) {
        if (!code || code.length !== 6) {
            return {
                valid: false,
                error: 'Invalid referral code format'
            };
        }
        const referrer = await this.userRepo.findByReferralCode(code.toUpperCase());
        if (!referrer) {
            return {
                valid: false,
                error: 'Referral code not found'
            };
        }
        // Prevent self-referral
        if (signupPhone && referrer.phoneNumber === signupPhone) {
            return {
                valid: false,
                error: 'Cannot use your own referral code'
            };
        }
        return {
            valid: true,
            referrerId: referrer.id,
            referrerName: referrer.name
        };
    }
    /**
   * Complete a referral when a referee signs up
   * Creates the referral record in the database
   */ async completeReferral(referralCode, refereeUserId) {
        const referrer = await this.userRepo.findByReferralCode(referralCode.toUpperCase());
        if (!referrer) {
            console.error(`[ReferralService] Cannot complete referral: code ${referralCode} not found`);
            return;
        }
        // Check if referee has already been referred
        const alreadyReferred = await this.referralRepo.hasBeenReferred(refereeUserId);
        if (alreadyReferred) {
            console.log(`[ReferralService] User ${refereeUserId} has already been referred, skipping`);
            return;
        }
        await this.referralRepo.create(referrer.id, refereeUserId);
        console.log(`[ReferralService] Referral completed: ${referrer.id} -> ${refereeUserId}`);
    }
    /**
   * Apply credit to the referrer's Stripe account
   * Called by webhook when referee's payment succeeds
   */ async creditReferrer(refereeUserId) {
        // Find the referral for this referee
        const referral = await this.referralRepo.findByRefereeId(refereeUserId);
        if (!referral) {
            console.log(`[ReferralService] No referral found for referee ${refereeUserId}`);
            return {
                success: true
            }; // Not an error, just no referral
        }
        // Check if credit already applied
        if (referral.creditApplied) {
            console.log(`[ReferralService] Credit already applied for referral ${referral.id}`);
            return {
                success: true
            };
        }
        // Check if referrer can still earn credits
        const creditsEarned = await this.referralRepo.countCreditsEarned(referral.referrerId);
        if (creditsEarned >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_REFERRAL_CREDITS"]) {
            console.log(`[ReferralService] Referrer ${referral.referrerId} has reached max credits (${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_REFERRAL_CREDITS"]})`);
            // Still mark the referral, but don't apply credit
            return {
                success: true
            };
        }
        // Get referrer's Stripe customer ID
        const referrer = await this.userRepo.findById(referral.referrerId);
        if (!referrer?.stripeCustomerId) {
            console.error(`[ReferralService] Referrer ${referral.referrerId} has no Stripe customer ID`);
            return {
                success: false,
                error: 'Referrer has no Stripe customer'
            };
        }
        try {
            // Create invoice credit in Stripe
            const credit = await stripe.customers.createBalanceTransaction(referrer.stripeCustomerId, {
                amount: -__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REFERRAL_CREDIT_AMOUNT_CENTS"],
                currency: 'usd',
                description: 'Referral credit - 1 free month'
            });
            // Mark referral as credited
            await this.referralRepo.markCreditApplied(referral.id, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REFERRAL_CREDIT_AMOUNT_CENTS"]);
            console.log(`[ReferralService] Applied $${(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REFERRAL_CREDIT_AMOUNT_CENTS"] / 100).toFixed(2)} credit to referrer ${referrer.id}`);
            return {
                success: true,
                creditId: credit.id
            };
        } catch (error) {
            console.error('[ReferralService] Failed to apply credit:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Get or create the Stripe coupon for referee's first month free
   */ async getRefereeCouponId() {
        try {
            // Try to retrieve existing coupon
            await stripe.coupons.retrieve(REFERRAL_COUPON_ID);
            return REFERRAL_COUPON_ID;
        } catch  {
            // Create if doesn't exist
            await stripe.coupons.create({
                id: REFERRAL_COUPON_ID,
                amount_off: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REFERRAL_CREDIT_AMOUNT_CENTS"],
                currency: 'usd',
                duration: 'once',
                name: 'Referral - First Month Free'
            });
            console.log('[ReferralService] Created referral coupon in Stripe');
            return REFERRAL_COUPON_ID;
        }
    }
    /**
   * Check if a user can still earn referral credits
   */ async canEarnCredits(userId) {
        const creditsEarned = await this.referralRepo.countCreditsEarned(userId);
        return creditsEarned < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$referral$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_REFERRAL_CREDITS"];
    }
}
const referralService = ReferralService.getInstance();
}),
"[project]/packages/shared/src/server/utils/sessionCrypto.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptUserId",
    ()=>decryptUserId,
    "encryptUserId",
    ()=>encryptUserId,
    "generateEncryptionKey",
    ()=>generateEncryptionKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
;
;
/**
 * Session crypto utilities for encrypting and decrypting user IDs in session cookies
 * Uses AES-256-GCM for authenticated encryption
 */ const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits
/**
 * Get the encryption key from config
 * In production, this should be a strong random key stored securely
 */ function getEncryptionKey() {
    const { sessionEncryptionKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseSecrets"])();
    if (!sessionEncryptionKey) {
        // For development, use a default key (NOT for production!)
        console.warn('SESSION_ENCRYPTION_KEY not set, using development key');
        return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scryptSync('gymtext-dev-key', 'salt', KEY_LENGTH);
    }
    // If key is hex-encoded, decode it
    if (sessionEncryptionKey.length === KEY_LENGTH * 2) {
        return Buffer.from(sessionEncryptionKey, 'hex');
    }
    // Otherwise, derive key from string
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scryptSync(sessionEncryptionKey, 'salt', KEY_LENGTH);
}
function encryptUserId(userId) {
    try {
        const key = getEncryptionKey();
        const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(IV_LENGTH);
        const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(userId, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Combine IV + authTag + encrypted data
        const combined = Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, 'hex')
        ]);
        return combined.toString('base64');
    } catch (error) {
        console.error('Error encrypting user ID:', error);
        throw new Error('Failed to encrypt session');
    }
}
function decryptUserId(encryptedData) {
    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encryptedData, 'base64');
        // Extract IV, authTag, and encrypted data
        const iv = combined.subarray(0, IV_LENGTH);
        const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
        const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Error decrypting user ID:', error);
        return null;
    }
}
function generateEncryptionKey() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(KEY_LENGTH).toString('hex');
}
}),
"[project]/packages/shared/src/server/utils/authMiddleware.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkAuthorization",
    ()=>checkAuthorization,
    "getAuthenticatedUserId",
    ()=>getAuthenticatedUserId,
    "isAdminAuthenticated",
    ()=>isAdminAuthenticated
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$sessionCrypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/sessionCrypto.ts [app-route] (ecmascript)");
;
function checkAuthorization(request, requestedUserId) {
    // Check if user is admin
    const isAdmin = request.cookies.get('gt_admin')?.value === 'ok';
    if (isAdmin) {
        return {
            isAuthorized: true,
            isAdmin: true,
            userId: null
        };
    }
    // Check if user has a valid session
    const userSession = request.cookies.get('gt_user_session')?.value;
    if (!userSession) {
        return {
            isAuthorized: false,
            isAdmin: false,
            userId: null,
            error: 'No authentication credentials provided'
        };
    }
    // Decrypt the user ID from session
    const authenticatedUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$sessionCrypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptUserId"])(userSession);
    if (!authenticatedUserId) {
        return {
            isAuthorized: false,
            isAdmin: false,
            userId: null,
            error: 'Invalid session token'
        };
    }
    // Check if the authenticated user matches the requested user
    if (authenticatedUserId !== requestedUserId) {
        return {
            isAuthorized: false,
            isAdmin: false,
            userId: authenticatedUserId,
            error: 'Unauthorized to access this user data'
        };
    }
    return {
        isAuthorized: true,
        isAdmin: false,
        userId: authenticatedUserId
    };
}
function getAuthenticatedUserId(request) {
    const userSession = request.cookies.get('gt_user_session')?.value;
    if (!userSession) {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$sessionCrypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptUserId"])(userSession);
}
function isAdminAuthenticated(request) {
    const adminCookie = request.cookies.get('gt_admin')?.value;
    return adminCookie === 'ok';
}
}),
"[project]/apps/web/src/app/api/users/[id]/referral/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$referral$2f$referralService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/referral/referralService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$authMiddleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/authMiddleware.ts [app-route] (ecmascript)");
;
;
;
async function GET(request, { params }) {
    try {
        const { id: userId } = await params;
        // Check authorization
        const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$authMiddleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkAuthorization"])(request, userId);
        if (!auth.isAuthorized) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: auth.error || 'Unauthorized'
            }, {
                status: 403
            });
        }
        const stats = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$referral$2f$referralService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["referralService"].getReferralStats(userId);
        if (!stats) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'User not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ba25501b._.js.map