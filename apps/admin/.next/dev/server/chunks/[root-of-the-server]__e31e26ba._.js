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
"[project]/packages/shared/src/server/repositories/onboardingRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OnboardingRepository",
    ()=>OnboardingRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/raw-builder/sql.js [app-route] (ecmascript)");
;
;
class OnboardingRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create an onboarding record for a client
   */ async create(clientId, signupData) {
        const record = {
            clientId,
            signupData: signupData ? JSON.parse(JSON.stringify(signupData)) : null,
            status: 'pending',
            programMessagesSent: false
        };
        return await this.db.insertInto('userOnboarding').values(record).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Find onboarding record by client ID
   */ async findByClientId(clientId) {
        return await this.db.selectFrom('userOnboarding').selectAll().where('clientId', '=', clientId).executeTakeFirst() ?? null;
    }
    /**
   * Update onboarding status
   */ async updateStatus(clientId, status, errorMessage) {
        const update = {
            status,
            errorMessage: errorMessage ?? null
        };
        return await this.db.updateTable('userOnboarding').set(update).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Mark onboarding as started
   */ async markStarted(clientId) {
        return await this.db.updateTable('userOnboarding').set({
            status: 'in_progress',
            startedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`CURRENT_TIMESTAMP`
        }).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Update current step (for progress tracking)
   */ async updateCurrentStep(clientId, stepNumber) {
        return await this.db.updateTable('userOnboarding').set({
            currentStep: stepNumber
        }).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Mark onboarding as completed
   */ async markCompleted(clientId) {
        return await this.db.updateTable('userOnboarding').set({
            status: 'completed',
            completedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`CURRENT_TIMESTAMP`
        }).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Mark final program messages as sent
   */ async markMessagesSent(clientId) {
        return await this.db.updateTable('userOnboarding').set({
            programMessagesSent: true
        }).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Check if messages have been sent
   */ async hasMessagesSent(clientId) {
        const result = await this.db.selectFrom('userOnboarding').select('programMessagesSent').where('clientId', '=', clientId).executeTakeFirst();
        return result?.programMessagesSent ?? false;
    }
    /**
   * Get signup data
   */ async getSignupData(clientId) {
        const result = await this.db.selectFrom('userOnboarding').select('signupData').where('clientId', '=', clientId).executeTakeFirst();
        return result?.signupData ?? null;
    }
    /**
   * Clear signup data (cleanup after profile creation)
   */ async clearSignupData(clientId) {
        return await this.db.updateTable('userOnboarding').set({
            signupData: null
        }).where('clientId', '=', clientId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Delete onboarding record (full cleanup)
   */ async delete(clientId) {
        await this.db.deleteFrom('userOnboarding').where('clientId', '=', clientId).execute();
    }
}
}),
"[project]/packages/shared/src/server/utils/circuitBreaker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CircuitBreaker",
    ()=>CircuitBreaker,
    "CircuitState",
    ()=>CircuitState
]);
var CircuitState = /*#__PURE__*/ function(CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
    return CircuitState;
}({});
class CircuitBreaker {
    state = "CLOSED";
    failureCount = 0;
    successCount = 0;
    lastFailureTime = null;
    options;
    constructor(options = {}){
        this.options = {
            failureThreshold: options.failureThreshold || 5,
            resetTimeout: options.resetTimeout || 60000,
            monitoringPeriod: options.monitoringPeriod || 60000 // 60 seconds
        };
    }
    async execute(fn) {
        if (this.state === "OPEN") {
            if (this.shouldAttemptReset()) {
                this.state = "HALF_OPEN";
            } else {
                console.warn('Circuit breaker is OPEN, skipping execution');
                return null;
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === "HALF_OPEN") {
            this.successCount++;
            if (this.successCount >= 3) {
                this.state = "CLOSED";
                this.successCount = 0;
                console.info('Circuit breaker is now CLOSED');
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === "HALF_OPEN") {
            this.state = "OPEN";
            console.warn('Circuit breaker is now OPEN due to failure in HALF_OPEN state');
        } else if (this.failureCount >= this.options.failureThreshold) {
            this.state = "OPEN";
            console.warn(`Circuit breaker is now OPEN after ${this.failureCount} failures`);
        }
    }
    shouldAttemptReset() {
        return this.lastFailureTime !== null && Date.now() - this.lastFailureTime >= this.options.resetTimeout;
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}
}),
"[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserService",
    ()=>UserService,
    "userService",
    ()=>userService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/user.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/userRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/onboardingRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
;
;
class UserService {
    static instance;
    userRepository;
    onboardingRepository;
    circuitBreaker;
    constructor(){
        this.userRepository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRepository"]();
        this.onboardingRepository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OnboardingRepository"]();
        this.circuitBreaker = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CircuitBreaker"]({
            failureThreshold: 5,
            resetTimeout: 60000,
            monitoringPeriod: 60000 // 1 minute
        });
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    async createUser(request) {
        const result = await this.circuitBreaker.execute(async ()=>{
            // Check if user already exists using repository
            const existingUser = await this.userRepository.findByPhoneNumber(request.phoneNumber);
            if (existingUser) {
                throw new Error('User already exists with this phone number');
            }
            // Prepare user data
            const userData = {
                name: request.name,
                phoneNumber: request.phoneNumber,
                age: request.age || null,
                gender: request.gender || null,
                timezone: request.timezone,
                preferredSendHour: request.preferredSendHour,
                email: request.email || null,
                stripeCustomerId: request.stripeCustomerId || null
            };
            // Validate user data using domain model
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].validateUserData(userData);
            // Create the user using repository
            const user = await this.userRepository.create(userData);
            if (!user) {
                throw new Error('Failed to create user');
            }
            return user;
        });
        if (!result) {
            throw new Error('Failed to create user');
        }
        return result;
    }
    async getUserById(id) {
        const result = await this.circuitBreaker.execute(async ()=>{
            return await this.userRepository.findById(id);
        });
        return result || undefined;
    }
    async getUserByPhone(phoneNumber) {
        const result = await this.circuitBreaker.execute(async ()=>{
            return await this.userRepository.findByPhoneNumber(phoneNumber);
        });
        return result || undefined;
    }
    async getUser(userId) {
        return await this.circuitBreaker.execute(async ()=>{
            return await this.userRepository.findWithProfile(userId);
        });
    }
    async getUsersForHour(currentUtcHour) {
        const result = await this.circuitBreaker.execute(async ()=>{
            return await this.userRepository.findUsersForHour(currentUtcHour);
        });
        return result || [];
    }
    async getUsersForWeeklyMessage(currentUtcHour) {
        const result = await this.circuitBreaker.execute(async ()=>{
            // Business logic: Weekly messages are sent at 5pm on Sundays
            const targetLocalHour = 17; // 5pm
            const sunday = 7; // Luxon weekday (7 = Sunday)
            // Calculate current UTC date
            const currentUtcDate = new Date();
            currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);
            // Get all timezones that are currently at 5pm on Sunday
            const matchingTimezones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTimezonesAtLocalTime"])(currentUtcDate, targetLocalHour, sunday);
            // Query users in those timezones
            return await this.userRepository.findUsersByTimezones(matchingTimezones);
        });
        return result || [];
    }
    async updateUser(id, updates) {
        const result = await this.circuitBreaker.execute(async ()=>{
            // Validate updates using domain model
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UserModel"].validateUserUpdates(updates);
            // Update using repository
            return await this.userRepository.update(id, updates);
        });
        if (!result) {
            throw new Error('Failed to update user');
        }
        return result;
    }
    async updatePreferences(userId, preferences) {
        const result = await this.circuitBreaker.execute(async ()=>{
            return await this.userRepository.updatePreferences(userId, preferences);
        });
        if (!result) {
            throw new Error('Failed to update preferences');
        }
        return result;
    }
    // Admin-specific methods
    async listUsersForAdmin(filters) {
        const result = await this.circuitBreaker.execute(async ()=>{
            const { page = 1, pageSize = 20, sort = {
                field: 'createdAt',
                direction: 'desc'
            }, ...restFilters } = filters;
            // Convert admin filters to repository filters
            const repoParams = {
                q: restFilters.search,
                hasProfile: restFilters.hasProfile,
                createdFrom: restFilters.createdAfter,
                createdTo: restFilters.createdBefore,
                page,
                pageSize,
                sort: `${sort.field}:${sort.direction}`
            };
            const { users, total } = await this.userRepository.list(repoParams);
            // Transform users to AdminUser format
            const adminUsers = users.map((user)=>this.transformToAdminUser(user));
            // Calculate stats
            const stats = await this.calculateUserStats();
            const pagination = {
                page,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            };
            return {
                users: adminUsers,
                pagination,
                stats
            };
        });
        if (!result) {
            throw new Error('Failed to fetch users');
        }
        return result;
    }
    async getUserForAdmin(id) {
        const result = await this.circuitBreaker.execute(async ()=>{
            const user = await this.userRepository.findWithProfile(id);
            if (!user) {
                throw new Error('User not found');
            }
            const adminUser = this.transformToAdminUser(user);
            // Fetch signup data from onboarding
            const signupData = await this.onboardingRepository.getSignupData(id);
            return {
                user: adminUser,
                profile: user.profile || null,
                signupData,
                recentActivity: {
                    totalMessages: 0,
                    totalWorkouts: 0
                }
            };
        });
        if (!result) {
            throw new Error('Failed to fetch user');
        }
        return result;
    }
    async deleteUser(id) {
        const result = await this.circuitBreaker.execute(async ()=>{
            // Verify user exists first
            const user = await this.userRepository.findById(id);
            if (!user) {
                return false;
            }
            // Delete user and all cascaded data
            return await this.userRepository.delete(id);
        });
        return result || false;
    }
    transformToAdminUser(user) {
        const hasProfile = Boolean(user.profile);
        return {
            ...user,
            hasProfile,
            profileSummary: undefined,
            stats: {
                totalWorkouts: 0,
                isActiveToday: false
            }
        };
    }
    async calculateUserStats() {
        // Get basic counts from repository
        const allUsersResult = await this.userRepository.list({
            pageSize: 1000
        });
        const users = allUsersResult.users;
        const totalUsers = users.length;
        const withEmail = users.filter((u)=>u.email).length;
        // Count users with profiles by checking profile
        const withProfile = users.filter((u)=>u.profile).length;
        const activeToday = 0; // TODO: Implement active user tracking
        return {
            totalUsers,
            withEmail,
            withProfile,
            activeToday
        };
    }
}
const userService = UserService.getInstance();
}),
"[project]/packages/shared/src/shared/types/plan/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlanScheduleTemplateSchema",
    ()=>PlanScheduleTemplateSchema,
    "PlanStructureSchema",
    ()=>PlanStructureSchema,
    "_FitnessPlanSchema",
    ()=>_FitnessPlanSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const PlanScheduleTemplateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    focus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    rationale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('')
})).describe("The ideal/default weekly rhythm");
const PlanStructureSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. 'Strength + Lean Build Phase'"),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. 'Powerbuilding'").default(''),
    // Core Strategy
    coreStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    // How You Progress
    progressionStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).default([]),
    // When We Adjust
    adjustmentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    // Conditioning Guidelines
    conditioning: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).default([]),
    // Schedule
    scheduleTemplate: PlanScheduleTemplateSchema.default([]),
    // Metadata
    durationWeeks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().default(-1),
    frequencyPerWeek: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().default(-1)
});
const _FitnessPlanSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string({
        description: "Structured text fitness plan containing split, frequency, deload rules, goals, and progression principles"
    }),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string({
        description: "Brief summary of the fitness plan for SMS messages"
    }).nullish()
});
}),
"[project]/packages/shared/src/shared/types/plan/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/plan/schema.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/shared/src/server/models/fitnessPlan.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FitnessPlanModel",
    ()=>FitnessPlanModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/plan/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/plan/schema.ts [app-route] (ecmascript)");
;
;
class FitnessPlanModel {
    id;
    clientId;
    description;
    message;
    structured;
    startDate;
    createdAt;
    updatedAt;
    constructor(id, clientId, description, message, structured, startDate, createdAt, updatedAt){
        this.id = id;
        this.clientId = clientId;
        this.description = description;
        this.message = message;
        this.structured = structured;
        this.startDate = startDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromDB(fitnessPlan) {
        return {
            id: fitnessPlan.id,
            clientId: fitnessPlan.clientId,
            description: fitnessPlan.description || '',
            message: fitnessPlan.message,
            structured: fitnessPlan.structured,
            startDate: new Date(fitnessPlan.startDate),
            createdAt: new Date(fitnessPlan.createdAt),
            updatedAt: new Date(fitnessPlan.updatedAt)
        };
    }
    static fromFitnessPlanOverview(user, fitnessPlanOverview) {
        return {
            clientId: user.id,
            description: fitnessPlanOverview.description,
            message: fitnessPlanOverview.message || null,
            structured: fitnessPlanOverview.structure || null,
            startDate: new Date()
        };
    }
    static schema = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_FitnessPlanSchema"];
}
}),
"[project]/packages/shared/src/server/repositories/fitnessPlanRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FitnessPlanRepository",
    ()=>FitnessPlanRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/fitnessPlan.ts [app-route] (ecmascript) <locals>");
;
;
class FitnessPlanRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Insert a new fitness plan
   */ async insertFitnessPlan(fitnessPlan) {
        const result = await this.db.insertInto('fitnessPlans').values({
            clientId: fitnessPlan.clientId,
            description: fitnessPlan.description,
            message: fitnessPlan.message,
            structured: fitnessPlan.structured ? JSON.stringify(fitnessPlan.structured) : null,
            startDate: fitnessPlan.startDate
        }).returningAll().executeTakeFirstOrThrow();
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromDB(result);
    }
    /**
   * Get a fitness plan by ID
   */ async getFitnessPlan(id) {
        const result = await this.db.selectFrom('fitnessPlans').selectAll().where('id', '=', id).executeTakeFirst();
        if (!result) return null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromDB(result);
    }
    /**
   * Get the current (latest) fitness plan for a user
   */ async getCurrentPlan(userId) {
        const result = await this.db.selectFrom('fitnessPlans').selectAll().where('clientId', '=', userId).orderBy('createdAt', 'desc').executeTakeFirst();
        if (!result) return null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromDB(result);
    }
    /**
   * Get all fitness plans for a user (for history)
   * Returns plans ordered by creation date (newest first)
   */ async getPlanHistory(userId) {
        const results = await this.db.selectFrom('fitnessPlans').selectAll().where('clientId', '=', userId).orderBy('createdAt', 'desc').execute();
        return results.map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromDB);
    }
    /**
   * Update a fitness plan
   */ async updateFitnessPlan(id, updates) {
        const updateData = {
            updatedAt: new Date()
        };
        if (updates.description !== undefined) {
            updateData.description = updates.description;
        }
        if (updates.message !== undefined) {
            updateData.message = updates.message;
        }
        if (updates.structured !== undefined) {
            updateData.structured = updates.structured ? JSON.stringify(updates.structured) : null;
        }
        const result = await this.db.updateTable('fitnessPlans').set(updateData).where('id', '=', id).returningAll().executeTakeFirst();
        if (!result) return null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromDB(result);
    }
    /**
   * Delete a fitness plan by ID
   */ async deleteFitnessPlan(id) {
        const result = await this.db.deleteFrom('fitnessPlans').where('id', '=', id).executeTakeFirst();
        return Number(result.numDeletedRows) > 0;
    }
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

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
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/promises [external] (node:stream/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/promises", () => require("node:stream/promises"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

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
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/packages/shared/src/server/agents/models.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initializeImageModel",
    ()=>initializeImageModel,
    "initializeModel",
    ()=>initializeModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$google$2d$genai$40$0$2e$2$2e$4_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$e_wqcmodl4fxa5duihavix7qq3bi$2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+google-genai@0.2.4_@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+e_wqcmodl4fxa5duihavix7qq3bi/node_modules/@langchain/google-genai/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$google$2d$genai$40$0$2e$2$2e$4_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$e_wqcmodl4fxa5duihavix7qq3bi$2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+google-genai@0.2.4_@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+e_wqcmodl4fxa5duihavix7qq3bi/node_modules/@langchain/google-genai/dist/chat_models.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$openai$40$0$2e$6$2e$13_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$export_2v4slvtfd4ogjzsvjyvualhfoi$2f$node_modules$2f40$langchain$2f$openai$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+openai@0.6.13_@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+export_2v4slvtfd4ogjzsvjyvualhfoi/node_modules/@langchain/openai/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$openai$40$0$2e$6$2e$13_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$export_2v4slvtfd4ogjzsvjyvualhfoi$2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+openai@0.6.13_@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+export_2v4slvtfd4ogjzsvjyvualhfoi/node_modules/@langchain/openai/dist/chat_models.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$genai$40$1$2e$31$2e$0$2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@google+genai@1.31.0/node_modules/@google/genai/dist/node/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
;
;
;
;
const initializeModel = (outputSchema, config, options)=>{
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 16000 } = config || {};
    if (model.startsWith('gemini')) {
        const llm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$google$2d$genai$40$0$2e$2$2e$4_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$e_wqcmodl4fxa5duihavix7qq3bi$2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatGoogleGenerativeAI"]({
            model: model,
            temperature,
            maxOutputTokens: maxTokens
        });
        if (options?.tools) {
            return llm.bindTools(options.tools);
        }
        if (outputSchema) {
            return llm.withStructuredOutput(outputSchema);
        }
        // When no schema provided, wrap LLM to auto-extract .content from AIMessage
        return {
            invoke: async (input)=>{
                const response = await llm.invoke(input);
                const content = typeof response.content === 'string' ? response.content : String(response.content);
                return content;
            }
        };
    } else {
        const llm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$openai$40$0$2e$6$2e$13_$40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$export_2v4slvtfd4ogjzsvjyvualhfoi$2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            model: model,
            temperature: model !== 'gpt-5-nano' ? temperature : 1,
            maxCompletionTokens: maxTokens,
            reasoningEffort: 'low'
        });
        if (options?.tools) {
            return llm.bindTools(options.tools);
        }
        if (outputSchema) {
            return llm.withStructuredOutput(outputSchema);
        }
        // When no schema provided, wrap LLM to auto-extract .content from AIMessage
        return {
            invoke: async (input)=>{
                const response = await llm.invoke(input);
                const content = typeof response.content === 'string' ? response.content : String(response.content);
                return content;
            }
        };
    }
};
const initializeImageModel = (config)=>{
    const { model = 'gemini-2.5-flash-image', aspectRatio = '3:4', imageSize = '2K' } = config || {};
    const { googleApiKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAiSecrets"])();
    const googleGenAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$genai$40$1$2e$31$2e$0$2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
        apiKey: googleApiKey
    });
    return {
        invoke: async (prompt)=>{
            const response = await googleGenAI.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseModalities: [
                        "TEXT",
                        "IMAGE"
                    ],
                    imageConfig: {
                        aspectRatio,
                        imageSize
                    }
                }
            });
            // Extract image data from response
            const parts = response.candidates?.[0]?.content?.parts;
            let imageData;
            let mimeType = "image/png";
            let text;
            if (parts) {
                for (const part of parts){
                    if ("text" in part && part.text) text = part.text;
                    if ("inlineData" in part && part.inlineData) {
                        imageData = part.inlineData.data;
                        mimeType = part.inlineData.mimeType ?? "image/png";
                    }
                }
            }
            if (!imageData) throw new Error("No image data returned from model");
            return {
                imageData,
                mimeType,
                text
            };
        }
    };
};
}),
"[project]/packages/shared/src/server/agents/utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildLoopContinuationMessage",
    ()=>buildLoopContinuationMessage,
    "buildMessages",
    ()=>buildMessages
]);
function buildMessages(config) {
    const { systemPrompt, userPrompt, context = [], previousMessages = [] } = config;
    // Build context messages (as user messages per existing pattern)
    const contextMessages = context.filter((content)=>content && content.trim().length > 0).map((content)=>({
            role: 'user',
            content
        }));
    return [
        {
            role: 'system',
            content: systemPrompt
        },
        ...contextMessages,
        ...previousMessages,
        {
            role: 'user',
            content: userPrompt
        }
    ];
}
function buildLoopContinuationMessage(toolType, toolMessages) {
    let messageContext = '';
    if (toolMessages.length > 0) {
        messageContext = `
[AUTOMATED MESSAGES]
The following messages will be sent to the user immediately after your response:
${toolMessages.map((m)=>`- "${m.substring(0, 100)}${m.length > 100 ? '...' : ''}"`).join('\n')}
`;
    }
    if (toolType === 'query') {
        // QUERY tool - user asked for information
        return `[SYSTEM: TOOL COMPLETE - QUERY]
${messageContext}
[INSTRUCTION]
The user asked a question and you retrieved the answer.
- Provide a brief, natural intro to the information (e.g., "Here's your workout for today:" or "Today you've got [type]:")
- DO NOT say "Done" or "Complete" - this was a question, not a request for action
- If [AUTOMATED MESSAGES] are listed, they contain the detailed response. Just provide a smooth lead-in.
- If there was an error, explain it simply.
- Keep it conversational and SMS-style (1-2 sentences max).
`;
    }
    // ACTION tool - user requested a change
    return `[SYSTEM: TOOL COMPLETE - ACTION]
${messageContext}
[INSTRUCTION]
The user requested a change and it has been processed.
- Briefly confirm what was done in a natural way
- If [AUTOMATED MESSAGES] are listed, DO NOT repeat their content. Just provide a brief confirmation.
- If you called make_modification with a message, that acknowledgment was already sent. Focus on the result now.
- If the action failed, explain the issue simply.
- Keep it conversational and SMS-style (1-2 sentences max).
`;
}
}),
"[project]/packages/shared/src/server/agents/subAgentExecutor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "executeSubAgents",
    ()=>executeSubAgents
]);
/**
 * Type guard to check if entry is an extended SubAgentConfig
 */ function isSubAgentConfig(entry) {
    return entry !== null && typeof entry === 'object' && 'agent' in entry && typeof entry.agent?.invoke === 'function';
}
async function executeSubAgents(config) {
    const { batches, input, previousResults, parentName } = config;
    // Main result for condition/transform functions
    const mainResult = previousResults.response;
    const accumulatedResults = {
        ...previousResults
    };
    for(let batchIndex = 0; batchIndex < batches.length; batchIndex++){
        const batch = batches[batchIndex];
        const batchKeys = Object.keys(batch);
        console.log(`[${parentName}] Executing batch ${batchIndex + 1}/${batches.length}: [${batchKeys.join(', ')}]`);
        const batchStartTime = Date.now();
        // Execute all agents in this batch in parallel (fail fast)
        const batchPromises = batchKeys.map(async (key)=>{
            const entry = batch[key];
            // Determine agent, condition, and transform based on entry type
            let agent;
            let condition;
            let transform;
            if (isSubAgentConfig(entry)) {
                // Extended config: { agent, transform?, condition? }
                agent = entry.agent;
                condition = entry.condition;
                transform = entry.transform;
            } else {
                // Simple config: bare agent
                agent = entry;
            }
            // Check condition - skip if condition returns false
            if (condition && !condition(mainResult)) {
                console.log(`[${parentName}:${key}] Skipped (condition not met)`);
                return {
                    key,
                    result: null,
                    skipped: true
                };
            }
            // Determine input: use transform if provided, otherwise default input
            const agentInput = transform ? transform(mainResult) : input;
            const startTime = Date.now();
            console.log(`[${parentName}:${key}] Starting`);
            const result = await agent.invoke(agentInput);
            console.log(`[${parentName}:${key}] Completed in ${Date.now() - startTime}ms`);
            return {
                key,
                result,
                skipped: false
            };
        });
        // Wait for all agents in batch (will throw on first failure)
        const batchResults = await Promise.all(batchPromises);
        console.log(`[${parentName}] Batch ${batchIndex + 1} completed in ${Date.now() - batchStartTime}ms`);
        // Accumulate results, flattening { response: X } to just X, skip nulls from conditions
        for (const { key, result, skipped } of batchResults){
            if (skipped) continue;
            const hasResponse = result && typeof result === 'object' && 'response' in result;
            accumulatedResults[key] = hasResponse ? result.response : result;
        }
    }
    // Remove the 'response' key as it will be added by the caller
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { response: _responseKey, ...subAgentResults } = accumulatedResults;
    return subAgentResults;
}
}),
"[project]/packages/shared/src/server/agents/toolExecutor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "executeToolLoop",
    ()=>executeToolLoop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/utils.ts [app-route] (ecmascript)");
;
// Tool execution priority (lower = first)
// Profile updates should happen before modifications
const TOOL_PRIORITY = {
    'update_profile': 1,
    'get_workout': 2,
    'make_modification': 3
};
async function executeToolLoop(config) {
    const { model, messages, tools, name, maxIterations } = config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory = [
        ...messages
    ];
    const toolCalls = [];
    const accumulatedMessages = [];
    let lastToolType = 'action';
    for(let iteration = 1; iteration <= maxIterations; iteration++){
        console.log(`[${name}] Tool loop iteration ${iteration}`);
        const result = await model.invoke(conversationHistory);
        // Check for tool calls
        if (!result.tool_calls || result.tool_calls.length === 0) {
            // No tool calls - return the response
            const response = typeof result.content === 'string' ? result.content : String(result.content);
            console.log(`[${name}] Tool loop completed after ${iteration} iteration(s)`);
            return {
                response,
                messages: accumulatedMessages,
                toolCalls
            };
        }
        // Sort tool calls by priority
        const sortedToolCalls = [
            ...result.tool_calls
        ].sort((a, b)=>(TOOL_PRIORITY[a.name] ?? 99) - (TOOL_PRIORITY[b.name] ?? 99));
        console.log(`[${name}] ${sortedToolCalls.length} tool call(s): ${sortedToolCalls.map((tc)=>tc.name).join(', ')}`);
        // Track messages from tools for this iteration
        const iterationMessages = [];
        // Execute each tool call in priority order
        for(let i = 0; i < sortedToolCalls.length; i++){
            const toolCall = sortedToolCalls[i];
            const callId = `call_${iteration}_${i}`;
            // Find the tool
            const selectedTool = tools.find((t)=>t.name === toolCall.name);
            if (!selectedTool) {
                console.error(`[${name}] Tool not found: ${toolCall.name}`);
                continue;
            }
            const toolStartTime = Date.now();
            try {
                console.log(`[${name}] Executing tool: ${toolCall.name}`);
                const toolResult = await selectedTool.invoke(toolCall.args);
                const durationMs = Date.now() - toolStartTime;
                // Track tool type for continuation message
                lastToolType = toolResult.toolType || 'action';
                // Accumulate messages if present
                if (toolResult.messages && toolResult.messages.length > 0) {
                    accumulatedMessages.push(...toolResult.messages);
                    iterationMessages.push(...toolResult.messages);
                    console.log(`[${name}] Accumulated ${toolResult.messages.length} message(s) from ${toolCall.name}`);
                }
                // Record tool call for observability
                toolCalls.push({
                    name: toolCall.name,
                    args: toolCall.args,
                    result: toolResult.response,
                    durationMs
                });
                // Add to conversation history
                conversationHistory.push({
                    role: 'assistant',
                    content: '',
                    tool_calls: [
                        {
                            id: callId,
                            type: 'function',
                            function: {
                                name: toolCall.name,
                                arguments: JSON.stringify(toolCall.args)
                            }
                        }
                    ]
                });
                conversationHistory.push({
                    role: 'tool',
                    content: toolResult.response,
                    tool_call_id: callId
                });
                console.log(`[${name}] ${toolCall.name} complete in ${durationMs}ms`);
            } catch (error) {
                console.error(`[${name}] Tool error (${toolCall.name}):`, error);
                // Add error to conversation history so model knows it failed
                conversationHistory.push({
                    role: 'tool',
                    content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    tool_call_id: callId
                });
                accumulatedMessages.push("I tried to help but encountered an issue. Please try again!");
            }
        }
        // Add continuation message for next iteration
        conversationHistory.push({
            role: 'user',
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildLoopContinuationMessage"])(lastToolType, iterationMessages)
        });
        console.log(`[${name}] All tools complete, continuing loop`);
    }
    // Max iterations reached
    console.warn(`[${name}] Max iterations (${maxIterations}) reached`);
    return {
        response: accumulatedMessages.length > 0 ? accumulatedMessages[accumulatedMessages.length - 1] : "I'm here to help! What would you like to know?",
        messages: accumulatedMessages,
        toolCalls
    };
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
"[project]/packages/shared/src/server/agents/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logAgentInvocation",
    ()=>logAgentInvocation
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
;
;
;
const LOGS_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](process.cwd(), '_logs');
/**
 * Check if agent logging is enabled via config
 */ function isLoggingEnabled() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getFeatureFlags"])().agentLogging;
}
/**
 * Generate a timestamp string for filenames
 * Format: YYYY-MM-DD_HHmmss-mmm (includes milliseconds to avoid collisions)
 */ function generateTimestamp() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${date}_${time}-${ms}`;
}
/**
 * Ensure the logs directory exists
 */ async function ensureLogsDir() {
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"](LOGS_DIR, {
            recursive: true
        });
    } catch  {
    // Directory might already exist, ignore
    }
}
/**
 * Format a message for human-readable text output
 */ function formatMessageForText(msg) {
    const roleLabel = msg.role.toUpperCase();
    const content = msg.content || '';
    // Detect context messages (they start with [CONTEXT:)
    const isContext = msg.role === 'user' && content.startsWith('[CONTEXT:');
    const label = isContext ? `[USER - CONTEXT]` : `[${roleLabel}]`;
    return `${label}\n${content}`;
}
/**
 * Generate human-readable text log content
 */ function generateTextLog(agentName, timestamp, input, messages, output) {
    const separator = '='.repeat(80);
    const lines = [
        separator,
        `AGENT: ${agentName}`,
        `TIMESTAMP: ${timestamp}`,
        `INPUT: ${input}`,
        separator,
        '',
        '--- MESSAGES ARRAY ---',
        ''
    ];
    // Add each message
    messages.forEach((msg)=>{
        lines.push(formatMessageForText(msg));
        lines.push('');
    });
    lines.push('--- OUTPUT ---');
    lines.push(typeof output === 'string' ? output : JSON.stringify(output, null, 2));
    lines.push(separator);
    return lines.join('\n');
}
/**
 * Generate JSON log content
 */ function generateJsonLog(agentName, timestamp, input, messages, output) {
    return JSON.stringify({
        timestamp,
        agentName,
        input,
        messages,
        output
    }, null, 2);
}
function logAgentInvocation(agentName, input, messages, output) {
    // Skip if logging is disabled
    if (!isLoggingEnabled()) {
        return;
    }
    // Fire-and-forget async logging
    (async ()=>{
        try {
            await ensureLogsDir();
            const timestamp = generateTimestamp();
            const isoTimestamp = new Date().toISOString();
            const baseFilename = `${agentName}_${timestamp}`;
            // Write both JSON and TXT files in parallel
            await Promise.all([
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"](__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](LOGS_DIR, `${baseFilename}.json`), generateJsonLog(agentName, isoTimestamp, input, messages, output), 'utf-8'),
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"](__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](LOGS_DIR, `${baseFilename}.txt`), generateTextLog(agentName, isoTimestamp, input, messages, output), 'utf-8')
            ]);
        } catch (error) {
            // Silently ignore logging errors to not affect agent execution
            console.error('[AgentLogger] Failed to write log:', error);
        }
    })();
}
}),
"[project]/packages/shared/src/server/repositories/promptRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromptRepository",
    ()=>PromptRepository,
    "promptRepository",
    ()=>promptRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class PromptRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Get both system and user prompts for an agent (most recent of each)
   */ async getPromptPair(id) {
        const prompts = await this.db.selectFrom('prompts').where('id', '=', id).orderBy('createdAt', 'desc').selectAll().execute();
        if (prompts.length === 0) return null;
        // Get the most recent of each role
        const system = prompts.find((p)=>p.role === 'system');
        const user = prompts.find((p)=>p.role === 'user');
        if (!system) return null;
        return {
            systemPrompt: system.value,
            userPrompt: user?.value ?? null
        };
    }
    /**
   * Get the most recent system prompt for an agent
   */ async getSystemPrompt(id) {
        const prompt = await this.db.selectFrom('prompts').where('id', '=', id).where('role', '=', 'system').orderBy('createdAt', 'desc').limit(1).select('value').executeTakeFirst();
        return prompt?.value ?? null;
    }
    /**
   * Get the most recent user prompt for an agent (if exists)
   */ async getUserPrompt(id) {
        const prompt = await this.db.selectFrom('prompts').where('id', '=', id).where('role', '=', 'user').orderBy('createdAt', 'desc').limit(1).select('value').executeTakeFirst();
        return prompt?.value ?? null;
    }
    /**
   * Get the most recent context prompt for an agent (if exists)
   */ async getContextPrompt(id) {
        const prompt = await this.db.selectFrom('prompts').where('id', '=', id).where('role', '=', 'context').orderBy('createdAt', 'desc').limit(1).select('value').executeTakeFirst();
        return prompt?.value ?? null;
    }
    /**
   * Create a new prompt version (insert-only)
   */ async createPrompt(newPrompt) {
        return this.db.insertInto('prompts').values(newPrompt).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Bulk insert prompts (for seeding)
   */ async createPrompts(prompts) {
        if (prompts.length === 0) return;
        await this.db.insertInto('prompts').values(prompts).execute();
    }
    /**
   * Get prompt history for an agent and role
   */ async getPromptHistory(id, role, limit = 10) {
        return this.db.selectFrom('prompts').where('id', '=', id).where('role', '=', role).orderBy('createdAt', 'desc').limit(limit).selectAll().execute();
    }
    /**
   * Get all unique prompt IDs (for listing available agents)
   */ async getAllPromptIds() {
        const results = await this.db.selectFrom('prompts').select('id').distinct().execute();
        return results.map((r)=>r.id);
    }
}
const promptRepository = new PromptRepository();
}),
"[project]/packages/shared/src/server/services/prompts/promptService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromptService",
    ()=>PromptService,
    "promptService",
    ()=>promptService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$promptRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/promptRepository.ts [app-route] (ecmascript)");
;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
class PromptService {
    static instance;
    cache = new Map();
    contextCache = new Map();
    constructor(){}
    static getInstance() {
        if (!PromptService.instance) {
            PromptService.instance = new PromptService();
        }
        return PromptService.instance;
    }
    /**
   * Get prompts for an agent, using cache when available
   *
   * @throws Error if prompt not found (prompts must be seeded)
   */ async getPrompts(agentId) {
        // Check cache first
        const cached = this.cache.get(agentId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        // Fetch from database
        const prompts = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$promptRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptRepository"].getPromptPair(agentId);
        if (!prompts) {
            throw new Error(`Prompt not found for agent '${agentId}'. ` + `All prompts must be seeded before use. Run the prompt seeding migration.`);
        }
        // Update cache
        this.cache.set(agentId, {
            data: prompts,
            expiresAt: Date.now() + CACHE_TTL_MS
        });
        return prompts;
    }
    /**
   * Get context prompt for an agent, using cache when available
   *
   * @returns The context prompt value, or null if not found
   */ async getContextPrompt(agentId) {
        const cacheKey = `${agentId}:context`;
        // Check cache first
        const cached = this.contextCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        // Fetch from database
        const value = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$promptRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptRepository"].getContextPrompt(agentId);
        if (value !== null) {
            // Update cache
            this.contextCache.set(cacheKey, {
                data: value,
                expiresAt: Date.now() + CACHE_TTL_MS
            });
        }
        return value;
    }
    /**
   * Invalidate cache for a specific agent (useful after updates)
   */ invalidateCache(agentId) {
        this.cache.delete(agentId);
        this.contextCache.delete(`${agentId}:context`);
    }
    /**
   * Clear entire cache (useful for testing or force refresh)
   */ clearCache() {
        this.cache.clear();
        this.contextCache.clear();
    }
}
const promptService = PromptService.getInstance();
}),
"[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAgent",
    ()=>createAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/models.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$subAgentExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/subAgentExecutor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$toolExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/toolExecutor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/prompts/promptService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function createAgent(definition, config) {
    const { name, systemPrompt: providedSystemPrompt, userPrompt: providedUserPrompt, context = [], previousMessages = [], tools, schema, subAgents = [] } = definition;
    // Fetch prompts from database if systemPrompt not provided directly
    let systemPrompt = providedSystemPrompt;
    let dbUserPrompt = null;
    if (!systemPrompt) {
        const prompts = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptService"].getPrompts(name);
        systemPrompt = prompts.systemPrompt;
        dbUserPrompt = prompts.userPrompt;
    }
    const { maxIterations = 5 } = config || {};
    // Determine if this is a tool-based agent
    const isToolAgent = tools && tools.length > 0;
    // Initialize the model appropriately
    // Tools and schema are mutually exclusive - tools take precedence
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = isToolAgent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(undefined, config, {
        tools
    }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(schema, config);
    const invoke = async (input)=>{
        const startTime = Date.now();
        console.log(`[${name}] Starting execution`);
        try {
            // Determine the final user message:
            // 1. If userPrompt function provided, use it to transform input
            // 2. Else if DB user prompt exists, prepend it to input
            // 3. Else input IS the user message directly
            let evaluatedUserPrompt;
            if (providedUserPrompt) {
                evaluatedUserPrompt = providedUserPrompt(input);
            } else if (dbUserPrompt) {
                // DB user prompt is a template that precedes the actual user input
                evaluatedUserPrompt = `${dbUserPrompt}\n\n${input}`;
            } else {
                evaluatedUserPrompt = input;
            }
            // Build messages with context and previous conversation history
            const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildMessages"])({
                systemPrompt,
                userPrompt: evaluatedUserPrompt,
                context,
                previousMessages
            });
            // Execute main agent
            let mainResult;
            let accumulatedMessages = [];
            if (isToolAgent) {
                const toolResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$toolExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeToolLoop"])({
                    model,
                    messages,
                    tools: tools,
                    name,
                    maxIterations
                });
                mainResult = toolResult.response;
                accumulatedMessages = toolResult.messages;
            } else {
                mainResult = await model.invoke(messages);
            }
            // Log the agent invocation (fire-and-forget, won't block execution)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAgentInvocation"])(name, input, messages, mainResult);
            console.log(`[${name}] Main agent completed in ${Date.now() - startTime}ms`);
            // If no subAgents, return main result wrapped in response (with messages if any)
            if (!subAgents || subAgents.length === 0) {
                return {
                    response: mainResult,
                    ...accumulatedMessages.length > 0 ? {
                        messages: accumulatedMessages
                    } : {}
                };
            }
            // Execute subAgents with the main response as their input
            // Convert mainResult to string if needed for subAgent invocation
            const responseString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
            const subAgentResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$subAgentExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeSubAgents"])({
                batches: subAgents,
                input: responseString,
                previousResults: {
                    response: mainResult
                },
                parentName: name
            });
            console.log(`[${name}] Total execution time: ${Date.now() - startTime}ms`);
            // Combine main result with subAgent results (and messages if any)
            return {
                response: mainResult,
                ...accumulatedMessages.length > 0 ? {
                    messages: accumulatedMessages
                } : {},
                ...subAgentResults
            };
        } catch (error) {
            console.error(`[${name}] Execution failed:`, error);
            throw error;
        }
    };
    return {
        invoke,
        name
    };
}
}),
"[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Agent Prompt IDs
 *
 * Use these constants in createAgent calls and migrations.
 * TypeScript will catch typos at compile time.
 */ // Core agents requiring system + optional user prompts
__turbopack_context__.s([
    "CONTEXT_IDS",
    ()=>CONTEXT_IDS,
    "PROMPT_IDS",
    ()=>PROMPT_IDS,
    "PROMPT_ROLES",
    ()=>PROMPT_ROLES
]);
const PROMPT_IDS = {
    // Chat
    CHAT_GENERATE: 'chat:generate',
    // Profile
    PROFILE_FITNESS: 'profile:fitness',
    PROFILE_STRUCTURED: 'profile:structured',
    PROFILE_USER: 'profile:user',
    // Plans
    PLAN_GENERATE: 'plan:generate',
    PLAN_STRUCTURED: 'plan:structured',
    PLAN_MESSAGE: 'plan:message',
    PLAN_MODIFY: 'plan:modify',
    // Workouts
    WORKOUT_GENERATE: 'workout:generate',
    WORKOUT_STRUCTURED: 'workout:structured',
    WORKOUT_MESSAGE: 'workout:message',
    WORKOUT_MODIFY: 'workout:modify',
    // Microcycles
    MICROCYCLE_GENERATE: 'microcycle:generate',
    MICROCYCLE_STRUCTURED: 'microcycle:structured',
    MICROCYCLE_MESSAGE: 'microcycle:message',
    MICROCYCLE_MODIFY: 'microcycle:modify',
    // Modifications
    MODIFICATIONS_ROUTER: 'modifications:router'
};
const CONTEXT_IDS = {
    // Day format
    WORKOUT_FORMAT_TRAINING: 'workout:message:format:training',
    WORKOUT_FORMAT_ACTIVE_RECOVERY: 'workout:message:format:active_recovery',
    WORKOUT_FORMAT_REST: 'workout:message:format:rest',
    // Experience levels - Microcycles
    MICROCYCLE_EXP_BEGINNER: 'microcycle:generate:experience:beginner',
    MICROCYCLE_EXP_INTERMEDIATE: 'microcycle:generate:experience:intermediate',
    MICROCYCLE_EXP_ADVANCED: 'microcycle:generate:experience:advanced',
    // Experience levels - Workouts
    WORKOUT_EXP_BEGINNER: 'workout:generate:experience:beginner',
    WORKOUT_EXP_INTERMEDIATE: 'workout:generate:experience:intermediate',
    WORKOUT_EXP_ADVANCED: 'workout:generate:experience:advanced'
};
const PROMPT_ROLES = {
    SYSTEM: 'system',
    USER: 'user',
    CONTEXT: 'context'
};
}),
"[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Configurable Agent System
 *
 * A declarative, composable way to define AI agents.
 * This is the primary way to create agents in the codebase.
 *
 * @example
 * ```typescript
 * import { createAgent } from '@/server/agents';
 *
 * const myAgent = createAgent({
 *   name: 'my-agent',
 *   systemPrompt: 'You are a helpful assistant.',
 *   userPrompt: (input) => `Help with: ${input}`,
 *   schema: OutputSchema,
 * }, {
 *   model: 'gpt-5-nano',
 *   maxTokens: 4000,
 * });
 *
 * const result = await myAgent.invoke('something');
 * // result.response contains the schema-typed output
 * ```
 */ // ============================================
// Main Agent Factory
// ============================================
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
// ============================================
// Prompt IDs (use these in createAgent calls)
// ============================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
// ============================================
// Model Initialization
// ============================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/models.ts [app-route] (ecmascript)");
// ============================================
// Utilities
// ============================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/utils.ts [app-route] (ecmascript)");
// ============================================
// Executors (for advanced use cases)
// ============================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$subAgentExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/subAgentExecutor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$toolExecutor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/toolExecutor.ts [app-route] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/packages/shared/src/shared/types/workout/workoutStructure.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IntensitySchema",
    ()=>IntensitySchema,
    "WorkoutActivitySchema",
    ()=>WorkoutActivitySchema,
    "WorkoutSectionSchema",
    ()=>WorkoutSectionSchema,
    "WorkoutStructureSchema",
    ()=>WorkoutStructureSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const IntensitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        "RPE",
        "RIR",
        "Percentage",
        "Zone",
        "HeartRate",
        "Pace",
        "Other"
    ]).default("Other"),
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g., '7-8', '2', '75%', 'Zone 2', '150bpm'").default(''),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Context for the user").default('')
});
const WorkoutActivitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. 'Back Squat' or 'Zone 2 Run'"),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        "Strength",
        "Cardio",
        "Plyometric",
        "Mobility",
        "Rest",
        "Other"
    ]).default("Strength"),
    // Metrics (Strings used for flexibility: "4", "3-4", "AMRAP")
    sets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '4' or '3-4'").default(''),
    reps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '6-8' or '4 min'").default(''),
    // Cardio/Duration Specific
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '45 min'").default(''),
    distance: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '5km'").default(''),
    // Common
    rest: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '2-3 min'").default(''),
    intensity: IntensitySchema.default({
        type: "Other",
        value: "",
        description: ""
    }),
    tempo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. '3-0-1'").default(''),
    // Execution & Grouping
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Execution cues").default(''),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).default([]),
    supersetId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('')
});
const WorkoutSectionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("e.g. 'Warm Up', 'Main Lift'"),
    overview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Brief goal of this section").default(''),
    exercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(WorkoutActivitySchema).default([])
});
const WorkoutStructureSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Concise workout name, 2-4 words max (e.g. 'Pull A', 'Upper Strength', 'Leg Day')"),
    focus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Brief focus area, 1-3 words (e.g. 'Back & Biceps', 'Quads', 'Push')").default(''),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    // Optional flair
    quote: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
        author: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('')
    }).default({
        text: '',
        author: ''
    }),
    // The actual programming
    sections: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(WorkoutSectionSchema).default([]),
    // Metadata
    estimatedDurationMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Estimated minutes").default(-1),
    intensityLevel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        "Low",
        "Moderate",
        "High",
        "Severe"
    ]).default("Moderate")
});
}),
"[project]/packages/shared/src/shared/types/workout/geminiSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeminiEnhancedWorkoutInstanceSchema",
    ()=>GeminiEnhancedWorkoutInstanceSchema,
    "GeminiUpdatedWorkoutInstanceSchema",
    ()=>GeminiUpdatedWorkoutInstanceSchema,
    "GeminiWorkoutBlockItemSchema",
    ()=>GeminiWorkoutBlockItemSchema,
    "GeminiWorkoutBlockSchema",
    ()=>GeminiWorkoutBlockSchema,
    "GeminiWorkoutModificationSchema",
    ()=>GeminiWorkoutModificationSchema,
    "GeminiWorkoutSessionContextSchema",
    ()=>GeminiWorkoutSessionContextSchema,
    "GeminiWorkoutSummarySchema",
    ()=>GeminiWorkoutSummarySchema,
    "GeminiWorkoutTargetMetricsSchema",
    ()=>GeminiWorkoutTargetMetricsSchema,
    "GeminiWorkoutWorkItemSchema",
    ()=>GeminiWorkoutWorkItemSchema,
    "convertGeminiToStandard",
    ()=>convertGeminiToStandard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const GeminiWorkoutBlockItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'prep',
        'compound',
        'secondary',
        'accessory',
        'core',
        'cardio',
        'cooldown'
    ]).describe("Type of exercise in the workout"),
    exercise: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Specific, actionable exercise name that a user can immediately perform (e.g., 'Band Pull-Aparts', 'Cat-Cow Stretch', 'Scapular Wall Slides'). Never use vague terms like 'mobility sequence' or 'dynamic warmup'."),
    sets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Number of sets (use -1 if not applicable)"),
    reps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Number of reps (can be range like '6-8' or number like '10', use empty string if not applicable)"),
    durationSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Duration in seconds (use -1 if not applicable)"),
    durationMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Duration in minutes (use -1 if not applicable)"),
    RPE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Rate of Perceived Exertion (1-10 scale, use -1 if not applicable)"),
    rir: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Reps in Reserve (typically 0-5, use -1 if not applicable)"),
    percentageRM: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Percentage of 1 Rep Max (0-100 scale, use -1 if not applicable)"),
    restSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Rest between sets in seconds (use -1 if not applicable)"),
    restText: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Readable rest instruction (e.g., '90s between supersets', use empty string if not applicable)"),
    equipment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Equipment used (barbell, DB, band, etc., use empty string if not applicable)"),
    pattern: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Movement pattern label (e.g., 'horizontal_press', use empty string if not applicable)"),
    tempo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Tempo prescription (e.g., '3-1-1', use empty string if not applicable)"),
    cues: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Key coaching cues (use empty array if none)"),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Semantic tags for filtering/substitution (use empty array if none)"),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Additional notes for the exercise (use empty string if no notes)")
}).strict();
const GeminiWorkoutWorkItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    structureType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'straight',
        'superset',
        'circuit'
    ]).describe("Defines how the exercises are grouped (straight = single exercise, superset = 2 exercises alternated, circuit = 3+ exercises)"),
    exercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(GeminiWorkoutBlockItemSchema).min(1).describe("One or more exercises (1 = straight, 2 = superset, 3+ = circuit)"),
    restBetweenExercisesSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Rest between exercises inside the superset/circuit in seconds (use -1 if not applicable)"),
    restAfterSetSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Rest between rounds or sets of this work item in seconds (use -1 if not applicable)"),
    rounds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Number of times the group is repeated (for circuits, use -1 if not applicable)"),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Extra details about the grouping (use empty string if no notes)")
}).strict();
const GeminiWorkoutBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Name of the workout block (e.g., 'Warm-Up', 'Main Lift', 'Accessory')"),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Purpose of this block (use empty string if not applicable)"),
    durationMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Estimated duration in minutes (use -1 if not applicable)"),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("General notes for this block (use empty string if no notes)"),
    work: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(GeminiWorkoutWorkItemSchema).describe("The list of work items (straight, superset, or circuit) within this block")
}).strict();
const GeminiWorkoutModificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    condition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Condition that triggers this modification (e.g., 'injury.lower_back.active')"),
    replace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        exercise: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Exercise to replace"),
        with: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Replacement exercise")
    }).describe("Exercise replacement details (use empty strings if not applicable)"),
    adjustment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Adjustment to make (e.g., 'reduce weight by 20%', use empty string if not applicable)"),
    note: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Explanation for the modification")
}).strict();
const GeminiWorkoutSessionContextSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    phaseName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Name of the training phase (use empty string if not applicable)"),
    weekNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Week number in the program (use -1 if not applicable)"),
    dayIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Day index in the microcycle (use -1 if not applicable)"),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Goal of the session (use empty string if not applicable)"),
    durationEstimateMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Estimated duration in minutes (use -1 if not applicable)"),
    environment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Training environment (e.g., 'gym', 'home', use empty string if not applicable)"),
    clientConstraints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        timeAvailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Time available in minutes (use -1 if not applicable)"),
        equipmentAvailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Available equipment (use empty array if not specified)"),
        injuries: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Current injuries or limitations (use empty array if none)"),
        preferences: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Client preferences (use empty array if not specified)")
    }).describe("Client-specific constraints for the session")
}).strict();
const GeminiWorkoutTargetMetricsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    totalVolume: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Total volume in kg (use -1 if not applicable)"),
    totalReps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Total reps across all exercises (use -1 if not applicable)"),
    totalSets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Total sets across all exercises (use -1 if not applicable)"),
    totalDistance: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Total distance in km (use -1 if not applicable)"),
    totalDuration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Total duration in minutes (use -1 if not applicable)"),
    averageRPE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Average RPE across workout (use -1 if not applicable)"),
    averageIntensity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Average intensity across workout (use -1 if not applicable)")
}).strict();
const GeminiWorkoutSummarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    adaptations: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Expected adaptations from this workout (use empty array if not specified)"),
    coachingNotes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Coaching notes for the client (use empty string if no notes)"),
    progressionNotes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Notes on progression strategy (use empty string if no notes)"),
    recoveryFocus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Recovery focus areas (use empty string if not specified)")
}).strict();
const GeminiEnhancedWorkoutInstanceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Overall theme of the workout (e.g., 'Upper Push', 'Lower Power')"),
    sessionContext: GeminiWorkoutSessionContextSchema.describe("Metadata and context about the session"),
    blocks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(GeminiWorkoutBlockSchema).describe("Structured blocks of the workout"),
    modifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(GeminiWorkoutModificationSchema).describe("Modifications for special conditions (use empty array if none)"),
    targetMetrics: GeminiWorkoutTargetMetricsSchema.describe("Target metrics for the workout"),
    summary: GeminiWorkoutSummarySchema.describe("Summary and meta reflections about the workout"),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Additional notes for the workout (use empty string if no notes)")
}).strict();
const GeminiUpdatedWorkoutInstanceSchema = GeminiEnhancedWorkoutInstanceSchema.extend({
    modificationsApplied: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();
function convertGeminiToStandard(geminiOutput) {
    if (Array.isArray(geminiOutput)) {
        return geminiOutput.map(convertGeminiToStandard);
    }
    if (geminiOutput && typeof geminiOutput === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = {};
        for (const [key, value] of Object.entries(geminiOutput)){
            // Handle empty strings
            if (value === "") {
                result[key] = null;
            } else if (value === -1) {
                result[key] = null;
            } else if (key === 'RPE' && typeof value === 'number') {
                result[key] = value >= 1 && value <= 10 ? value : null;
            } else if (key === 'percentageRM' && typeof value === 'number') {
                result[key] = value >= 0 && value <= 100 ? value : null;
            } else if (key === 'rir' && typeof value === 'number') {
                result[key] = value >= 0 && value <= 10 ? value : null;
            } else if (key === 'sets' && typeof value === 'number') {
                result[key] = value > 0 ? value : null;
            } else if ((key === 'durationSec' || key === 'durationMin') && typeof value === 'number') {
                result[key] = value > 0 ? value : null;
            } else if ((key === 'restSec' || key === 'restAfterSetSec' || key === 'restBetweenExercisesSec') && typeof value === 'number') {
                result[key] = value > 0 ? value : null;
            } else if (key === 'rounds' && typeof value === 'number') {
                result[key] = value > 0 ? value : null;
            } else if (Array.isArray(value) && value.length === 0 && (key === 'cues' || key === 'tags' || key === 'modifications' || key === 'adaptations' || key === 'equipmentAvailable' || key === 'injuries' || key === 'preferences')) {
                result[key] = null;
            } else if (key === 'replace' && typeof value === 'object' && value.exercise === "" && value.with === "") {
                result[key] = null;
            } else if (typeof value === 'object' && value !== null) {
                result[key] = convertGeminiToStandard(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return geminiOutput;
}
}),
"[project]/packages/shared/src/shared/types/workout/openAISchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_EnhancedWorkoutInstanceSchema",
    ()=>_EnhancedWorkoutInstanceSchema,
    "_UpdatedWorkoutInstanceSchema",
    ()=>_UpdatedWorkoutInstanceSchema,
    "_WorkoutBlockItemSchema",
    ()=>_WorkoutBlockItemSchema,
    "_WorkoutBlockSchema",
    ()=>_WorkoutBlockSchema,
    "_WorkoutInstanceSchema",
    ()=>_WorkoutInstanceSchema,
    "_WorkoutModificationSchema",
    ()=>_WorkoutModificationSchema,
    "_WorkoutSessionContextSchema",
    ()=>_WorkoutSessionContextSchema,
    "_WorkoutSummarySchema",
    ()=>_WorkoutSummarySchema,
    "_WorkoutTargetMetricsSchema",
    ()=>_WorkoutTargetMetricsSchema,
    "_WorkoutWorkItemSchema",
    ()=>_WorkoutWorkItemSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const _WorkoutBlockItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'prep',
        'compound',
        'secondary',
        'accessory',
        'core',
        'cardio',
        'cooldown'
    ]).describe("Category of the movement or its role in the session."),
    exercise: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Explicit exercise name (e.g., 'Barbell Back Squat')."),
    sets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Number of sets."),
    reps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Reps (can be a range or a single value)."),
    durationSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Exercise duration in seconds."),
    durationMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Exercise duration in minutes."),
    RPE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(1).max(10).nullish().describe("Rate of Perceived Exertion 1–10."),
    rir: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Reps in Reserve (autoregulation measure)."),
    percentageRM: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(0).max(100).nullish().describe("Percent of 1RM load."),
    restSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Rest between sets in seconds."),
    restText: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Readable rest instruction, e.g. '90s between supersets'."),
    equipment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Equipment used (barbell, DB, band, etc.)."),
    pattern: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Movement pattern label (e.g., 'horizontal_press')."),
    tempo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Tempo prescription, e.g. '3-1-1'."),
    cues: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish().describe("Key coaching cues."),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish().describe("Semantic tags for filtering/substitution."),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Extra details or special instructions.")
}).strict();
const _WorkoutWorkItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    structureType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        'straight',
        'superset',
        'circuit'
    ]).default('straight').describe("Defines how the exercises are grouped."),
    exercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(_WorkoutBlockItemSchema).min(1).describe("One or more exercises (1 = straight, 2 = superset, 3+ = circuit)."),
    restBetweenExercisesSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Rest between exercises inside the superset/circuit."),
    restAfterSetSec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Rest between rounds or sets of this work item."),
    rounds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Number of times the group is repeated (for circuits)."),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Extra details about the grouping.")
}).strict();
const _WorkoutBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Name of the workout block (e.g., 'Warm-Up', 'Main Lift')."),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Purpose of this block."),
    durationMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish().describe("Estimated duration in minutes."),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("General notes for this block."),
    work: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(_WorkoutWorkItemSchema).describe("The list of work items (straight, superset, or circuit) within this block.")
}).strict();
const _WorkoutModificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    condition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Trigger condition, e.g. 'injury.shoulder.active'."),
    replace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        exercise: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Original exercise to replace."),
        with: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Substitute exercise.")
    }).nullish(),
    adjustment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish().describe("Other adjustments (e.g., reduce weight 20%)."),
    note: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Reason or context for this modification.")
}).strict();
const _WorkoutSessionContextSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    phaseName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    weekNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    dayIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    durationEstimateMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    environment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    clientConstraints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        timeAvailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
        equipmentAvailable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
        injuries: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
        preferences: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish()
    }).nullish()
}).nullish();
const _WorkoutTargetMetricsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    totalVolume: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    totalReps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    totalSets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    totalDuration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    averageRPE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish(),
    averageIntensity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().nullish()
}).nullish();
const _WorkoutSummarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    adaptations: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).nullish(),
    coachingNotes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    progressionNotes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish(),
    recoveryFocus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
}).nullish();
const _EnhancedWorkoutInstanceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Theme of the workout (e.g., 'Upper Push', 'Lower Power')."),
    sessionContext: _WorkoutSessionContextSchema,
    blocks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(_WorkoutBlockSchema),
    modifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(_WorkoutModificationSchema).nullish(),
    targetMetrics: _WorkoutTargetMetricsSchema,
    summary: _WorkoutSummarySchema,
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullish()
}).strict();
const _UpdatedWorkoutInstanceSchema = _EnhancedWorkoutInstanceSchema.extend({
    modificationsApplied: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();
const _WorkoutInstanceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    sessionType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        "run",
        "lift",
        "metcon",
        "mobility",
        "rest",
        "other"
    ]).describe("Primary modality"),
    details: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Name of the block (e.g. Warm-up)"),
        activities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Ordered list of exercise descriptions")
    }).strict()).min(1).describe("Sequential blocks in the workout"),
    targets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Metric / target field name"),
        value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().describe("Numeric value for the key")
    }).strict()).describe("Numeric targets such as distanceKm, volumeKg").nullish()
}).strict();
}),
"[project]/packages/shared/src/shared/types/workout/formattedSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EnhancedFormattedWorkoutSchema",
    ()=>EnhancedFormattedWorkoutSchema,
    "FormattedWorkoutSchema",
    ()=>FormattedWorkoutSchema,
    "UpdatedFormattedWorkoutSchema",
    ()=>UpdatedFormattedWorkoutSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const FormattedWorkoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    formatted: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(100).describe(`
      Formatted workout text using extended markdown format.

      REQUIRED STRUCTURE:
      # {Theme} - {Focus}

      ## Session Overview
      **Duration:** ~{X} minutes
      **RPE Target:** {X-Y}
      **Focus:** {focus areas}

      ---

      ## {Emoji} Block 1: {Block Name}
      **Goal:** {Purpose}

      {Work items with exercises, sets, reps, RPE, cues, etc.}

      ---

      ## Coaching Notes
      - {Notes for user}

      FORMAT EXAMPLES:

      Straight sets:
      1. **Barbell Bench Press** [COMPOUND]
         - 4 x 5 reps @ 80% 1RM
         - RPE: 8 | RIR: 2
         - Rest: 3-4 min
         - *Cues: Retract scapula, leg drive*
         - **Progression:** +5lbs from last week

      Supersets:
      **A. Superset (3 rounds, 90s rest between rounds):**
         1a. **Incline DB Press** [SECONDARY]
             - 10-12 reps @ RPE 7
             - *Cue: Full ROM, control eccentric*

         1b. **Cable Face Pulls** [ACCESSORY]
             - 15 reps
             - *Cue: Pull to forehead level*

      Circuits:
      **B. Circuit (2 rounds, 60s rest):**
         2a. **Dips** - 8-10 reps @ RPE 8
         2b. **Lateral Raises** - 12 reps per side
         2c. **Tricep Pushdowns** - 15 reps

      Cardio:
      1. **Easy Run**
         - Duration: 40 min
         - Pace: 9:30-10:00 /mile
         - Heart Rate: Zone 2 (130-145 bpm)
         - *Cues: Relax shoulders, land midfoot*

      IMPORTANT FORMATTING RULES:
      - Use markdown headers (# for title, ## for blocks)
      - Use --- to separate blocks
      - Use **bold** for exercise names
      - Use [TYPE] tags: [PREP], [COMPOUND], [SECONDARY], [ACCESSORY], [CORE], [CARDIO], [COOLDOWN]
      - Use emojis for visual hierarchy
      - Use *italic* for coaching cues
      - Use bullet points (-) for lists
      - Include RPE, sets, reps, rest periods as appropriate
      - Add coaching notes and modifications sections
      - Be comprehensive - include ALL exercises and details
      - Adapt format to workout type (strength, cardio, metcon, etc.)
    `)
}).strict();
const EnhancedFormattedWorkoutSchema = FormattedWorkoutSchema.extend({
    theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Workout theme/title (e.g., 'Upper Push', 'Easy Run')")
}).strict();
const UpdatedFormattedWorkoutSchema = EnhancedFormattedWorkoutSchema.extend({
    modificationsApplied: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of specific changes made (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();
}),
"[project]/packages/shared/src/shared/types/workout/sessionTypes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Maps LLM-generated session types to database-compatible session types
 *
 * Database expects: 'strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'
 * LLM generates: 'run', 'lift', 'metcon', 'mobility', 'rest', 'other'
 */ __turbopack_context__.s([
    "DB_SESSION_TYPES",
    ()=>DB_SESSION_TYPES,
    "LLM_SESSION_TYPES",
    ()=>LLM_SESSION_TYPES,
    "SESSION_TYPE_MAP",
    ()=>SESSION_TYPE_MAP,
    "isValidDBSessionType",
    ()=>isValidDBSessionType,
    "mapSessionType",
    ()=>mapSessionType
]);
const SESSION_TYPE_MAP = {
    // LLM type -> DB type
    'lift': 'strength',
    'run': 'cardio',
    'metcon': 'cardio',
    'mobility': 'mobility',
    'rest': 'recovery',
    'other': 'recovery'
};
const DB_SESSION_TYPES = [
    'strength',
    'cardio',
    'mobility',
    'recovery',
    'assessment',
    'deload'
];
const LLM_SESSION_TYPES = [
    'run',
    'lift',
    'metcon',
    'mobility',
    'rest',
    'other'
];
function mapSessionType(llmSessionType) {
    const mapped = SESSION_TYPE_MAP[llmSessionType];
    if (!mapped) {
        // If we get an unmapped type, default to 'recovery'
        console.warn(`Unknown LLM session type: ${llmSessionType}, defaulting to 'recovery'`);
        return 'recovery';
    }
    return mapped;
}
function isValidDBSessionType(sessionType) {
    return DB_SESSION_TYPES.includes(sessionType);
}
}),
"[project]/packages/shared/src/shared/types/workout/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized workout schema exports
 *
 * This module provides all workout schemas and utilities for both Gemini and OpenAI models.
 * Use getWorkoutSchemas() to automatically select the appropriate schemas based on the model.
 */ __turbopack_context__.s([
    "getWorkoutSchemas",
    ()=>getWorkoutSchemas,
    "isGeminiModel",
    ()=>isGeminiModel
]);
// ============================================================================
// Workout Structure Schemas (for structured workout output)
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/workoutStructure.ts [app-route] (ecmascript)");
// ============================================================================
// Gemini Schema Exports (use sentinel values instead of null)
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/geminiSchema.ts [app-route] (ecmascript)");
// ============================================================================
// OpenAI Schema Exports (use nullable/optional for flexibility)
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/openAISchema.ts [app-route] (ecmascript)");
// ============================================================================
// Formatted Text Schema Exports (replaces complex JSON)
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$formattedSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/formattedSchema.ts [app-route] (ecmascript)");
// ============================================================================
// Session Type Exports
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/sessionTypes.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
function isGeminiModel(model) {
    return model?.startsWith('gemini') || false;
}
function getWorkoutSchemas(model) {
    const useGemini = isGeminiModel(model);
    if (useGemini) {
        return {
            enhanced: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiEnhancedWorkoutInstanceSchema"],
            updated: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiUpdatedWorkoutInstanceSchema"],
            isGemini: true
        };
    } else {
        return {
            enhanced: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_EnhancedWorkoutInstanceSchema"],
            updated: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_UpdatedWorkoutInstanceSchema"],
            isGemini: false
        };
    }
}
}),
"[project]/packages/shared/src/server/models/workout.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkoutInstanceModel",
    ()=>WorkoutInstanceModel
]);
// Re-export everything from shared workout types
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/index.ts [app-route] (ecmascript) <locals>");
;
class WorkoutInstanceModel {
    clientId;
    microcycleId;
    sessionType;
    createdAt;
    date;
    id;
    updatedAt;
    goal;
    details;
    completedAt;
    constructor(workoutInstance){
        this.clientId = workoutInstance.clientId;
        this.createdAt = workoutInstance.createdAt;
        this.date = workoutInstance.date;
        this.id = workoutInstance.id;
        this.microcycleId = workoutInstance.microcycleId;
        this.sessionType = workoutInstance.sessionType;
        this.details = workoutInstance.details; // Details is required in DB
        this.goal = workoutInstance.goal;
        this.completedAt = workoutInstance.completedAt;
    }
}
}),
"[project]/packages/shared/src/shared/types/workout/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DB_SESSION_TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DB_SESSION_TYPES"],
    "EnhancedFormattedWorkoutSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$formattedSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnhancedFormattedWorkoutSchema"],
    "FormattedWorkoutSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$formattedSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FormattedWorkoutSchema"],
    "GeminiEnhancedWorkoutInstanceSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiEnhancedWorkoutInstanceSchema"],
    "GeminiUpdatedWorkoutInstanceSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiUpdatedWorkoutInstanceSchema"],
    "GeminiWorkoutBlockItemSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutBlockItemSchema"],
    "GeminiWorkoutBlockSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutBlockSchema"],
    "GeminiWorkoutModificationSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutModificationSchema"],
    "GeminiWorkoutSessionContextSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutSessionContextSchema"],
    "GeminiWorkoutSummarySchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutSummarySchema"],
    "GeminiWorkoutTargetMetricsSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutTargetMetricsSchema"],
    "GeminiWorkoutWorkItemSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GeminiWorkoutWorkItemSchema"],
    "IntensitySchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IntensitySchema"],
    "LLM_SESSION_TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLM_SESSION_TYPES"],
    "SESSION_TYPE_MAP",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_TYPE_MAP"],
    "UpdatedFormattedWorkoutSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$formattedSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UpdatedFormattedWorkoutSchema"],
    "WorkoutActivitySchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutActivitySchema"],
    "WorkoutSectionSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutSectionSchema"],
    "WorkoutStructureSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutStructureSchema"],
    "_EnhancedWorkoutInstanceSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_EnhancedWorkoutInstanceSchema"],
    "_UpdatedWorkoutInstanceSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_UpdatedWorkoutInstanceSchema"],
    "_WorkoutBlockItemSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutBlockItemSchema"],
    "_WorkoutBlockSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutBlockSchema"],
    "_WorkoutInstanceSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutInstanceSchema"],
    "_WorkoutModificationSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutModificationSchema"],
    "_WorkoutSessionContextSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutSessionContextSchema"],
    "_WorkoutSummarySchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutSummarySchema"],
    "_WorkoutTargetMetricsSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutTargetMetricsSchema"],
    "_WorkoutWorkItemSchema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_WorkoutWorkItemSchema"],
    "convertGeminiToStandard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertGeminiToStandard"],
    "getWorkoutSchemas",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getWorkoutSchemas"],
    "isGeminiModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isGeminiModel"],
    "isValidDBSessionType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidDBSessionType"],
    "mapSessionType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapSessionType"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$workoutStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/workoutStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$geminiSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/geminiSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$openAISchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/openAISchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$formattedSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/formattedSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$sessionTypes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/sessionTypes.ts [app-route] (ecmascript)");
}),
"[project]/packages/shared/src/server/services/agents/prompts/workouts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Workouts Prompts - All prompts related to workout generation and modification
 */ __turbopack_context__.s([
    "DAILY_WORKOUT_SYSTEM_PROMPT",
    ()=>DAILY_WORKOUT_SYSTEM_PROMPT,
    "MODIFY_WORKOUT_SYSTEM_PROMPT",
    ()=>MODIFY_WORKOUT_SYSTEM_PROMPT,
    "ModifyWorkoutGenerationOutputSchema",
    ()=>ModifyWorkoutGenerationOutputSchema,
    "STRUCTURED_WORKOUT_SYSTEM_PROMPT",
    ()=>STRUCTURED_WORKOUT_SYSTEM_PROMPT,
    "WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT",
    ()=>WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
    "modifyWorkoutUserPrompt",
    ()=>modifyWorkoutUserPrompt,
    "structuredWorkoutUserPrompt",
    ()=>structuredWorkoutUserPrompt,
    "workoutSmsUserPrompt",
    ()=>workoutSmsUserPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const DAILY_WORKOUT_SYSTEM_PROMPT = `
You are an expert Strength & Conditioning Coach. Your task is to generate the specific session details for a single day based on a provided "Day Outline."

Your output must be **clean, professional Markdown text**.

============================================================
# INPUT ANALYSIS
============================================================
You will receive:
1. **Client Profile:** Equipment access, injuries, preferences, and any experience-level guidance.
2. **Day Outline:** The plan for today (Focus, Patterns, Intensity, Progression, and/or Recovery guidance).
3. **IsDeload:** Boolean flag.

============================================================
# SESSION TYPE (CRITICAL)
============================================================
Before writing the output, classify the day into EXACTLY ONE of:

- **TRAINING** (strength, hypertrophy, conditioning intervals, sport-specific training)
- **ACTIVE_RECOVERY** (optional easy cardio, light recreation, mobility-focused movement)
- **REST** (no training; optional gentle movement only)

Use these rules:
- If the outline includes "rest day", "full rest", "off", or indicates no session → **REST**
- If the outline includes "active recovery", "optional easy cardio", "easy cardio", "recreation", "recovery", or intensity described as "easy / could do more / not a grind" → **ACTIVE_RECOVERY**
- Otherwise → **TRAINING**

This classification controls the ENTIRE output structure.

============================================================
# GENERATION RULES
============================================================

## 1. Interpret the Session Structure
- **Single Session:** Output one main block using the correct template for the Session Type.
- **Double Session (AM/PM):** Clearly separate the output into "## AM SESSION" and "## PM SESSION".
  - Each session must use the correct template for its Session Type.
- **CRITICAL:** ACTIVE_RECOVERY and REST must NOT be forced into a workout-style structure.

## 2. Format MUST match Session Type
### A) TRAINING
Use the structured workout format (Warmup / Workout / Cooldown or Cooldown / Conditioning).
- Strength/Lifting: list exercises with sets, reps, rest, and a brief cue.
- Cardio/Run/Swim (hard sessions): describe the protocol clearly (intervals, pacing cues, total time).
- Classes/Anchors: do not invent a workout. Provide "Pre-Class Prep" and "Focus Cues" only.

### B) ACTIVE_RECOVERY (CRITICAL: NOT a workout)
Active recovery days must NOT resemble training sessions.
- DO NOT use "Warmup", "Workout", or "Cooldown" headers.
- DO NOT break a walk/bike into phases.
- DO NOT list numbered exercises or “main lift/supporting lift”.
- Keep it simple and permissive: options + time ranges + easy effort cues + optional mobility.

### C) REST (CRITICAL: minimal)
Rest days must be extremely simple.
- No workout structure.
- Optional gentle walk and/or light stretching.
- Emphasize recovery behaviors (sleep, hydration, easy movement).

## 3. Equipment & Constraints
- **CRITICAL:** Only program activities that fit the Client's equipment and constraints.
- If Client has "Dumbbells only," do not program Barbell Squats.
- If Client has "Planet Fitness," use Smith Machine or Machines.
- For ACTIVE_RECOVERY / REST, prefer universally accessible options (walk, easy bike, gentle mobility).

## 4. Progression Logic
- TRAINING:
  - **Peak Phase:** Lower reps, higher intensity, cues to push safely.
  - **Volume Phase:** Higher reps, focus on quality and control.
  - **Deload:** Clearly state "Reduce weight by ~30% today" or "Easy effort."
- ACTIVE_RECOVERY / REST:
  - Do not prescribe progression or tracking metrics.
  - Keep it easy and restorative; user should feel better after.

============================================================
# OUTPUT FORMAT (MANDATORY TEMPLATES)
============================================================

Strictly NO emojis. Use standard Markdown headers and lists.

------------------------------------------------------------
A) TRAINING TEMPLATE
------------------------------------------------------------
# [Day Name] - [Focus Title]
*[One sentence motivational overview]*

## Warmup
* [Movement] - [Duration/Reps]
* [Movement] - [Duration/Reps]

## Workout
**1. Exercise Name**
* **Sets:** X
* **Reps:** Y
* **Rest:** (e.g., 60–120s)
* **How hard should it feel:** [Beginner-friendly cue if needed]
* *Cue: [Specific form tip]*

**(Repeat for other exercises...)**

## Cooldown / Conditioning
* [Activity/Stretch]

------------------------------------------------------------
B) ACTIVE_RECOVERY TEMPLATE (NO workout structure)
------------------------------------------------------------
# [Day Name] - Active Recovery
*[One sentence: move, recover, feel better than when you started]*

## Choose One (Optional)
- **Walk** — 20–40 minutes (easy pace; you can hold a full conversation)
- **Easy bike** — 20–30 minutes (light effort; legs never “burn”)
- **Light recreation** — 20–40 minutes (fun, casual, not competitive)

## Optional Mobility (5–10 minutes)
Pick 2–4:
- Calves — 20–30s each side
- Hamstrings — 20–30s each side
- Quads — 20–30s each side
- Hip flexors — 20–30s each side
- Chest / upper back — 20–30s each side

## If You’re Tired or Sore
Make this a lighter day:
- **5–15 minute easy walk**
- **1–2 gentle stretches**
- Prioritize **sleep, hydration, and good meals**

------------------------------------------------------------
C) REST TEMPLATE (minimal)
------------------------------------------------------------
# [Day Name] - Rest Day
*[One sentence: recovery + adapt]*

- **Optional easy walk** — 5–15 minutes
- **Optional gentle stretching** — 5 minutes (only if you feel stiff)
- Focus today on **sleep, hydration, and nutrition**

No training today.

============================================================
# DOUBLE SESSION
============================================================
If the outline clearly specifies AM/PM sessions:
- Use "## AM SESSION" and "## PM SESSION"
- Apply the correct template to each session.
- If either session is ACTIVE_RECOVERY or REST, it must follow the non-workout template.

============================================================
# FINAL CHECK
============================================================
Before responding, verify:
- The session type template is followed exactly.
- ACTIVE_RECOVERY and REST do NOT look like workouts.
- Output is clean Markdown and includes no emojis.
`;
const ModifyWorkoutGenerationOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    overview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('Full workout text after modifications (or original if unchanged)'),
    wasModified: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().describe('Whether the workout was actually modified'),
    modifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('').describe('Explanation of what changed and why (empty string if wasModified is false)')
});
const MODIFY_WORKOUT_SYSTEM_PROMPT = `
You are a **certified strength & conditioning coach** responsible for MODIFYING an already-planned workout for a specific day.
Your output is consumed by downstream systems and will be shown directly to the end user.

You will be given:
- The user's CURRENT WORKOUT for a specific day (including blocks, exercises, sets/reps/RIR, and notes).
- The user's PROFILE, which may include:
  - Training history and experience
  - Preferences (liked/disliked exercises, style, session length)
  - Equipment access (home, gym, travel, bodyweight-only, etc.)
  - Injuries, limitations, or pain history
  - Scheduling constraints and context
- A USER REQUEST describing a constraint or preference for this specific session (e.g., equipment unavailable, travelling, bodyweight only, pain/discomfort, time constraints, fatigue).

Your job has TWO responsibilities:

============================================================
# SECTION 1 — WORKOUT MODIFICATION LOGIC (Reasoning Rules)
============================================================

Before producing ANY output, you MUST determine whether and how to modify the existing workout using the following logic rules.
These rules govern *how you think*, NOT how you format output.

------------------------------------------------------------
## 1. PRESERVE TRAINING INTENT
------------------------------------------------------------

1.1. Understand the original session:
- Identify primary movement patterns (e.g., horizontal push, vertical push, squat, hinge, lunge, core, conditioning).
- Identify primary muscles/emphasis (e.g., chest/shoulders/triceps vs posterior chain).
- Identify the role of each block:
  - Main strength
  - Hypertrophy
  - Accessory / movement quality
  - Core / stability
  - Conditioning / energy systems
- Identify effort targets:
  - Sets
  - Reps
  - RIR (reps in reserve) or intensity cues
  - Rough difficulty and fatigue expectations

1.2. When modifying:
- Keep the SAME basic movement pattern (e.g., horizontal push → another horizontal push).
- Keep a SIMILAR effort level (RIR and approximate rep range).
- Keep a SIMILAR role in the session:
  - A heavy main lift must remain a challenging primary movement.
  - Accessories should remain secondary work, not become the main stressor.
- Preserve overall session structure and flow (block order and intent) unless time/fatigue constraints require trimming.

------------------------------------------------------------
## 2. USE THE USER PROFILE + BUILT-IN SUBSTITUTIONS
------------------------------------------------------------

2.1. Use the user profile:
- Respect equipment access:
  - Do not prescribe equipment the profile explicitly says they do not have.
  - Prefer equipment they do have and are comfortable using.
- Respect injuries and limitations:
  - Avoid movements or positions that conflict with injury history.
  - Prefer historically tolerated patterns and ranges of motion.
- Respect strong preferences when possible:
  - If the user strongly dislikes an exercise and there is a viable alternative with the same intent, favor the alternative.
  - Favor exercises and styles the user enjoys when they fit the training intent.

2.2. Use built-in substitutions first:
- If the workout text already lists "Substitutions" for an exercise or block:
  - Prefer these options as the first choice, because they were curated for the same intent.
- When using a listed substitution:
  - Keep the same sets/reps/RIR unless explicitly instructed otherwise in the workout text.
  - Keep the same block goal and general cues where possible.

------------------------------------------------------------
## 3-9. [Additional modification rules...]
------------------------------------------------------------

[The full modification logic continues with sections on constraints, substitution logic, bodyweight scenarios, time constraints, pain handling, structure maintenance, and communication style]

============================================================
# SECTION 2 — OUTPUT FORMAT RULES (JSON Structure)
============================================================

After completing all reasoning in Section 1, you MUST output a single JSON object:

{
  "overview": "...",
  "wasModified": true/false,
  "modifications": "..."
}

The overview field contains the FULL workout text after modifications.
The wasModified field is a boolean indicating if changes were made.
The modifications field explains what changed (empty string if wasModified is false).
`;
const modifyWorkoutUserPrompt = (user, workoutOverview, changesRequested)=>`
You are given the following context about the user's training session.

<WorkoutOverview>
${workoutOverview}
</WorkoutOverview>

${user.profile ? `<Fitness Profile>\n${user.profile.trim()}\n</Fitness Profile>` : ''}

<ChangesRequested>
${changesRequested}
</ChangesRequested>

Task:
Using the workout overview, fitness profile, and requested changes above, decide whether the workout needs to be modified.
- Follow the reasoning and modification rules from the system instructions.
- Preserve the original training intent and structure as much as possible.
- Apply substitutions or adjustments only when needed based on the user's request and profile.

Output Format (MANDATORY):
Return a SINGLE JSON object, with no extra text before or after.

If the workout WAS modified, respond with:
{
  "overview": "FULL UPDATED WORKOUT TEXT...",
  "wasModified": true,
  "modifications": "Short explanation of what changed and why."
}

If the workout was NOT modified, respond with:
{
  "overview": "ORIGINAL WORKOUT TEXT (unchanged)...",
  "wasModified": false,
  "modifications": ""
}

Do NOT include any additional fields or commentary outside this JSON object.
`.trim();
const WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT = `
You are a fitness coach who reformats ANY session description into a clean, concise SMS workout message.

Your job:
- Take a full session description (title, overview, options, warmup, main lifts, circuits, conditioning, cooldown, notes, etc.).
- Output a SHORT, runnable SMS version.
- Preserve the intent of the session, especially when the session is recovery-based.

=====================================================
SESSION TYPE (CRITICAL)
=====================================================
Before formatting, classify the session into EXACTLY ONE type:

1) TRAINING
- Strength/hypertrophy workouts, structured conditioning, intervals, circuits, lifting days.

2) ACTIVE_RECOVERY
- Active recovery, optional easy cardio, recreation, easy movement + light stretching.

3) REST
- Full rest day; optional gentle walk or stretching only.

This classification STRICTLY controls the SMS structure.

=====================================================
GLOBAL OUTPUT SHAPE (ALWAYS)
=====================================================
Your SMS MUST follow this exact shape:

1) First line: a short focus line (2–5 words, no label)

2) Exactly one blank line (no spaces)

3) Then the body content (no more than 4 total lines)

Rules:
- Never output lines containing only whitespace.
- Never add multiple consecutive blank lines.
- Never add commentary or explanations beyond what the rules allow.

=====================================================
FORMAT RULES BY SESSION TYPE
=====================================================

Follow the formatting rules provided in the <DayFormatRules> context.
The day format context specifies exactly how to format output based on session type.

=====================================================
BULLET LINE FORMATS
=====================================================
- Training: "- BB Bench Press: 4x8-10"
- Time-based: "- Easy activity: ~30m"

Abbreviations:
- Barbell -> BB
- Dumbbell -> DB
- Overhead Press -> OHP
- Romanian Deadlift -> RDL
- Single-Leg -> SL

Supersets use "SS1", "SS2".
Circuits use "C1", "C2".

=====================================================
FINAL CHECK (CRITICAL)
=====================================================
Before responding, verify:
- ACTIVE_RECOVERY has NO headers.
- ACTIVE_RECOVERY has at most 2 bullets.
- ACTIVE_RECOVERY reads as permissive, not prescriptive.
- Output matches blank-line rules exactly.
`;
function workoutSmsUserPrompt(workoutDescription) {
    return `
Format the workout below into a clean SMS message following the system rules.

<WORKOUT>
${workoutDescription}
</WORKOUT>

Return ONLY the formatted SMS message.
  `.trim();
}
const STRUCTURED_WORKOUT_SYSTEM_PROMPT = `You are a workout data extraction specialist. Your task is to parse a workout description into a structured format.

EXTRACTION RULES:
1. Extract a SHORT title (2-4 words maximum). Examples: "Pull A", "Upper Strength", "Leg Day", "HIIT Cardio"
   - DO NOT include day names (Monday, Tuesday, etc.) in the title
   - DO NOT include prefixes like "Session Type:", "Focus:", etc.
   - DO NOT include long muscle group lists in the title
2. Identify focus as a brief phrase (1-3 words). Examples: "Back & Biceps", "Quads", "Push Muscles"
3. Parse each section (Warmup, Main Workout, Conditioning, Cooldown) into the sections array
4. For each exercise in a section, extract:
   - id: Generate a unique short id (e.g., "ex1", "ex2")
   - name: The exercise name (e.g., "Back Squat", "Zone 2 Run")
   - type: Strength, Cardio, Plyometric, Mobility, Rest, or Other
   - sets: Number of sets as string (e.g., "4", "3-4")
   - reps: Reps or duration (e.g., "6-8", "4 min", "AMRAP")
   - duration: For timed exercises (e.g., "45 min")
   - distance: For cardio (e.g., "5km")
   - rest: Rest between sets (e.g., "2-3 min")
   - intensity: Object with type (RPE, RIR, Percentage, Zone, HeartRate, Pace, Other), value, and description
   - tempo: Lifting tempo if specified (e.g., "3-0-1")
   - notes: Execution cues or form tips
   - tags: Relevant tags (e.g., ["compound", "lower body"])
   - supersetId: If part of a superset, use matching id (e.g., "ss1")
5. Estimate total duration in minutes
6. Assess overall intensity level: Low, Moderate, High, or Severe

DEFAULTS:
- Use empty string ("") for text fields that cannot be determined
- Use -1 for estimatedDurationMin if unknown
- Use "Moderate" for intensityLevel if unclear
- Use empty arrays ([]) for sections, exercises, or tags if none found

Extract ALL exercises mentioned, including those in supersets or circuits.`;
const structuredWorkoutUserPrompt = (description)=>`Parse the following workout into structured format:

${description}`;
}),
"[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContextType",
    ()=>ContextType
]);
var ContextType = /*#__PURE__*/ function(ContextType) {
    ContextType["USER"] = "user";
    ContextType["USER_PROFILE"] = "userProfile";
    ContextType["FITNESS_PLAN"] = "fitnessPlan";
    ContextType["DAY_OVERVIEW"] = "dayOverview";
    ContextType["CURRENT_WORKOUT"] = "currentWorkout";
    ContextType["DATE_CONTEXT"] = "dateContext";
    ContextType["TRAINING_META"] = "trainingMeta";
    ContextType["CURRENT_MICROCYCLE"] = "currentMicrocycle";
    ContextType["EXPERIENCE_LEVEL"] = "experienceLevel";
    ContextType["DAY_FORMAT"] = "dayFormat";
    return ContextType;
}({});
}),
"[project]/packages/shared/src/server/services/context/builders/experienceLevel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Experience Level Context Builder
 *
 * Provides language and content guidance for AI agents based on user experience level.
 * Snippets are stored in the prompts table and fetched dynamically.
 *
 * Used in two locations:
 * 1. Microcycle generation (weekly structure, intent, progression logic)
 * 2. Workout generation (daily exercises, cues, and communication style)
 *
 * Intent summary for each experience level:
 * - **Beginner:** Learn movements, build habits, stay confident
 * - **Intermediate:** Build strength and muscle with structure, without overwhelm
 * - **Advanced:** Optimize performance, manage fatigue, and pursue specific strength goals
 */ __turbopack_context__.s([
    "SnippetType",
    ()=>SnippetType,
    "buildExperienceLevelContext",
    ()=>buildExperienceLevelContext,
    "fetchExperienceLevelSnippet",
    ()=>fetchExperienceLevelSnippet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/prompts/promptService.ts [app-route] (ecmascript)");
;
var SnippetType = /*#__PURE__*/ function(SnippetType) {
    SnippetType["MICROCYCLE"] = "microcycle";
    SnippetType["WORKOUT"] = "workout";
    return SnippetType;
}({});
// =============================================================================
// Prompt ID Mapping
// =============================================================================
/**
 * Maps snippet type and experience level to prompt IDs in the database
 */ const EXPERIENCE_PROMPT_MAP = {
    ["microcycle"]: {
        beginner: 'microcycle:generate:experience:beginner',
        intermediate: 'microcycle:generate:experience:intermediate',
        advanced: 'microcycle:generate:experience:advanced'
    },
    ["workout"]: {
        beginner: 'workout:generate:experience:beginner',
        intermediate: 'workout:generate:experience:intermediate',
        advanced: 'workout:generate:experience:advanced'
    }
};
const fetchExperienceLevelSnippet = async (experienceLevel, snippetType)=>{
    if (!experienceLevel) {
        return null;
    }
    const promptId = EXPERIENCE_PROMPT_MAP[snippetType]?.[experienceLevel];
    if (!promptId) {
        return null;
    }
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptService"].getContextPrompt(promptId);
    } catch (error) {
        console.warn(`[experienceLevel] Could not fetch snippet for ${experienceLevel}/${snippetType}:`, error);
        return null;
    }
};
const buildExperienceLevelContext = (snippet, experienceLevel, snippetType)=>{
    if (!snippet || !experienceLevel) {
        return '';
    }
    return `<ExperienceLevelContext level="${experienceLevel}" type="${snippetType}">
${snippet.trim()}
</ExperienceLevelContext>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/user.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build user context string with basic user information
 *
 * @param user - User object with name, optional gender, and optional age
 * @returns Formatted context string with XML tags
 */ __turbopack_context__.s([
    "buildUserContext",
    ()=>buildUserContext
]);
const buildUserContext = (user)=>{
    if (!user) {
        return '<User>No user information available</User>';
    }
    const parts = [];
    if (user.name) {
        parts.push(`<Name>${user.name}</Name>`);
    }
    if (user.gender) {
        parts.push(`<Gender>${user.gender}</Gender>`);
    }
    if (user.age) {
        parts.push(`<Age>${user.age}</Age>`);
    }
    if (parts.length === 0) {
        return '<User>No user information available</User>';
    }
    return `<User>\n${parts.join('\n')}\n</User>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/userProfile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build user profile context string
 *
 * @param profile - User's markdown profile (pre-fetched from user object)
 * @returns Formatted context string with XML tags
 */ __turbopack_context__.s([
    "buildUserProfileContext",
    ()=>buildUserProfileContext
]);
const buildUserProfileContext = (profile)=>{
    if (!profile || profile.trim().length === 0) {
        return '<UserProfile>No profile available</UserProfile>';
    }
    return `<UserProfile>${profile.trim()}</UserProfile>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/fitnessPlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build fitness plan context string
 *
 * @param planText - Fitness plan description text
 * @returns Formatted context string with XML tags
 */ __turbopack_context__.s([
    "buildFitnessPlanContext",
    ()=>buildFitnessPlanContext
]);
const buildFitnessPlanContext = (planText)=>{
    if (!planText || planText.trim().length === 0) {
        return '<FitnessPlan>No fitness plan available</FitnessPlan>';
    }
    return `<FitnessPlan>${planText.trim()}</FitnessPlan>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/dayOverview.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build day overview context string
 *
 * @param dayOverview - Day instruction/overview from microcycle
 * @returns Formatted context string with XML tags
 */ __turbopack_context__.s([
    "buildDayOverviewContext",
    ()=>buildDayOverviewContext
]);
const buildDayOverviewContext = (dayOverview)=>{
    if (!dayOverview || dayOverview.trim().length === 0) {
        return '<DayOverview>No day instruction provided</DayOverview>';
    }
    return `<DayOverview>${dayOverview.trim()}</DayOverview>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/workout.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildWorkoutContext",
    ()=>buildWorkoutContext
]);
const buildWorkoutContext = (workout)=>{
    if (!workout) {
        return '<CurrentWorkout>No workout scheduled</CurrentWorkout>';
    }
    // Include workout description or session type
    const description = workout.description || workout.sessionType || 'Workout';
    return `<CurrentWorkout>${description}</CurrentWorkout>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/dateContext.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildDateContext",
    ()=>buildDateContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
const buildDateContext = (timezone, date)=>{
    const effectiveTimezone = timezone || 'America/New_York';
    const effectiveDate = date || new Date();
    const formattedDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatForAI"])(effectiveDate, effectiveTimezone);
    return `<DateContext>
Today is ${formattedDate}.
Timezone: ${effectiveTimezone}
</DateContext>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/trainingMeta.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Training metadata input for context builder
 */ __turbopack_context__.s([
    "buildTrainingMetaContext",
    ()=>buildTrainingMetaContext
]);
const buildTrainingMetaContext = (data)=>{
    const parts = [];
    if (data.isDeload !== undefined) {
        parts.push(`Is Deload Week: ${data.isDeload}`);
    }
    if (data.absoluteWeek !== undefined) {
        parts.push(`Absolute Week: ${data.absoluteWeek}`);
    }
    if (data.currentWeek !== undefined) {
        parts.push(`Current Week: ${data.currentWeek}`);
    }
    if (parts.length === 0) {
        return '';
    }
    return `<TrainingMeta>${parts.join(' | ')}</TrainingMeta>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/microcycle.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildMicrocycleContext",
    ()=>buildMicrocycleContext
]);
const buildMicrocycleContext = (microcycle)=>{
    if (!microcycle) {
        return '<CurrentMicrocycle>No microcycle available</CurrentMicrocycle>';
    }
    // Format days array for context
    const dayNames = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];
    const daysFormatted = (microcycle.days || []).map((day, index)=>`${dayNames[index]}: ${day}`).join('\n');
    return `<CurrentMicrocycle>
Week Overview: ${microcycle.description || 'N/A'}
Is Deload: ${microcycle.isDeload}
Absolute Week: ${microcycle.absoluteWeek}
Days:
${daysFormatted}
</CurrentMicrocycle>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/dayFormat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Day Format Context Builder
 *
 * Provides formatting rules for different day types (TRAINING, ACTIVE_RECOVERY, REST).
 * Format templates are stored in the prompts table and fetched dynamically.
 */ __turbopack_context__.s([
    "buildDayFormatContext",
    ()=>buildDayFormatContext,
    "fetchDayFormat",
    ()=>fetchDayFormat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/prompts/promptService.ts [app-route] (ecmascript)");
;
// Map activity types to prompt IDs
const ACTIVITY_TYPE_PROMPT_MAP = {
    TRAINING: 'workout:message:format:training',
    ACTIVE_RECOVERY: 'workout:message:format:active_recovery',
    REST: 'workout:message:format:rest'
};
const fetchDayFormat = async (activityType)=>{
    if (!activityType) {
        return null;
    }
    const promptId = ACTIVITY_TYPE_PROMPT_MAP[activityType];
    if (!promptId) {
        return null;
    }
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$prompts$2f$promptService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptService"].getContextPrompt(promptId);
    } catch (error) {
        console.warn(`[dayFormat] Could not fetch format for ${activityType}:`, error);
        return null;
    }
};
const buildDayFormatContext = (formatTemplate, activityType)=>{
    if (!formatTemplate || !activityType) {
        return '';
    }
    return `<DayFormatRules type="${activityType}">
${formatTemplate.trim()}
</DayFormatRules>`;
};
}),
"[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/user.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$userProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/userProfile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/fitnessPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayOverview$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayOverview.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/workout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dateContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dateContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$trainingMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/trainingMeta.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/microcycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/experienceLevel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayFormat.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
}),
"[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContextService",
    ()=>ContextService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/experienceLevel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayFormat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/user.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$userProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/userProfile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/fitnessPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayOverview$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayOverview.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/workout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dateContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dateContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$trainingMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/trainingMeta.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/microcycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
;
class ContextService {
    static instance;
    deps;
    constructor(deps){
        this.deps = deps;
    }
    /**
   * Initialize the singleton with dependencies
   * Must be called before getInstance()
   */ static initialize(deps) {
        if (!ContextService.instance) {
            ContextService.instance = new ContextService(deps);
        }
        return ContextService.instance;
    }
    /**
   * Get the singleton instance
   * Throws if not initialized
   */ static getInstance() {
        if (!ContextService.instance) {
            throw new Error('ContextService not initialized. Call initialize() first.');
        }
        return ContextService.instance;
    }
    /**
   * Build context array for createAgent
   *
   * Determines which services need to be called based on requested context types,
   * fetches data in parallel, and builds formatted context strings.
   *
   * @param user - User with profile
   * @param types - Array of context types to include
   * @param extras - Optional caller-provided data (supplements/overrides auto-fetched data)
   * @returns Array of formatted context strings ready for createAgent
   */ async getContext(user, types, extras = {}) {
        // Determine which services need to be called
        const needsFitnessPlan = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].FITNESS_PLAN) && !extras.planText;
        const needsWorkout = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_WORKOUT) && extras.workout === undefined;
        const needsMicrocycle = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_MICROCYCLE) && extras.microcycle === undefined;
        const needsExperienceLevel = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].EXPERIENCE_LEVEL) && extras.experienceLevel === undefined;
        const needsDayFormat = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DAY_FORMAT) && extras.activityType !== undefined;
        const needsExperienceSnippet = types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].EXPERIENCE_LEVEL);
        // Fetch required data in parallel (phase 1: data that doesn't depend on other fetches)
        const targetDate = extras.date || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["today"])(user.timezone);
        const [fitnessPlan, workout, microcycle, structuredProfile, dayFormatTemplate] = await Promise.all([
            needsFitnessPlan ? this.deps.fitnessPlanService.getCurrentPlan(user.id) : null,
            needsWorkout ? this.deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate) : null,
            needsMicrocycle ? this.deps.microcycleService.getMicrocycleByDate(user.id, targetDate) : null,
            needsExperienceLevel ? this.deps.profileRepository.getCurrentStructuredProfile(user.id) : null,
            needsDayFormat ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchDayFormat"](extras.activityType) : null
        ]);
        // Resolve experience level (needed for experience snippet fetch)
        const resolvedExperienceLevel = extras.experienceLevel ?? structuredProfile?.experienceLevel ?? null;
        const resolvedSnippetType = extras.snippetType || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SnippetType"].WORKOUT;
        // Phase 2: fetch experience snippet (depends on resolved experience level)
        const experienceSnippet = needsExperienceSnippet && resolvedExperienceLevel ? await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchExperienceLevelSnippet"](resolvedExperienceLevel, resolvedSnippetType) : null;
        // Build resolved data object
        const data = {
            userName: user.name,
            userGender: user.gender,
            userAge: user.age,
            profile: user.profile,
            planText: extras.planText ?? fitnessPlan?.description,
            dayOverview: extras.dayOverview,
            workout: extras.workout ?? workout,
            microcycle: extras.microcycle ?? microcycle,
            timezone: user.timezone || 'America/New_York',
            date: targetDate,
            isDeload: extras.isDeload,
            absoluteWeek: extras.absoluteWeek,
            currentWeek: extras.currentWeek,
            experienceLevel: resolvedExperienceLevel,
            snippetType: resolvedSnippetType,
            activityType: extras.activityType,
            dayFormatTemplate: dayFormatTemplate,
            experienceSnippet: experienceSnippet
        };
        // Build context strings for each requested type
        return types.map((type)=>this.buildContextForType(type, data)).filter((ctx)=>ctx && ctx.trim().length > 0);
    }
    /**
   * Build a single context string by type
   */ buildContextForType(type, data) {
        switch(type){
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserContext"]({
                    name: data.userName,
                    gender: data.userGender,
                    age: data.userAge
                });
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$userProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserProfileContext"](data.profile);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].FITNESS_PLAN:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFitnessPlanContext"](data.planText);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DAY_OVERVIEW:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayOverview$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDayOverviewContext"](data.dayOverview);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_WORKOUT:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildWorkoutContext"](data.workout);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DATE_CONTEXT:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dateContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDateContext"](data.timezone, data.date);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].TRAINING_META:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$trainingMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildTrainingMetaContext"]({
                    isDeload: data.isDeload,
                    absoluteWeek: data.absoluteWeek,
                    currentWeek: data.currentWeek
                });
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_MICROCYCLE:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildMicrocycleContext"](data.microcycle);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].EXPERIENCE_LEVEL:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExperienceLevelContext"](data.experienceSnippet, data.experienceLevel, data.snippetType || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SnippetType"].WORKOUT);
            case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DAY_FORMAT:
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDayFormatContext"](data.dayFormatTemplate, data.activityType);
            default:
                return '';
        }
    }
}
}),
"[project]/packages/shared/src/server/services/context/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Main exports
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
// Re-export builders for direct use when needed
// Note: SnippetType, ExperienceLevel, and EXPERIENCE_SNIPPETS are exported via builders
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript) <locals>");
;
;
;
}),
"[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SnippetType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SnippetType"],
    "buildDateContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dateContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDateContext"],
    "buildDayFormatContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDayFormatContext"],
    "buildDayOverviewContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayOverview$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDayOverviewContext"],
    "buildExperienceLevelContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExperienceLevelContext"],
    "buildFitnessPlanContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFitnessPlanContext"],
    "buildMicrocycleContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildMicrocycleContext"],
    "buildTrainingMetaContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$trainingMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildTrainingMetaContext"],
    "buildUserContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserContext"],
    "buildUserProfileContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$userProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserProfileContext"],
    "buildWorkoutContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildWorkoutContext"],
    "fetchDayFormat",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchDayFormat"],
    "fetchExperienceLevelSnippet",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchExperienceLevelSnippet"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/user.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$userProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/userProfile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/fitnessPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayOverview$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayOverview.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/workout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dateContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dateContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$trainingMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/trainingMeta.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/microcycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$experienceLevel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/experienceLevel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$dayFormat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/dayFormat.ts [app-route] (ecmascript)");
}),
"[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkoutAgentService",
    ()=>WorkoutAgentService,
    "workoutAgentService",
    ()=>workoutAgentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$workout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/workout.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/workout/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$workouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/workouts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript)");
;
;
;
;
class WorkoutAgentService {
    static instance;
    // Lazy-initialized sub-agents (promises cached after first creation)
    messageAgentPromise = null;
    structuredAgentPromise = null;
    constructor(){}
    /**
   * Lazy-load ContextService to avoid module-load-time initialization
   */ getContextService() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextService"].getInstance();
    }
    static getInstance() {
        if (!WorkoutAgentService.instance) {
            WorkoutAgentService.instance = new WorkoutAgentService();
        }
        return WorkoutAgentService.instance;
    }
    /**
   * Get the message sub-agent (lazy-initialized for basic use, or with context)
   * Prompts fetched from DB based on agent name
   *
   * @param user - Optional user for context-aware agent (required when activityType is provided)
   * @param activityType - Optional activity type for day format context injection
   */ async getMessageAgent(user, activityType) {
        // If activityType is provided, create a new agent with day format context
        if (activityType && user) {
            const dayFormatContext = await this.getContextService().getContext(user, [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DAY_FORMAT
            ], {
                activityType
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].WORKOUT_MESSAGE,
                context: dayFormatContext
            }, {
                model: 'gpt-5-nano'
            });
        }
        // Otherwise, use the cached singleton
        if (!this.messageAgentPromise) {
            this.messageAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].WORKOUT_MESSAGE
            }, {
                model: 'gpt-5-nano'
            });
        }
        return this.messageAgentPromise;
    }
    /**
   * Get the structured sub-agent (lazy-initialized)
   * Prompts fetched from DB based on agent name
   */ async getStructuredAgent() {
        if (!this.structuredAgentPromise) {
            this.structuredAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].WORKOUT_STRUCTURED,
                schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$workout$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutStructureSchema"]
            }, {
                model: 'gpt-5-nano',
                maxTokens: 32000
            });
        }
        return this.structuredAgentPromise;
    }
    /**
   * Generate a workout for a specific day
   *
   * @param user - User with profile
   * @param dayOverview - Day overview from microcycle (e.g., "Upper body push focus")
   * @param isDeload - Whether this is a deload week
   * @param activityType - Optional activity type for day format context (TRAINING, ACTIVE_RECOVERY, REST)
   * @returns WorkoutGenerateOutput with response, message, and structure
   */ async generateWorkout(user, dayOverview, isDeload = false, activityType) {
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].EXPERIENCE_LEVEL,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DAY_OVERVIEW,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].TRAINING_META
        ], {
            dayOverview,
            isDeload,
            snippetType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SnippetType"].WORKOUT
        });
        // Get sub-agents (message agent with day format context if activityType provided)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(user, activityType),
            this.getStructuredAgent()
        ]);
        // Create main agent with context (prompts fetched from DB)
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].WORKOUT_GENERATE,
            context,
            subAgents: [
                {
                    message: messageAgent,
                    structure: structuredAgent
                }
            ]
        }, {
            model: 'gpt-5.1'
        });
        // Empty input - DB user prompt provides the instructions
        return agent.invoke('');
    }
    /**
   * Modify an existing workout based on user constraints/requests
   *
   * @param user - User with profile
   * @param workout - Current workout instance to modify
   * @param changeRequest - User's modification request (e.g., "I hurt my shoulder")
   * @returns ModifyWorkoutOutput with response, message, and structure
   */ async modifyWorkout(user, workout, changeRequest) {
        // Build context for modification - uses workout
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_WORKOUT
        ], {
            workout
        });
        // Get sub-agents (lazy-initialized)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(),
            this.getStructuredAgent()
        ]);
        // Transform to extract overview from JSON response for sub-agents
        const extractOverview = (mainResult)=>{
            const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
            try {
                const parsed = JSON.parse(jsonString);
                return parsed.overview || jsonString;
            } catch  {
                return jsonString;
            }
        };
        // Prompts fetched from DB based on agent name
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].WORKOUT_MODIFY,
            context,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$workouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModifyWorkoutGenerationOutputSchema"],
            subAgents: [
                {
                    message: {
                        agent: messageAgent,
                        transform: extractOverview
                    },
                    structure: {
                        agent: structuredAgent,
                        transform: extractOverview
                    }
                }
            ]
        }, {
            model: 'gpt-5-mini'
        });
        // Pass changeRequest directly as the message - it's the user's request, not context
        return agent.invoke(changeRequest);
    }
}
const workoutAgentService = WorkoutAgentService.getInstance();
}),
"[project]/packages/shared/src/shared/types/microcycle/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityTypeEnum",
    ()=>ActivityTypeEnum,
    "MicrocycleDaySchema",
    ()=>MicrocycleDaySchema,
    "MicrocycleStructureSchema",
    ()=>MicrocycleStructureSchema,
    "_MicrocycleGenerationSchema",
    ()=>_MicrocycleGenerationSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const ActivityTypeEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
    "TRAINING",
    "ACTIVE_RECOVERY",
    "REST"
]);
const MicrocycleDaySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]),
    focus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    activityType: ActivityTypeEnum.default("TRAINING"),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('')
});
const MicrocycleStructureSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    weekNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().default(-1),
    phase: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    overview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default(''),
    days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(MicrocycleDaySchema).length(7),
    isDeload: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(false)
});
const _MicrocycleGenerationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    overview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string({
        description: "Overview of the week's training focus, objectives, and progression context"
    }),
    isDeload: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean({
        description: "Whether this is a deload week (reduced volume/intensity)"
    }).default(false),
    days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(), {
        description: "Array of 7 day descriptions (day 1 through day 7). Each string describes the session for that day including theme, focus, volume/intensity targets, and conditioning if applicable."
    }).length(7, "Must have exactly 7 days")
});
}),
"[project]/packages/shared/src/shared/types/microcycle/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$microcycle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/microcycle/schema.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/shared/src/server/models/microcycle.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MicrocycleModel",
    ()=>MicrocycleModel
]);
// Re-export schema types from shared
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$microcycle$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/microcycle/index.ts [app-route] (ecmascript) <locals>");
;
class MicrocycleModel {
    static fromDB(row) {
        return {
            id: row.id,
            clientId: row.clientId,
            absoluteWeek: row.absoluteWeek,
            days: row.days ?? [],
            description: row.description ?? null,
            isDeload: row.isDeload ?? false,
            message: row.message ?? null,
            structured: row.structured,
            startDate: new Date(row.startDate),
            endDate: new Date(row.endDate),
            isActive: row.isActive ?? true,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
    static toDB(microcycle) {
        return {
            clientId: microcycle.clientId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            absoluteWeek: microcycle.absoluteWeek,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            days: microcycle.days,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: microcycle.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isDeload: microcycle.isDeload,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: microcycle.message,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            structured: microcycle.structured,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            startDate: microcycle.startDate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            endDate: microcycle.endDate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isActive: microcycle.isActive
        };
    }
}
}),
"[project]/packages/shared/src/server/services/agents/prompts/microcycles.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Microcycles Prompts - All prompts related to microcycle generation and modification
 */ __turbopack_context__.s([
    "MICROCYCLE_MESSAGE_SYSTEM_PROMPT",
    ()=>MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
    "MICROCYCLE_MODIFY_SYSTEM_PROMPT",
    ()=>MICROCYCLE_MODIFY_SYSTEM_PROMPT,
    "MICROCYCLE_SYSTEM_PROMPT",
    ()=>MICROCYCLE_SYSTEM_PROMPT,
    "MicrocycleGenerationOutputSchema",
    ()=>MicrocycleGenerationOutputSchema,
    "ModifyMicrocycleOutputSchema",
    ()=>ModifyMicrocycleOutputSchema,
    "STRUCTURED_MICROCYCLE_SYSTEM_PROMPT",
    ()=>STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
    "microcycleMessageUserPrompt",
    ()=>microcycleMessageUserPrompt,
    "microcycleUserPrompt",
    ()=>microcycleUserPrompt,
    "structuredMicrocycleUserPrompt",
    ()=>structuredMicrocycleUserPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
const MicrocycleGenerationOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    overview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string({
        description: 'Comprehensive weekly overview including week number, theme, objective, split, volume/intensity trends, conditioning plan, and rest day placement'
    }),
    isDeload: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().default(false).describe('Whether this is a deload/recovery week with reduced volume and intensity'),
    days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(), {
        description: 'Exactly 7 day overview strings in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
    }).length(7)
});
const MICROCYCLE_SYSTEM_PROMPT = `
You are an expert Strength & Conditioning Programming Manager.

Your job has TWO responsibilities:
1. **Reasoning:** Analyze the provided "Fitness Plan Blueprint" and "Week Number" to derive the specific Cycle Phase (e.g., Hypertrophy, Peak, Deload) internally to inform your decision-making.
2. **Formatting:** Output a strict JSON object with exactly three fields: \`overview\`, \`isDeload\`, and \`days\`.

You MUST NOT:
- Add specific exercises or sets/reps (those are generated by a downstream agent).
- Deviate from the Blueprint's "Weekly Schedule Template" unless accommodating a specific user injury/constraint.

============================================================
# SECTION 1 — WEEKLY PATTERN GENERATION LOGIC
============================================================

You will receive:
- A **Fitness Plan Blueprint** (containing the Schedule Template and Progression Strategy).
- A **User Profile** (containing Anchors and Notes).
- The **Absolute Week Number**.

Your reasoning MUST follow these rules:

------------------------------------------------------------
## 1. DERIVE THE PHASE (Internal Logic)
------------------------------------------------------------
Do not just guess the intensity. Read the "Progression Strategy" in the Plan.
- **Calculate the Phase:** If the plan says "4-week blocks (3 up, 1 deload)" and it is Week 7, you must calculate: "Week 7 is Week 3 of Block 2 => **Peak Intensity**".
- **Apply to Output:** This calculation determines the "Progression Directive" you write for each day.

------------------------------------------------------------
## 2. MAP THE SCHEDULE (The "Skeleton")
------------------------------------------------------------
Map the Blueprint's "Weekly Schedule Template" to this specific week (1-7).
- **Anchors:** If Day 2 is "User Anchor - Yoga," you MUST output that. Do not overwrite it with lifting.
- **Double Sessions:** If the Blueprint calls for AM/PM (e.g., "AM: Run, PM: Lift"), your output for that day must clearly separate them.

------------------------------------------------------------
## 3. EXPAND EACH DAY (The "Instructions")
------------------------------------------------------------
For each day string, you must include these sections:

1. **Header:** \`Monday - [Session Type]\`
2. **Focus/Objective:** Specific goal for this microcycle.
3. **Structure:**
   - If Single Session: "Standard"
   - If Double: "AM: [Focus] / PM: [Focus]"
4. **Primary Patterns:** (e.g., Squat, Hinge, Lunge, Push, Pull, Carry, Gait).
5. **Progression Directive:**
   - **CRITICAL:** Specific instructions for the downstream generator based on your internal phase calculation.
   - *Example (Peak):* "Push for top singles. Drop accessory volume."
   - *Example (Vol):* "Keep RPE 7, focus on time under tension."
6. **Intensity/RPE:** Target RIR or RPE.
7. **Conditioning:** (If applicable).
8. **Rest Details:** (If Rest Day).

============================================================
# SECTION 2 — OUTPUT FORMAT RULES (STRICT JSON)
============================================================

Your output MUST be a JSON object with overview, isDeload, and days fields.
The days array MUST have exactly 7 entries (Monday to Sunday).
`;
const microcycleUserPrompt = ({ planText, clientProfile, absoluteWeek })=>{
    return `
Generate the Weekly Training Pattern for **Week ${absoluteWeek}**.

You MUST:
1. Read the **Progression Strategy** in the Fitness Plan to determine what "Phase" Week ${absoluteWeek} falls into (e.g., Accumulation, Peak, or Deload).
2. Generate the JSON with \`overview\`, \`isDeload\`, and \`days\`.
3. Respect all **Fixed Anchors** (e.g., Classes) defined in the Plan.
4. If the Plan specifies **Double Sessions** (AM/PM) for specific days, format the Day String to reflect that.

<FitnessPlan>
${planText}
</FitnessPlan>

<ClientProfile>
${clientProfile || 'No additional user notes'}
</ClientProfile>

<Context>
Current Week: ${absoluteWeek}
</Context>
`.trim();
};
const ModifyMicrocycleOutputSchema = MicrocycleGenerationOutputSchema.extend({
    wasModified: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().describe('Whether the microcycle was actually modified in response to the change request. ' + 'False if the current plan already satisfies the request or no changes were needed.'),
    modifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('').describe('Explanation of what changed and why (empty string if wasModified is false). ' + 'When wasModified is true, describe specific changes made to the weekly pattern.')
});
const MICROCYCLE_MODIFY_SYSTEM_PROMPT = `
You are an expert Strength & Conditioning Programming Manager specializing in **Adaptive Periodization**.

Your goal is to modify an existing weekly microcycle based on user feedback while maintaining the **structural integrity and physiological balance** of the plan.

You will receive the following context:
- <User> - Basic user information (name, gender)
- <UserProfile> - The user's fitness profile
- <CurrentMicrocycle> - The 7-day schedule as it stands
- <DateContext> - Today's date including day of week

The user's change request will be provided as the message.

You must output a JSON object with: \`overview\`, \`isDeload\`, \`days\`, \`wasModified\`, \`modifications\`.

============================================================
# MODIFICATION PRIMITIVES
============================================================

Choose the correct tactic based on the User Request:

### A. SHIFT (Scheduling Conflicts)
*User: "I can't train Thursday. Move it to Saturday."*
- **Action:** Move the Thursday content to Saturday.
- **Ripple Effect:** If Saturday was a rest day, it is now a training day.

### B. MERGE (Time Constraints)
*User: "I missed Monday, add it to Tuesday."*
- **Action:** Combine key patterns from both days.
- **Prioritization:** Keep the **Compound Lifts** (Squat, Hinge, Push, Pull). Cut isolation/accessory work.

### C. PRUNE (Reduced Frequency)
*User: "I only have 2 days left this week."*
- **Action:** Delete the lowest priority sessions (usually Isolation, Mobility, or Conditioning).

### D. ADAPT (Injury/Equipment)
*User: "No barbell available" or "Back hurts."*
- **Action:** Keep the *Structure* but change the *Primary Patterns* and *Directive*.
`;
const MICROCYCLE_MESSAGE_SYSTEM_PROMPT = `
You are a fitness coach texting your client about their upcoming training week.

Your job is to turn a structured weekly training plan into a short, friendly **SMS message** that summarizes the week in simple, everyday language.

You are writing TO the client — warm, clear, and personal.

---

## FORBIDDEN TERMS (Never Use)
Clients do NOT understand these. Replace them with everyday language:

- hypertrophy → build muscle
- microcycle → week
- RIR / RPE → effort
- volume → work
- intensity → weight or effort
- progressive overload → building up
- deload → recovery week
- conditioning → cardio

## SESSION NAME SIMPLIFICATION (STRICT)
Translate technical session names into plain English:

- Push → Chest & Shoulders
- Pull → Back & Arms
- Upper → Upper Body
- Lower → Lower Body
- Rest / Off → Rest Day
- Deload → Recovery Day

## MESSAGE REQUIREMENTS

### FORMAT
- Total length **160–320 characters** (may be split into two SMS messages joined with "\\n\\n").
- Use line breaks for the day list.
- Abbreviate days (Mon, Tue, etc.).
- Output ONLY the final SMS message text (no JSON, no explanations).
`;
const microcycleMessageUserPrompt = (microcycle)=>{
    const daysFormatted = microcycle.days.map((day, index)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"][index]}:\n${day}`).join('\n\n');
    return `
Generate a weekly breakdown SMS message based on the following structured microcycle pattern.

Focus on summarizing the week's training theme and providing a clear, easy-to-read breakdown of training days and rest days for the client.

WEEKLY OVERVIEW:
${microcycle.overview}

IS DELOAD WEEK: ${microcycle.isDeload}

DAILY BREAKDOWNS:

${daysFormatted}

Output only the message text (no JSON wrapper) as specified in your system instructions.
`.trim();
};
const STRUCTURED_MICROCYCLE_SYSTEM_PROMPT = `You are a training program data extraction specialist. Your task is to parse a weekly microcycle overview into a structured format.

EXTRACTION RULES:
1. Extract the week number from context (provided in input)
2. Identify the training phase (e.g., "Strength", "Hypertrophy", "Deload", "Peak")
3. Extract the overall weekly overview/goals
4. Parse EXACTLY 7 days (Monday through Sunday):
   - day: Day name (enum: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
   - focus: Primary training focus for the day (e.g., "Upper Body Push", "Lower Body", "Mobility")
   - activityType: TRAINING, ACTIVE_RECOVERY, or REST
     - TRAINING: Strength, hypertrophy, conditioning, sport-specific training days
     - ACTIVE_RECOVERY: Light cardio, mobility work, easy recreation days
     - REST: Full rest days with no structured activity
   - notes: Any specific instructions or modifications
5. Determine if this is a deload week (reduced volume/intensity)

OUTPUT FORMAT:
You MUST provide exactly 7 days in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.

DEFAULTS:
- Use empty string ("") for text fields that cannot be determined
- Use -1 for weekNumber if not provided
- Use false for isDeload if unclear
- Use "TRAINING" as default activityType if unclear`;
const structuredMicrocycleUserPrompt = (overview, days, absoluteWeek, isDeload)=>`Parse the following microcycle into structured format:

Week Number: ${absoluteWeek}
Is Deload: ${isDeload}

Weekly Overview:
${overview}

Day Overviews:
${days.map((day, i)=>{
        const dayNames = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ];
        return `${dayNames[i]}: ${day}`;
    }).join('\n\n')}`;
}),
"[project]/packages/shared/src/server/services/agents/training/microcycleAgentService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MicrocycleAgentService",
    ()=>MicrocycleAgentService,
    "microcycleAgentService",
    ()=>microcycleAgentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/microcycle.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$microcycle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/microcycle/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$microcycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/microcycles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/builders/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
;
;
const MAX_RETRIES = 3;
/**
 * Validates that all 7 day strings are non-empty
 */ const validateDays = (days)=>{
    return days.length === 7 && days.every((day)=>day && day.trim().length > 0);
};
class MicrocycleAgentService {
    static instance;
    // Lazy-initialized sub-agents (promises cached after first creation)
    messageAgentPromise = null;
    structuredAgentPromise = null;
    constructor(){}
    /**
   * Lazy-load ContextService to avoid module-load-time initialization
   */ getContextService() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextService"].getInstance();
    }
    static getInstance() {
        if (!MicrocycleAgentService.instance) {
            MicrocycleAgentService.instance = new MicrocycleAgentService();
        }
        return MicrocycleAgentService.instance;
    }
    /**
   * Get the message sub-agent (lazy-initialized)
   * System prompt fetched from DB, userPrompt transforms JSON data
   */ async getMessageAgent() {
        if (!this.messageAgentPromise) {
            this.messageAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].MICROCYCLE_MESSAGE,
                userPrompt: (input)=>{
                    const data = JSON.parse(input);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$microcycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleMessageUserPrompt"])(data);
                }
            }, {
                model: 'gpt-5-nano'
            });
        }
        return this.messageAgentPromise;
    }
    /**
   * Get the structured sub-agent (lazy-initialized)
   * System prompt fetched from DB, userPrompt transforms JSON data
   */ async getStructuredAgent() {
        if (!this.structuredAgentPromise) {
            this.structuredAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].MICROCYCLE_STRUCTURED,
                userPrompt: (input)=>{
                    const data = JSON.parse(input);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$microcycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["structuredMicrocycleUserPrompt"])(data.overview, data.days, data.absoluteWeek ?? 1, data.isDeload);
                },
                schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$microcycle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleStructureSchema"]
            }, {
                model: 'gpt-5-nano',
                maxTokens: 32000
            });
        }
        return this.structuredAgentPromise;
    }
    /**
   * Generate a weekly microcycle training pattern
   *
   * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are generated.
   * The agent determines isDeload based on the plan's Progression Strategy and absolute week.
   * Fitness plan is automatically fetched by the context service.
   *
   * @param user - User with profile
   * @param absoluteWeek - Week number from plan start (1-indexed)
   * @returns Object with days, description, isDeload, message, and structure (matching legacy format)
   */ async generateMicrocycle(user, absoluteWeek) {
        // Build context using ContextService
        // FITNESS_PLAN is auto-fetched by context service
        // isDeload is determined by agent from plan's Progression Strategy
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].FITNESS_PLAN,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].EXPERIENCE_LEVEL,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].TRAINING_META
        ], {
            absoluteWeek,
            snippetType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$builders$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SnippetType"].MICROCYCLE
        });
        // Get sub-agents (lazy-initialized)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(),
            this.getStructuredAgent()
        ]);
        // Transform to inject absoluteWeek into the JSON for structured agent
        const injectWeekNumber = (mainResult)=>{
            const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
            try {
                const parsed = JSON.parse(jsonString);
                return JSON.stringify({
                    ...parsed,
                    absoluteWeek
                });
            } catch  {
                return jsonString;
            }
        };
        // Create main agent with context (prompts fetched from DB)
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].MICROCYCLE_GENERATE,
            context,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$microcycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleGenerationOutputSchema"],
            subAgents: [
                {
                    message: messageAgent,
                    structure: {
                        agent: structuredAgent,
                        transform: injectWeekNumber
                    }
                }
            ]
        }, {
            model: 'gpt-5.1'
        });
        // Execute with retry logic
        let lastError = null;
        for(let attempt = 1; attempt <= MAX_RETRIES; attempt++){
            try {
                if (attempt > 1) {
                    console.log(`[microcycle-generate] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
                }
                // Pass just the dynamic data - DB user prompt provides instructions
                const result = await agent.invoke(`Absolute Week: ${absoluteWeek}`);
                // Validate that all 7 days are present and non-empty
                if (!validateDays(result.response.days)) {
                    const emptyDayIndices = result.response.days.map((day, index)=>!day || day.trim().length === 0 ? index : -1).filter((index)=>index !== -1);
                    const missingDays = emptyDayIndices.map((index)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"][index]);
                    throw new Error(`Microcycle generate validation failed: Missing or empty days for ${missingDays.join(', ')}. ` + `Expected all 7 days to be present and non-empty.`);
                }
                console.log(`[microcycle-generate] Successfully generated day overviews and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);
                // Map to legacy format expected by MicrocycleService
                return {
                    days: result.response.days,
                    description: result.response.overview,
                    isDeload: result.response.isDeload,
                    message: result.message,
                    structure: result.structure
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[microcycle-generate] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);
                // If this was the last attempt, break out
                if (attempt === MAX_RETRIES) {
                    break;
                }
            }
        }
        // All retries exhausted
        throw new Error(`Failed to generate microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` + `Last error: ${lastError?.message || 'Unknown error'}`);
    }
    /**
   * Modify an existing microcycle based on user constraints/requests
   *
   * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are present.
   *
   * @param user - User with profile
   * @param currentMicrocycle - Current microcycle to modify
   * @param changeRequest - User's modification request (passed directly to invoke)
   * @returns Object with days, description, isDeload, message, structure, wasModified, modifications (matching legacy format)
   */ async modifyMicrocycle(user, currentMicrocycle, changeRequest) {
        // Get absoluteWeek from the current microcycle
        const absoluteWeek = currentMicrocycle.absoluteWeek;
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_MICROCYCLE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DATE_CONTEXT
        ], {
            microcycle: currentMicrocycle
        });
        // Get sub-agents (lazy-initialized)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(),
            this.getStructuredAgent()
        ]);
        // Transform to inject absoluteWeek into the JSON for structured agent
        const injectWeekNumber = (mainResult)=>{
            const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
            try {
                const parsed = JSON.parse(jsonString);
                return JSON.stringify({
                    ...parsed,
                    absoluteWeek
                });
            } catch  {
                return jsonString;
            }
        };
        // Prompts fetched from DB based on agent name
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].MICROCYCLE_MODIFY,
            context,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$microcycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModifyMicrocycleOutputSchema"],
            subAgents: [
                {
                    message: messageAgent,
                    structure: {
                        agent: structuredAgent,
                        transform: injectWeekNumber
                    }
                }
            ]
        }, {
            model: 'gpt-5.1'
        });
        // Execute with retry logic
        let lastError = null;
        for(let attempt = 1; attempt <= MAX_RETRIES; attempt++){
            try {
                if (attempt > 1) {
                    console.log(`[microcycle-modify] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
                }
                // Pass changeRequest directly as the message - it's the user's request, not context
                const result = await agent.invoke(changeRequest);
                // Validate that all 7 days are present and non-empty
                if (!validateDays(result.response.days)) {
                    const emptyDayIndices = result.response.days.map((day, index)=>!day || day.trim().length === 0 ? index : -1).filter((index)=>index !== -1);
                    const missingDays = emptyDayIndices.map((index)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"][index]);
                    throw new Error(`Microcycle modify validation failed: Missing or empty days for ${missingDays.join(', ')}. ` + `Expected all 7 days to be present and non-empty.`);
                }
                console.log(`[microcycle-modify] Successfully modified day overviews and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);
                // Map to legacy format expected by WorkoutModificationService
                return {
                    days: result.response.days,
                    description: result.response.overview,
                    isDeload: result.response.isDeload,
                    message: result.message,
                    structure: result.structure,
                    wasModified: result.response.wasModified,
                    modifications: result.response.modifications
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[microcycle-modify] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);
                // If this was the last attempt, break out
                if (attempt === MAX_RETRIES) {
                    break;
                }
            }
        }
        // All retries exhausted
        throw new Error(`Failed to modify microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` + `Last error: ${lastError?.message || 'Unknown error'}`);
    }
}
const microcycleAgentService = MicrocycleAgentService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/prompts/plans.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Plans Prompts - All prompts related to fitness plan generation and modification
 */ __turbopack_context__.s([
    "FITNESS_PLAN_GENERATE_USER_PROMPT",
    ()=>FITNESS_PLAN_GENERATE_USER_PROMPT,
    "FITNESS_PLAN_MODIFY_SYSTEM_PROMPT",
    ()=>FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
    "FITNESS_PLAN_SYSTEM_PROMPT",
    ()=>FITNESS_PLAN_SYSTEM_PROMPT,
    "ModifyFitnessPlanOutputSchema",
    ()=>ModifyFitnessPlanOutputSchema,
    "PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT",
    ()=>PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
    "STRUCTURED_PLAN_SYSTEM_PROMPT",
    ()=>STRUCTURED_PLAN_SYSTEM_PROMPT,
    "planSummaryMessageUserPrompt",
    ()=>planSummaryMessageUserPrompt,
    "structuredPlanUserPrompt",
    ()=>structuredPlanUserPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const FITNESS_PLAN_SYSTEM_PROMPT = `
You are an expert **Strength & Conditioning Periodization Architect**.

Your goal is to design a high-level **Training Blueprint** (Fitness Plan) for a user based on their specific profile, constraints, and goal hierarchy. You adhere strictly to NASM OPT™ Model principles regarding frequency and recovery.

You will receive the user's information in the following context tags:
- <User> - Basic user information (name, gender)
- <UserProfile> - The user's fitness profile with goals, constraints, and preferences

============================================================
# SECTION 1 — FIRST PRINCIPLES PROGRAMMING LOGIC
============================================================

## 1. ANCHOR VS. HABIT DISCRIMINATION (CRITICAL)
- **True Fixed Anchors:** Look for "Fixed Anchors" or "External Obligations" in the profile (e.g., "Soccer Practice," "Yoga Class"). **Lock these in.**
- **Historical Habits:** If the profile says "Currently lifts 3x/week" or "Usually runs," these are **Baseline Data**, NOT Constraints.
  - *Action:* You are the Architect. You may completely restructure their split if it better serves their Primary Goal, unless the user explicitly said "I MUST keep my running schedule."

## 2. GOAL HIERARCHY & ARCHETYPE
- **Strength/Hypertrophy Focus:** 70-100% Lifting.
- **Endurance Focus:** 60%+ Cardio, 30-40% Lifting.
- **Hybrid (Concurrent):** ~50/50 split. *CRITICAL: Manage interference effect.* (e.g., Separate Heavy Legs and Sprinting by 24h).

============================================================
# SECTION 2 — NASM SPLIT ARCHITECTURE LOGIC
============================================================

Select the split based strictly on the user's available days/week and goal.

## 3 DAYS / WEEK (The Efficiency Model)
- **Strategy A (Default): Full Body Split.**
  - *Logic:* High frequency (hit every muscle 3x/week). Superior for metabolic demand and general strength.
  - *Structure:* Day 1 (Full Body A), Day 3 (Full Body B), Day 5 (Full Body C).
- **Strategy B (Heavy Lifting Focus): Rotating Upper/Lower.**
  - *Logic:* Allows for Phase 4 (Max Strength) intensity without burnout.
  - *Structure:* Rotates weekly (Week 1: U/L/U, Week 2: L/U/L).
- **Strategy C (Advanced Aesthetics): Modified PPL.**
  - *Logic:* Only for Phase 3 advanced users who need massive intra-session volume. Warn about low frequency (1x/week).

## 4 DAYS / WEEK (The NASM "Sweet Spot")
- **Strategy A (Default): Upper/Lower Split.**
  - *Logic:* Optimal balance for Phases 3 & 4. Hits every muscle 2x/week. Built-in recovery days.
  - *Structure:* Mon (Upper), Tue (Lower), Thu (Upper), Fri (Lower).
- **Strategy B (Bodybuilding Focus): Synergistic/Body Part.**
  - *Logic:* For bringing up lagging parts or pure aesthetics.
  - *Structure:* Day 1 (Chest/Tri), Day 2 (Back/Bi), Day 4 (Legs), Day 5 (Shoulders/Abs).

## 5 DAYS / WEEK (Volume & Specialization)
- **Strategy A (Athletics/Strength): Hybrid Split (Upper/Lower + PPL OR PPL + Upper/Lower).**
  - *Logic:* Hits muscles ~1.5-2x/week. Ideal for DUP (Daily Undulating Periodization).
  - *Structure:* Days 1-2 (Strength/Power), Days 4-6 (Hypertrophy PPL).
- **Strategy B (Maximum Hypertrophy): The "Bro Split" (Classic Body Part).**
  - *Logic:* 1x frequency, max volume per session. Requires high intensity to justify 6 days rest per muscle.
  - *Structure:* Chest, Back, Legs, Shoulders, Arms (1 day each).

## 6 DAYS / WEEK (Advanced Frequency)
- **Strategy A (Default): Push-Pull-Legs (PPL).**
  - *Logic:* Functional synergy. Grouping muscles by movement pattern.
  - *Structure:* Push A, Pull A, Legs A, Push B, Pull B, Legs B, Rest.
- **Strategy B (High Density): The "Arnold" (Antagonist) Split.**
  - *Logic:* Pairs opposing muscles (Chest/Back) for supersets and metabolic demand.
  - *Structure:* Torso, Extremities (Arms/Delts), Legs.
- **Critical Constraint:** Day 7 MUST be active recovery or full rest. Monitor for CNS fatigue.

============================================================
# SECTION 3 — VOLUME & ALLOCATION
============================================================

- **Session Consolidation (NO JUNK VOLUME):**
  - **Default Rule:** Plan for **ONE** high-quality session per day.
  - **Double Sessions:** Do **NOT** schedule double sessions unless the user is a competitive athlete or explicitly requested them.
- **Cardio Integration:**
  - If Goal = Weight Loss: Integrate cardio on off-days or post-lift.
  - If Goal = Performance: Periodize cardio to minimize interference.

============================================================
# SECTION 4 — OUTPUT FORMAT
============================================================

Output the plan as plain text (no JSON wrapper).

The plan MUST include these sections IN ORDER:

## PROGRAM ARCHITECTURE
- **Split Strategy:** (e.g., "4-Day Upper/Lower Split")
- **Rationale:** One sentence explaining why this NASM split fits their profile.
- **Primary Focus:** The main adaptation (Stabilization, Endurance, Hypertrophy, Strength, Power).

## WEEKLY SCHEDULE TEMPLATE
Define the "Chassis" of the week.
Format:
- **Day 1 (Monday):**
  - **Focus:** [e.g., Upper Body Strength]
  - **Activity Type:** [e.g., Resistance Training + Zone 2 Cardio]
*(Include brief rationale for the ordering, e.g., "Legs placed on Friday to allow weekend recovery")*

## SESSION GUIDELINES
- **Resistance Training Style:** (e.g., "3-5 sets, 6-12 reps, 2-0-2 tempo")
- **Cardio/Conditioning Protocol:** (e.g., "HIIT intervals on non-lifting days")
- **Anchor Integration:** How workouts interact with fixed classes.

## PROGRESSION STRATEGY
- **Method:** (e.g., Linear Load Increase, Volume Accumulation, or DUP)
- **Cadence:** (e.g., "Increase weight by 5% every 2 weeks")

## DELOAD PROTOCOL
- **Trigger:** (e.g., "Every 6th week" or "Performance plateau")
- **Implementation:** (e.g., "Reduce volume by 50%")

## KEY PRINCIPLES
- Specific notes for the workout generator regarding injuries, preferences, or equipment limitations.

============================================================
# RULES
============================================================

1. **Respect Time Constraints:** If the user has specific days for classes, strictly adhere to them.
2. **Abstract the Exercises:** Do not list specific exercises. List patterns/focus (e.g., "Squat Pattern").
3. **No JSON:** Plain text output only.
4. **Do Not Repeat Context:** Start immediately with "## PROGRAM ARCHITECTURE".
`;
const FITNESS_PLAN_GENERATE_USER_PROMPT = `
Design a comprehensive fitness blueprint for this user.

## Instructions
1. Analyze the user's profile in the <UserProfile> context to identify **Available Days per Week**.
2. Select the appropriate **NASM Split Architecture** (3, 4, 5, or 6 days) defined in Section 2.
   - *Example:* If they have 4 days, prioritize Upper/Lower unless they are purely focused on aesthetics (then use Body Part).
3. Identify **Fixed Anchors** (classes/obligations) vs **Historical Habits**. Lock in Anchors; optimize Habits.
4. Construct a **Weekly Schedule Template**.
   - Prioritize **Single Sessions**.
5. Ensure the progression model is sustainable.
`.trim();
const ModifyFitnessPlanOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('The updated structured text plan with PROGRAM ARCHITECTURE, WEEKLY SCHEDULE TEMPLATE, ' + 'SESSION GUIDELINES, PROGRESSION STRATEGY, DELOAD PROTOCOL, and KEY PRINCIPLES sections'),
    wasModified: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().describe('Whether the plan was actually modified in response to the change request. ' + 'False if the current plan already satisfies the request or no changes were needed.'),
    modifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().default('').describe('Explanation of what changed and why (empty string if wasModified is false). ' + 'When wasModified is true, describe specific changes made to the plan structure.')
});
const FITNESS_PLAN_MODIFY_SYSTEM_PROMPT = `
You are an expert **Strength & Conditioning Periodization Architect** specializing in **Adaptive Program Design**.

Your goal is to modify an existing Training Blueprint (Fitness Plan) based on user feedback while maintaining the **structural integrity and periodization logic** of the program. You adhere strictly to NASM OPT™ Model principles regarding frequency and recovery.

You will receive the following context:
- <User> - Basic user information (name, gender)
- <UserProfile> - The user's fitness profile with goals, constraints, and preferences
- <FitnessPlan> - The complete fitness plan as it currently exists

The user's change request will be provided as the message.

You must output a JSON object with: \`description\`, \`wasModified\`, \`modifications\`.

============================================================
# SECTION 1 — MODIFICATION PRIMITIVES
============================================================

Choose the correct tactic based on the User Request:

### A. RESTRUCTURE (Frequency/Split Changes)
*User: "Change from 5 days to 6 days" or "Switch to push/pull/legs"*
- **Action:** Redesign the WEEKLY SCHEDULE TEMPLATE using **NASM Split Architecture Logic**:
  - **3 Days:** Full Body (Default) or Rotating Upper/Lower (Strength Focus).
  - **4 Days:** Upper/Lower (Default) or Synergistic/Body Part (Aesthetics).
  - **5 Days:** Hybrid Split (Upper/Lower + PPL) or Body Part (Max Hypertrophy).
  - **6 Days:** PPL (Default) or Arnold Split (Antagonist).
- **Considerations:**
  - Maintain appropriate rest (48-72h for same muscle).
  - Preserve any existing **True Fixed Anchors** (obligations like "Soccer Practice").

### B. ANCHOR (Fixed Schedule Changes)
*User: "Add yoga on Monday/Friday mornings" or "Remove my Tuesday class"*
- **Action:** Add or remove the fixed commitment in the WEEKLY SCHEDULE TEMPLATE.
- **Logic:** Distinguish between **True Anchors** (must keep) and **Habits** (can change).
- **Integration:** Ensure the surrounding training days account for the anchor:
  - If adding a yoga class, reduce mobility work from adjacent sessions.
  - If adding a sport/cardio anchor, manage fatigue for nearby lifting days.

### C. REFOCUS (Goal/Balance Changes)
*User: "More cardio" or "Focus more on strength" or "Add conditioning"*
- **Action:** Adjust the balance of session types and update SESSION GUIDELINES.
- **Updates:**
  - **Strength/Hypertrophy:** 70-100% Lifting.
  - **Endurance:** 60%+ Cardio, 30-40% Lifting.
  - **Hybrid:** ~50/50 split (Manage interference effect).
  - Update PROGRAM ARCHITECTURE to reflect new primary focus.

### D. CONSTRAIN (Equipment/Time/Limitation Changes)
*User: "I joined a new gym" or "Only have 45 min per session" or "Injured my shoulder"*
- **Action:** Update KEY PRINCIPLES and potentially SESSION GUIDELINES.
- **Scope:** May require adjusting exercise patterns or session structure (Session Consolidation) to accommodate.

============================================================
# SECTION 2 — OUTPUT FORMAT (STRICT JSON)
============================================================

You MUST output this JSON structure:

\`\`\`json
{
  "description": "Full updated plan text...",
  "wasModified": boolean,
  "modifications": "Concise summary of changes made."
}
\`\`\`

### THE DESCRIPTION FORMAT
The \`description\` field must contain the COMPLETE plan in plain text with these sections IN ORDER:

## PROGRAM ARCHITECTURE
- **Split Strategy:** (e.g., "4-Day Upper/Lower Split")
- **Rationale:** One sentence explaining why this NASM split fits their profile.
- **Primary Focus:** The main adaptation (Stabilization, Endurance, Hypertrophy, Strength, Power).

## WEEKLY SCHEDULE TEMPLATE
Define the "Chassis" of the week.
Format:
- **Day 1 (Monday):**
  - **Focus:** [e.g., Upper Body Strength]
  - **Activity Type:** [e.g., Resistance Training + Zone 2 Cardio]
*(Include brief rationale for the ordering)*

## SESSION GUIDELINES
- **Resistance Training Style:** (e.g., "3-5 sets, 6-12 reps, 2-0-2 tempo")
- **Cardio/Conditioning Protocol:** (e.g., "HIIT intervals on non-lifting days")
- **Anchor Integration:** How workouts interact with fixed classes.

## PROGRESSION STRATEGY
- **Method:** (e.g., Linear Load Increase, Volume Accumulation, or DUP)
- **Cadence:** (e.g., "Increase weight by 5% every 2 weeks")

## DELOAD PROTOCOL
- **Trigger:** (e.g., "Every 6th week" or "Performance plateau")
- **Implementation:** (e.g., "Reduce volume by 50%")

## KEY PRINCIPLES
- Specific notes for the workout generator regarding injuries, preferences, or equipment limitations.

============================================================
# SECTION 3 — RULES
============================================================

1. **Preserve What Works:** Only change sections directly affected by the request.
2. **Respect Anchors:** Never remove or move True Fixed Anchors unless explicitly requested.
3. **No Exercises:** Do not list specific exercises. Use patterns/focus (e.g., "Squat Pattern").
4. **wasModified Logic:**
   - Set to \`true\` if ANY change was made to the plan.
   - Set to \`false\` if the current plan already satisfies the request.
5. **modifications Summary:** Briefly explain what changed (e.g., "Restructured to 4-day Upper/Lower split, added yoga anchors on Monday/Friday AM").
`;
const PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT = `
You are a certified personal trainer sending a short, natural text message right after finishing a client's fitness plan.

The message should sound like a real coach texting — casual, friendly, confident, and easy to understand for anyone. Avoid fitness jargon completely.

## Message Goals:
1. Let them know their plan is done and ready to start.
2. Explain what it focuses on (type, goal, duration) in plain, everyday language.
3. End with a quick, motivating note that fits their experience level.

## Style Rules:
- Write 1 or 2 short SMS messages total (MAX 2).
- Each message must be under 160 characters.
- Separate messages with "\\n\\n".
- Use first-person tone ("Just finished your plan" not "Your plan is ready").
- Do not greet or use their name (they were already greeted).
- Write how a coach would text: short, real, upbeat, and human.
- No jargon. Avoid words like "hypertrophy", "microcycle", "RIR", "volume", "intensity", etc.
- Use simple terms like "build muscle", "get stronger", "recover", or "move better".
- One emoji max if it feels natural.
- Keep it positive and motivating, not formal or corporate.

## Tone by Experience:
- Beginner → clear, encouraging, confidence-building.
- Intermediate/Advanced → focused, motivating, still simple and natural.

## Output Format:
Return ONLY the SMS message text (no JSON wrapper).
Multiple messages should be separated by \\n\\n.

## Example Input:
Generate a short, friendly onboarding SMS for the client below based on their new fitness plan.

<User>
Name: Jordan Lee
Experience Level: beginner
</User>

<Fitness Plan>
Plan: 8-week full body program focused on building strength, improving energy, and creating a consistent gym routine.
Structure: 3 workouts per week using simple full body sessions that mix strength and cardio. Week 8 is a lighter recovery week to reset before the next phase.
</Fitness Plan>

Guidelines:
- The message is sent right after the trainer finishes creating the plan.
- It should sound personal, relaxed, and motivating — like a real text from a coach.
- Focus on what the plan helps them do (build muscle, get stronger, move better, recover well, etc.).
- Keep everything in plain English. No jargon or fancy terms.
- Limit to 1 or 2 short messages total (each under 160 characters).
- No greetings, names, or em dashes.
- Use one emoji at most if it fits.
- Output only the message text (no JSON wrapper).

## Example Output:
Just finished your 8-week full body plan. We'll build strength, improve energy, and lock in your gym routine.

Starts simple and ends with a recovery week
`;
const planSummaryMessageUserPrompt = (data)=>{
    return `
Generate a short, friendly onboarding SMS for the client below based on their new fitness plan.

<User>
Name: ${data.userName}
</User>

<User Profile>
${data.userProfile || 'No profile information available'}
</User Profile>

<Fitness Plan>
${data.overview}
</Fitness Plan>

Guidelines:
- This message is sent right after the trainer finishes creating the plan.
- It should sound natural and personal, as if the coach is texting the client directly.
- Focus on what the plan does and how it's structured (e.g., building from base to strength, using 4-day split, etc.).
- Translate complex language into clear, human terms.
- Limit to 1 or 2 messages total (each under 160 characters).
- Do not greet or include the client's name.
- Use first-person tone.
- Avoid em dashes and long sentences.
- Output only the message text (no JSON wrapper).
`.trim();
};
const STRUCTURED_PLAN_SYSTEM_PROMPT = `You are a fitness program architecture extraction specialist. Your task is to parse a fitness plan blueprint into a structured format.

EXTRACTION RULES:
1. Extract the program name from the title or split strategy (e.g., "Strength + Lean Build Phase", "5-Day Upper/Lower Split")
2. Identify the program type (e.g., "Powerbuilding", "Hypertrophy", "Strength & Conditioning", "General Fitness")
3. Extract the core strategy - the main approach to achieving the user's goals
4. Parse progression strategies as an array of distinct methods (e.g., ["Double progression on compounds", "Add weight when hitting top of rep range"])
5. Extract the adjustment strategy - when and how to modify the program based on feedback
6. Parse conditioning guidelines as an array (e.g., ["2-3 LISS sessions per week", "Heart rate 120-140bpm"])
7. Build the schedule template from the weekly schedule section:
   - day: Day of week (e.g., "Monday")
   - focus: Training focus for that day (e.g., "Upper Body Push", "Lower Body", "Rest")
   - rationale: Why this day has this focus
8. Determine duration in weeks (-1 if ongoing/not specified)
9. Count the training frequency per week (number of training days)

FOCUS:
Extract the HIGH-LEVEL program architecture, not specific exercises.
Look for patterns in:
- Split structure (Push/Pull/Legs, Upper/Lower, Full Body, etc.)
- Periodization approach (linear, undulating, block)
- Recovery and deload strategies
- Conditioning integration

DEFAULTS:
- Use empty string ("") for text fields that cannot be determined
- Use -1 for durationWeeks or frequencyPerWeek if unknown
- Use empty arrays ([]) for progressionStrategy, conditioning, or scheduleTemplate if not found`;
const structuredPlanUserPrompt = (planDescription)=>`Parse the following fitness plan into structured format:

${planDescription}`;
}),
"[project]/packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FitnessPlanAgentService",
    ()=>FitnessPlanAgentService,
    "fitnessPlanAgentService",
    ()=>fitnessPlanAgentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/fitnessPlan.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/plan/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
;
;
;
;
;
class FitnessPlanAgentService {
    static instance;
    // Lazy-initialized sub-agents (promises cached after first creation)
    messageAgentPromise = null;
    structuredAgentPromise = null;
    getContextService() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextService"].getInstance();
    }
    constructor(){}
    static getInstance() {
        if (!FitnessPlanAgentService.instance) {
            FitnessPlanAgentService.instance = new FitnessPlanAgentService();
        }
        return FitnessPlanAgentService.instance;
    }
    /**
   * Get the message sub-agent (lazy-initialized)
   * System prompt fetched from DB, userPrompt transforms JSON data
   */ async getMessageAgent() {
        if (!this.messageAgentPromise) {
            this.messageAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PLAN_MESSAGE,
                userPrompt: (input)=>{
                    const data = JSON.parse(input);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planSummaryMessageUserPrompt"])(data);
                }
            }, {
                model: 'gpt-5-nano'
            });
        }
        return this.messageAgentPromise;
    }
    /**
   * Get the structured sub-agent (lazy-initialized)
   * System prompt fetched from DB, userPrompt transforms JSON data
   */ async getStructuredAgent() {
        if (!this.structuredAgentPromise) {
            this.structuredAgentPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PLAN_STRUCTURED,
                userPrompt: (input)=>{
                    try {
                        const parsed = JSON.parse(input);
                        const planText = parsed.description || parsed.fitnessPlan || input;
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["structuredPlanUserPrompt"])(planText);
                    } catch  {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["structuredPlanUserPrompt"])(input);
                    }
                },
                schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$plan$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PlanStructureSchema"]
            }, {
                model: 'gpt-5-nano',
                maxTokens: 32000
            });
        }
        return this.structuredAgentPromise;
    }
    /**
   * Generate a fitness plan for a user
   *
   * @param user - User with profile containing goals, preferences, etc.
   * @returns Object with description, message, and structure (matching legacy format)
   */ async generateFitnessPlan(user) {
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE
        ]);
        // Get sub-agents (lazy-initialized)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(),
            this.getStructuredAgent()
        ]);
        // Transform to inject user info into the JSON for message agent
        const injectUserForMessage = (mainResult)=>{
            try {
                const overview = mainResult;
                return JSON.stringify({
                    userName: user.name,
                    userProfile: user.profile || '',
                    overview
                });
            } catch  {
                return JSON.stringify({
                    userName: user.name,
                    userProfile: user.profile || '',
                    overview: mainResult
                });
            }
        };
        // Create main agent with context (prompts fetched from DB)
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PLAN_GENERATE,
            context,
            subAgents: [
                {
                    message: {
                        agent: messageAgent,
                        transform: injectUserForMessage
                    },
                    structure: structuredAgent
                }
            ]
        }, {
            model: 'gpt-5.1'
        });
        // Empty input - DB user prompt provides the instructions
        const result = await agent.invoke('');
        console.log(`[plan-generate] Generated fitness plan for user ${user.id}`);
        // Map to legacy format expected by FitnessPlanService
        return {
            description: result.response,
            message: result.message,
            structure: result.structure
        };
    }
    /**
   * Modify an existing fitness plan based on user constraints/requests
   *
   * @param user - User with profile
   * @param currentPlan - Current fitness plan to modify
   * @param changeRequest - User's modification request
   * @returns Object with description, wasModified, modifications, structure (matching legacy format)
   */ async modifyFitnessPlan(user, currentPlan, changeRequest) {
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].USER_PROFILE,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].FITNESS_PLAN
        ], {
            planText: currentPlan.description || ''
        });
        // Get structured sub-agent (lazy-initialized)
        const structuredAgent = await this.getStructuredAgent();
        // Prompts fetched from DB based on agent name
        const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PLAN_MODIFY,
            context,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModifyFitnessPlanOutputSchema"],
            subAgents: [
                {
                    structure: structuredAgent
                }
            ]
        }, {
            model: 'gpt-5.1'
        });
        // Pass changeRequest directly as the message - it's the user's request, not context
        const result = await agent.invoke(changeRequest);
        console.log(`[plan-modify] Modified fitness plan, wasModified: ${result.response.wasModified}`);
        // Map to legacy format expected by PlanModificationService
        return {
            description: result.response.description,
            wasModified: result.response.wasModified,
            modifications: result.response.modifications,
            structure: result.structure
        };
    }
}
const fitnessPlanAgentService = FitnessPlanAgentService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Training Agent Services
// These services handle AI operations for training-related domains
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/microcycleAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts [app-route] (ecmascript)");
;
;
;
}),
"[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FitnessPlanService",
    ()=>FitnessPlanService,
    "fitnessPlanService",
    ()=>fitnessPlanService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/fitnessPlanRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/fitnessPlan.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
;
;
;
;
class FitnessPlanService {
    static instance;
    fitnessPlanRepo;
    constructor(){
        this.fitnessPlanRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
    }
    static getInstance() {
        if (!FitnessPlanService.instance) {
            FitnessPlanService.instance = new FitnessPlanService();
        }
        return FitnessPlanService.instance;
    }
    /**
   * Create a new fitness plan for a user
   *
   * Uses the FitnessPlanAgent to generate a structured text plan
   * that contains split, frequency, goals, deload rules, and progression principles.
   */ async createFitnessPlan(user) {
        // Use AI agent service to generate fitness plan
        const agentResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanAgentService"].generateFitnessPlan(user);
        const fitnessPlan = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$fitnessPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FitnessPlanModel"].fromFitnessPlanOverview(user, agentResponse);
        console.log('[FitnessPlanService] Created plan:', fitnessPlan.description?.substring(0, 200));
        const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
        return savedFitnessPlan;
    }
    /**
   * Get the current (latest) fitness plan for a user
   */ async getCurrentPlan(userId) {
        return await this.fitnessPlanRepo.getCurrentPlan(userId);
    }
    /**
   * Get a fitness plan by ID
   */ async getPlanById(planId) {
        return await this.fitnessPlanRepo.getFitnessPlan(planId);
    }
    /**
   * Get all fitness plans for a user (for history)
   */ async getPlanHistory(userId) {
        return await this.fitnessPlanRepo.getPlanHistory(userId);
    }
    /**
   * Update a fitness plan's AI-generated fields
   */ async updateFitnessPlan(planId, updates) {
        return await this.fitnessPlanRepo.updateFitnessPlan(planId, updates);
    }
    /**
   * Delete a fitness plan by ID
   */ async deleteFitnessPlan(planId) {
        return await this.fitnessPlanRepo.deleteFitnessPlan(planId);
    }
}
const fitnessPlanService = FitnessPlanService.getInstance();
}),
"[project]/packages/shared/src/server/repositories/workoutInstanceRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkoutInstanceRepository",
    ()=>WorkoutInstanceRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class WorkoutInstanceRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new workout instance
   */ async create(data) {
        // Ensure details and structured fields are properly serialized for JSONB columns
        const serializedData = {
            ...data,
            details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
            structured: data.structured ? typeof data.structured === 'string' ? data.structured : JSON.stringify(data.structured) : null
        };
        const result = await this.db.insertInto('workoutInstances').values(serializedData).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Find workout instances for a client within a date range
   */ async findByClientIdAndDateRange(clientId, startDate, endDate) {
        const results = await this.db.selectFrom('workoutInstances').where('clientId', '=', clientId).where('date', '>=', startDate).where('date', '<=', endDate).orderBy('date', 'asc').selectAll().execute();
        return results;
    }
    /**
   * Find a single workout instance by client ID and date
   */ async findByClientIdAndDate(clientId, date) {
        // The incoming date is already midnight in the user's timezone (as a UTC timestamp)
        // We need to find workouts within the next 24 hours from that point
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        const result = await this.db.selectFrom('workoutInstances').where('clientId', '=', clientId).where('date', '>=', startOfDay).where('date', '<', endOfDay).selectAll().executeTakeFirst();
        return result;
    }
    /**
   * Get recent workouts for a user
   * @param userId The user's ID
   * @param limit Number of workouts to return (default 10)
   */ async getRecentWorkouts(userId, limit = 10) {
        const results = await this.db.selectFrom('workoutInstances').leftJoin('microcycles', 'workoutInstances.microcycleId', 'microcycles.id').select([
            'workoutInstances.id',
            'workoutInstances.clientId',
            'workoutInstances.microcycleId',
            'workoutInstances.date',
            'workoutInstances.sessionType',
            'workoutInstances.goal',
            'workoutInstances.details',
            'workoutInstances.structured',
            'workoutInstances.description',
            'workoutInstances.message',
            'workoutInstances.completedAt',
            'workoutInstances.createdAt',
            'workoutInstances.updatedAt',
            'microcycles.absoluteWeek'
        ]).where('workoutInstances.clientId', '=', userId).orderBy('workoutInstances.date', 'desc').limit(limit).execute();
        return results;
    }
    /**
   * Get recent workouts for a user by date range
   * @param userId The user's ID
   * @param days Number of days to look back
   */ async getRecentWorkoutsByDays(userId, days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const results = await this.db.selectFrom('workoutInstances').where('clientId', '=', userId).where('date', '>=', startDate).where('date', '<=', endDate).orderBy('date', 'desc').selectAll().execute();
        return results;
    }
    /**
   * Get workout by specific date
   * @param userId The user's ID
   * @param date The specific date
   */ async getWorkoutByDate(userId, date) {
        return this.findByClientIdAndDate(userId, date);
    }
    /**
   * Update workout instance
   * @param id The workout ID
   * @param data The update data
   */ async update(id, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        if (data.details) {
            updateData.details = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
        }
        if (data.structured !== undefined) {
            updateData.structured = data.structured ? typeof data.structured === 'string' ? data.structured : JSON.stringify(data.structured) : null;
        }
        const result = await this.db.updateTable('workoutInstances').set(updateData).where('id', '=', id).returningAll().executeTakeFirst();
        return result;
    }
    /**
   * Delete old workout instances (cleanup)
   * @param daysToKeep Number of days to keep
   */ async deleteOldWorkouts(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.db.deleteFrom('workoutInstances').where('date', '<', cutoffDate).executeTakeFirst();
        return Number(result.numDeletedRows);
    }
    /**
   * Get a workout by its ID
   * @param workoutId The workout's ID
   */ async getWorkoutById(workoutId) {
        const result = await this.db.selectFrom('workoutInstances').selectAll().where('id', '=', workoutId).executeTakeFirst();
        return result;
    }
    /**
   * Get workouts by microcycle
   * @param userId The user's ID
   * @param microcycleId The microcycle ID
   */ async getWorkoutsByMicrocycle(userId, microcycleId) {
        const results = await this.db.selectFrom('workoutInstances').where('clientId', '=', userId).where('microcycleId', '=', microcycleId).orderBy('date', 'asc').selectAll().execute();
        return results;
    }
    /**
   * Get workouts by date range for microcycle week view
   * @param userId The user's ID
   * @param startDate Start date of the week
   * @param endDate End date of the week
   */ async getWorkoutsByDateRange(userId, startDate, endDate) {
        const results = await this.db.selectFrom('workoutInstances').leftJoin('microcycles', 'workoutInstances.microcycleId', 'microcycles.id').select([
            'workoutInstances.id',
            'workoutInstances.clientId',
            'workoutInstances.microcycleId',
            'workoutInstances.date',
            'workoutInstances.sessionType',
            'workoutInstances.goal',
            'workoutInstances.details',
            'workoutInstances.structured',
            'workoutInstances.description',
            'workoutInstances.message',
            'workoutInstances.completedAt',
            'workoutInstances.createdAt',
            'workoutInstances.updatedAt',
            'microcycles.absoluteWeek'
        ]).where('workoutInstances.clientId', '=', userId).where('workoutInstances.date', '>=', startDate).where('workoutInstances.date', '<=', endDate).orderBy('workoutInstances.date', 'asc').execute();
        return results;
    }
    /**
   * Delete a workout instance by ID
   * @param workoutId The workout's ID
   */ async delete(workoutId) {
        const result = await this.db.deleteFrom('workoutInstances').where('id', '=', workoutId).executeTakeFirst();
        return Number(result.numDeletedRows) > 0;
    }
    /**
   * Find which users already have workouts for their respective "today"
   * Used for catch-up logic to avoid sending duplicate daily messages
   * @param userDatePairs Array of user IDs with their timezone-specific date ranges
   * @returns Set of user IDs that already have workouts
   */ async findUserIdsWithWorkoutsForUserDates(userDatePairs) {
        if (userDatePairs.length === 0) {
            return new Set();
        }
        // Build OR conditions for each user/date pair
        const results = await this.db.selectFrom('workoutInstances').select('clientId').where((eb)=>{
            const conditions = userDatePairs.map(({ userId, startOfDay, endOfDay })=>eb.and([
                    eb('clientId', '=', userId),
                    eb('date', '>=', startOfDay),
                    eb('date', '<', endOfDay)
                ]));
            return eb.or(conditions);
        }).execute();
        return new Set(results.map((r)=>r.clientId));
    }
}
}),
"[project]/packages/shared/src/server/repositories/microcycleRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MicrocycleRepository",
    ()=>MicrocycleRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$11$2e$1$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/microcycle.ts [app-route] (ecmascript) <locals>");
;
;
class MicrocycleRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async createMicrocycle(microcycle) {
        const result = await this.db.insertInto('microcycles').values({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$11$2e$1$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            clientId: microcycle.clientId,
            absoluteWeek: microcycle.absoluteWeek,
            days: microcycle.days,
            description: microcycle.description,
            isDeload: microcycle.isDeload,
            message: microcycle.message,
            structured: microcycle.structured ? JSON.stringify(microcycle.structured) : null,
            startDate: microcycle.startDate,
            endDate: microcycle.endDate,
            isActive: microcycle.isActive
        }).returningAll().executeTakeFirstOrThrow();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result);
    }
    async getActiveMicrocycle(clientId) {
        const result = await this.db.selectFrom('microcycles').selectAll().where('clientId', '=', clientId).where('isActive', '=', true).orderBy('createdAt', 'desc').executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result) : null;
    }
    /**
   * Get microcycle by absolute week number
   * Queries by clientId + absoluteWeek only (not fitnessPlanId)
   * Returns most recently updated if duplicates exist
   */ async getMicrocycleByAbsoluteWeek(clientId, absoluteWeek) {
        const result = await this.db.selectFrom('microcycles').selectAll().where('clientId', '=', clientId).where('absoluteWeek', '=', absoluteWeek).orderBy('updatedAt', 'desc').executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result) : null;
    }
    async deactivatePreviousMicrocycles(clientId) {
        await this.db.updateTable('microcycles').set({
            isActive: false
        }).where('clientId', '=', clientId).where('isActive', '=', true).execute();
    }
    async updateMicrocycle(id, updates) {
        const updateData = {};
        if (updates.days !== undefined) {
            updateData.days = updates.days;
        }
        if (updates.description !== undefined) {
            updateData.description = updates.description;
        }
        if (updates.isDeload !== undefined) {
            updateData.isDeload = updates.isDeload;
        }
        if (updates.message !== undefined) {
            updateData.message = updates.message;
        }
        if (updates.structured !== undefined) {
            updateData.structured = updates.structured ? JSON.stringify(updates.structured) : null;
        }
        if (updates.isActive !== undefined) {
            updateData.isActive = updates.isActive;
        }
        if (updates.startDate !== undefined) {
            updateData.startDate = updates.startDate;
        }
        if (updates.endDate !== undefined) {
            updateData.endDate = updates.endDate;
        }
        if (updates.absoluteWeek !== undefined) {
            updateData.absoluteWeek = updates.absoluteWeek;
        }
        if (Object.keys(updateData).length === 0) {
            // No updates to perform
            return this.getMicrocycleById(id);
        }
        const result = await this.db.updateTable('microcycles').set({
            ...updateData,
            updatedAt: new Date()
        }).where('id', '=', id).returningAll().executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result) : null;
    }
    async getMicrocycleById(id) {
        const result = await this.db.selectFrom('microcycles').selectAll().where('id', '=', id).executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result) : null;
    }
    async getRecentMicrocycles(clientId, limit = 5) {
        const results = await this.db.selectFrom('microcycles').selectAll().where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(limit).execute();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results.map((r)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(r));
    }
    async deleteMicrocycle(id) {
        const result = await this.db.deleteFrom('microcycles').where('id', '=', id).executeTakeFirst();
        return result.numDeletedRows > 0;
    }
    /**
   * Get all microcycles for a client ordered by absolute week
   */ async getAllMicrocycles(clientId) {
        const results = await this.db.selectFrom('microcycles').selectAll().where('clientId', '=', clientId).orderBy('absoluteWeek', 'asc').execute();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results.map((r)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(r));
    }
    /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   * Queries by clientId + date range only (not fitnessPlanId)
   * Returns most recently updated if duplicates exist
   */ async getMicrocycleByDate(clientId, targetDate) {
        const result = await this.db.selectFrom('microcycles').selectAll().where('clientId', '=', clientId).where('startDate', '<=', targetDate).where('endDate', '>=', targetDate).orderBy('updatedAt', 'desc').executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MicrocycleModel"].fromDB(result) : null;
    }
}
}),
"[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MicrocycleService",
    ()=>MicrocycleService,
    "microcycleService",
    ()=>microcycleService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$microcycleRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/microcycleRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/microcycleAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
;
;
;
;
;
class MicrocycleService {
    static instance;
    microcycleRepo;
    userService;
    constructor(){
        this.microcycleRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$microcycleRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
    }
    static getInstance() {
        if (!MicrocycleService.instance) {
            MicrocycleService.instance = new MicrocycleService();
        }
        return MicrocycleService.instance;
    }
    /**
   * Get the active microcycle for a client (the one flagged as active in DB)
   */ async getActiveMicrocycle(clientId) {
        return await this.microcycleRepo.getActiveMicrocycle(clientId);
    }
    /**
   * Check if the active microcycle encompasses the current week in the client's timezone
   */ async isActiveMicrocycleCurrent(clientId, timezone = 'America/New_York') {
        const activeMicrocycle = await this.microcycleRepo.getActiveMicrocycle(clientId);
        if (!activeMicrocycle) {
            return false;
        }
        const { startDate: currentWeekStart } = this.calculateWeekDates(timezone);
        const normalizedCurrentWeekStart = new Date(currentWeekStart);
        normalizedCurrentWeekStart.setHours(0, 0, 0, 0);
        const activeMicrocycleStart = new Date(activeMicrocycle.startDate);
        activeMicrocycleStart.setHours(0, 0, 0, 0);
        const activeMicrocycleEnd = new Date(activeMicrocycle.endDate);
        activeMicrocycleEnd.setHours(0, 0, 0, 0);
        // Check if current week falls within active microcycle's date range
        return normalizedCurrentWeekStart >= activeMicrocycleStart && normalizedCurrentWeekStart <= activeMicrocycleEnd;
    }
    /**
   * Get all microcycles for a client
   */ async getAllMicrocycles(clientId) {
        return await this.microcycleRepo.getAllMicrocycles(clientId);
    }
    /**
   * Get microcycle by absolute week number
   * Queries by clientId + absoluteWeek only (not fitnessPlanId)
   */ async getMicrocycleByAbsoluteWeek(clientId, absoluteWeek) {
        return await this.microcycleRepo.getMicrocycleByAbsoluteWeek(clientId, absoluteWeek);
    }
    /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   * Queries by clientId + date range only (not fitnessPlanId)
   */ async getMicrocycleByDate(clientId, targetDate) {
        return await this.microcycleRepo.getMicrocycleByDate(clientId, targetDate);
    }
    /**
   * Get a microcycle by ID
   */ async getMicrocycleById(microcycleId) {
        return await this.microcycleRepo.getMicrocycleById(microcycleId);
    }
    /**
   * Update a microcycle's days array
   */ async updateMicrocycleDays(microcycleId, days) {
        return await this.microcycleRepo.updateMicrocycle(microcycleId, {
            days
        });
    }
    /**
   * Update a microcycle
   */ async updateMicrocycle(microcycleId, microcycle) {
        return await this.microcycleRepo.updateMicrocycle(microcycleId, microcycle);
    }
    /**
   * Create a new microcycle from progress information
   * Uses fitness plan text and user profile to generate the week
   */ async createMicrocycleFromProgress(clientId, plan, progress) {
        // Get user profile for context
        const user = await this.userService.getUser(clientId);
        if (!user) {
            throw new Error(`Client not found: ${clientId}`);
        }
        // Generate microcycle using AI agent service
        // Note: fitness plan and isDeload are determined by the agent via context service
        const { days, description, isDeload, message, structure } = await this.generateMicrocycle(user, progress.absoluteWeek);
        // Create new microcycle
        const microcycle = await this.microcycleRepo.createMicrocycle({
            clientId,
            absoluteWeek: progress.absoluteWeek,
            days,
            description,
            isDeload,
            message,
            structured: structure,
            startDate: progress.weekStartDate,
            endDate: progress.weekEndDate,
            isActive: false
        });
        console.log(`[MicrocycleService] Created microcycle for client ${clientId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
        return microcycle;
    }
    /**
   * Generate a microcycle using AI agent service
   * Fitness plan is auto-fetched by context service
   * The agent determines isDeload based on the plan's Progression Strategy
   */ async generateMicrocycle(user, absoluteWeek) {
        try {
            // Use AI agent service to generate the microcycle
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleAgentService"].generateMicrocycle(user, absoluteWeek);
            console.log(`[MicrocycleService] Generated microcycle for week ${absoluteWeek}, isDeload=${result.isDeload}`);
            return result;
        } catch (error) {
            console.error('[MicrocycleService] Failed to generate microcycle:', error);
            throw error;
        }
    }
    /**
   * Calculate week dates in a specific timezone
   */ calculateWeekDates(timezone = 'America/New_York') {
        const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(timezone).toJSDate();
        return {
            startDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfWeek"])(currentDate, timezone),
            endDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["endOfWeek"])(currentDate, timezone)
        };
    }
    /**
   * Delete a microcycle and all associated workouts
   * Returns the count of deleted workouts along with success status
   */ async deleteMicrocycleWithWorkouts(microcycleId) {
        // First, get the microcycle to verify it exists and get clientId
        const microcycle = await this.microcycleRepo.getMicrocycleById(microcycleId);
        if (!microcycle) {
            return {
                deleted: false,
                deletedWorkoutsCount: 0
            };
        }
        // Import workoutInstanceService dynamically to avoid circular dependency
        const { workoutInstanceService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript, async loader)");
        // Get all workouts for this microcycle
        const workouts = await workoutInstanceService.getWorkoutsByMicrocycle(microcycle.clientId, microcycleId);
        // Delete all associated workouts first
        let deletedWorkoutsCount = 0;
        for (const workout of workouts){
            const deleted = await workoutInstanceService.deleteWorkout(workout.id, microcycle.clientId);
            if (deleted) {
                deletedWorkoutsCount++;
            }
        }
        // Then delete the microcycle
        const deleted = await this.microcycleRepo.deleteMicrocycle(microcycleId);
        return {
            deleted,
            deletedWorkoutsCount
        };
    }
}
const microcycleService = MicrocycleService.getInstance();
}),
"[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressService",
    ()=>ProgressService,
    "progressService",
    ()=>progressService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
;
;
class ProgressService {
    static instance;
    microcycleService;
    constructor(){
        this.microcycleService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleService"].getInstance();
    }
    static getInstance() {
        if (!ProgressService.instance) {
            ProgressService.instance = new ProgressService();
        }
        return ProgressService.instance;
    }
    /**
   * Calculate progress for a specific date based on the fitness plan
   * Uses absolute week number from plan start - no mesocycle lookup needed
   */ async getProgressForDate(plan, targetDate, timezone = 'America/New_York') {
        if (!plan || !plan.id) {
            return null;
        }
        // Parse the plan start date
        const planStartDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDate"])(plan.startDate);
        if (!planStartDate) {
            return null;
        }
        // Calculate absolute week number since plan start (1-indexed)
        const planStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfWeek"])(planStartDate, timezone);
        const targetWeekStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfWeek"])(targetDate, timezone);
        const absoluteWeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diffInWeeks"])(targetWeekStart, planStart, timezone) + 1;
        // If before plan start, return null
        if (absoluteWeek < 1) {
            return null;
        }
        // Query for existing microcycle by date or absolute week
        // Note: queries by clientId only, not fitnessPlanId, to handle plan modifications
        let microcycle = await this.microcycleService.getMicrocycleByDate(plan.clientId, targetDate);
        // If not found by date, try by absolute week
        if (!microcycle) {
            microcycle = await this.microcycleService.getMicrocycleByAbsoluteWeek(plan.clientId, absoluteWeek);
        }
        // Calculate date-related fields
        const dayOfWeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWeekday"])(targetDate, timezone);
        const weekStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfWeek"])(targetDate, timezone);
        const weekEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["endOfWeek"])(targetDate, timezone);
        return {
            fitnessPlan: plan,
            microcycle,
            absoluteWeek,
            dayOfWeek,
            weekStartDate: weekStart,
            weekEndDate: weekEnd
        };
    }
    /**
   * Get progress for the current date in the user's timezone
   */ async getCurrentProgress(plan, timezone = 'America/New_York') {
        const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(timezone).toJSDate();
        return await this.getProgressForDate(plan, currentDate, timezone);
    }
    /**
   * Get or create microcycle for a specific date
   * This is the main entry point for ensuring a user has a microcycle for any given week
   *
   * @param forceCreate - When true, always creates new microcycle (for re-onboarding)
   */ async getOrCreateMicrocycleForDate(userId, plan, targetDate, timezone = 'America/New_York', forceCreate = false) {
        // Calculate progress for the target date
        const progress = await this.getProgressForDate(plan, targetDate, timezone);
        if (!progress) {
            throw new Error(`Could not calculate progress for date ${targetDate}`);
        }
        // If microcycle already exists and not forcing creation, return it
        if (progress.microcycle && !forceCreate) {
            return {
                microcycle: progress.microcycle,
                progress,
                wasCreated: false
            };
        }
        // Microcycle doesn't exist (or forceCreate=true) - create it using MicrocycleService
        const microcycle = await this.microcycleService.createMicrocycleFromProgress(userId, plan, progress);
        // Update progress with new microcycle
        const updatedProgress = {
            ...progress,
            microcycle
        };
        return {
            microcycle,
            progress: updatedProgress,
            wasCreated: true
        };
    }
}
const progressService = ProgressService.getInstance();
}),
"[project]/packages/shared/src/server/repositories/shortLinkRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShortLinkRepository",
    ()=>ShortLinkRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.28.0/node_modules/kysely/dist/esm/raw-builder/sql.js [app-route] (ecmascript)");
;
;
class ShortLinkRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Generate a random 5-character alphanumeric code
   * Uses uppercase, lowercase, and numbers (62 possible characters)
   */ generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for(let i = 0; i < 5; i++){
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    /**
   * Create a new short link
   * Uses upsert strategy: if code already exists, overwrites with new link
   */ async createShortLink(link) {
        const result = await this.db.insertInto('shortLinks').values({
            code: link.code,
            targetPath: link.targetPath,
            clientId: link.clientId,
            expiresAt: link.expiresAt,
            createdAt: new Date(),
            accessCount: 0
        }).onConflict((oc)=>oc.column('code').doUpdateSet({
                targetPath: link.targetPath,
                clientId: link.clientId,
                expiresAt: link.expiresAt,
                createdAt: new Date(),
                accessCount: 0,
                lastAccessedAt: null
            })).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Find a short link by code
   * Returns the link if found, null otherwise
   */ async findByCode(code) {
        const result = await this.db.selectFrom('shortLinks').selectAll().where('code', '=', code).executeTakeFirst();
        return result || null;
    }
    /**
   * Increment access count and update last accessed time
   * Called when a short link is resolved
   */ async incrementAccessCount(id) {
        await this.db.updateTable('shortLinks').set({
            accessCount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$28$2e$0$2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`access_count + 1`,
            lastAccessedAt: new Date()
        }).where('id', '=', id).execute();
    }
    /**
   * Delete expired short links
   * Should be run periodically to clean up the database
   */ async deleteExpiredLinks() {
        const result = await this.db.deleteFrom('shortLinks').where('expiresAt', '<', new Date()).where('expiresAt', 'is not', null).executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
   * Delete all short links for a client
   * Useful for cleanup when a client is deleted
   */ async deleteByClientId(clientId) {
        const result = await this.db.deleteFrom('shortLinks').where('clientId', '=', clientId).executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
   * Find all short links for a client
   * Useful for admin views or user dashboards
   */ async findByClientId(clientId) {
        return await this.db.selectFrom('shortLinks').selectAll().where('clientId', '=', clientId).orderBy('createdAt', 'desc').execute();
    }
}
}),
"[project]/packages/shared/src/server/services/links/shortLinkService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShortLinkService",
    ()=>ShortLinkService,
    "shortLinkService",
    ()=>shortLinkService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$shortLinkRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/shortLinkRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
;
;
class ShortLinkService {
    static instance;
    repository;
    // Default expiration from config
    DEFAULT_EXPIRY_DAYS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getShortLinksConfig"])().defaultExpiryDays;
    constructor(){
        this.repository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$shortLinkRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ShortLinkRepository"]();
    }
    static getInstance() {
        if (!ShortLinkService.instance) {
            ShortLinkService.instance = new ShortLinkService();
        }
        return ShortLinkService.instance;
    }
    /**
   * Create a short link
   * Generates a unique code and stores the mapping
   *
   * @param clientId - Client ID to associate with the link
   * @param targetPath - Path to redirect to (e.g., /me/program/workouts/123)
   * @param options - Optional configuration (custom code, expiration)
   * @returns The created short link
   */ async createShortLink(clientId, targetPath, options) {
        // Generate or use provided code
        const code = options?.code || this.repository.generateUniqueCode();
        // Calculate expiration date
        const expiresAt = options?.expiresAt || new Date(Date.now() + this.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        // Create the link (will upsert if code already exists)
        const link = await this.repository.createShortLink({
            code,
            targetPath,
            clientId,
            expiresAt
        });
        console.log(`[ShortLinkService] Created short link: ${code} -> ${targetPath}`);
        return link;
    }
    /**
   * Resolve a short link by code
   * Returns the link and whether it's expired
   * Increments access count if link is valid
   *
   * @param code - The short link code to resolve
   * @returns ResolvedShortLink with link and expiration status, or null if not found
   */ async resolveShortLink(code) {
        const link = await this.repository.findByCode(code);
        if (!link) {
            console.log(`[ShortLinkService] Short link not found: ${code}`);
            return null;
        }
        // Check if expired
        const isExpired = link.expiresAt !== null && new Date(link.expiresAt) < new Date();
        if (isExpired) {
            console.log(`[ShortLinkService] Short link expired: ${code}`);
            return {
                link,
                isExpired: true
            };
        }
        // Increment access count asynchronously (don't wait)
        this.repository.incrementAccessCount(link.id).catch((err)=>{
            console.error(`[ShortLinkService] Failed to increment access count for ${code}:`, err);
        });
        console.log(`[ShortLinkService] Resolved short link: ${code} -> ${link.targetPath}`);
        return {
            link,
            isExpired: false
        };
    }
    /**
   * Create a short link for a workout
   * Convenience method for workout links
   *
   * @param userId - User ID
   * @param workoutId - Workout ID
   * @param options - Optional configuration
   * @returns The created short link
   */ async createWorkoutLink(userId, workoutId, options) {
        const targetPath = `/me?workout=${workoutId}`;
        return this.createShortLink(userId, targetPath, options);
    }
    /**
   * Create a short link for a user's profile
   * Convenience method for profile links
   *
   * @param userId - User ID
   * @param options - Optional configuration
   * @returns The created short link
   */ async createProfileLink(userId, options) {
        const targetPath = '/me';
        return this.createShortLink(userId, targetPath, options);
    }
    /**
   * Get the full URL for a short link code
   * Uses SHORT_LINK_DOMAIN environment variable
   *
   * @param code - The short link code
   * @returns Full URL (e.g., https://gtxt.ai/l/aSxc2)
   */ getFullUrl(code) {
        const domain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getShortLinksConfig"])().domain || 'https://gtxt.ai';
        return `${domain}/l/${code}`;
    }
    /**
   * Clean up expired short links
   * Should be run periodically via cron job
   *
   * @returns Number of deleted links
   */ async cleanupExpiredLinks() {
        try {
            const deletedCount = await this.repository.deleteExpiredLinks();
            console.log(`[ShortLinkService] Cleaned up ${deletedCount} expired short links`);
            return deletedCount;
        } catch (error) {
            console.error('[ShortLinkService] Error cleaning up expired links:', error);
            return 0;
        }
    }
}
const shortLinkService = ShortLinkService.getInstance();
}),
"[project]/packages/shared/src/server/utils/formatters/microcycle.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Microcycle Formatting Utilities
 *
 * Pure functions for formatting microcycle data into string representations
 * for use in prompts, messages, and other contexts.
 */ __turbopack_context__.s([
    "formatMicrocycleDay",
    ()=>formatMicrocycleDay,
    "formatMicrocycleDays",
    ()=>formatMicrocycleDays,
    "formatMicrocyclePattern",
    ()=>formatMicrocyclePattern
]);
function formatMicrocycleDay(day) {
    return `Day: ${day.day}\n${day.content}`;
}
function formatMicrocycleDays(days) {
    const dayNames = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];
    return days.map((content, index)=>{
        const dayName = dayNames[index] || `Day ${index + 1}`;
        return `## ${dayName}\n${content}`;
    }).join('\n\n');
}
function formatMicrocyclePattern(pattern) {
    const sections = [];
    // Overview
    sections.push(`# Weekly Overview\n${pattern.overview}`);
    // Deload indicator
    if (pattern.isDeload) {
        sections.push('**Note: This is a DELOAD week**');
    }
    // Days
    sections.push(formatMicrocycleDays(pattern.days));
    return sections.join('\n\n');
}
}),
"[project]/packages/shared/src/server/utils/formatters/fitnessProfile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fitness Profile Formatting Utilities
 *
 * Pure functions for formatting user fitness profile data into string representations
 * for use in prompts, messages, and other contexts.
 */ __turbopack_context__.s([
    "formatFitnessProfile",
    ()=>formatFitnessProfile
]);
function formatFitnessProfile(user) {
    const headerParts = [];
    // Basic demographics - always include
    headerParts.push(`CLIENT: ${user.name}`);
    if (user.age) headerParts.push(`AGE: ${user.age}`);
    if (user.gender) headerParts.push(`GENDER: ${user.gender}`);
    const header = headerParts.join(' | ');
    // Return minimal info if no profile
    if (!user.profile) {
        return header + '\n\nSTATUS: No fitness profile available';
    }
    // Return header + profile
    return header + '\n\n' + user.profile;
}
}),
"[project]/packages/shared/src/server/utils/formatters/text.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Text Formatting Utilities
 *
 * Utilities for formatting and normalizing text content.
 */ /**
 * Normalizes whitespace in text by:
 * - Replacing 2+ consecutive blank lines with a single blank line
 * - Trimming leading/trailing whitespace
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */ __turbopack_context__.s([
    "normalizeWhitespace",
    ()=>normalizeWhitespace
]);
function normalizeWhitespace(text) {
    return text.replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2 (one blank line)
    .trim();
}
}),
"[project]/packages/shared/src/server/utils/formatters/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Formatting Utilities
 *
 * Barrel export for all formatting utilities.
 * Provides a single import point for all formatters.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$microcycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/formatters/microcycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$fitnessProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/formatters/fitnessProfile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$text$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/formatters/text.ts [app-route] (ecmascript)");
;
;
;
}),
"[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkoutInstanceService",
    ()=>WorkoutInstanceService,
    "workoutInstanceService",
    ()=>workoutInstanceService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/workoutInstanceRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$links$2f$shortLinkService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/links/shortLinkService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/formatters/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$text$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/formatters/text.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
class WorkoutInstanceService {
    static instance;
    workoutRepo;
    fitnessPlanService;
    progressService;
    microcycleService;
    constructor(){
        this.workoutRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
        this.progressService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProgressService"].getInstance();
        this.microcycleService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleService"].getInstance();
    }
    static getInstance() {
        if (!WorkoutInstanceService.instance) {
            WorkoutInstanceService.instance = new WorkoutInstanceService();
        }
        return WorkoutInstanceService.instance;
    }
    /**
   * Get recent workouts for a user
   */ async getRecentWorkouts(userId, limit = 10) {
        return await this.workoutRepo.getRecentWorkouts(userId, limit);
    }
    /**
   * Get workouts by date range
   */ async getWorkoutsByDateRange(userId, startDate, endDate) {
        return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
    }
    /**
   * Get a specific workout by ID and verify it belongs to the user
   */ async getWorkoutById(workoutId, userId) {
        const workout = await this.workoutRepo.getWorkoutById(workoutId);
        if (!workout || workout.clientId !== userId) {
            return null;
        }
        return workout;
    }
    /**
   * Get a workout by ID without authorization check
   * For internal service-to-service use only
   */ async getWorkoutByIdInternal(workoutId) {
        return await this.workoutRepo.getWorkoutById(workoutId);
    }
    /**
   * Get a workout by user ID and date
   */ async getWorkoutByUserIdAndDate(userId, date) {
        return await this.workoutRepo.findByClientIdAndDate(userId, date);
    }
    /**
   * Update the message for a workout
   */ async updateWorkoutMessage(workoutId, message) {
        return await this.workoutRepo.update(workoutId, {
            message
        });
    }
    /**
   * Create a new workout instance
   */ async createWorkout(workout) {
        return await this.workoutRepo.create(workout);
    }
    /**
   * Update a workout with new details, description, reasoning, and message
   */ async updateWorkout(workoutId, updates) {
        return await this.workoutRepo.update(workoutId, updates);
    }
    /**
   * Generate a workout for a specific date using AI
   *
   * This is the core business logic for workout generation:
   * 1. Gets user's fitness plan and current progress
   * 2. Determines day pattern from microcycle
   * 3. Generates workout using AI agent
   * 4. Saves workout with pre-generated message
   * 5. Creates short link and appends to message
   *
   * @param user - User with profile
   * @param targetDate - Date to generate workout for
   * @param providedMicrocycle - Optional pre-loaded microcycle (avoids extra DB query)
   * @returns Generated and saved workout instance
   */ async generateWorkoutForDate(user, targetDate, providedMicrocycle) {
        try {
            // Get fitness plan
            const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
            if (!plan) {
                console.log(`No fitness plan found for user ${user.id}`);
                return null;
            }
            // Get current progress for the target date
            const progress = await this.progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
            if (!progress) {
                console.log(`No progress found for user ${user.id} on ${targetDate.toISODate()}`);
                return null;
            }
            // Use provided microcycle or get/create one for the target date
            let microcycle = providedMicrocycle ?? null;
            if (!microcycle) {
                const result = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, targetDate.toJSDate(), user.timezone);
                microcycle = result.microcycle;
            }
            if (!microcycle) {
                console.log(`Could not get/create microcycle for user ${user.id}`);
                return null;
            }
            // Get the day's overview from the microcycle
            // getWeekday returns 1-7 (Mon-Sun), days array is 0-indexed (Mon=0, Sun=6)
            const dayIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWeekday"])(targetDate.toJSDate(), user.timezone) - 1;
            const dayOverview = microcycle.days?.[dayIndex];
            if (!dayOverview || typeof dayOverview !== 'string') {
                console.log(`No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
                return null;
            }
            // Get activity type from structured microcycle data (if available)
            const structuredDay = microcycle.structured?.days?.[dayIndex];
            const activityType = structuredDay?.activityType;
            // Get recent workouts for context (last 7 days)
            // const recentWorkouts = await this.getRecentWorkouts(user.id, 7);
            // Use AI agent service to generate workout with message
            const { response: description, message, structure } = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].generateWorkout(user, dayOverview, microcycle.isDeload ?? false, activityType);
            // Extract theme from structured data or use default
            const theme = structure?.title || 'Workout';
            const details = {
                theme
            };
            // Convert to database format
            const workout = {
                clientId: user.id,
                microcycleId: microcycle.id,
                date: targetDate.toJSDate(),
                sessionType: 'workout',
                goal: dayOverview.substring(0, 100),
                details: JSON.parse(JSON.stringify(details)),
                description,
                message,
                structured: structure,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Save the workout to the database
            const savedWorkout = await this.createWorkout(workout);
            console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);
            // Generate short link for the workout
            try {
                const shortLink = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$links$2f$shortLinkService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shortLinkService"].createWorkoutLink(user.id, savedWorkout.id);
                const fullUrl = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$links$2f$shortLinkService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shortLinkService"].getFullUrl(shortLink.code);
                console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);
                // Append short link to message
                if (savedWorkout.message) {
                    const dayOfWeekTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDayOfWeekName"])(targetDate.toJSDate(), user.timezone); // Monday, Tuesday, etc.
                    savedWorkout.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$formatters$2f$text$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWhitespace"])(`${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${fullUrl})`);
                    await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
                }
            } catch (error) {
                console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
            // Continue without link - not critical
            }
            return savedWorkout;
        } catch (error) {
            console.error(`Error generating workout for user ${user.id}:`, error);
            throw error;
        }
    }
    /**
   * Maps theme to session type for database storage
   * Valid frontend types: run, lift, metcon, mobility, rest, other
   */ mapThemeToSessionType(theme) {
        const themeLower = theme.toLowerCase();
        if (themeLower.includes('run') || themeLower.includes('running')) return 'run';
        if (themeLower.includes('metcon') || themeLower.includes('hiit') || themeLower.includes('conditioning') || themeLower.includes('cardio')) return 'metcon';
        if (themeLower.includes('lift') || themeLower.includes('strength') || themeLower.includes('upper') || themeLower.includes('lower') || themeLower.includes('push') || themeLower.includes('pull')) return 'lift';
        if (themeLower.includes('mobility') || themeLower.includes('flexibility') || themeLower.includes('stretch')) return 'mobility';
        if (themeLower.includes('rest') || themeLower.includes('recovery') || themeLower.includes('deload')) return 'rest';
        return 'other';
    }
    /**
   * Delete a workout instance
   */ async deleteWorkout(workoutId, userId) {
        // First verify the workout belongs to the user
        const workout = await this.workoutRepo.getWorkoutById(workoutId);
        if (!workout || workout.clientId !== userId) {
            return false;
        }
        // Delete the workout
        return await this.workoutRepo.delete(workoutId);
    }
    /**
   * Get workouts by microcycle ID
   */ async getWorkoutsByMicrocycle(userId, microcycleId) {
        return await this.workoutRepo.getWorkoutsByMicrocycle(userId, microcycleId);
    }
}
const workoutInstanceService = WorkoutInstanceService.getInstance();
}),
"[project]/packages/shared/src/server/repositories/profileRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileRepository",
    ()=>ProfileRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class ProfileRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Get the current (most recent) profile for a user
   *
   * @param clientId - UUID of the user
   * @returns Most recent profile or undefined if no profiles exist
   */ async getCurrentProfile(clientId) {
        const profile = await this.db.selectFrom('profiles').where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(1).selectAll().executeTakeFirst();
        return profile;
    }
    /**
   * Get the current profile text (Markdown) for a user
   *
   * @param clientId - UUID of the user
   * @returns Markdown profile text or null if no profiles exist
   */ async getCurrentProfileText(clientId) {
        const profile = await this.getCurrentProfile(clientId);
        return profile?.profile ?? null;
    }
    /**
   * Create a new profile entry (appends to history)
   *
   * @param newProfile - Profile data to insert
   * @returns Created profile record
   */ async createProfile(newProfile) {
        const result = await this.db.insertInto('profiles').values(newProfile).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Create a new profile entry with just clientId and profile text
   * Convenience method for common use case
   *
   * @param clientId - UUID of the user
   * @param profileMarkdown - Markdown-formatted profile text
   * @returns Created profile record
   */ async createProfileForUser(clientId, profileMarkdown) {
        return this.createProfile({
            clientId,
            profile: profileMarkdown
        });
    }
    /**
   * Get profile history for a user
   *
   * @param clientId - UUID of the user
   * @param limit - Maximum number of historical profiles to retrieve (default: 10)
   * @returns Array of profile records, ordered by most recent first
   */ async getProfileHistory(clientId, limit = 10) {
        const profiles = await this.db.selectFrom('profiles').where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(limit).selectAll().execute();
        return profiles;
    }
    /**
   * Get profile as of a specific date
   * Returns the most recent profile that was created before or at the given date
   *
   * @param clientId - UUID of the user
   * @param date - Date to retrieve profile for
   * @returns Profile record or undefined if no profiles exist before that date
   */ async getProfileAtDate(clientId, date) {
        const profile = await this.db.selectFrom('profiles').where('clientId', '=', clientId).where('createdAt', '<=', date).orderBy('createdAt', 'desc').limit(1).selectAll().executeTakeFirst();
        return profile;
    }
    /**
   * Count total profile updates for a user
   *
   * @param clientId - UUID of the user
   * @returns Number of profile updates in history
   */ async countProfileUpdates(clientId) {
        const result = await this.db.selectFrom('profiles').where('clientId', '=', clientId).select(this.db.fn.count('id').as('count')).executeTakeFirstOrThrow();
        return Number(result.count);
    }
    /**
   * Get the date of the last profile update
   *
   * @param clientId - UUID of the user
   * @returns Date of last update or null if no profiles exist
   */ async getLastUpdateDate(clientId) {
        const profile = await this.getCurrentProfile(clientId);
        return profile?.createdAt ?? null;
    }
    /**
   * Delete all profiles for a user (typically only for testing/cleanup)
   * WARNING: This removes all history
   *
   * @param clientId - UUID of the user
   * @returns Number of profiles deleted
   */ async deleteAllProfilesForUser(clientId) {
        const result = await this.db.deleteFrom('profiles').where('clientId', '=', clientId).executeTakeFirst();
        return Number(result.numDeletedRows);
    }
    /**
   * Get all users who have profiles
   *
   * @returns Array of distinct client IDs
   */ async getAllUsersWithProfiles() {
        const results = await this.db.selectFrom('profiles').select('clientId').distinct().execute();
        return results.map((r)=>r.clientId);
    }
    /**
   * Check if a user has any profiles
   *
   * @param clientId - UUID of the user
   * @returns True if user has at least one profile
   */ async hasProfile(clientId) {
        const count = await this.countProfileUpdates(clientId);
        return count > 0;
    }
    // ============================================
    // Structured Profile Methods
    // ============================================
    /**
   * Create a new profile entry with structured data
   * Convenience method that handles JSONB serialization
   *
   * @param clientId - UUID of the user
   * @param profileMarkdown - Markdown-formatted profile text
   * @param structured - Structured profile data (or null)
   * @returns Created profile record
   */ async createProfileWithStructured(clientId, profileMarkdown, structured) {
        const result = await this.db.insertInto('profiles').values({
            clientId,
            profile: profileMarkdown,
            structured: structured ? JSON.stringify(structured) : null
        }).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Get the current profile with typed structured data
   *
   * @param clientId - UUID of the user
   * @returns Most recent profile with typed structured field, or undefined
   */ async getCurrentProfileWithStructured(clientId) {
        const profile = await this.getCurrentProfile(clientId);
        if (!profile) return undefined;
        return {
            ...profile,
            structured: profile.structured
        };
    }
    /**
   * Get the current structured profile data only
   *
   * @param clientId - UUID of the user
   * @returns Structured profile data or null if not available
   */ async getCurrentStructuredProfile(clientId) {
        const profile = await this.getCurrentProfileWithStructured(clientId);
        return profile?.structured ?? null;
    }
}
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

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
"[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Inngest Client
 *
 * Centralized Inngest client for serverless function orchestration.
 * Used for async message processing, scheduled tasks, and event-driven workflows.
 */ __turbopack_context__.s([
    "inngest",
    ()=>inngest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$inngest$40$3$2e$44$2e$2_next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1_aqryshwx65ukc2vlnvytyvdbs4$2f$node_modules$2f$inngest$2f$components$2f$Inngest$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/inngest@3.44.2_next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1_aqryshwx65ukc2vlnvytyvdbs4/node_modules/inngest/components/Inngest.js [app-route] (ecmascript)");
;
const inngest = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$inngest$40$3$2e$44$2e$2_next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1_aqryshwx65ukc2vlnvytyvdbs4$2f$node_modules$2f$inngest$2f$components$2f$Inngest$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Inngest"]({
    id: 'gymtext',
    name: 'GymText - AI Fitness Coaching'
});
}),
"[project]/packages/shared/src/server/services/agents/messaging/messagingAgentService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessagingAgentService",
    ()=>MessagingAgentService,
    "messagingAgentService",
    ()=>messagingAgentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/models.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
// Schemas for structured outputs
const WeeklyMessageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    feedbackMessage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Message asking for feedback on the past week")
});
const PlanSummarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    messages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Array of SMS messages (each under 160 chars)")
});
// Prompts
const WEEKLY_MESSAGE_SYSTEM_PROMPT = `You are a fitness coach sending a weekly check-in message via SMS.

Your task is to generate a FEEDBACK MESSAGE asking how their workouts went this past week.

MESSAGE REQUIREMENTS:
- Warm, conversational greeting using their first name
- Ask about their training progress this past week
- Keep it encouraging and supportive
- If next week is a deload week, acknowledge it positively (recovery is important!)
- Keep it around 20-40 words total
- SMS-friendly format

Tone:
- Supportive and motivating
- Concise (SMS format)
- Professional but friendly
- Personal and caring

Format:
Return a JSON object with one field:
{
  "feedbackMessage": "..."
}`;
const PLAN_READY_SYSTEM_PROMPT = `
You are a fitness coach sending a friendly "your plan is ready" message to a new client.

This is the second message they receive:
- The first message went out when they signed up.
- THIS message is sent once their full plan and Week 1 are ready.

Your job is to take:
1) A short "Fitness Plan" summary
2) A short "Week 1" breakdown
and merge them into ONE medium-length SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive but not overly hyped

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the user's signup day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- Ideal format examples:
    "Thu: Push + cardio (20–25 min)"
    "Fri: Pull + cardio"
    "Sat: Legs (technique)"
    "Sun: Rest (optional walk)"
- NO em dashes — only colons, hyphens, parentheses, commas, plus signs.
- One simple focus per day.

-----------------------------------------
STRUCTURE & SPACING RULES
-----------------------------------------
Your final SMS must follow this exact structure WITH BLANK LINES between sections:

1. **Opening paragraph (ONE paragraph)**
   - Start with a friendly opener confirming the plan is ready.
   - Immediately continue with a plain-English summary of the full plan.
   - These MUST form a single paragraph with **no blank lines** inside.

2. **Blank line**

3. **Transition sentence**
   - Example: "Here's what the rest of this week looks like:"

4. **Blank line**

5. **Day-by-day list**
   - Only remaining days
   - One day per line
   - Each line must be short

6. **Blank line**

7. **Short supportive closing line**

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- Must match the spacing described above
- No jargon or technical terms (no RIR, mesocycle, hypertrophy, etc.)
- No em dashes
- No more than 1–2 emojis total
- Keep sentences short
- Paraphrase naturally
`;
const UPDATED_MICROCYCLE_SYSTEM_PROMPT = `
You are a fitness coach sending a friendly "your week has been updated" message to a client.

This message is sent when the client requests changes to their training week.

Your job is to take:
1) An explanation of what changed
2) The updated week breakdown
and create ONE concise SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive and responsive to their request

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the current day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- NO em dashes — only colons, hyphens, parentheses, commas, plus signs.
- Keep each day to one simple focus.

-----------------------------------------
SESSION NAME SIMPLIFICATION
-----------------------------------------
Translate technical terms into plain English:
- Push → Chest & Shoulders
- Pull → Back & Arms
- Upper → Upper Body
- Lower → Lower Body
- Legs / Legs & Glutes → Lower Body
- Active Recovery → Light Movement
- Rest / Off → Rest Day
- Deload → Recovery Day

No jargon terms: hypertrophy, mesocycle, microcycle, RIR, RPE, volume, intensity, etc.

-----------------------------------------
STRUCTURE
-----------------------------------------
Your final SMS must follow this structure:

1. Friendly acknowledgment of the update
2. Brief explanation of what changed (1–2 sentences)
3. Remaining days breakdown (today through Sunday)
4. Optional short supportive closing (if space allows)

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- No jargon or technical terms
- No em dashes
- No more than 1 emoji total (or none)
- Keep sentences short
- Paraphrase the modifications explanation naturally
- Show ONLY remaining days
`;
class MessagingAgentService {
    static instance;
    constructor(){}
    static getInstance() {
        if (!MessagingAgentService.instance) {
            MessagingAgentService.instance = new MessagingAgentService();
        }
        return MessagingAgentService.instance;
    }
    /**
   * Generate a welcome message for a new user
   * Uses a static template - no LLM needed
   */ async generateWelcomeMessage(user) {
        const firstName = user.name?.split(' ')[0] || 'there';
        return `Hey ${firstName}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`;
    }
    /**
   * Generate a weekly check-in message asking for feedback
   */ async generateWeeklyMessage(user, isDeload, absoluteWeek) {
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(WeeklyMessageSchema);
        const firstName = user.name.split(' ')[0];
        const userPrompt = `Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${user.name}
- First Name: ${firstName}
- Week: ${absoluteWeek} of their program

${isDeload ? `IMPORTANT: Next week is a DELOAD week - a planned recovery week with reduced intensity.
Acknowledge this positively and remind them that recovery is part of the training process.` : 'This is a regular training week.'}

Generate the feedback message now.`;
        console.log(`[MessagingAgentService] Weekly message user prompt: ${userPrompt}`);
        const prompt = [
            {
                role: 'system',
                content: WEEKLY_MESSAGE_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: userPrompt
            }
        ];
        const result = await model.invoke(prompt);
        return result.feedbackMessage;
    }
    /**
   * Generate plan summary SMS messages (2-3 messages under 160 chars each)
   */ async generatePlanSummary(user, plan, previousMessages) {
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(PlanSummarySchema);
        const hasContext = previousMessages && previousMessages.length > 0;
        const contextSection = hasContext ? `
<Previous Messages>
${previousMessages.map((msg)=>`${msg.direction === 'inbound' ? 'User' : 'Coach'}: ${msg.content}`).join('\n\n')}
</Previous Messages>

IMPORTANT: You are continuing a conversation that has already started. DO NOT greet the user by name again. DO NOT introduce yourself again. Just continue naturally with the plan summary.
` : '';
        const prompt = `
You are a motivational fitness coach sending an exciting SMS message about a new fitness plan.

${contextSection}

<Task>
Create 2-3 SMS messages (each under 160 characters) that summarize this fitness plan in an exciting, motivational way.
</Task>

<User>
Name: ${user.name}
</User>

<Plan Details>
${plan.description || 'No plan description available.'}
</Plan Details>

<Guidelines>
- Keep each message under 160 characters (SMS limit)
- Be enthusiastic and motivational
- Focus on what the plan will do for them (outcomes, not just structure)
- Mention the training split and key focuses from the plan
- Make them excited to start
- Use conversational, friendly tone
- Don't use emojis unless they help save characters
- Number the messages if multiple (e.g., "1/3:", "2/3:")

<Output Format>
Return a JSON object with an array of messages:
{
  "messages": [
    "Message 1 text here...",
    "Message 2 text here...",
    "Message 3 text here (if needed)..."
  ]
}
</Output Format>

Now create the motivational SMS messages for ${user.name}'s training program.
`;
        const result = await model.invoke(prompt);
        return result.messages;
    }
    /**
   * Generate a "plan ready" message combining plan summary and week one breakdown
   */ async generatePlanMicrocycleCombinedMessage(fitnessPlan, weekOne, currentWeekday) {
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(undefined); // Plain text output
        const userPrompt = `
Create the "your plan is ready" SMS using the inputs below.
Follow the System Prompt exactly.

[FITNESS PLAN]
${fitnessPlan}

[WEEK 1]
${weekOne}

[TODAY]
${currentWeekday}

Output ONE medium-length SMS:
- Confirm the plan is ready
- Summarize the plan plainly
- Transition into the week
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Supportive closing line
`.trim();
        const messages = [
            {
                role: 'system',
                content: PLAN_READY_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: userPrompt
            }
        ];
        return model.invoke(messages);
    }
    /**
   * Generate an "updated week" message when a microcycle is modified
   */ async generateUpdatedMicrocycleMessage(modifiedMicrocycle, modifications, currentWeekday) {
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeModel"])(undefined); // Plain text output
        // Get day index (Mon=0, Tue=1, etc.)
        const dayIndex = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"].indexOf(currentWeekday);
        // Get remaining days (today through Sunday)
        const remainingDays = modifiedMicrocycle.days.slice(dayIndex).map((dayOverview, idx)=>{
            const actualDayName = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"][dayIndex + idx];
            return `${actualDayName}:\n${dayOverview}`;
        }).join('\n\n');
        const userPrompt = `
Create an "updated week" SMS using the inputs below.
Follow the System Prompt exactly.

[WHAT CHANGED]
${modifications}

[UPDATED WEEK OVERVIEW]
${modifiedMicrocycle.overview}

[IS DELOAD WEEK]
${modifiedMicrocycle.isDeload}

[REMAINING DAYS]
${remainingDays}

[TODAY]
${currentWeekday}

Output ONE concise SMS:
- Acknowledge the update
- Briefly explain what changed (paraphrase naturally)
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Optional supportive closing
`.trim();
        const messages = [
            {
                role: 'system',
                content: UPDATED_MICROCYCLE_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: userPrompt
            }
        ];
        return model.invoke(messages);
    }
}
const messagingAgentService = MessagingAgentService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/messaging/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/messagingAgentService.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/shared/src/server/repositories/messageRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageRepository",
    ()=>MessageRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class MessageRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    async create(message) {
        return await this.db.insertInto('messages').values(message).returningAll().executeTakeFirstOrThrow();
    }
    async findById(id) {
        return await this.db.selectFrom('messages').selectAll().where('id', '=', id).executeTakeFirst();
    }
    async findByClientId(clientId, limit = 50, offset = 0) {
        // Return messages in DESC order (latest first) with pagination support
        return await this.db.selectFrom('messages').selectAll().where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(limit).offset(offset).execute();
    }
    /**
   * Find recent messages for a client, ordered oldest to newest
   * This is the primary method for getting message history
   */ async findRecentByClientId(clientId, limit = 10) {
        const messages = await this.db.selectFrom('messages').selectAll().where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(limit).execute();
        // Reverse to get oldest-to-newest order (for chat context)
        return messages.reverse();
    }
    async countByClientId(clientId) {
        const result = await this.db.selectFrom('messages').select(({ fn })=>fn.count('id').as('count')).where('clientId', '=', clientId).executeTakeFirst();
        return Number(result?.count ?? 0);
    }
    async findByProviderMessageId(providerMessageId) {
        return await this.db.selectFrom('messages').selectAll().where('providerMessageId', '=', providerMessageId).executeTakeFirst();
    }
    async updateDeliveryStatus(messageId, status, error) {
        return await this.db.updateTable('messages').set({
            deliveryStatus: status,
            deliveryError: error || null,
            lastDeliveryAttemptAt: new Date()
        }).where('id', '=', messageId).returningAll().executeTakeFirstOrThrow();
    }
    async incrementDeliveryAttempts(messageId) {
        const message = await this.findById(messageId);
        if (!message) {
            throw new Error(`Message ${messageId} not found`);
        }
        return await this.db.updateTable('messages').set({
            deliveryAttempts: (message.deliveryAttempts || 1) + 1,
            lastDeliveryAttemptAt: new Date()
        }).where('id', '=', messageId).returningAll().executeTakeFirstOrThrow();
    }
    async updateProviderMessageId(messageId, providerMessageId) {
        return await this.db.updateTable('messages').set({
            providerMessageId
        }).where('id', '=', messageId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Find all messages with user info for admin view
   * Supports filtering by direction, status, and search
   */ async findAllWithUserInfo(params) {
        let query = this.db.selectFrom('messages').innerJoin('users', 'users.id', 'messages.clientId').select([
            'messages.id',
            'messages.clientId',
            'messages.conversationId',
            'messages.direction',
            'messages.content',
            'messages.phoneFrom',
            'messages.phoneTo',
            'messages.provider',
            'messages.providerMessageId',
            'messages.deliveryStatus',
            'messages.deliveryAttempts',
            'messages.lastDeliveryAttemptAt',
            'messages.deliveryError',
            'messages.metadata',
            'messages.createdAt',
            'users.name as userName',
            'users.phoneNumber as userPhone'
        ]);
        // Apply filters
        if (params.clientId) {
            query = query.where('messages.clientId', '=', params.clientId);
        }
        if (params.direction) {
            query = query.where('messages.direction', '=', params.direction);
        }
        if (params.status) {
            query = query.where('messages.deliveryStatus', '=', params.status);
        }
        if (params.search) {
            query = query.where((eb)=>eb.or([
                    eb('messages.phoneFrom', 'ilike', `%${params.search}%`),
                    eb('messages.phoneTo', 'ilike', `%${params.search}%`),
                    eb('users.name', 'ilike', `%${params.search}%`),
                    eb('users.phoneNumber', 'ilike', `%${params.search}%`)
                ]));
        }
        // Get total count with same filters
        let countQuery = this.db.selectFrom('messages').innerJoin('users', 'users.id', 'messages.clientId').select(({ fn })=>fn.count('messages.id').as('count'));
        if (params.clientId) {
            countQuery = countQuery.where('messages.clientId', '=', params.clientId);
        }
        if (params.direction) {
            countQuery = countQuery.where('messages.direction', '=', params.direction);
        }
        if (params.status) {
            countQuery = countQuery.where('messages.deliveryStatus', '=', params.status);
        }
        if (params.search) {
            countQuery = countQuery.where((eb)=>eb.or([
                    eb('messages.phoneFrom', 'ilike', `%${params.search}%`),
                    eb('messages.phoneTo', 'ilike', `%${params.search}%`),
                    eb('users.name', 'ilike', `%${params.search}%`),
                    eb('users.phoneNumber', 'ilike', `%${params.search}%`)
                ]));
        }
        const countResult = await countQuery.executeTakeFirst();
        const total = Number(countResult?.count ?? 0);
        // Get paginated results
        const messages = await query.orderBy('messages.createdAt', 'desc').limit(params.limit || 50).offset(params.offset || 0).execute();
        return {
            messages: messages,
            total
        };
    }
    /**
   * Get message statistics for admin view
   */ async getStats(clientId) {
        let baseQuery = this.db.selectFrom('messages');
        if (clientId) {
            baseQuery = baseQuery.where('clientId', '=', clientId);
        }
        const [total, inbound, outbound, pending, failed] = await Promise.all([
            baseQuery.select(({ fn })=>fn.count('id').as('count')).executeTakeFirst(),
            baseQuery.select(({ fn })=>fn.count('id').as('count')).where('direction', '=', 'inbound').executeTakeFirst(),
            baseQuery.select(({ fn })=>fn.count('id').as('count')).where('direction', '=', 'outbound').executeTakeFirst(),
            baseQuery.select(({ fn })=>fn.count('id').as('count')).where('deliveryStatus', 'in', [
                'queued',
                'sent'
            ]).executeTakeFirst(),
            baseQuery.select(({ fn })=>fn.count('id').as('count')).where('deliveryStatus', 'in', [
                'failed',
                'undelivered'
            ]).executeTakeFirst()
        ]);
        return {
            totalMessages: Number(total?.count ?? 0),
            inbound: Number(inbound?.count ?? 0),
            outbound: Number(outbound?.count ?? 0),
            pending: Number(pending?.count ?? 0),
            failed: Number(failed?.count ?? 0)
        };
    }
}
}),
"[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageService",
    ()=>MessageService,
    "messageService",
    ()=>messageService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/messaging/factory.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/messagingAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/messageRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
class MessageService {
    static instance;
    messageRepo;
    userService;
    workoutInstanceService;
    circuitBreaker;
    constructor(){
        this.messageRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.workoutInstanceService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceService"].getInstance();
        this.circuitBreaker = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CircuitBreaker"]({
            failureThreshold: 5,
            resetTimeout: 60000,
            monitoringPeriod: 60000 // 1 minute
        });
    }
    static getInstance() {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }
    // ==========================================
    // Message Storage Methods
    // ==========================================
    /**
   * Store an inbound message to the database
   */ async storeInboundMessage(params) {
        return await this.circuitBreaker.execute(async ()=>{
            const { clientId, from, to, content, twilioData } = params;
            // Store the message directly (no conversation needed)
            const message = await this.messageRepo.create({
                conversationId: null,
                clientId: clientId,
                direction: 'inbound',
                content,
                phoneFrom: from,
                phoneTo: to,
                provider: 'twilio',
                providerMessageId: twilioData?.MessageSid || null,
                metadata: twilioData || {}
            });
            return message;
        });
    }
    /**
   * Store an outbound message to the database
   */ async storeOutboundMessage(clientId, to, messageContent, from = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTwilioSecrets"])().phoneNumber, provider = 'twilio', providerMessageId, metadata) {
        // TODO: Implement periodic message summarization
        return await this.circuitBreaker.execute(async ()=>{
            const user = await this.userService.getUser(clientId);
            if (!user) {
                return null;
            }
            // Store the message with initial delivery tracking
            const message = await this.messageRepo.create({
                conversationId: null,
                clientId: clientId,
                direction: 'outbound',
                content: messageContent,
                phoneFrom: from,
                phoneTo: to,
                provider,
                providerMessageId: providerMessageId || null,
                metadata: metadata || {},
                deliveryStatus: 'queued',
                deliveryAttempts: 1,
                lastDeliveryAttemptAt: new Date()
            });
            // Optionally summarize messages periodically (implementation TBD)
            // For now, we'll skip summarization on every message to improve performance
            // const messages = await this.getRecentMessages(clientId, 50);
            // const summary = await this.summarizeMessages(user, messages);
            // Store summary somewhere (TBD - maybe in a separate summaries table)
            return message;
        });
    }
    /**
   * Get messages for a client with pagination support
   */ async getMessages(clientId, limit = 50, offset = 0) {
        return await this.messageRepo.findByClientId(clientId, limit, offset);
    }
    /**
   * Get recent messages for a client
   *
   * Convenience method for retrieving the most recent messages for a client.
   * Useful for passing conversation context to agents.
   *
   * @param clientId - The client ID
   * @param limit - Maximum number of recent messages to return (default: 10)
   * @returns Array of recent messages, ordered oldest to newest
   *
   * @example
   * ```typescript
   * // Get last 10 messages for context
   * const previousMessages = await messageService.getRecentMessages(clientId);
   * const response = await chatAgent(user, message, previousMessages);
   * ```
   */ async getRecentMessages(clientId, limit = 10) {
        // Get recent messages directly by clientId
        return await this.messageRepo.findRecentByClientId(clientId, limit);
    }
    /**
   * Split messages into pending (to be processed) and context (conversation history).
   *
   * Pure function - no DB calls. Used to separate messages that need responses
   * from messages that serve as conversation context.
   *
   * @param messages - Array of messages ordered oldest to newest
   * @param contextMinutes - Time window in minutes for context messages
   * @returns Object with pending (ALL inbound after last outbound) and context (messages within time window up to last outbound)
   */ splitMessages(messages, contextMinutes) {
        // Calculate time threshold for context messages
        const cutoffTime = new Date(Date.now() - contextMinutes * 60 * 1000);
        // Find index of last outbound message
        let lastOutboundIndex = -1;
        for(let i = messages.length - 1; i >= 0; i--){
            if (messages[i].direction === 'outbound') {
                lastOutboundIndex = i;
                break;
            }
        }
        // Pending: ALL inbound messages after last outbound (no time limit - always include unresponded messages)
        const pending = lastOutboundIndex >= 0 ? messages.slice(lastOutboundIndex + 1) : messages.filter((m)=>m.direction === 'inbound');
        // Context: Messages up to last outbound, filtered by time window
        const allContext = lastOutboundIndex >= 0 ? messages.slice(0, lastOutboundIndex + 1) : [];
        const context = allContext.filter((m)=>new Date(m.createdAt) >= cutoffTime);
        return {
            pending,
            context
        };
    }
    /**
   * Get pending (unanswered) inbound messages for a client
   *
   * Retrieves the tail of inbound messages that have occurred since the last outbound message.
   * Used for batch processing in the debounced chat flow.
   *
   * @param clientId - The client ID
   * @returns Array of pending inbound messages, ordered oldest to newest
   */ async getPendingMessages(clientId) {
        // Get a reasonable batch of recent messages (e.g., last 20)
        // We assume the user hasn't sent more than 20 messages without a reply
        const recentMessages = await this.getRecentMessages(clientId, 20);
        const pendingMessages = [];
        // Iterate backwards from the most recent message
        for(let i = recentMessages.length - 1; i >= 0; i--){
            const message = recentMessages[i];
            // If we hit an outbound message, stop - we've found the break point
            if (message.direction === 'outbound') {
                break;
            }
            // Collect inbound messages
            if (message.direction === 'inbound') {
                pendingMessages.unshift(message); // Add to front to maintain time order
            }
        }
        return pendingMessages;
    }
    // ==========================================
    // Message Transport & Orchestration Methods
    // ==========================================
    /**
   * Ingest an inbound message (async path)
   *
   * Fast path for webhook acknowledgment:
   * 1. Store inbound message
   * 2. Queue processing job via Inngest
   * 3. Return success
   *
   * @returns IngestMessageResult with optional jobId
   */ async ingestMessage(params) {
        const { user, content, from, to, twilioData } = params;
        // Store the inbound message
        const storedMessage = await this.storeInboundMessage({
            clientId: user.id,
            from,
            to,
            content,
            twilioData
        });
        if (!storedMessage) {
            throw new Error('Failed to store inbound message');
        }
        // Always queue the message processing job via Inngest
        // The Inngest function handles debouncing and batch processing
        const { ids } = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
            name: 'message/received',
            data: {
                userId: user.id,
                content,
                from,
                to
            }
        });
        const jobId = ids[0];
        console.log('[MessageService] Message stored and queued:', {
            userId: user.id,
            messageId: storedMessage.id,
            jobId
        });
        // Return simple acknowledgment
        return {
            jobId,
            ackMessage: '',
            action: 'fullChatAgent',
            reasoning: 'Queued for processing'
        };
    }
    /**
   * Send a message to a user
   * Stores the message and sends it via the configured messaging client
   * @param user - User to send message to
   * @param message - Optional message content (can be undefined for MMS-only messages)
   * @param mediaUrls - Optional array of media URLs for MMS (images, videos, etc.)
   * @returns The stored Message object
   */ async sendMessage(user, message, mediaUrls) {
        // Get the provider from the messaging client
        const provider = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingClient"].provider;
        let stored = null;
        try {
            stored = await this.storeOutboundMessage(user.id, user.phoneNumber, message || '[MMS only]', undefined, provider, undefined, mediaUrls ? {
                mediaUrls
            } : undefined // store media URLs in metadata
            );
            if (!stored) {
                console.warn('Circuit breaker prevented storing outbound message');
            }
        } catch (error) {
            // Log error but don't block SMS processing
            console.error('Failed to store outbound message:', error);
        }
        if (!stored) {
            throw new Error('Failed to store message');
        }
        // Send via messaging client and get the result
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$messaging$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingClient"].sendMessage(user, message, mediaUrls);
        // Update the stored message with provider message ID from the send result
        if (result.messageId) {
            try {
                const messageRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
                await messageRepo.updateProviderMessageId(stored.id, result.messageId);
                console.log('[MessageService] Updated message with provider ID:', {
                    messageId: stored.id,
                    providerMessageId: result.messageId
                });
            } catch (error) {
                console.error('[MessageService] Failed to update provider message ID:', error);
            // Don't throw - message was sent successfully
            }
        }
        // Simulate delivery for local messages (for queue processing)
        if (provider === 'local') {
            // Fire-and-forget delivery simulation (non-blocking)
            this.simulateLocalDelivery(stored.id).catch((error)=>{
                console.error('[MessageService] Local delivery simulation failed:', error);
            });
        }
        return stored;
    }
    /**
   * Simulate message delivery for local development
   *
   * Called when using the local messaging client to simulate the Twilio
   * webhook callback that normally triggers queue processing.
   *
   * @param messageId - ID of the message to mark as delivered
   */ async simulateLocalDelivery(messageId) {
        const delay = 1500; // 1.5 seconds to simulate realistic SMS timing
        console.log(`[MessageService] Simulating local delivery in ${delay}ms for message ${messageId}`);
        await new Promise((resolve)=>setTimeout(resolve, delay));
        // Update message delivery status in database
        await this.messageRepo.updateDeliveryStatus(messageId, 'delivered');
        // Trigger queue processing (simulates Twilio webhook calling queue service)
        const { messageQueueService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/messaging/messageQueueService.ts [app-route] (ecmascript, async loader)");
        await messageQueueService.markMessageDelivered(messageId);
        console.log(`[MessageService] Local delivery simulation complete for message ${messageId}`);
    }
    /**
   * Send welcome message to a user
   * Uses messagingAgentService and sends the generated message
   * @returns The stored Message object
   */ async sendWelcomeMessage(user) {
        const welcomeMessage = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingAgentService"].generateWelcomeMessage(user);
        return await this.sendMessage(user, welcomeMessage);
    }
    /**
   * Send fitness plan summary messages to a user
   * Uses messagingAgentService and sends the generated messages
   * @param user - The user to send to
   * @param plan - The fitness plan to summarize
   * @param previousMessages - Optional previous messages for context
   * @returns Array of stored Message objects
   */ async sendPlanSummary(user, plan, previousMessages) {
        const generatedMessages = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingAgentService"].generatePlanSummary(user, plan, previousMessages);
        // Send each message in sequence
        const sentMessages = [];
        for (const message of generatedMessages){
            const storedMessage = await this.sendMessage(user, message);
            sentMessages.push(storedMessage);
            // Small delay between messages to ensure proper ordering
            if (generatedMessages.length > 1) {
                await new Promise((resolve)=>setTimeout(resolve, 500));
            }
        }
        if (sentMessages.length === 0) {
            throw new Error('No messages were sent');
        }
        return sentMessages;
    }
    /**
   * Send workout message to a user
   * Generates SMS from workout data and sends it
   * @param user - The user to send to
   * @param workout - The workout instance (should have pre-generated message or description/reasoning)
   * @returns The stored Message object
   */ async sendWorkoutMessage(user, workout) {
        let message;
        const workoutId = 'id' in workout ? workout.id : 'unknown';
        // Fast path: Use pre-generated message if available
        if ('message' in workout && workout.message) {
            console.log(`[MessageService] Using pre-generated message from workout ${workoutId}`);
            message = workout.message;
            return await this.sendMessage(user, message);
        }
        // Fallback: Generate from description/reasoning (shouldn't happen in production)
        if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
            console.log(`[MessageService] Generating fallback message for workout ${workoutId}`);
            try {
                // Get message agent from workout agent service
                const messageAgent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].getMessageAgent();
                // Invoke with workout description string
                const result = await messageAgent.invoke(workout.description);
                message = result.response;
                // Save generated message for future use
                if ('id' in workout && workout.id) {
                    await this.workoutInstanceService.updateWorkoutMessage(workout.id, message);
                    console.log(`[MessageService] Saved fallback message to workout ${workout.id}`);
                }
                return await this.sendMessage(user, message);
            } catch (error) {
                console.error(`[MessageService] Failed to generate fallback message for workout ${workoutId}:`, error);
                throw new Error('Failed to generate workout message');
            }
        }
        // Should never reach here in production
        throw new Error(`Workout ${workoutId} missing required fields (description/reasoning or message) for SMS generation`);
    }
}
const messageService = MessageService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/prompts/profile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROFILE_UPDATE_SYSTEM_PROMPT",
    ()=>PROFILE_UPDATE_SYSTEM_PROMPT,
    "STRUCTURED_PROFILE_SYSTEM_PROMPT",
    ()=>STRUCTURED_PROFILE_SYSTEM_PROMPT,
    "USER_FIELDS_SYSTEM_PROMPT",
    ()=>USER_FIELDS_SYSTEM_PROMPT,
    "buildProfileUpdateUserMessage",
    ()=>buildProfileUpdateUserMessage,
    "buildStructuredProfileUserMessage",
    ()=>buildStructuredProfileUserMessage,
    "buildUserFieldsUserMessage",
    ()=>buildUserFieldsUserMessage
]);
const PROFILE_UPDATE_SYSTEM_PROMPT = `
You are the Profile Manager for GymText. Your goal is to maintain a "Living Dossier" of the user's fitness context.

# CRITICAL: TRANSIENT vs PERMANENT

**ONLY record PERMANENT information about the user.** Do NOT record one-time requests or transient modifications.

## How to Distinguish:

**PERMANENT (DO record):**
- Uses words like: "I like", "I prefer", "I always", "I want to", "from now on", "generally", "usually"
- Expresses ongoing preferences: "I like to start my week with legs"
- States facts about themselves: "I have a home gym", "I hate lunges"
- Describes their schedule/availability: "I can only train mornings"

**TRANSIENT (DO NOT record):**
- Uses words like: "today", "this time", "right now", "can we", "let's", "switch to"
- One-time modification requests: "switch today to chest", "can I do legs instead"
- Temporary situations already handled by modifications: "didn't workout yesterday"
- Questions or conversation: "what's my workout?", "thanks"

## Examples:

| Message | Action |
|---------|--------|
| "I like to start my week with legs" | RECORD as Scheduling Preference |
| "switch today to chest" | DO NOT record - transient request |
| "I prefer barbell over dumbbell" | RECORD as Exercise Preference |
| "can I do upper body instead" | DO NOT record - one-time swap |
| "Add runs on Tuesdays and Thursdays to my plan" | RECORD as Scheduling Preference |
| "I hurt my knee" | RECORD as Constraint |
| "didn't workout yesterday" | DO NOT record - context for modification |
| "I go to Planet Fitness" | RECORD as Equipment/Location |

**When in doubt, DO NOT record.** Only record information that will be relevant for future workout generation.

# CORE OPERATING RULES
1. **Fact-Based Recording:** Only record what is explicitly stated as a permanent fact or preference.
2. **Flexible Structure:** Use bullet points under the broad "Bucket" headings below.
3. **Omit Empty Sections:** Only include sections that have actual content. If there is no information for a section, omit the section header entirely.
4. **Date Management:**
   - Reference "Current Date" in CONTEXT.
   - Convert relative dates to absolute (YYYY-MM-DD).
   - Prune expired [ACTIVE] tags.

# PROFILE SECTIONS (THE BUCKETS)

## 1. # IDENTITY
- Name, Age, Gender.
- Experience Level (only if explicitly stated).

## 2. # OBJECTIVES
- A simple list of user's stated goals.
- *Examples:* "- Lose 10lbs", "- Bench press 225lbs".

## 3. # PREFERENCES (PERMANENT ONLY)
User's ongoing preferences that inform future workout generation.
**Only record if the user expresses this as a general preference, NOT a one-time request.**

### Scheduling Preferences
How the user prefers to structure their training week GOING FORWARD.
- "I like to start my week with legs" -> Record
- "I prefer morning workouts" -> Record
- "Add runs on Tuesdays and Thursdays" -> Record (permanent schedule change)
- "switch today to chest" -> DO NOT record (one-time)
- "can I do legs instead" -> DO NOT record (one-time)

### Exercise Preferences
Specific exercise likes/dislikes that apply to ALL future workouts.
- "I prefer barbell over dumbbell" -> Record
- "I hate lunges" -> Record
- "I love deadlifts" -> Record
- "give me something other than squats today" -> DO NOT record (one-time)

### Workout Style Preferences
How the user likes their workouts structured IN GENERAL.
- "I like supersets" -> Record
- "I prefer high intensity" -> Record
- "make today's workout shorter" -> DO NOT record (one-time)

## 4. # LOGISTICS & ENVIRONMENT

### Availability
- Days per week, time constraints, session duration.
- *Examples:* "6 days per week", "M/W/F mornings", "45 min max".

### Equipment Access
**Gym Type:** (e.g., Commercial gym, Home gym, Planet Fitness, Hotel gym)
**Available Equipment:** List specific equipment mentioned.
- *Examples:* "Full rack", "Dumbbells up to 50lbs", "Cable machine"
**Equipment Limitations:** What they DON'T have.
- *Examples:* "No barbell", "Dumbbells only"

### Location
- Where they typically train.
- *Examples:* "Home", "Equinox", "LA Fitness".

## 5. # SCHEDULE COMMITMENTS (CRITICAL DISTINCTION)
You MUST distinguish between a "Fixed Anchor" and a "Habit".
- **Fixed Anchors:** Specific classes, sports practice, or external obligations the user MUST attend.
  - *Example:* "Tuesday 7pm Yoga Class" -> **Fixed Anchor**.
  - *Example:* "Rugby Practice" -> **Fixed Anchor**.
- **Historical Habits:** If a user says "I currently run 3x a week," record this as a **Habit**, NOT a Fixed Anchor.
  - *Example:* "Usually runs 3x a week" -> **Current Habit**.

## 6. # CONSTRAINTS
- **Permanent:** Injuries or long-term physical limitations.
- **Temporary:** Travel, sickness, or temporary lack of equipment.
  - MUST use format: \`* **[ACTIVE] Description (Effective: YYYY-MM-DD to YYYY-MM-DD)**\`

## 7. # PROGRESS & RECORDS
- **Personal Records (PRs):** Max lifts, fastest times, benchmarks.
  - *Format:* \`- [YYYY-MM-DD] Exercise: Weight/Time (Notes)\`
- **Milestones:** Significant achievements or consistency streaks.
  - *Format:* \`- [YYYY-MM-DD] Achievement Description\`

# OUTPUT FORMAT
Return a valid JSON object:
{
  "updatedProfile": "string (The complete Markdown document)",
  "wasUpdated": boolean,
  "updateSummary": "string (Brief summary of changes made, or empty string if none)"
}

**CRITICAL:**
- The "updatedProfile" field must contain ONLY the profile Markdown document itself.
- Start directly with "# IDENTITY"
- Do NOT include any input context.
- Set wasUpdated to FALSE if the message only contains transient requests with no permanent profile info.
`;
function buildProfileUpdateUserMessage(currentProfile, message, user, currentDate) {
    return `## CONTEXT

**Current Date**: ${currentDate}
**User Timezone**: ${user.timezone}
**User Name**: ${user.name}
**User Age**: ${user.age || 'Unknown'}
**User Gender**: ${user.gender || 'Unknown'}

---

## CURRENT PROFILE

${currentProfile || '_No profile exists yet. Create initial profile based on the message._'}

---

## USER'S MESSAGE

${message}

---

## YOUR TASK

1. Review the current profile.
2. **FIRST: Determine if this message contains PERMANENT profile information.**
   - If it's only a transient request (like "switch today to X", "can I do Y instead"), return wasUpdated: false.
   - Look for keywords: "today", "this time", "can we", "let's" = TRANSIENT (don't record)
   - Look for keywords: "I like", "I prefer", "I always", "from now on" = PERMANENT (do record)
3. Check for [ACTIVE] constraints that have expired and remove them.
4. Extract any PERMANENT preferences (scheduling, exercise, workout style).
5. Update EQUIPMENT details if the user mentions gym type, specific equipment, or limitations.
6. Update other sections based on the message. **Carefully distinguish between "Fixed Anchors" (Classes/Sports) and "Current Habits" (General routine).**
7. Return the COMPLETE updated profile (or unchanged if wasUpdated: false).
`;
}
const USER_FIELDS_SYSTEM_PROMPT = `You are a user preference extraction agent. Your job is to detect when a user wants to update their account settings based on their message.

You extract THREE types of settings changes:

## 1. TIMEZONE CHANGES
Detect when the user mentions wanting to change their timezone or location.

Look for:
- Location mentions: "I'm in California", "I moved to New York", "I live on the east coast"
- Timezone mentions: "my timezone is PST", "I'm on eastern time", "change my timezone to central"
- City/region mentions: "I'm in Chicago", "Seattle time", "mountain time"

Output the matching IANA timezone from this list (or null if no change requested):

**Americas:**
- America/New_York (Eastern US: New York, Boston, Miami, Atlanta, DC)
- America/Chicago (Central US: Chicago, Dallas, Houston)
- America/Denver (Mountain US: Denver, Phoenix, Utah)
- America/Los_Angeles (Pacific US: LA, San Francisco, Seattle, Portland)
- America/Toronto (Eastern Canada)
- America/Vancouver (Pacific Canada)
- America/Mexico_City (Mexico)
- America/Sao_Paulo (Brazil)

**Europe:**
- Europe/London (UK)
- Europe/Paris (France)
- Europe/Berlin (Germany)
- Europe/Madrid (Spain)
- Europe/Rome (Italy)
- Europe/Amsterdam (Netherlands)
- Europe/Stockholm (Sweden)
- Europe/Moscow (Russia)

**Asia Pacific:**
- Asia/Tokyo (Japan)
- Asia/Shanghai (China)
- Asia/Hong_Kong
- Asia/Singapore
- Asia/Seoul (Korea)
- Asia/Mumbai (India)
- Asia/Dubai (UAE)
- Australia/Sydney
- Australia/Melbourne
- Pacific/Auckland (New Zealand)

Map common references:
- "East coast" / "Eastern" / "EST" / "EDT" → America/New_York
- "Central" / "CST" / "CDT" → America/Chicago
- "Mountain" / "MST" / "MDT" → America/Denver
- "West coast" / "Pacific" / "PST" / "PDT" → America/Los_Angeles

## 2. PREFERRED SEND TIME CHANGES
Detect when the user wants to change when they receive their daily messages.

Interpret natural language intelligently:
- "morning" → 8
- "early morning" / "before work" → 6
- "afternoon" → 14
- "evening" / "after work" / "end of day" → 18
- "night" / "late" → 20
- "noon" / "lunch" / "midday" → 12
- Explicit times: "8am" → 8, "6pm" → 18, "7:30am" → 7, "5:00 PM" → 17

Only extract if the user is clearly asking to CHANGE their send time, not just mentioning a time casually.
Examples that ARE changes: "send my workouts in the morning", "can I get messages at 6pm instead", "change my send time to evening"
Examples that are NOT changes: "I worked out this morning", "I'll be busy at 6pm"

## 3. NAME CHANGES
Detect when the user wants to be called something different.

Look for:
- "call me X"
- "my name is X"
- "I go by X"
- "you can call me X"
- "I prefer X"

Only extract the NEW name they want, not their current name being referenced.

## IMPORTANT RULES

1. Only extract fields the user is ACTIVELY REQUESTING to change
2. Return null for any field not mentioned or not being changed
3. Set hasUpdates to true only if at least one field is non-null
4. Be conservative - when in doubt, return null
5. The updateSummary should briefly describe what was detected (empty string if nothing)

## OUTPUT FORMAT

Return JSON with:
- timezone: string | null (IANA timezone from the list above, e.g., "America/New_York")
- preferredSendHour: number | null (0-23)
- name: string | null
- hasUpdates: boolean
- updateSummary: string`;
function buildUserFieldsUserMessage(message, user, currentDate) {
    return `## CURRENT USER SETTINGS
- Name: ${user.name || 'Not set'}
- Timezone: ${user.timezone}
- Preferred Send Hour: ${user.preferredSendHour} (${formatHourForDisplay(user.preferredSendHour)})
- Current Date: ${currentDate}

## USER MESSAGE
${message}

## TASK
Analyze the message above. Extract any requested changes to timezone, send time, or name.
Return null for fields not being changed.`;
}
/**
 * Format hour for display (e.g., 8 → "8:00 AM", 18 → "6:00 PM")
 */ function formatHourForDisplay(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
}
const STRUCTURED_PROFILE_SYSTEM_PROMPT = `You are a profile parser for a fitness coaching app. Your job is to extract structured data from a Markdown fitness profile document.

# INPUT
You will receive a Markdown "Living Dossier" profile document. This document contains sections like IDENTITY, OBJECTIVES, PREFERENCES, LOGISTICS & ENVIRONMENT, CONSTRAINTS, etc.

# OUTPUT
Extract the following fields into structured JSON:

## 1. goals (string[])
Extract all fitness goals from the OBJECTIVES section and any other goal-related mentions.
- Examples: "Lose 10lbs", "Bench 225lbs", "Run a marathon", "Build muscle"
- Keep them as concise statements

## 2. experienceLevel ("beginner" | "intermediate" | "advanced" | null)
Look for explicit mentions of experience level in IDENTITY or elsewhere.
- Only set this if explicitly stated (e.g., "Experience Level: Intermediate")
- Return null if not explicitly mentioned

## 3. preferences (string[])
Extract ALL preferences including:
- **Exercise preferences**: "Prefers barbell over dumbbell", "Hates lunges", "Loves deadlifts"
- **Scheduling preferences**: "Likes to start week with legs", "Prefers morning workouts"
- **Workout style preferences**: "Likes supersets", "Prefers high intensity"
- Keep each preference as a clear, concise statement

## 4. injuries (string[])
Extract PERMANENT physical limitations from the CONSTRAINTS section.
- Only include injuries marked as permanent or chronic
- Examples: "Bad lower back", "Chronic shoulder impingement", "Knee arthritis"
- Do NOT include temporary injuries here

## 5. constraints (array of objects)
Extract TEMPORARY constraints with optional date bounds.
Each constraint has:
- value: Description of the constraint
- start: ISO date (YYYY-MM-DD) when it started, or null if unknown
- end: ISO date (YYYY-MM-DD) when it ends, or null if ongoing

Look for [ACTIVE] tags which contain dates in format: [ACTIVE] Description (Effective: YYYY-MM-DD to YYYY-MM-DD)
- Examples:
  - "[ACTIVE] Travel (Effective: 2024-01-15 to 2024-01-22)" → { value: "Travel", start: "2024-01-15", end: "2024-01-22" }
  - "[ACTIVE] Recovering from flu" → { value: "Recovering from flu", start: null, end: null }

## 6. equipmentAccess (string[])
Extract equipment and gym access information:
- Gym type: "Commercial gym", "Home gym", "Planet Fitness"
- Available equipment: "Full rack", "Dumbbells up to 50lbs", "Cable machine"
- Equipment limitations: "No barbell", "Dumbbells only"
- Location: "Works out at LA Fitness"

# RULES
1. Extract ONLY what is explicitly stated in the profile
2. Return empty arrays [] for sections with no data
3. For experienceLevel, return null unless explicitly stated
4. Keep values concise and normalized
5. Parse [ACTIVE] tags carefully for date extraction
6. Ignore expired constraints (where end date has passed based on current date)

# EXAMPLES

Input profile:
\`\`\`
# IDENTITY
- Name: John
- Age: 30
- Experience Level: Intermediate

# OBJECTIVES
- Lose 15lbs
- Bench 225lbs

# PREFERENCES
### Exercise Preferences
- I prefer barbell over dumbbell
- I hate lunges

### Workout Style Preferences
- I like supersets

# LOGISTICS & ENVIRONMENT
### Equipment Access
**Gym Type:** Commercial gym (LA Fitness)
**Available Equipment:** Full rack, Cable machine, Dumbbells

# CONSTRAINTS
**Permanent:**
- Bad lower back

**Temporary:**
* **[ACTIVE] Shoulder strain (Effective: 2024-01-10 to 2024-02-10)**
\`\`\`

Output:
{
  "goals": ["Lose 15lbs", "Bench 225lbs"],
  "experienceLevel": "intermediate",
  "preferences": ["Prefers barbell over dumbbell", "Hates lunges", "Likes supersets"],
  "injuries": ["Bad lower back"],
  "constraints": [{ "value": "Shoulder strain", "start": "2024-01-10", "end": "2024-02-10" }],
  "equipmentAccess": ["Commercial gym", "LA Fitness", "Full rack", "Cable machine", "Dumbbells"]
}`;
function buildStructuredProfileUserMessage(dossierText, currentDate) {
    return `## CURRENT DATE
${currentDate}

## PROFILE TO PARSE

${dossierText || '_No profile content - return empty arrays for all fields_'}

## YOUR TASK
Parse this profile into the structured format. Extract all relevant information following the rules above.`;
}
}),
"[project]/packages/shared/src/shared/utils/timezone.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client-side timezone utilities
 * These are safe to use in React components
 */ // Common IANA timezones for UI selection
__turbopack_context__.s([
    "COMMON_TIMEZONES",
    ()=>COMMON_TIMEZONES,
    "formatTimezoneForDisplay",
    ()=>formatTimezoneForDisplay,
    "getTimezoneSuggestions",
    ()=>getTimezoneSuggestions,
    "isValidTimezone",
    ()=>isValidTimezone
]);
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
function formatTimezoneForDisplay(timezone) {
    // Convert America/New_York to "New York (America)"
    const parts = timezone.split('/');
    if (parts.length === 2) {
        const city = parts[1].replace(/_/g, ' ');
        return `${city} (${parts[0]})`;
    }
    return timezone;
}
function isValidTimezone(timezone) {
    if (!timezone || typeof timezone !== 'string') {
        return false;
    }
    // First check if it's in our common timezones list
    if (COMMON_TIMEZONES.includes(timezone)) {
        return true;
    }
    // Then try to validate using Intl.DateTimeFormat
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: timezone
        });
        return true;
    } catch  {
        return false;
    }
}
function getTimezoneSuggestions(input) {
    if (!input || input.length < 2) {
        // Return most common US timezones
        return [
            {
                timezone: 'America/New_York',
                display: 'New York (Eastern Time)'
            },
            {
                timezone: 'America/Chicago',
                display: 'Chicago (Central Time)'
            },
            {
                timezone: 'America/Denver',
                display: 'Denver (Mountain Time)'
            },
            {
                timezone: 'America/Los_Angeles',
                display: 'Los Angeles (Pacific Time)'
            }
        ];
    }
    const cleaned = input.toLowerCase().trim();
    const suggestions = [];
    // Filter common timezones that match the input
    for (const timezone of COMMON_TIMEZONES){
        const display = formatTimezoneForDisplay(timezone);
        const city = timezone.split('/')[1]?.replace(/_/g, ' ').toLowerCase() || '';
        const region = timezone.split('/')[0]?.toLowerCase() || '';
        if (timezone.toLowerCase().includes(cleaned) || display.toLowerCase().includes(cleaned) || city.includes(cleaned) || region.includes(cleaned)) {
            suggestions.push({
                timezone,
                display
            });
        }
    }
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
}
}),
"[project]/packages/shared/src/server/services/agents/schemas/profile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileUpdateOutputSchema",
    ()=>ProfileUpdateOutputSchema,
    "UserFieldsOutputSchema",
    ()=>UserFieldsOutputSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/timezone.ts [app-route] (ecmascript)");
;
;
const ProfileUpdateOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    updatedProfile: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('The complete updated Markdown profile document'),
    wasUpdated: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean().describe('Whether any changes were made to the profile'),
    updateSummary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('Brief summary of changes made. Empty string if nothing was updated.')
});
const UserFieldsOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    /**
   * IANA timezone from constrained enum
   * LLM picks from valid options based on user's location/timezone mention
   * Returns null if no timezone change was requested
   */ timezone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COMMON_TIMEZONES"]).nullable(),
    /**
   * Inferred preferred send hour (0-23 in 24-hour format)
   * The agent interprets natural language time expressions:
   * - "morning" → 8
   * - "early morning" → 6
   * - "afternoon" → 14
   * - "evening" / "after work" → 18
   * - "night" → 20
   * - "noon" / "lunch" → 12
   * - Explicit times: "8am" → 8, "6pm" → 18
   * Returns null if no send time change was requested
   */ preferredSendHour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().int().min(0).max(23).nullable(),
    /**
   * New name if user wants to change it
   * Detected from phrases like "call me X", "my name is X", "I go by X"
   * Returns null if no name change was requested
   */ name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullable(),
    /**
   * Whether any field updates were detected in the message
   * True if at least one of timezone, preferredSendHour, or name is non-null
   */ hasUpdates: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean(),
    /**
   * Brief summary of what was detected
   * Examples:
   * - "User wants to change timezone to east coast"
   * - "User wants messages at 6pm and to be called Mike"
   * - "" (empty string if no updates)
   */ updateSummary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()
});
}),
"[project]/packages/shared/src/shared/types/profile/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExperienceLevelSchema",
    ()=>ExperienceLevelSchema,
    "StructuredConstraintSchema",
    ()=>StructuredConstraintSchema,
    "StructuredProfileSchema",
    ()=>StructuredProfileSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
const StructuredConstraintSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('Description of the constraint (injury, travel, temporary limitation, etc.)'),
    start: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullable().describe('ISO date string when constraint started, or null if permanent/unknown'),
    end: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().nullable().describe('ISO date string when constraint ends, or null if ongoing/permanent')
});
const ExperienceLevelSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].enum([
    'beginner',
    'intermediate',
    'advanced'
]);
const StructuredProfileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    /** User's fitness goals extracted from profile */ goals: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("User's stated fitness goals"),
    /** User's experience level if stated */ experienceLevel: ExperienceLevelSchema.nullable().describe("User's experience level (beginner, intermediate, advanced) or null if not stated"),
    /** Exercise, scheduling, and workout style preferences */ preferences: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe('Preferences including exercise likes/dislikes, scheduling preferences, and workout style preferences'),
    /** Permanent physical limitations or injuries */ injuries: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe('Permanent physical limitations or chronic injuries'),
    /** Temporary constraints with optional date bounds */ constraints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(StructuredConstraintSchema).describe('Temporary constraints with optional start/end dates (travel, temporary injuries, etc.)'),
    /** Available equipment and gym access info */ equipmentAccess: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe('Equipment access including gym type, available equipment, and limitations')
});
}),
"[project]/packages/shared/src/shared/types/profile/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/profile/schema.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/shared/src/server/models/profile.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Profile Model
 *
 * Re-exports structured profile schemas and types from shared/types.
 */ // Re-export from shared types
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/profile/index.ts [app-route] (ecmascript) <locals>");
;
}),
"[project]/packages/shared/src/server/utils/profile/jsonToMarkdown.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Markdown Profile Utilities
 *
 * Provides utilities for creating Markdown "Living Dossier" format profiles.
 */ __turbopack_context__.s([
    "createEmptyProfile",
    ()=>createEmptyProfile
]);
function createEmptyProfile(user) {
    const sections = [];
    // Minimal IDENTITY section
    const identityLines = [
        '# IDENTITY'
    ];
    if (user?.name) {
        identityLines.push(`**Name:** ${user.name}`);
    }
    if (user?.age) {
        identityLines.push(`**Age:** ${user.age}`);
    }
    sections.push(identityLines.join('\n'));
    return sections.join('\n\n');
}
}),
"[project]/packages/shared/src/server/services/user/signupDataFormatter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatSignupDataForLLM",
    ()=>formatSignupDataForLLM
]);
function formatSignupDataForLLM(data) {
    // 1. Fitness Goals
    const goalsList = `My goals are: ${(data.primaryGoals || []).map(getGoalDescription).join(', ')}`;
    const fitnessGoals = data.goalsElaboration?.trim() ? `${goalsList}. Additional details: ${data.goalsElaboration.trim()}` : goalsList;
    // 2. Desired Availability & Experience
    const desiredFrequency = data.desiredDaysPerWeek ? getDaysPerWeekDescription(data.desiredDaysPerWeek) : '';
    const experienceLevel = data.experienceLevel ? `Experience level: ${data.experienceLevel.charAt(0).toUpperCase() + data.experienceLevel.slice(1)}` : '';
    // Frame as desired availability - what the user WANTS, not what they currently do
    const availabilityText = `***Desired Availability***:
  ${experienceLevel}. ${desiredFrequency}.
  Additional Details: ${data.availabilityElaboration?.trim() || 'None provided.'}`;
    const currentExercise = availabilityText;
    // 3. Environment
    const locationText = data.trainingLocation ? `Training location: ${getLocationDescription(data.trainingLocation)}` : '';
    const equipmentText = data.equipment && data.equipment.length > 0 ? `Available equipment: ${data.equipment.map((e)=>getEquipmentDescription(e)).join(', ')}` : 'No specific equipment';
    const environment = `***Environment & Constraints***:
  ${locationText}. ${equipmentText}`;
    return {
        fitnessGoals,
        currentExercise,
        environment,
        injuries: data.injuries
    };
}
// Helper functions for converting enum values to descriptions
function getGoalDescription(goal) {
    const goalMap = {
        strength: 'Build strength and muscle',
        endurance: 'Improve endurance and stamina',
        weight_loss: 'Lose weight and improve body composition',
        general_fitness: 'Improve overall fitness and health'
    };
    return goalMap[goal] || goal;
}
function getDaysPerWeekDescription(daysPerWeek) {
    const daysMap = {
        '3_per_week': 'Wants to train 3 days per week',
        '4_per_week': 'Wants to train 4 days per week',
        '5_per_week': 'Wants to train 5 days per week',
        '6_per_week': 'Wants to train 6 days per week'
    };
    return daysMap[daysPerWeek] || daysPerWeek;
}
function getLocationDescription(location) {
    const locationMap = {
        home: 'Home gym',
        commercial_gym: 'Commercial gym',
        bodyweight: 'Bodyweight/minimal equipment'
    };
    return locationMap[location] || location;
}
function getEquipmentDescription(equipment) {
    const equipmentMap = {
        dumbbells: 'Dumbbells',
        barbell: 'Barbell',
        resistance_bands: 'Resistance bands',
        pull_up_bar: 'Pull-up bar',
        cardio_equipment: 'Cardio equipment',
        full_gym: 'Full gym access'
    };
    return equipmentMap[equipment] || equipment;
}
}),
"[project]/packages/shared/src/server/services/user/fitnessProfileService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * FitnessProfileService - Markdown-based Profile Management
 *
 * This service manages Markdown "Living Dossier" profiles with full history tracking.
 *
 * Key features:
 * - Uses ProfileRepository for Markdown profile storage
 * - Single Profile Update Agent for AI-powered profile creation
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text
 * - Circuit breaker pattern for resilience
 */ __turbopack_context__.s([
    "FitnessProfileService",
    ()=>FitnessProfileService,
    "fitnessProfileService",
    ()=>fitnessProfileService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/profileRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/profile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$schemas$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/schemas/profile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/profile.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/profile/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$profile$2f$jsonToMarkdown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/utils/profile/jsonToMarkdown.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$signupDataFormatter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/signupDataFormatter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
class FitnessProfileService {
    static instance;
    circuitBreaker;
    profileRepository;
    constructor(){
        this.circuitBreaker = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CircuitBreaker"]({
            failureThreshold: 5,
            resetTimeout: 60000,
            monitoringPeriod: 60000
        });
        this.profileRepository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileRepository"]();
    }
    static getInstance() {
        if (!FitnessProfileService.instance) {
            FitnessProfileService.instance = new FitnessProfileService();
        }
        return FitnessProfileService.instance;
    }
    /**
   * Get the current Markdown profile for a user
   *
   * @param userId - UUID of the user
   * @returns Markdown profile text or null if no profile exists
   */ async getCurrentProfile(userId) {
        return await this.profileRepository.getCurrentProfileText(userId);
    }
    /**
   * Save updated profile
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param profile - Complete profile text
   */ async saveProfile(userId, profile) {
        try {
            await this.profileRepository.createProfileForUser(userId, profile);
            console.log(`[FitnessProfileService] Saved profile for user ${userId}`);
        } catch (error) {
            console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
            throw error;
        }
    }
    /**
   * Create initial fitness profile from signup data
   * Converts signup data to Markdown format and stores it
   *
   * @param user - User to create profile for
   * @param signupData - Onboarding signup data
   * @returns Markdown profile text
   */ async createFitnessProfile(user, signupData) {
        return this.circuitBreaker.execute(async ()=>{
            try {
                // Format signup data for agent processing
                const formattedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$signupDataFormatter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatSignupDataForLLM"])(signupData);
                // Build message from signup data
                const messageParts = [];
                if (formattedData.fitnessGoals?.trim()) {
                    messageParts.push(`***Goals***:\n${formattedData.fitnessGoals.trim()}`);
                }
                if (formattedData.currentExercise?.trim()) {
                    messageParts.push(`***Current Activity***:\n${formattedData.currentExercise.trim()}`);
                }
                if (formattedData.environment?.trim()) {
                    messageParts.push(`***Training Environment***:\n${formattedData.environment.trim()}`);
                }
                if (formattedData.injuries?.trim()) {
                    messageParts.push(`***Injuries or Limitations***:\n${formattedData.injuries.trim()}`);
                }
                const message = messageParts.join('\n\n');
                // Start with empty profile
                const currentProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$utils$2f$profile$2f$jsonToMarkdown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmptyProfile"])(user);
                // Use Profile Update Agent to build initial profile from signup data
                const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatForAI"])(new Date(), user.timezone);
                // Helper function for structured profile extraction
                // System prompt fetched from DB based on agent name
                const invokeStructuredProfileAgent = async (input)=>{
                    const parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
                    const userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildStructuredProfileUserMessage"])(parsedInput.dossierText, parsedInput.currentDate);
                    const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                        name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_STRUCTURED,
                        schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StructuredProfileSchema"]
                    }, {
                        model: 'gpt-5-nano',
                        temperature: 0.3
                    });
                    const agentResult = await agent.invoke(userPrompt);
                    return {
                        structured: agentResult.response,
                        success: true
                    };
                };
                // Create profile update agent inline with subAgents for structured extraction
                // Prompts fetched from DB based on agent name
                const userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildProfileUpdateUserMessage"])(currentProfile, message, user, currentDate);
                const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                    name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_FITNESS,
                    schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$schemas$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileUpdateOutputSchema"],
                    subAgents: [
                        {
                            structured: {
                                agent: {
                                    name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_STRUCTURED,
                                    invoke: invokeStructuredProfileAgent
                                },
                                condition: (agentResult)=>agentResult.wasUpdated,
                                transform: (agentResult)=>JSON.stringify({
                                        dossierText: agentResult.updatedProfile,
                                        currentDate
                                    })
                            }
                        }
                    ]
                }, {
                    model: 'gpt-5.1'
                });
                const agentResult = await agent.invoke(userPrompt);
                const structuredResult = agentResult.structured;
                const structured = structuredResult?.success ? structuredResult.structured : null;
                const result = {
                    updatedProfile: agentResult.response.updatedProfile,
                    wasUpdated: agentResult.response.wasUpdated,
                    updateSummary: agentResult.response.updateSummary || '',
                    structured
                };
                console.log('[FitnessProfileService] Created initial profile:', {
                    wasUpdated: result.wasUpdated,
                    summary: result.updateSummary,
                    hasStructured: result.structured !== null
                });
                // Store profile with structured data
                await this.profileRepository.createProfileWithStructured(user.id, result.updatedProfile, result.structured);
                return result.updatedProfile;
            } catch (error) {
                console.error('[FitnessProfileService] Error creating profile:', error);
                throw error;
            }
        });
    }
    /**
   * Get profile update history for a user
   *
   * @param userId - UUID of the user
   * @param limit - Number of historical profiles to retrieve
   * @returns Array of profile snapshots with timestamps
   */ async getProfileHistory(userId, limit = 10) {
        return await this.profileRepository.getProfileHistory(userId, limit);
    }
    // ============================================
    // Structured Profile Methods
    // ============================================
    /**
   * Save updated profile with structured data
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param profile - Complete profile text (Markdown)
   * @param structured - Structured profile data (or null)
   */ async saveProfileWithStructured(userId, profile, structured) {
        try {
            await this.profileRepository.createProfileWithStructured(userId, profile, structured);
            console.log(`[FitnessProfileService] Saved profile with structured data for user ${userId}`);
        } catch (error) {
            console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
            throw error;
        }
    }
    /**
   * Get current structured profile data
   *
   * @param userId - UUID of the user
   * @returns Structured profile data or null if not available
   */ async getCurrentStructuredProfile(userId) {
        return await this.profileRepository.getCurrentStructuredProfile(userId);
    }
}
const fitnessProfileService = FitnessProfileService.getInstance();
}),
"[project]/packages/shared/src/server/services/flows/conversationFlowBuilder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConversationFlowBuilder",
    ()=>ConversationFlowBuilder
]);
class ConversationFlowBuilder {
    messages = [];
    /**
   * Convert Message array to LangChain message format (static utility)
   *
   * Use this when you need to convert Message objects to the format expected
   * by LangChain/OpenAI APIs. This is the single source of truth for message formatting.
   *
   * @param messages - Array of Message objects to convert
   * @returns Array formatted for LangChain with proper roles (user/assistant)
   *
   * @example
   * ```typescript
   * // In an agent:
   * const messages = [
   *   { role: 'system', content: systemPrompt },
   *   ...ConversationFlowBuilder.toMessageArray(previousMessages),
   *   { role: 'user', content: currentMessage }
   * ];
   * ```
   */ static toMessageArray(messages) {
        return messages.map((msg)=>({
                role: msg.direction === 'inbound' ? 'user' : 'assistant',
                content: msg.content
            }));
    }
    /**
   * Filter messages to get proper context for chat agents
   *
   * When processing a new inbound message, the database may contain:
   * - Case 1: [..., user_message] - Last is the current inbound message being processed (duplicate)
   * - Case 2: [..., reply_agent_message] - Last is the reply agent's acknowledgment (needed for context)
   *
   * This method intelligently filters to avoid duplicates while preserving reply agent context.
   *
   * @param messages - Array of messages from the database
   * @returns Filtered messages for use as chat context
   *
   * @example
   * ```typescript
   * // In chatService when processing a new message:
   * const recentMessages = await conversationService.getRecentMessages(userId, 10);
   * const contextMessages = ConversationFlowBuilder.filterMessagesForContext(recentMessages);
   * const response = await chatAgent(user, message, contextMessages);
   * ```
   */ static filterMessagesForContext(messages) {
        if (!messages || messages.length === 0) {
            return [];
        }
        const lastMessage = messages[messages.length - 1];
        // If last message is inbound (from user), it's the current message being processed
        // Remove it to avoid duplicate context
        if (lastMessage.direction === 'inbound') {
            return messages.slice(0, -1);
        }
        // If last message is outbound (from assistant/reply agent), keep it
        // This is important context from the reply agent that the chat agent needs
        return messages;
    }
    /**
   * Add one or more messages to the flow
   */ addMessage(message) {
        if (Array.isArray(message)) {
            this.messages.push(...message);
        } else {
            this.messages.push(message);
        }
    }
    /**
   * Get recent messages from the flow
   * @param limit - Maximum number of messages to return (most recent first)
   * @returns Array of messages
   */ getRecentMessages(limit) {
        if (!limit) {
            return [
                ...this.messages
            ];
        }
        return this.messages.slice(-limit);
    }
    /**
   * Convert messages to LangChain message format
   * @param limit - Optional limit on number of messages to convert
   * @returns Array formatted for LangChain with proper roles
   */ toArray(limit) {
        const messages = this.getRecentMessages(limit);
        return messages.map((msg)=>({
                role: msg.direction === 'inbound' ? 'user' : 'assistant',
                content: msg.content
            }));
    }
    /**
   * Convert messages to formatted string for direct prompt injection
   * @param limit - Optional limit on number of messages to include
   * @returns Formatted string of conversation
   */ toString(limit) {
        const messages = this.getRecentMessages(limit);
        return messages.map((msg)=>{
            const role = msg.direction === 'inbound' ? 'User' : 'Assistant';
            return `${role}: ${msg.content}`;
        }).join('\n\n');
    }
    /**
   * Get total number of messages in the flow
   */ get length() {
        return this.messages.length;
    }
    /**
   * Clear all messages from the flow
   */ clear() {
        this.messages = [];
    }
}
}),
"[project]/packages/shared/src/server/services/agents/profile/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileService",
    ()=>ProfileService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/fitnessProfileService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/flows/conversationFlowBuilder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/profile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$schemas$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/schemas/profile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$models$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/models/profile.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/types/profile/schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
class ProfileService {
    /**
   * Update profile and user fields from a user message
   *
   * Runs both agents in parallel:
   * 1. Profile agent - updates the fitness profile dossier
   * 2. User fields agent - extracts timezone, send time, and name changes
   *
   * Fetches context via entity services, calls both agents,
   * persists updates, and returns a standardized ToolResult.
   *
   * @param userId - The user's ID
   * @param message - The user's message to extract info from
   * @param previousMessages - Optional conversation history for context
   * @returns ToolResult with response summary and optional messages
   */ static async updateProfile(userId, message, previousMessages) {
        console.log('[PROFILE_SERVICE] Processing profile update:', {
            userId,
            message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        });
        try {
            // Fetch context via entity services
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].getUser(userId);
            if (!user) {
                console.warn('[PROFILE_SERVICE] User not found:', userId);
                return {
                    toolType: 'action',
                    response: 'User not found.'
                };
            }
            const currentProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessProfileService"].getCurrentProfile(userId) ?? '';
            const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatForAI"])(new Date(), user.timezone);
            // Convert previous messages to Message format for the configurable agent
            const previousMsgs = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ConversationFlowBuilder"].toMessageArray(previousMessages || []).map((m)=>({
                    role: m.role,
                    content: m.content
                }));
            // Helper function to create and invoke the structured profile agent
            // System prompt fetched from DB based on agent name
            const invokeStructuredProfileAgent = async (input)=>{
                const parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
                const userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildStructuredProfileUserMessage"])(parsedInput.dossierText, parsedInput.currentDate);
                const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                    name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_STRUCTURED,
                    schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$types$2f$profile$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StructuredProfileSchema"]
                }, {
                    model: 'gpt-5-nano',
                    temperature: 0.3
                });
                const result = await agent.invoke(userPrompt);
                return {
                    structured: result.response,
                    success: true
                };
            };
            // Run BOTH agents in parallel for efficiency
            const [profileResult, userFieldsResult] = await Promise.all([
                // Profile agent - updates fitness profile dossier
                // Prompts fetched from DB based on agent name
                (async ()=>{
                    const userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildProfileUpdateUserMessage"])(currentProfile, message, user, currentDate);
                    // Create profile update agent with subAgents for structured extraction
                    const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                        name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_FITNESS,
                        previousMessages: previousMsgs,
                        schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$schemas$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileUpdateOutputSchema"],
                        subAgents: [
                            {
                                structured: {
                                    agent: {
                                        name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_STRUCTURED,
                                        invoke: invokeStructuredProfileAgent
                                    },
                                    condition: (result)=>result.wasUpdated,
                                    transform: (result)=>JSON.stringify({
                                            dossierText: result.updatedProfile,
                                            currentDate
                                        })
                                }
                            }
                        ]
                    });
                    const result = await agent.invoke(userPrompt);
                    const structuredResult = result.structured;
                    const structured = structuredResult?.success ? structuredResult.structured : null;
                    return {
                        updatedProfile: result.response.updatedProfile,
                        wasUpdated: result.response.wasUpdated,
                        updateSummary: result.response.updateSummary || '',
                        structured
                    };
                })(),
                // User fields agent - extracts timezone, send time, name changes
                // Prompts fetched from DB based on agent name
                (async ()=>{
                    const userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserFieldsUserMessage"])(message, user, currentDate);
                    const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                        name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].PROFILE_USER,
                        previousMessages: previousMsgs,
                        schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$schemas$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserFieldsOutputSchema"]
                    }, {
                        model: 'gpt-5-nano',
                        temperature: 0.3
                    });
                    const result = await agent.invoke(userPrompt);
                    return {
                        timezone: result.response.timezone,
                        preferredSendHour: result.response.preferredSendHour,
                        name: result.response.name,
                        hasUpdates: result.response.hasUpdates,
                        updateSummary: result.response.updateSummary || ''
                    };
                })()
            ]);
            // Persist profile updates (structured data now included from update agent)
            if (profileResult.wasUpdated) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessProfileService"].saveProfileWithStructured(userId, profileResult.updatedProfile, profileResult.structured);
                console.log('[PROFILE_SERVICE] Profile updated:', {
                    summary: profileResult.updateSummary,
                    hasStructured: profileResult.structured !== null
                });
            } else {
                console.log('[PROFILE_SERVICE] No profile updates detected');
            }
            // Handle user field updates
            if (userFieldsResult.hasUpdates) {
                const userUpdates = {};
                // Timezone: !! handles null and empty string
                if (!!userFieldsResult.timezone) {
                    userUpdates.timezone = userFieldsResult.timezone;
                    console.log('[PROFILE_SERVICE] Timezone update:', userFieldsResult.timezone);
                }
                // PreferredSendHour: can't use !! because 0 (midnight) is valid
                // Check for null and -1 sentinel explicitly
                if (userFieldsResult.preferredSendHour != null && userFieldsResult.preferredSendHour !== -1) {
                    userUpdates.preferredSendHour = userFieldsResult.preferredSendHour;
                }
                // Name: !! handles null and empty string
                if (!!userFieldsResult.name) {
                    userUpdates.name = userFieldsResult.name;
                }
                // Persist user updates if any valid fields
                if (Object.keys(userUpdates).length > 0) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].updatePreferences(userId, userUpdates);
                    console.log('[PROFILE_SERVICE] User fields updated:', userUpdates);
                    // Check if time-related fields changed - ensure user has today's workout
                    if (userUpdates.timezone !== undefined || userUpdates.preferredSendHour !== undefined) {
                        const newTimezone = userUpdates.timezone ?? user.timezone;
                        const currentTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(newTimezone);
                        // Check if workout already exists for today (prevents duplicates)
                        const todayStart = currentTime.startOf('day').toJSDate();
                        const existingWorkout = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutInstanceService"].getWorkoutByUserIdAndDate(userId, todayStart);
                        if (!existingWorkout) {
                            // No workout exists - trigger immediate send via Inngest
                            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
                                name: 'workout/scheduled',
                                data: {
                                    userId,
                                    targetDate: currentTime.startOf('day').toISO()
                                }
                            });
                            console.log('[PROFILE_SERVICE] Triggered immediate workout for missed send time');
                        }
                    }
                }
            }
            // Combine summaries for response
            const summaries = [];
            if (profileResult.wasUpdated) {
                summaries.push(`Profile: ${profileResult.updateSummary}`);
            }
            if (userFieldsResult.hasUpdates && Object.keys(userFieldsResult).some((k)=>k !== 'hasUpdates' && k !== 'updateSummary' && userFieldsResult[k] !== null)) {
                summaries.push(`Settings: ${userFieldsResult.updateSummary}`);
            }
            return {
                toolType: 'action',
                response: summaries.length > 0 ? summaries.join('; ') : 'No updates detected.'
            };
        } catch (error) {
            console.error('[PROFILE_SERVICE] Error updating profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                toolType: 'action',
                response: `Profile update failed: ${errorMessage}`
            };
        }
    }
}
}),
"[project]/packages/shared/src/server/services/agents/modifications/workoutModificationService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkoutModificationService",
    ()=>WorkoutModificationService,
    "workoutModificationService",
    ()=>workoutModificationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/microcycleAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$luxon$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/luxon.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/luxon@3.7.1/node_modules/luxon/src/datetime.js [app-route] (ecmascript) <export default as DateTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class WorkoutModificationService {
    static instance;
    userService;
    microcycleService;
    workoutInstanceService;
    progressService;
    fitnessPlanService;
    constructor(){
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.microcycleService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleService"].getInstance();
        this.workoutInstanceService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceService"].getInstance();
        this.progressService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProgressService"].getInstance();
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
    }
    static getInstance() {
        if (!WorkoutModificationService.instance) {
            WorkoutModificationService.instance = new WorkoutModificationService();
        }
        return WorkoutModificationService.instance;
    }
    /**
   * Modify an entire workout based on constraints
   */ async modifyWorkout(params) {
        try {
            const { userId, workoutDate, changeRequest } = params;
            console.log('Modifying workout', params);
            // Get user with profile first to determine timezone
            const user = await this.userService.getUser(userId);
            if (!user) {
                return {
                    success: false,
                    messages: [],
                    error: 'User not found'
                };
            }
            // Convert the workout date to the user's timezone
            // If the date came as an ISO string like "2024-10-08", it was parsed as UTC midnight
            // We need to interpret it as a calendar date in the user's timezone instead
            const dateStr = workoutDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
            const userLocalDate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$luxon$40$3$2e$7$2e$1$2f$node_modules$2f$luxon$2f$src$2f$datetime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__DateTime$3e$__["DateTime"].fromISO(dateStr, {
                zone: user.timezone
            }).startOf('day').toJSDate();
            // Get the existing workout
            const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, userLocalDate);
            if (!existingWorkout) {
                return {
                    success: false,
                    messages: [],
                    error: 'No workout found for the specified date'
                };
            }
            // Use the workout agent service to modify the workout
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].modifyWorkout(user, existingWorkout, changeRequest);
            // Extract theme from structured data or use default
            const theme = result.structure?.title || 'Workout';
            // Store theme in details
            const details = {
                theme
            };
            // Update the workout in the database
            await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
                description: result.response.overview,
                message: result.message,
                structured: result.structure,
                details
            });
            return {
                success: true,
                workout: result,
                modifications: result.response.modifications,
                messages: result.message ? [
                    result.message
                ] : []
            };
        } catch (error) {
            console.error('Error modifying workout:', error);
            return {
                success: false,
                messages: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
   * Modify the weekly pattern for remaining days and regenerate a single workout
   */ async modifyWeek(params) {
        try {
            const { userId, changeRequest } = params;
            // const reason = params.reason; // Not currently used
            // targetDay is not currently used - we use the current day of week instead
            // Get user with profile
            const user = await this.userService.getUser(userId);
            if (!user) {
                return {
                    success: false,
                    messages: [],
                    error: 'User not found'
                };
            }
            const plan = await this.fitnessPlanService.getCurrentPlan(userId);
            if (!plan) {
                return {
                    success: false,
                    messages: [],
                    error: 'No fitness plan found'
                };
            }
            const progress = await this.progressService.getCurrentProgress(plan, user.timezone);
            if (!progress) {
                return {
                    success: false,
                    messages: [],
                    error: 'No progress found'
                };
            }
            const { microcycle } = progress;
            if (!microcycle) {
                return {
                    success: false,
                    messages: [],
                    error: 'No microcycle found'
                };
            }
            console.log(`[MODIFY_WEEK] Using active microcycle ${microcycle.id} (${new Date(microcycle.startDate).toLocaleDateString()} - ${new Date(microcycle.endDate).toLocaleDateString()})`);
            // Get current date in user's timezone (needed for workout operations below)
            const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate();
            // Get today's day of week and index for microcycle days array (0-6, Mon-Sun)
            const todayDayOfWeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDayOfWeek"])(undefined, user.timezone);
            const todayDayIndex = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"].indexOf(todayDayOfWeek);
            const originalTodayOverview = microcycle.days[todayDayIndex] || null;
            // Use the microcycle agent service to modify the pattern
            const modifyMicrocycleResult = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleAgentService"].modifyMicrocycle(user, microcycle, changeRequest);
            console.log(`[MODIFY_WEEK] Microcycle modification result:`, modifyMicrocycleResult);
            // Check if the microcycle was actually modified
            if (modifyMicrocycleResult.wasModified) {
                console.log(`[MODIFY_WEEK] Microcycle was modified - updating database`);
                // Generate specialized "updated week" message using remaining days
                // const updatedMicrocycleMessageAgent = createUpdatedMicrocycleMessageAgent();
                // const microcycleUpdateMessage = await updatedMicrocycleMessageAgent.invoke({
                //   modifiedMicrocycle: {
                //     overview: modifyMicrocycleResult.description,
                //     isDeload: modifyMicrocycleResult.isDeload || false,
                //     days: modifyMicrocycleResult.days,
                //   },
                //   modifications: modifyMicrocycleResult.modifications || 'Updated weekly pattern based on your request',
                //   currentWeekday: todayDayOfWeek as DayOfWeek,
                //   user,
                // });
                // Update the microcycle with the new pattern (days array from the result)
                await this.microcycleService.updateMicrocycle(microcycle.id, {
                    days: modifyMicrocycleResult.days,
                    description: modifyMicrocycleResult.description,
                    isDeload: modifyMicrocycleResult.isDeload,
                    structured: modifyMicrocycleResult.structure
                });
                // Check if today's overview changed - if so, regenerate today's workout
                const newTodayOverview = modifyMicrocycleResult.days[todayDayIndex] || null;
                if (originalTodayOverview !== newTodayOverview) {
                    // Get activity type from modified microcycle structure
                    const structuredDay = modifyMicrocycleResult.structure?.days?.[todayDayIndex];
                    const activityType = structuredDay?.activityType;
                    // Generate new workout for today using workout agent service
                    const workoutResult = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].generateWorkout(user, newTodayOverview || '', modifyMicrocycleResult.isDeload || false, activityType);
                    // Extract theme from structured data or use default
                    const theme = workoutResult.structure?.title || 'Workout';
                    // Store theme in details
                    const details = {
                        theme
                    };
                    // Check if a workout exists for today
                    const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, today);
                    if (existingWorkout) {
                        // Update existing workout
                        await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
                            details,
                            description: workoutResult.response,
                            message: workoutResult.message,
                            structured: workoutResult.structure,
                            goal: theme,
                            sessionType: this.mapThemeToSessionType(theme)
                        });
                        console.log(`[MODIFY_WEEK] Updated today's workout`);
                    } else {
                        // Create new workout
                        await this.workoutInstanceService.createWorkout({
                            clientId: userId,
                            microcycleId: microcycle.id,
                            date: today,
                            sessionType: this.mapThemeToSessionType(theme),
                            goal: theme,
                            details,
                            description: workoutResult.response,
                            message: workoutResult.message,
                            structured: workoutResult.structure
                        });
                        console.log(`[MODIFY_WEEK] Created new workout for today`);
                    }
                    // Return with both microcycle and workout messages
                    const messages = [];
                    if (workoutResult.message) {
                        messages.push(workoutResult.message);
                    }
                    return {
                        success: true,
                        workout: workoutResult,
                        messages,
                        modifications: modifyMicrocycleResult.modifications
                    };
                }
                // Return success with the modified microcycle message and modifications
                return {
                    success: true,
                    messages: [],
                    modifications: modifyMicrocycleResult.modifications
                };
            } else {
                console.log(`[MODIFY_WEEK] No modifications needed - current plan already satisfies the request`);
                // Return success without database update
                // Empty messages - conversation agent will use modifications field to craft response
                return {
                    success: true,
                    messages: [],
                    modifications: 'No changes needed - your current plan already matches your request'
                };
            }
        } catch (error) {
            console.error('Error modifying week:', error);
            return {
                success: false,
                messages: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
   * Map workout theme to session type for database storage
   */ mapThemeToSessionType(theme) {
        const themeLower = theme.toLowerCase();
        // Valid types: strength, cardio, mobility, recovery, assessment, deload
        if (themeLower.includes('run') || themeLower.includes('cardio') || themeLower.includes('hiit') || themeLower.includes('metcon') || themeLower.includes('conditioning')) return 'cardio';
        if (themeLower.includes('lift') || themeLower.includes('strength') || themeLower.includes('upper') || themeLower.includes('lower') || themeLower.includes('push') || themeLower.includes('pull')) return 'strength';
        if (themeLower.includes('mobility') || themeLower.includes('flexibility') || themeLower.includes('stretch')) return 'mobility';
        if (themeLower.includes('rest') || themeLower.includes('recovery')) return 'recovery';
        if (themeLower.includes('assessment') || themeLower.includes('test')) return 'assessment';
        if (themeLower.includes('deload')) return 'deload';
        // Default to strength for hybrid/unknown workouts
        return 'strength';
    }
}
const workoutModificationService = WorkoutModificationService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/modifications/planModificationService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlanModificationService",
    ()=>PlanModificationService,
    "planModificationService",
    ()=>planModificationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/fitnessPlanRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/workoutModificationService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
class PlanModificationService {
    static instance;
    userService;
    fitnessPlanService;
    fitnessPlanRepo;
    workoutModificationService;
    constructor(){
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
        this.fitnessPlanRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
        this.workoutModificationService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutModificationService"].getInstance();
    }
    static getInstance() {
        if (!PlanModificationService.instance) {
            PlanModificationService.instance = new PlanModificationService();
        }
        return PlanModificationService.instance;
    }
    /**
   * Modify a user's fitness plan based on their change request
   * Modifies (not regenerates) the current microcycle to preserve completed workouts
   * Runs plan and microcycle modifications in parallel for faster response
   */ async modifyPlan(params) {
        try {
            const { userId, changeRequest } = params;
            console.log('[MODIFY_PLAN] Starting plan modification', {
                userId,
                changeRequest
            });
            // 1. Get user with profile
            const user = await this.userService.getUser(userId);
            if (!user) {
                return {
                    success: false,
                    messages: [],
                    error: 'User not found'
                };
            }
            // 2. Get current fitness plan
            const currentPlan = await this.fitnessPlanService.getCurrentPlan(userId);
            if (!currentPlan) {
                return {
                    success: false,
                    messages: [],
                    error: 'No fitness plan found. Please create a plan first.'
                };
            }
            // 3. Get today's date for week modification
            const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone);
            const currentDayOfWeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDayOfWeek"])(today.toJSDate(), user.timezone);
            // 4. Run plan and week modifications in PARALLEL
            // modifyWeek handles microcycle modification AND workout generation
            console.log('[MODIFY_PLAN] Running plan and week modifications in parallel');
            const [planResult, weekResult] = await Promise.all([
                // Modify plan using agent service
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanAgentService"].modifyFitnessPlan(user, currentPlan, changeRequest),
                // Modify week (handles microcycle + workout)
                this.workoutModificationService.modifyWeek({
                    userId,
                    targetDay: currentDayOfWeek,
                    changeRequest
                })
            ]);
            // 5. Check if plan was actually modified
            if (!planResult.wasModified) {
                console.log('[MODIFY_PLAN] No modifications needed - current plan already satisfies the request');
                return {
                    success: true,
                    wasModified: false,
                    messages: []
                };
            }
            console.log('[MODIFY_PLAN] Plan was modified - saving new version');
            // 6. Save new plan version
            const newPlan = await this.fitnessPlanRepo.insertFitnessPlan({
                clientId: userId,
                description: planResult.description,
                structured: planResult.structure,
                startDate: new Date()
            });
            console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);
            // Week modification (microcycle + workout) was handled in parallel by modifyWeek
            if (weekResult.success) {
                console.log(`[MODIFY_PLAN] Week modification completed successfully`);
            } else if (weekResult.error) {
                console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
            }
            return {
                success: true,
                wasModified: true,
                modifications: planResult.modifications,
                messages: weekResult.messages || []
            };
        } catch (error) {
            console.error('[MODIFY_PLAN] Error modifying plan:', error);
            return {
                success: false,
                messages: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
const planModificationService = PlanModificationService.getInstance();
}),
"[project]/packages/shared/src/server/services/agents/shared/utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared utilities for agent orchestration services
 */ __turbopack_context__.s([
    "toToolResult",
    ()=>toToolResult
]);
function toToolResult(result, toolType = 'action') {
    if (!result.success) {
        return {
            toolType,
            response: `Operation failed: ${result.error || 'Unknown error'}`,
            messages: result.messages?.length ? result.messages : undefined
        };
    }
    return {
        toolType,
        response: result.modifications ? `Operation completed: ${result.modifications}` : 'Operation completed successfully',
        messages: result.messages?.length ? result.messages : undefined
    };
}
}),
"[project]/packages/shared/src/server/services/agents/modifications/tools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createModificationTools",
    ()=>createModificationTools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$shared$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/shared/utils.ts [app-route] (ecmascript)");
;
;
;
// Schema definitions - empty because all params come from context
const ModifyWorkoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({});
const ModifyWeekSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({});
const ModifyPlanSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({});
const createModificationTools = (context, deps)=>{
    // Tool 1: Modify Workout
    const modifyWorkoutTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async ()=>{
        const result = await deps.modifyWorkout({
            userId: context.userId,
            workoutDate: context.workoutDate,
            changeRequest: context.message
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$shared$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toToolResult"])(result);
    }, {
        name: 'modify_workout',
        description: `Regenerate today's workout keeping the SAME muscle group/focus but with different constraints.

NOTE: All parameters (userId, date, request) are automatically filled from context - no input needed.

Use ONLY when the user explicitly wants to keep the same muscle group/workout type but change HOW they do it:
- Same muscle group, different equipment (e.g., "Today is chest - can't make it to my gym, need a chest workout with just dumbbells")
- Same focus, different time (e.g., "Today is leg day but only have 30 min, can you adjust my leg workout?")
- Same workout, different constraints (e.g., "Today's shoulder workout but my shoulder hurts, can you modify it to be gentler?")

IMPORTANT: User must indicate they want to keep the SAME muscle group/workout type.
DO NOT use if user requests a DIFFERENT muscle group or doesn't specify - use modify_week instead.
This is the LEAST commonly used tool - default to modify_week when uncertain.`,
        schema: ModifyWorkoutSchema
    });
    // Tool 2: Modify Week
    const modifyWeekTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async ()=>{
        const result = await deps.modifyWeek({
            userId: context.userId,
            targetDay: context.targetDay,
            changeRequest: context.message
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$shared$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toToolResult"])(result);
    }, {
        name: 'modify_week',
        description: `Modify the weekly training pattern and regenerate workouts as needed. **This is the PRIMARY and MOST COMMON tool.**

NOTE: All parameters (userId, targetDay, request) are automatically filled from context - no input needed.

Use this for ANY request for a different workout type or muscle group:
- ANY different muscle group request (e.g., "can I have a leg workout", "chest workout please", "give me back instead")
- ANY different workout type (e.g., "I actually want to run today instead", "cardio today?", "full body workout")
- Rearranging the weekly schedule (e.g., "can we swap my rest days?", "move leg day to Friday")
- Multi-day constraints (e.g., "traveling this week with hotel gym", "only 30 min per day rest of week")

**DEFAULT TO THIS TOOL when user requests a workout change.** Even if they don't explicitly say "instead of" or mention multiple days.

Examples that should use modify_week:
- "Can I do legs today?" -> YES (different muscle group)
- "Chest workout please" -> YES (potentially different from scheduled)
- "I want to run instead" -> YES (different workout type)
- "Can't make it to gym this week" -> YES (multi-day change)

This intelligently updates the weekly pattern to maintain training balance and muscle group spacing.`,
        schema: ModifyWeekSchema
    });
    // Tool 3: Modify Plan
    const modifyPlanTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async ()=>{
        const result = await deps.modifyPlan({
            userId: context.userId,
            changeRequest: context.message
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$shared$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toToolResult"])(result);
    }, {
        name: 'modify_plan',
        description: `Modify the user's overall fitness plan/program structure.

NOTE: All parameters (userId, changeRequest) are automatically filled from context - no input needed.

Use when the user wants to change their PROGRAM-LEVEL settings:
- Training frequency changes (e.g., "change from 5 to 6 days a week", "I want to train 4 days instead of 3")
- Adding/removing fixed schedule items (e.g., "add yoga on Monday/Friday mornings", "I joined a spinning class on Wednesdays")
- Changing their training split (e.g., "switch to push/pull/legs", "I want an upper/lower split")
- Adjusting overall goals or focus (e.g., "more cardio", "focus on strength", "add more conditioning")
- Equipment/facility changes (e.g., "I joined a new gym with more equipment", "I only have dumbbells now")

DO NOT use for day-to-day or single week changes - use modify_week or modify_workout instead.
This tool is for STRUCTURAL/ARCHITECTURAL changes to the entire training program.

Examples that should use modify_plan:
- "Can we change to 6 days a week?" -> YES (frequency change)
- "I started yoga on Mondays and Fridays" -> YES (adding anchors)
- "Switch me to a PPL split" -> YES (program structure)
- "I want more cardio overall" -> YES (program balance)

Examples that should NOT use modify_plan:
- "Can I do legs today?" -> NO (use modify_week)
- "Skip today's workout" -> NO (use modify_week)`,
        schema: ModifyPlanSchema
    });
    return [
        modifyWorkoutTool,
        modifyWeekTool,
        modifyPlanTool
    ];
};
}),
"[project]/packages/shared/src/server/services/agents/prompts/modifications.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MODIFICATIONS_SYSTEM_PROMPT",
    ()=>MODIFICATIONS_SYSTEM_PROMPT,
    "buildModificationsUserMessage",
    ()=>buildModificationsUserMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
const MODIFICATIONS_SYSTEM_PROMPT = `You are a flexible fitness coach for GymText, helping users modify their workouts and training plans.

## YOUR ROLE

Your job is to analyze the user's modification request and select the appropriate tool. All parameters are automatically provided from context - you only need to choose which tool to call. You do not need to generate conversational responses.

## AVAILABLE TOOLS

You have three tools available (in order of usage frequency):

1. **modify_week** - **PRIMARY TOOL** - Use for TEMPORARY or CURRENT WEEK changes
   - Use when the user wants a different muscle group or workout type than scheduled **for this week only**
   - Example: "Can I have a leg workout today?" (any leg request, regardless of what's scheduled)
   - Example: "I want to run today instead" (different workout type)
   - Example: "Can we do back instead of chest **today**?" (explicit swap for now)
   - Example: "Can we move leg day to Friday **this week**?" (temporary rearrange)
   - Example: "I'm traveling **this week** with limited equipment" (temporary constraints)
   - **DEFAULT TO THIS TOOL for one-off changes**

2. **modify_workout** - **LESS COMMON** - Use ONLY when user wants SAME muscle group with different constraints
   - Use when user explicitly wants to keep the same muscle group but change HOW they do it
   - Example: "Today is chest day - can't make it to my gym, need a chest workout with just dumbbells" (same muscle group, different equipment)
   - Example: "Today is leg day but only have 30 min, can you adjust my leg workout?" (same focus, less time)
   - **User must indicate they want the SAME muscle group - otherwise use modify_week**

3. **modify_plan** - **LEAST COMMON** - Use for PERMANENT PROGRAM-LEVEL structural changes
   - Use when the user wants to change their **ongoing** training program structure or schedule
   - Example: "Can we update my plan so that I start my weeks with legs instead of push" (permanent reorder)
   - Example: "Can we change to 6 days a week?" (frequency change)
   - Example: "I want to do yoga on Mondays from now on" (permanent schedule anchor)
   - Example: "Switch me to a push/pull/legs split" (program structure change)
   - **Use this for ANY request that implies "from now on", "my plan", or "always"**

## TOOL USAGE GUIDELINES

**Priority Bias (use this order):**
1. **modify_week** - MOST COMMON (temporary/current week changes)
2. **modify_workout** - LESS COMMON (same muscle group, different constraints)
3. **modify_plan** - LEAST COMMON (permanent program/structural changes)

**Decision Tree:**

**Step 1:** Is the user asking for a PERMANENT or STRUCTURAL change?
- "Update my plan so I start weeks with legs" → YES → **modify_plan**
- "Can we change to 6 days a week?" → YES → **modify_plan**
- "I want to do yoga every Monday" → YES → **modify_plan**
- "Switch me to push/pull/legs" → YES → **modify_plan**
- "I want more cardio overall in my plan" → YES → **modify_plan**
- Keywords: "plan", "program", "start my weeks", "from now on", "always"
- If YES → **use modify_plan**

**Step 2:** Is the user asking for a DIFFERENT workout type or muscle group (Temporary/One-off)?
- "Can I have a leg workout today?" → YES → **modify_week**
- "I want to run instead" → YES → **modify_week**
- "Can we do back instead of chest today?" → YES → **modify_week**
- "Move legs to Friday just for this week" → YES → **modify_week**
- If YES → **use modify_week**

**Step 3:** Is the user explicitly asking to keep the SAME muscle group but change constraints?
- "Today is chest - can I do a chest workout with just dumbbells?" → YES → **modify_workout**
- "Today is leg day but only have 30 min, can you adjust my leg workout?" → YES → **modify_workout**
- If YES → **use modify_workout**

**When uncertain between modifying the week vs plan, look for "this week" (modify_week) vs "my plan/always" (modify_plan). If ambiguous, default to modify_week.**

## EXAMPLES

**Example 1: Different workout type (modify_week)**
User: "Can I have a leg workout today?"
Tool: modify_week (different muscle group request)

**Example 2: Permanent Schedule Reorder (modify_plan)**
User: "Can we update my plan so that I start my weeks with legs instead of push"
Tool: modify_plan (permanent schedule change)

**Example 3: Different workout type (modify_week)**
User: "I actually want to run today instead"
Tool: modify_week (different workout type)

**Example 4: Same muscle group, different constraints (modify_workout)**
User: "Today is chest day - can't make it to my gym, need a chest workout with just dumbbells"
Tool: modify_workout (same muscle group, different equipment)

**Example 5: Training frequency change (modify_plan)**
User: "Can we change to 6 days a week?"
Tool: modify_plan (program-level frequency change)

**Example 6: Temporary Schedule Shift (modify_week)**
User: "Can we move leg day to Friday this week?"
Tool: modify_week (temporary rearrange)
`;
const buildModificationsUserMessage = (input)=>{
    const { user } = input;
    // Get current date/time in user's timezone
    const now = new Date();
    const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatForAI"])(now, user.timezone);
    // Get the current day of the week
    const currentDayOfWeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDayOfWeekName"])(now, user.timezone); // Full weekday name (e.g., "Monday")
    return `## CONTEXT

**Todays Date**: ${currentDate}
**Todays Day of Week**: ${currentDayOfWeek}
**User Name**: ${user.name}

### User Profile
${user.profile || 'No profile available'}

---

**Users Message**: ${input.message}

---

Select the appropriate tool based on the user's request. All parameters (userId, date, targetDay, etc.) are automatically provided from context.`;
};
}),
"[project]/packages/shared/src/server/services/agents/modifications/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModificationService",
    ()=>ModificationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/workoutModificationService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$planModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/planModificationService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/tools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/flows/conversationFlowBuilder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$modifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/prompts/modifications.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
class ModificationService {
    /**
   * Process a modification request from a user message
   *
   * Fetches context via entity services, calls the modifications agent,
   * and returns a standardized ToolResult.
   *
   * @param userId - The user's ID
   * @param message - The user's modification request message
   * @param previousMessages - Optional conversation history for context
   * @returns ToolResult with response summary and optional messages
   */ static async makeModification(userId, message, previousMessages) {
        console.log('[MODIFICATION_SERVICE] Processing modification request:', {
            userId,
            message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        });
        try {
            // Fetch context via entity services
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].getUser(userId);
            if (!user) {
                console.warn('[MODIFICATION_SERVICE] User not found:', userId);
                return {
                    toolType: 'action',
                    response: 'User not found.'
                };
            }
            const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate();
            const weekday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWeekday"])(today, user.timezone);
            const targetDay = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_NAMES"][weekday - 1];
            const currentWorkout = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutInstanceService"].getWorkoutByUserIdAndDate(userId, today);
            console.log('[MODIFICATION_SERVICE] Context fetched:', {
                targetDay,
                workoutDate: today.toISOString(),
                hasWorkout: !!currentWorkout,
                messageCount: previousMessages?.length ?? 0
            });
            // Create modification tools with context and service dependencies
            const tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createModificationTools"])({
                userId,
                message,
                workoutDate: today,
                targetDay
            }, {
                modifyWorkout: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutModificationService"].modifyWorkout.bind(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutModificationService"]),
                modifyWeek: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutModificationService"].modifyWeek.bind(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$workoutModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutModificationService"]),
                modifyPlan: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$planModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planModificationService"].modifyPlan.bind(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$planModificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planModificationService"])
            });
            // Convert previous messages to Message format for the configurable agent
            const previousMsgs = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ConversationFlowBuilder"].toMessageArray(previousMessages || []).map((m)=>({
                    role: m.role,
                    content: m.content
                }));
            // Build user message
            const userMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$prompts$2f$modifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildModificationsUserMessage"])({
                user,
                message
            });
            // Create modifications agent - prompts fetched from DB based on agent name
            const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].MODIFICATIONS_ROUTER,
                previousMessages: previousMsgs,
                tools
            }, {
                model: 'gpt-5-mini'
            });
            // Invoke the agent - tool execution is handled by createAgent
            const result = await agent.invoke(userMessage);
            console.log('[MODIFICATION_SERVICE] Agent returned:', {
                messageCount: result.messages?.length ?? 0,
                response: result.response.substring(0, 100) + (result.response.length > 100 ? '...' : '')
            });
            return {
                toolType: 'action',
                response: result.response,
                messages: result.messages
            };
        } catch (error) {
            console.error('[MODIFICATION_SERVICE] Error processing modification:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                toolType: 'action',
                response: `Modification failed: ${errorMessage}`
            };
        }
    }
}
;
;
;
}),
"[project]/packages/shared/src/server/services/agents/chat/tools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createChatTools",
    ()=>createChatTools,
    "toolWithMessage",
    ()=>toolWithMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/index.js [app-route] (ecmascript) <locals>");
;
;
function toolWithMessage(name, description, callback, onSendMessage) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async (args)=>{
        // Send immediate message before execution
        if (args.message) {
            try {
                await onSendMessage(args.message);
                console.log(`[toolWithMessage] Sent: ${args.message}`);
            } catch (error) {
                console.error('[toolWithMessage] Failed to send:', error);
            }
        }
        return callback();
    }, {
        name,
        description,
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
            message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe('REQUIRED. Brief acknowledgment to send immediately (1 sentence). Example: "Got it, switching to legs!"')
        })
    });
}
const createChatTools = (context, deps, onSendMessage)=>{
    // Tool 1: Update Profile (Priority 1 - runs first when called with other tools)
    const updateProfileTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async ()=>{
        return deps.updateProfile(context.userId, context.message, context.previousMessages);
    }, {
        name: 'update_profile',
        description: `Record permanent user preferences and profile information.

Use this tool when the user shares PERMANENT information:
- **Preferences**: "I like starting with legs", "I prefer barbells", "I hate lunges"
- **Constraints/Injuries**: "I hurt my knee", "I have a bad shoulder"
- **Schedule preferences**: "I prefer runs on Tuesdays", "I like morning workouts"
- **Goals**: "I want to lose 10lbs", "training for a marathon"
- **Equipment/Location**: "I go to Planet Fitness", "I have a home gym"
- **Settings**: timezone, send time, or name changes

DO NOT use for one-time requests ("switch today to legs") or questions.

IMPORTANT: If user wants BOTH a preference AND a workout change, call BOTH tools.
Example: "Add runs to my plan on Tues/Thurs" -> update_profile (preference) + make_modification (plan change)

All context is automatically provided - no parameters needed.`,
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({})
    });
    // Tool 2: Make Modification
    const makeModificationTool = toolWithMessage('make_modification', `Make changes to the user's workout or training program.

Use this tool for:
- **Today's Workout**: Swap exercises, different constraints, different equipment
- **Weekly Schedule**: Change workout type, muscle group, or training day
- **Program-Level**: Frequency, training splits, overall focus

This tool handles WORKOUT CONTENT - not user settings like send time, timezone, or name.
All context (user, message, date, etc.) is automatically provided - no parameters needed.`, async ()=>{
        return deps.makeModification(context.userId, context.message, context.previousMessages);
    }, onSendMessage);
    // Tool 3: Get Workout
    const getWorkoutTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])(async ()=>{
        return deps.getWorkout(context.userId, context.timezone);
    }, {
        name: 'get_workout',
        description: `Get the user's workout for today.

Use this tool when the user asks about their workout for today, such as:
- "What's my workout today?"
- "What am I doing today?"
- "Send me my workout"
- "What exercises do I have?"

This tool will:
1. Check if a workout already exists for today
2. If not, generate one based on their fitness plan
3. Return the full workout details and send the workout message

IMPORTANT: Only use this for TODAY's workout. Do not use for future dates.
If [CONTEXT: WORKOUT] says "No workout scheduled", use this tool to generate it.
All context is automatically provided - no parameters needed.`,
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({})
    });
    return [
        updateProfileTool,
        makeModificationTool,
        getWorkoutTool
    ];
};
}),
"[project]/packages/shared/src/server/services/agents/chat/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatService",
    ()=>ChatService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/createAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/agents/promptIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$profile$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/profile/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$chat$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/chat/tools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/flows/conversationFlowBuilder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/settings.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
// Configuration from shared config
const { smsMaxLength: SMS_MAX_LENGTH, contextMinutes: CHAT_CONTEXT_MINUTES } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getChatConfig"])();
/**
 * Get or generate today's workout for a user.
 * Returns a ToolResult with the workout message in the messages array.
 */ async function getWorkoutForToday(userId, timezone) {
    try {
        const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(timezone);
        const todayDate = today.toJSDate();
        // Check if workout already exists
        const existingWorkout = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutInstanceService"].getWorkoutByUserIdAndDate(userId, todayDate);
        if (existingWorkout) {
            // Workout exists - return its message
            console.log('[ChatService] Existing workout found for today');
            return {
                toolType: 'query',
                response: `User's workout for today: ${existingWorkout.sessionType || 'Workout'} - ${existingWorkout.description || 'Custom workout'}`,
                messages: existingWorkout.message ? [
                    existingWorkout.message
                ] : undefined
            };
        }
        // No workout - need to generate one
        // Fetch user with profile for generation
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].getUser(userId);
        if (!user) {
            return {
                toolType: 'query',
                response: 'User not found.'
            };
        }
        // Generate the workout
        console.log('[ChatService] Generating workout for today');
        const generatedWorkout = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutInstanceService"].generateWorkoutForDate(user, today);
        if (!generatedWorkout) {
            return {
                toolType: 'query',
                response: 'No workout scheduled for today. This could be a rest day based on the training plan, or the user may not have a fitness plan yet.'
            };
        }
        return {
            toolType: 'query',
            response: `User's workout for today: ${generatedWorkout.sessionType || 'Workout'} - ${generatedWorkout.description || 'Custom workout'}`,
            messages: generatedWorkout.message ? [
                generatedWorkout.message
            ] : undefined
        };
    } catch (error) {
        console.error('[ChatService] Error getting/generating workout:', error);
        return {
            toolType: 'query',
            response: `Failed to get workout: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
class ChatService {
    /**
   * Processes pending inbound SMS messages using the two-agent architecture.
   *
   * @param user - The user object with their profile information
   * @returns A promise that resolves to an array of response messages (empty if no pending messages)
   *
   * @remarks
   * This method performs a single DB fetch and splits messages into:
   * - pending: inbound messages after the last outbound (to be processed)
   * - context: conversation history up to and including the last outbound
   *
   * This architecture ensures:
   * - No race conditions from multiple DB fetches
   * - Profile information is always current
   * - Proper acknowledgment of profile updates in responses
   * - Support for multiple messages (e.g., week update + workout message)
   *
   * @example
   * ```typescript
   * const messages = await ChatService.handleIncomingMessage(user);
   * // Returns [] if no pending messages, otherwise generates responses
   * ```
   */ static async handleIncomingMessage(user) {
        try {
            // Single DB fetch: get enough messages for pending + context window
            // We fetch extra to ensure we have enough context after splitting
            const allMessages = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageService"].getRecentMessages(user.id, 20);
            // Split into pending (needs response) and context (conversation history)
            const { pending, context } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageService"].splitMessages(allMessages, CHAT_CONTEXT_MINUTES);
            // Early return if no pending messages
            if (pending.length === 0) {
                console.log('[ChatService] No pending messages, skipping');
                return [];
            }
            // Aggregate pending message content
            const message = pending.map((m)=>m.content).join('\n\n');
            console.log('[ChatService] Processing pending messages:', {
                pendingCount: pending.length,
                contextCount: context.length,
                aggregatedContent: message.substring(0, 100) + (message.length > 100 ? '...' : '')
            });
            // Fetch user with profile (if not already included)
            const userWithProfile = user.profile !== undefined ? user : await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].getUser(user.id) || user;
            // Callback for sending immediate messages
            const onSendMessage = async (immediateMessage)=>{
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageService"].sendMessage(userWithProfile, immediateMessage);
                    console.log('[ChatService] Sent immediate message:', immediateMessage);
                } catch (error) {
                    console.error('[ChatService] Failed to send immediate message:', error);
                // Don't throw - continue with tool execution
                }
            };
            // Create tools using the factory function
            // Tool priority: update_profile (1) > get_workout (2) > make_modification (3)
            const tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$chat$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createChatTools"])({
                userId: userWithProfile.id,
                message,
                previousMessages: context,
                timezone: userWithProfile.timezone
            }, {
                makeModification: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ModificationService"].makeModification,
                getWorkout: getWorkoutForToday,
                updateProfile: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$profile$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileService"].updateProfile
            }, onSendMessage);
            // Build context using ContextService
            const agentContext = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextService"].getInstance().getContext(userWithProfile, [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].DATE_CONTEXT,
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextType"].CURRENT_WORKOUT
            ]);
            // Convert previous messages to Message format for the configurable agent
            const previousMsgs = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$flows$2f$conversationFlowBuilder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ConversationFlowBuilder"].toMessageArray(context || []).map((m)=>({
                    role: m.role,
                    content: m.content
                }));
            // Create chat agent - prompts fetched from DB based on agent name
            const agent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$createAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAgent"])({
                name: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$agents$2f$promptIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROMPT_IDS"].CHAT_GENERATE,
                context: agentContext,
                previousMessages: previousMsgs,
                tools
            });
            // Invoke the chat agent - it will decide when to call tools (including update_profile)
            const result = await agent.invoke(message);
            console.log(`[ChatService] Agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);
            // Map to ChatOutput format
            // Order: [agent's final response, ...accumulated tool messages]
            const messages = [
                result.response,
                ...result.messages || []
            ].filter((m)=>m && m.trim());
            if (!messages || messages.length === 0) {
                throw new Error('Chat agent returned no messages');
            }
            // Enforce SMS length constraints on each message
            const validatedMessages = messages.filter((msg)=>msg && msg.trim()).map((msg)=>{
                const trimmed = msg.trim();
                if (trimmed.length > SMS_MAX_LENGTH) {
                    return trimmed.substring(0, SMS_MAX_LENGTH - 3) + '...';
                }
                return trimmed;
            });
            return validatedMessages;
        } catch (error) {
            console.error('[ChatService] Error handling message:', error);
            // Log additional context in development
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnvironmentSettings"])().isDevelopment) {
                console.error('Error details:', {
                    userId: user.id,
                    error: error instanceof Error ? error.stack : error
                });
            }
            // Return a helpful fallback message
            return [
                "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!"
            ];
        }
    }
}
;
}),
"[project]/packages/shared/src/server/repositories/messageQueueRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageQueueRepository",
    ()=>MessageQueueRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class MessageQueueRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new queue entry
   */ async create(queueEntry) {
        return await this.db.insertInto('messageQueues').values(queueEntry).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Bulk insert multiple queue entries
   */ async createMany(queueEntries) {
        if (queueEntries.length === 0) return [];
        return await this.db.insertInto('messageQueues').values(queueEntries).returningAll().execute();
    }
    /**
   * Find queue entry by ID
   */ async findById(id) {
        return await this.db.selectFrom('messageQueues').selectAll().where('id', '=', id).executeTakeFirst();
    }
    /**
   * Find queue entry by message ID (for webhook lookups)
   */ async findByMessageId(messageId) {
        return await this.db.selectFrom('messageQueues').selectAll().where('messageId', '=', messageId).executeTakeFirst();
    }
    /**
   * Find all pending entries for a client's queue, ordered by sequence
   */ async findPendingByClient(clientId, queueName) {
        return await this.db.selectFrom('messageQueues').selectAll().where('clientId', '=', clientId).where('queueName', '=', queueName).where('status', '=', 'pending').orderBy('sequenceNumber', 'asc').execute();
    }
    /**
   * Find all pending queue items globally for admin view
   */ async findAllPending(params) {
        let query = this.db.selectFrom('messageQueues').selectAll().where('status', '=', 'pending');
        if (params.clientId) {
            query = query.where('clientId', '=', params.clientId);
        }
        return await query.orderBy('createdAt', 'desc').limit(params.limit || 100).offset(params.offset || 0).execute();
    }
    /**
   * Find all pending queue items with user info for admin view
   */ async findAllPendingWithUserInfo(params) {
        let query = this.db.selectFrom('messageQueues').innerJoin('users', 'users.id', 'messageQueues.clientId').select([
            'messageQueues.id',
            'messageQueues.clientId',
            'messageQueues.queueName',
            'messageQueues.sequenceNumber',
            'messageQueues.messageContent',
            'messageQueues.mediaUrls',
            'messageQueues.status',
            'messageQueues.messageId',
            'messageQueues.retryCount',
            'messageQueues.maxRetries',
            'messageQueues.timeoutMinutes',
            'messageQueues.errorMessage',
            'messageQueues.createdAt',
            'messageQueues.sentAt',
            'messageQueues.deliveredAt',
            'users.name as userName',
            'users.phoneNumber as userPhone'
        ]).where('messageQueues.status', '=', 'pending');
        if (params.clientId) {
            query = query.where('messageQueues.clientId', '=', params.clientId);
        }
        const results = await query.orderBy('messageQueues.createdAt', 'desc').limit(params.limit || 100).execute();
        return results;
    }
    /**
   * Find the next pending message in a queue
   */ async findNextPending(clientId, queueName) {
        return await this.db.selectFrom('messageQueues').selectAll().where('clientId', '=', clientId).where('queueName', '=', queueName).where('status', '=', 'pending').orderBy('sequenceNumber', 'asc').limit(1).executeTakeFirst();
    }
    /**
   * Find stalled messages (sent but not delivered/failed after timeout)
   */ async findStalled(cutoffDate) {
        return await this.db.selectFrom('messageQueues').selectAll().where('status', '=', 'sent').where('sentAt', '<', cutoffDate).execute();
    }
    /**
   * Update queue entry status
   */ async updateStatus(id, status, timestamps, error) {
        return await this.db.updateTable('messageQueues').set({
            status,
            ...timestamps?.sentAt && {
                sentAt: timestamps.sentAt
            },
            ...timestamps?.deliveredAt && {
                deliveredAt: timestamps.deliveredAt
            },
            ...error && {
                errorMessage: error
            }
        }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Link a queue entry to a sent message
   */ async linkMessage(id, messageId) {
        return await this.db.updateTable('messageQueues').set({
            messageId,
            status: 'sent',
            sentAt: new Date()
        }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Increment retry count
   */ async incrementRetry(id) {
        const entry = await this.findById(id);
        if (!entry) {
            throw new Error(`Queue entry ${id} not found`);
        }
        return await this.db.updateTable('messageQueues').set({
            retryCount: entry.retryCount + 1
        }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Delete completed/failed queue entries for cleanup
   */ async deleteCompleted(clientId, queueName) {
        await this.db.deleteFrom('messageQueues').where('clientId', '=', clientId).where('queueName', '=', queueName).where('status', 'in', [
            'delivered',
            'failed'
        ]).execute();
    }
    /**
   * Get queue status summary
   */ async getQueueStatus(clientId, queueName) {
        const entries = await this.db.selectFrom('messageQueues').select([
            'status'
        ]).where('clientId', '=', clientId).where('queueName', '=', queueName).execute();
        return {
            total: entries.length,
            pending: entries.filter((e)=>e.status === 'pending').length,
            sent: entries.filter((e)=>e.status === 'sent').length,
            delivered: entries.filter((e)=>e.status === 'delivered').length,
            failed: entries.filter((e)=>e.status === 'failed').length
        };
    }
}
}),
"[project]/packages/shared/src/server/services/messaging/messageQueueService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageQueueService",
    ()=>MessageQueueService,
    "messageQueueService",
    ()=>messageQueueService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageQueueRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/messageQueueRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/postgres/postgres.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$twilio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/twilio/twilio.ts [app-route] (ecmascript) <locals>");
;
;
;
;
class MessageQueueService {
    static instance;
    messageQueueRepo;
    constructor(){
        this.messageQueueRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageQueueRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageQueueRepository"](__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$postgres$2f$postgres$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["postgresDb"]);
    }
    static getInstance() {
        if (!MessageQueueService.instance) {
            MessageQueueService.instance = new MessageQueueService();
        }
        return MessageQueueService.instance;
    }
    /**
   * Enqueue multiple messages for ordered delivery
   *
   * Creates queue entries and immediately starts sending the first message.
   * Subsequent messages will be sent after previous ones are delivered.
   *
   * @param clientId - Client to send messages to
   * @param messages - Array of messages to queue
   * @param queueName - Named queue (e.g., 'daily', 'onboarding')
   * @returns Array of created queue entries
   */ async enqueueMessages(clientId, messages, queueName) {
        if (messages.length === 0) return;
        console.log(`[MessageQueueService] Enqueueing ${messages.length} messages for client ${clientId} in queue '${queueName}'`);
        // Create queue entries with sequence numbers
        const queueEntries = messages.map((msg, index)=>({
                clientId,
                queueName,
                sequenceNumber: index + 1,
                messageContent: msg.content || null,
                // Stringify array for JSONB storage (Kysely will handle the JSONB insert)
                mediaUrls: msg.mediaUrls ? JSON.stringify(msg.mediaUrls) : null,
                status: 'pending'
            }));
        // Bulk insert all queue entries
        await this.messageQueueRepo.createMany(queueEntries);
        console.log(`[MessageQueueService] Created ${queueEntries.length} queue entries`);
        // Trigger processing of the first message via Inngest
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
            name: 'message-queue/process-next',
            data: {
                clientId,
                queueName
            }
        });
    }
    /**
   * Process the next pending message in a queue
   *
   * Sends the next message via MessageService and updates queue status.
   * Called by Inngest when the previous message is delivered.
   *
   * @param clientId - Client ID
   * @param queueName - Queue name
   */ async processNextMessage(clientId, queueName) {
        console.log(`[MessageQueueService] Processing next message for client ${clientId} in queue '${queueName}'`);
        // Get next pending message
        const nextEntry = await this.messageQueueRepo.findNextPending(clientId, queueName);
        if (!nextEntry) {
            console.log(`[MessageQueueService] No more pending messages in queue '${queueName}' for client ${clientId}`);
            // Optionally clean up completed queue
            await this.clearQueue(clientId, queueName);
            return;
        }
        console.log(`[MessageQueueService] Found next message (sequence ${nextEntry.sequenceNumber})`);
        // Send via Inngest to handle actual message sending
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
            name: 'message-queue/send-message',
            data: {
                queueEntryId: nextEntry.id,
                clientId: nextEntry.clientId,
                queueName: nextEntry.queueName
            }
        });
    }
    /**
   * Send a queued message
   * Called by Inngest function to actually send the message
   */ async sendQueuedMessage(queueEntryId) {
        const queueEntry = await this.messageQueueRepo.findById(queueEntryId);
        if (!queueEntry) {
            throw new Error(`Queue entry ${queueEntryId} not found`);
        }
        // Import MessageService here to avoid circular dependency
        const { messageService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript, async loader)");
        const { userService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript, async loader)");
        const user = await userService.getUser(queueEntry.clientId);
        if (!user) {
            throw new Error(`Client ${queueEntry.clientId} not found`);
        }
        // Get media URLs if present
        // Handle both stringified JSON and already-parsed arrays
        let mediaUrls;
        if (queueEntry.mediaUrls) {
            if (typeof queueEntry.mediaUrls === 'string') {
                try {
                    mediaUrls = JSON.parse(queueEntry.mediaUrls);
                } catch (error) {
                    console.error('[MessageQueueService] Failed to parse media URLs:', error);
                }
            } else {
                mediaUrls = queueEntry.mediaUrls;
            }
        }
        // Send the message
        console.log(`[MessageQueueService] Sending queued message ${queueEntryId}`);
        const message = await messageService.sendMessage(user, queueEntry.messageContent || undefined, mediaUrls);
        // Link the queue entry to the sent message
        await this.messageQueueRepo.linkMessage(queueEntry.id, message.id);
        console.log(`[MessageQueueService] Queued message sent successfully`, {
            queueEntryId,
            messageId: message.id
        });
        return message;
    }
    /**
   * Mark a message as delivered and trigger next message
   *
   * Called by Twilio webhook when message status is 'delivered'.
   * Updates queue entry and triggers next message in queue.
   *
   * @param messageId - ID of the delivered message
   */ async markMessageDelivered(messageId) {
        const queueEntry = await this.messageQueueRepo.findByMessageId(messageId);
        if (!queueEntry) {
            console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
            return;
        }
        console.log(`[MessageQueueService] Marking message ${messageId} as delivered`);
        // Update status to delivered
        await this.messageQueueRepo.updateStatus(queueEntry.id, 'delivered', {
            deliveredAt: new Date()
        });
        // Trigger next message in queue via Inngest
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
            name: 'message-queue/process-next',
            data: {
                clientId: queueEntry.clientId,
                queueName: queueEntry.queueName
            }
        });
        console.log(`[MessageQueueService] Triggered next message for queue '${queueEntry.queueName}'`);
    }
    /**
   * Mark a message as failed and optionally retry or move to next
   *
   * Called by Twilio webhook when message status is 'failed' or 'undelivered'.
   * Retries if under max retries, otherwise marks failed and moves to next.
   *
   * @param messageId - ID of the failed message
   * @param error - Error message from Twilio
   */ async markMessageFailed(messageId, error) {
        const queueEntry = await this.messageQueueRepo.findByMessageId(messageId);
        if (!queueEntry) {
            console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
            return;
        }
        console.log(`[MessageQueueService] Message ${messageId} failed:`, error);
        // Check if we should retry
        if (queueEntry.retryCount < queueEntry.maxRetries) {
            console.log(`[MessageQueueService] Retrying message (attempt ${queueEntry.retryCount + 1}/${queueEntry.maxRetries})`);
            // Increment retry count
            await this.messageQueueRepo.incrementRetry(queueEntry.id);
            // Reset to pending for retry
            await this.messageQueueRepo.updateStatus(queueEntry.id, 'pending', undefined, error);
            // Trigger retry via existing message retry mechanism
            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
                name: 'message/delivery-failed',
                data: {
                    messageId,
                    clientId: queueEntry.clientId,
                    providerMessageId: messageId,
                    error: error || 'Unknown error'
                }
            });
        } else {
            console.log(`[MessageQueueService] Max retries reached, marking as failed and moving to next`);
            // Mark as permanently failed
            await this.messageQueueRepo.updateStatus(queueEntry.id, 'failed', undefined, error || 'Max retries exceeded');
            // Move to next message
            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send({
                name: 'message-queue/process-next',
                data: {
                    clientId: queueEntry.clientId,
                    queueName: queueEntry.queueName
                }
            });
        }
    }
    /**
   * Check for stalled messages and unblock queues
   *
   * Finds messages that have been in 'sent' status for longer than
   * their timeout period. Verifies actual status with Twilio API.
   *
   * Called by scheduled Inngest cron job.
   */ async checkStalledMessages() {
        // Find messages sent more than 10 minutes ago
        const cutoffDate = new Date(Date.now() - 10 * 60 * 1000);
        const stalledEntries = await this.messageQueueRepo.findStalled(cutoffDate);
        if (stalledEntries.length === 0) {
            console.log('[MessageQueueService] No stalled messages found');
            return;
        }
        console.log(`[MessageQueueService] Found ${stalledEntries.length} stalled messages`);
        for (const entry of stalledEntries){
            try {
                if (!entry.messageId) {
                    console.warn(`[MessageQueueService] Stalled entry ${entry.id} has no messageId, marking as failed`);
                    await this.messageQueueRepo.updateStatus(entry.id, 'failed', undefined, 'No message ID found');
                    continue;
                }
                // Get the actual message to find provider message ID
                const { messageService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript, async loader)");
                const messageRepo = messageService['messageRepo'];
                const message = await messageRepo.findById(entry.messageId);
                if (!message || !message.providerMessageId) {
                    console.warn(`[MessageQueueService] Message ${entry.messageId} not found or has no provider ID`);
                    // Assume delivered to avoid blocking queue
                    await this.messageQueueRepo.updateStatus(entry.id, 'delivered', {
                        deliveredAt: new Date()
                    });
                    await this.processNextMessage(entry.clientId, entry.queueName);
                    continue;
                }
                // Check actual status via Twilio API
                console.log(`[MessageQueueService] Checking Twilio status for ${message.providerMessageId}`);
                const twilioMessage = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$twilio$2f$twilio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["twilioClient"].getMessageStatus(message.providerMessageId);
                if (twilioMessage.status === 'delivered') {
                    console.log(`[MessageQueueService] Twilio confirms delivery, updating queue`);
                    await this.markMessageDelivered(entry.messageId);
                } else if (twilioMessage.status === 'failed' || twilioMessage.status === 'undelivered') {
                    console.log(`[MessageQueueService] Twilio confirms failure, updating queue`);
                    await this.markMessageFailed(entry.messageId, `Stalled message status: ${twilioMessage.status}`);
                } else {
                    // Still in transit, assume delivered to avoid blocking indefinitely
                    console.log(`[MessageQueueService] Message still in transit (${twilioMessage.status}), assuming delivered`);
                    await this.messageQueueRepo.updateStatus(entry.id, 'delivered', {
                        deliveredAt: new Date()
                    });
                    await this.processNextMessage(entry.clientId, entry.queueName);
                }
            } catch (error) {
                console.error(`[MessageQueueService] Error checking stalled message ${entry.id}:`, error);
                // Assume delivered to avoid blocking queue indefinitely
                await this.messageQueueRepo.updateStatus(entry.id, 'delivered', {
                    deliveredAt: new Date()
                });
                await this.processNextMessage(entry.clientId, entry.queueName);
            }
        }
    }
    /**
   * Get queue status for a client
   */ async getQueueStatus(clientId, queueName) {
        return await this.messageQueueRepo.getQueueStatus(clientId, queueName);
    }
    /**
   * Clear completed/failed queue entries
   */ async clearQueue(clientId, queueName) {
        console.log(`[MessageQueueService] Clearing completed queue '${queueName}' for client ${clientId}`);
        await this.messageQueueRepo.deleteCompleted(clientId, queueName);
    }
}
const messageQueueService = MessageQueueService.getInstance();
}),
"[project]/packages/shared/src/server/repositories/dayConfigRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DayConfigRepository",
    ()=>DayConfigRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class DayConfigRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Get config for a specific date (global scope)
   */ async getByDate(date) {
        const result = await this.db.selectFrom('dayConfigs').selectAll().where('date', '=', date).where('scopeType', '=', 'global').where('scopeId', 'is', null).executeTakeFirst();
        if (!result) return null;
        return {
            ...result,
            config: result.config || {}
        };
    }
    /**
   * Get configs for a date range (for calendar view)
   */ async getByDateRange(startDate, endDate) {
        const results = await this.db.selectFrom('dayConfigs').selectAll().where('date', '>=', startDate).where('date', '<=', endDate).where('scopeType', '=', 'global').where('scopeId', 'is', null).orderBy('date', 'asc').execute();
        return results.map((result)=>({
                ...result,
                config: result.config || {}
            }));
    }
    /**
   * Create a new day config
   */ async create(data) {
        const result = await this.db.insertInto('dayConfigs').values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Update an existing day config
   */ async update(id, data) {
        const result = await this.db.updateTable('dayConfigs').set({
            ...data,
            updatedAt: new Date()
        }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Upsert a day config (create or update)
   * For global scope, merges config with existing if present
   */ async upsert(date, config, scopeType = 'global', scopeId = null) {
        // Check if exists
        const existing = await this.db.selectFrom('dayConfigs').selectAll().where('date', '=', date).where('scopeType', '=', scopeType).where('scopeId', scopeId === null ? 'is' : '=', scopeId).executeTakeFirst();
        if (existing) {
            // Merge config with existing
            const existingConfig = existing.config || {};
            const mergedConfig = {
                ...existingConfig,
                ...config
            };
            const result = await this.db.updateTable('dayConfigs').set({
                config: JSON.stringify(mergedConfig),
                updatedAt: new Date()
            }).where('id', '=', existing.id).returningAll().executeTakeFirstOrThrow();
            return {
                ...result,
                config: mergedConfig
            };
        }
        // Create new
        const result = await this.db.insertInto('dayConfigs').values({
            date,
            scopeType,
            scopeId,
            config: JSON.stringify(config),
            createdAt: new Date(),
            updatedAt: new Date()
        }).returningAll().executeTakeFirstOrThrow();
        return {
            ...result,
            config: config
        };
    }
    /**
   * Delete config for a date
   */ async deleteByDate(date, scopeType = 'global', scopeId = null) {
        await this.db.deleteFrom('dayConfigs').where('date', '=', date).where('scopeType', '=', scopeType).where('scopeId', scopeId === null ? 'is' : '=', scopeId).execute();
    }
    /**
   * Delete config by ID
   */ async deleteById(id) {
        await this.db.deleteFrom('dayConfigs').where('id', '=', id).execute();
    }
}
}),
"[project]/packages/shared/src/server/repositories/uploadedImageRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UploadedImageRepository",
    ()=>UploadedImageRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class UploadedImageRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * List all images with optional filtering
   */ async list(options) {
        let query = this.db.selectFrom('uploadedImages').selectAll().orderBy('createdAt', 'desc');
        if (options?.category) {
            query = query.where('category', '=', options.category);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        return query.execute();
    }
    /**
   * Get an image by ID
   */ async getById(id) {
        const result = await this.db.selectFrom('uploadedImages').selectAll().where('id', '=', id).executeTakeFirst();
        return result || null;
    }
    /**
   * Find an image by URL
   */ async findByUrl(url) {
        const result = await this.db.selectFrom('uploadedImages').selectAll().where('url', '=', url).executeTakeFirst();
        return result || null;
    }
    /**
   * Create a new image record
   */ async create(image) {
        const result = await this.db.insertInto('uploadedImages').values({
            ...image,
            createdAt: new Date()
        }).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Update an image's metadata
   */ async update(id, data) {
        const result = await this.db.updateTable('uploadedImages').set(data).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Delete an image by ID
   */ async delete(id) {
        await this.db.deleteFrom('uploadedImages').where('id', '=', id).execute();
    }
}
}),
"[externals]/stream/web [external] (stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream/web", () => require("stream/web"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[externals]/util/types [external] (util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util/types", () => require("util/types"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/diagnostics_channel [external] (diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("diagnostics_channel", () => require("diagnostics_channel"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/async_hooks [external] (async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("async_hooks", () => require("async_hooks"));

module.exports = mod;
}),
"[externals]/console [external] (console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("console", () => require("console"));

module.exports = mod;
}),
"[project]/packages/shared/src/server/connections/storage/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteFile",
    ()=>deleteFile,
    "getFileMetadata",
    ()=>getFileMetadata,
    "listFiles",
    ()=>listFiles,
    "uploadImage",
    ()=>uploadImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$vercel$2b$blob$40$2$2e$0$2e$0$2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@vercel+blob@2.0.0/node_modules/@vercel/blob/dist/index.js [app-route] (ecmascript) <locals>");
;
async function uploadImage(filename, data, options) {
    const path = options?.folder ? `${options.folder}/${filename}` : filename;
    // Convert base64 string to Buffer if needed
    const content = typeof data === "string" ? Buffer.from(data, "base64") : data;
    const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$vercel$2b$blob$40$2$2e$0$2e$0$2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["put"])(path, content, {
        access: "public",
        contentType: options?.contentType ?? "image/png"
    });
    return blob.url;
}
async function deleteFile(url) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$vercel$2b$blob$40$2$2e$0$2e$0$2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["del"])(url);
}
async function listFiles(prefix) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$vercel$2b$blob$40$2$2e$0$2e$0$2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["list"])({
        prefix
    });
}
async function getFileMetadata(url) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$vercel$2b$blob$40$2$2e$0$2e$0$2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["head"])(url);
}
}),
"[project]/packages/shared/src/server/services/calendar/dayConfigService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DayConfigService",
    ()=>DayConfigService,
    "dayConfigService",
    ()=>dayConfigService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$dayConfigRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/dayConfigRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$uploadedImageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/uploadedImageRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$storage$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/storage/storage.ts [app-route] (ecmascript)");
;
;
;
class DayConfigService {
    static instance;
    dayConfigRepo;
    imageRepo;
    constructor(){
        this.dayConfigRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$dayConfigRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DayConfigRepository"]();
        this.imageRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$uploadedImageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UploadedImageRepository"]();
    }
    static getInstance() {
        if (!DayConfigService.instance) {
            DayConfigService.instance = new DayConfigService();
        }
        return DayConfigService.instance;
    }
    // =====================
    // Day Config Methods
    // =====================
    /**
   * Get config for a specific date (global scope)
   */ async getConfigForDate(date) {
        return this.dayConfigRepo.getByDate(date);
    }
    /**
   * Get configs for a month (for calendar view)
   * Returns all global configs for the specified month
   */ async getConfigsForMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        return this.dayConfigRepo.getByDateRange(startDate, endDate);
    }
    /**
   * Upsert config for a date (merges with existing config)
   */ async upsertConfig(date, config) {
        return this.dayConfigRepo.upsert(date, config);
    }
    /**
   * Set image for a specific date
   */ async setDayImage(date, imageUrl, imageName) {
        return this.dayConfigRepo.upsert(date, {
            imageUrl,
            imageName: imageName ?? undefined
        });
    }
    /**
   * Clear config for a date (removes entire config)
   */ async clearConfig(date) {
        return this.dayConfigRepo.deleteByDate(date);
    }
    /**
   * Get image URL for a date (used by daily message service)
   * Returns null if no custom image is set
   */ async getImageUrlForDate(date) {
        const config = await this.dayConfigRepo.getByDate(date);
        return config?.config?.imageUrl ?? null;
    }
    // =====================
    // Image Library Methods
    // =====================
    /**
   * Upload a new image to the library
   */ async uploadImage(file, filename, contentType, options) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${filename}`;
        // Upload to Vercel Blob
        const url = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$storage$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadImage"])(uniqueFilename, file, {
            folder: 'day-images',
            contentType
        });
        // Store metadata in DB
        const imageData = {
            url,
            filename,
            displayName: options?.displayName ?? filename.replace(/\.[^/.]+$/, ''),
            contentType,
            sizeBytes: file instanceof Buffer ? file.length : 0,
            category: options?.category ?? 'general',
            uploadedBy: options?.uploadedBy ?? null
        };
        return this.imageRepo.create(imageData);
    }
    /**
   * Get image library with optional category filter
   */ async getImageLibrary(category) {
        return this.imageRepo.list({
            category
        });
    }
    /**
   * Get an image by ID
   */ async getImageById(id) {
        return this.imageRepo.getById(id);
    }
    /**
   * Delete an image from the library
   * Also removes from Vercel Blob storage
   */ async deleteImage(id) {
        const image = await this.imageRepo.getById(id);
        if (!image) {
            return;
        }
        // Delete from Vercel Blob
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$storage$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteFile"])(image.url);
        } catch (error) {
            console.error(`[DayConfigService] Failed to delete blob ${image.url}:`, error);
        // Continue with DB deletion even if blob deletion fails
        }
        // Delete from DB
        await this.imageRepo.delete(id);
    }
    /**
   * Update image metadata
   */ async updateImageMetadata(id, data) {
        return this.imageRepo.update(id, data);
    }
}
const dayConfigService = DayConfigService.getInstance();
}),
"[project]/packages/shared/src/server/services/orchestration/dailyMessageService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DailyMessageService",
    ()=>DailyMessageService,
    "dailyMessageService",
    ()=>dailyMessageService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/workoutInstanceRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageQueueService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageQueueService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$calendar$2f$dayConfigService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/calendar/dayConfigService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
class DailyMessageService {
    static instance;
    userService;
    workoutInstanceService;
    workoutInstanceRepository;
    messageService;
    batchSize;
    constructor(batchSize = 10){
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.workoutInstanceService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceService"].getInstance();
        this.workoutInstanceRepository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceRepository"]();
        this.messageService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageService"].getInstance();
        this.batchSize = batchSize;
    }
    static getInstance(batchSize = 10) {
        if (!DailyMessageService.instance) {
            DailyMessageService.instance = new DailyMessageService(batchSize);
        }
        return DailyMessageService.instance;
    }
    /**
   * Schedules daily messages for all users in a given UTC hour
   * Returns metrics about the scheduling operation
   *
   * This method uses catch-up logic: it schedules messages for users whose
   * preferred send hour has already passed today AND who haven't received
   * their workout message yet (no workout instance exists for today).
   */ async scheduleMessagesForHour(utcHour) {
        const startTime = Date.now();
        const errors = [];
        let scheduled = 0;
        let failed = 0;
        try {
            // Get candidate users (those whose local hour >= preferredSendHour)
            const candidateUsers = await this.userService.getUsersForHour(utcHour);
            console.log(`[DailyMessageService] Found ${candidateUsers.length} candidate users for hour ${utcHour}`);
            if (candidateUsers.length === 0) {
                return {
                    scheduled: 0,
                    failed: 0,
                    duration: Date.now() - startTime,
                    errors: []
                };
            }
            // Build user-specific date ranges (each user's "today" based on their timezone)
            const userDatePairs = candidateUsers.map((user)=>{
                const todayStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).startOf('day').toJSDate();
                const todayEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).startOf('day').plus({
                    days: 1
                }).toJSDate();
                return {
                    userId: user.id,
                    startOfDay: todayStart,
                    endOfDay: todayEnd
                };
            });
            // Batch-check which users already have workouts for their "today"
            const userIdsWithWorkouts = await this.workoutInstanceRepository.findUserIdsWithWorkoutsForUserDates(userDatePairs);
            // Filter to only users WITHOUT workouts (they haven't been sent yet)
            const usersToSchedule = candidateUsers.filter((u)=>!userIdsWithWorkouts.has(u.id));
            console.log(`[DailyMessageService] ${userIdsWithWorkouts.size} users already have workouts, scheduling ${usersToSchedule.length} users`);
            if (usersToSchedule.length === 0) {
                return {
                    scheduled: 0,
                    failed: 0,
                    duration: Date.now() - startTime,
                    errors: []
                };
            }
            // Map users to Inngest events
            const events = usersToSchedule.map((user)=>{
                // Get target date in user's timezone (today at start of day)
                const targetDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).startOf('day').toISO();
                return {
                    name: 'workout/scheduled',
                    data: {
                        userId: user.id,
                        targetDate
                    }
                };
            });
            // Send all events to Inngest in batch
            try {
                const { ids } = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send(events);
                scheduled = ids.length;
                console.log(`[DailyMessageService] Scheduled ${scheduled} Inngest jobs`);
            } catch (error) {
                console.error('[DailyMessageService] Failed to schedule Inngest jobs:', error);
                failed = events.length;
                errors.push({
                    userId: 'batch',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
            return {
                scheduled,
                failed,
                duration: Date.now() - startTime,
                errors
            };
        } catch (error) {
            console.error('[DailyMessageService] Error scheduling messages:', error);
            throw error;
        }
    }
    /**
   * Sends a daily message to a single user
   */ async sendDailyMessage(user) {
        try {
            console.log(`Processing daily message for user ${user.id}`);
            // Get today's date in the user's timezone
            const targetDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).startOf('day');
            // First try to get existing workout
            let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());
            // If no workout exists, generate it on-demand
            if (!workout) {
                console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
                workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
                if (!workout) {
                    console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
                    return {
                        success: false,
                        userId: user.id,
                        error: 'Could not generate workout for today'
                    };
                }
            }
            // Extract message content (either pre-generated or need to generate)
            let workoutMessage;
            if ('message' in workout && workout.message) {
                workoutMessage = workout.message;
            } else if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
                // Fallback: Generate message if needed (shouldn't happen in production)
                const { workoutAgentService } = await __turbopack_context__.A("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript, async loader)");
                const messageAgent = await workoutAgentService.getMessageAgent();
                const result = await messageAgent.invoke(workout.description);
                workoutMessage = result.response;
            } else {
                throw new Error('Workout missing required fields for message generation');
            }
            // Send single message with both image and text
            // Check for day-specific custom image first
            const customImageUrl = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$calendar$2f$dayConfigService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dayConfigService"].getImageUrlForDate(targetDate.toJSDate());
            let mediaUrls;
            if (customImageUrl) {
                // Use day-specific custom image (e.g., holiday themed)
                mediaUrls = [
                    customImageUrl
                ];
                console.log(`Using custom day image for ${targetDate.toISODate()}`);
            } else {
                // Fall back to default logo
                const { publicBaseUrl, baseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUrlsConfig"])();
                const resolvedBaseUrl = publicBaseUrl || baseUrl;
                mediaUrls = resolvedBaseUrl ? [
                    `${resolvedBaseUrl}/OpenGraphGymtext.png`
                ] : undefined;
                if (!resolvedBaseUrl) {
                    console.warn('BASE_URL not configured - sending workout without logo image');
                }
            }
            const queuedMessages = [
                {
                    content: workoutMessage,
                    mediaUrls
                }
            ];
            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageQueueService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageQueueService"].enqueueMessages(user.id, queuedMessages, 'daily');
            console.log(`Successfully queued daily messages for user ${user.id}`);
            return {
                success: true,
                userId: user.id,
                messageId: undefined // Messages will be sent asynchronously by queue
            };
        } catch (error) {
            console.error(`Error sending daily message to user ${user.id}:`, error);
            return {
                success: false,
                userId: user.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Gets today's workout for a user
   */ async getTodaysWorkout(userId, date) {
        // The date passed in is already the correct date at midnight in the user's timezone
        // We can use it directly for the query
        const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
        console.log(`Workout: ${workout}`);
        return workout || null;
    }
    /**
   * Generates a workout for a specific date (wrapper for onboarding)
   * Delegates to WorkoutInstanceService for business logic
   */ async generateWorkout(user, targetDate) {
        return this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
    }
}
const dailyMessageService = DailyMessageService.getInstance();
}),
"[project]/packages/shared/src/server/services/orchestration/weeklyMessageService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WeeklyMessageService",
    ()=>WeeklyMessageService,
    "weeklyMessageService",
    ()=>weeklyMessageService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/connections/inngest/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/messagingAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class WeeklyMessageService {
    static instance;
    userService;
    messageService;
    progressService;
    microcycleService;
    fitnessPlanService;
    constructor(){
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.messageService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageService"].getInstance();
        this.progressService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProgressService"].getInstance();
        this.microcycleService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleService"].getInstance();
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
    }
    static getInstance() {
        if (!WeeklyMessageService.instance) {
            WeeklyMessageService.instance = new WeeklyMessageService();
        }
        return WeeklyMessageService.instance;
    }
    /**
   * Schedules weekly messages for all users in a given UTC hour on Sunday
   * Returns metrics about the scheduling operation
   */ async scheduleMessagesForHour(utcHour) {
        const startTime = Date.now();
        const errors = [];
        let scheduled = 0;
        let failed = 0;
        try {
            // Get all users who should receive weekly messages this hour (Sunday only)
            const users = await this.userService.getUsersForWeeklyMessage(utcHour);
            console.log(`[WeeklyMessageService] Found ${users.length} users to schedule for hour ${utcHour} on Sunday`);
            if (users.length === 0) {
                return {
                    scheduled: 0,
                    failed: 0,
                    duration: Date.now() - startTime,
                    errors: []
                };
            }
            // Map users to Inngest events
            const events = users.map((user)=>({
                    name: 'weekly/scheduled',
                    data: {
                        userId: user.id
                    }
                }));
            // Send all events to Inngest in batch
            try {
                const { ids } = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$connections$2f$inngest$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inngest"].send(events);
                scheduled = ids.length;
                console.log(`[WeeklyMessageService] Scheduled ${scheduled} Inngest jobs`);
            } catch (error) {
                console.error('[WeeklyMessageService] Failed to schedule Inngest jobs:', error);
                failed = events.length;
                errors.push({
                    userId: 'batch',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
            return {
                scheduled,
                failed,
                duration: Date.now() - startTime,
                errors
            };
        } catch (error) {
            console.error('[WeeklyMessageService] Error scheduling messages:', error);
            throw error;
        }
    }
    /**
   * Sends weekly check-in messages to a single user
   *
   * Flow:
   * 1. Calculate next Sunday's date in user's timezone
   * 2. Get progress for next week using date-based calculation
   * 3. Get/create next week's microcycle
   * 4. Check if it's a deload week
   * 5. Generate personalized feedback message using AI agent
   * 6. Retrieve breakdown message from stored microcycle.message
   * 7. Send both messages with delay
   */ async sendWeeklyMessage(user) {
        try {
            console.log(`[WeeklyMessageService] Processing weekly message for user ${user.id}`);
            // Step 1: Get the fitness plan
            const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
            if (!plan) {
                console.error(`[WeeklyMessageService] No fitness plan found for user ${user.id}`);
                return {
                    success: false,
                    userId: user.id,
                    error: 'No fitness plan found'
                };
            }
            // Step 2: Calculate next Sunday's date in user's timezone (start of next week)
            const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate();
            const nextSundayDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNextWeekStart"])(currentDate, user.timezone);
            console.log(`[WeeklyMessageService] Getting next week's plan for ${nextSundayDate.toISOString()} for user ${user.id}`);
            // Step 3: Get progress for next week using date-based calculation
            const nextWeekProgress = await this.progressService.getProgressForDate(plan, nextSundayDate, user.timezone);
            if (!nextWeekProgress) {
                console.error(`[WeeklyMessageService] Could not calculate progress for next week for user ${user.id}`);
                return {
                    success: false,
                    userId: user.id,
                    error: 'Could not determine next week\'s training progress'
                };
            }
            // Step 4: Get or create next week's microcycle
            const { microcycle: nextWeekMicrocycle } = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, nextSundayDate, user.timezone);
            if (!nextWeekMicrocycle) {
                console.error(`[WeeklyMessageService] Failed to get/create next week's microcycle for user ${user.id}`);
                return {
                    success: false,
                    userId: user.id,
                    error: 'Could not generate next week\'s training pattern'
                };
            }
            // Step 5: Check if next week is a deload week
            const isDeload = nextWeekMicrocycle.isDeload;
            if (isDeload) {
                console.log(`[WeeklyMessageService] User ${user.id} is entering a deload week (week ${nextWeekMicrocycle.absoluteWeek})`);
            }
            // Step 6: Generate feedback message using messaging agent service
            const feedbackMessage = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingAgentService"].generateWeeklyMessage(user, isDeload, nextWeekMicrocycle.absoluteWeek);
            // Step 7: Get breakdown message from stored microcycle
            const breakdownMessage = nextWeekMicrocycle.message;
            if (!breakdownMessage) {
                console.error(`[WeeklyMessageService] No breakdown message stored for microcycle ${nextWeekMicrocycle.id}`);
                return {
                    success: false,
                    userId: user.id,
                    error: 'No breakdown message found for next week\'s microcycle'
                };
            }
            // Step 8: Send both messages with delay
            const messageIds = [];
            // Send feedback message first
            const feedbackMsg = await this.messageService.sendMessage(user, feedbackMessage);
            messageIds.push(feedbackMsg.id);
            console.log(`[WeeklyMessageService] Sent feedback message to user ${user.id}`);
            // Small delay before sending breakdown
            await new Promise((resolve)=>setTimeout(resolve, 1000));
            // Send breakdown message (from stored microcycle.message)
            const breakdownMsg = await this.messageService.sendMessage(user, breakdownMessage);
            messageIds.push(breakdownMsg.id);
            console.log(`[WeeklyMessageService] Sent breakdown message to user ${user.id}`);
            console.log(`[WeeklyMessageService] Successfully sent weekly messages to user ${user.id}`);
            return {
                success: true,
                userId: user.id,
                messageIds
            };
        } catch (error) {
            console.error(`[WeeklyMessageService] Error sending weekly message to user ${user.id}:`, error);
            return {
                success: false,
                userId: user.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
const weeklyMessageService = WeeklyMessageService.getInstance();
}),
"[project]/packages/shared/src/server/services/orchestration/onboardingService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OnboardingService",
    ()=>OnboardingService,
    "onboardingService",
    ()=>onboardingService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$dailyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/orchestration/dailyMessageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/utils/date.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/messaging/messagingAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageQueueService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageQueueService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class OnboardingService {
    static instance;
    fitnessPlanService;
    messageService;
    dailyMessageService;
    workoutInstanceService;
    progressService;
    constructor(){
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
        this.progressService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProgressService"].getInstance();
        this.messageService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageService"].getInstance();
        this.dailyMessageService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$dailyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DailyMessageService"].getInstance();
        this.workoutInstanceService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceService"].getInstance();
    }
    static getInstance() {
        if (!OnboardingService.instance) {
            OnboardingService.instance = new OnboardingService();
        }
        return OnboardingService.instance;
    }
    /**
   * Create fitness plan with pre-generated message
   * Step 1 of onboarding entity creation
   *
   * @param user - The user to create plan for
   * @throws Error if creation fails
   */ async createFitnessPlan(user) {
        console.log(`[Onboarding] Creating fitness plan for ${user.id}`);
        try {
            await this.fitnessPlanService.createFitnessPlan(user);
            console.log(`[Onboarding] Successfully created fitness plan for ${user.id}`);
        } catch (error) {
            console.error(`[Onboarding] Failed to create fitness plan for ${user.id}:`, error);
            throw error;
        }
    }
    /**
   * Create first microcycle with pre-generated message
   * Step 2 of onboarding entity creation
   * Requires fitness plan to exist
   *
   * @param user - The user to create microcycle for
   * @throws Error if creation fails
   */ async createFirstMicrocycle(user) {
        console.log(`[Onboarding] Creating first microcycle for ${user.id}`);
        try {
            const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
            if (!plan) {
                throw new Error(`No fitness plan found for user ${user.id}`);
            }
            // Create first microcycle using date-based approach (for current week)
            const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate();
            const { microcycle } = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
            if (!microcycle) {
                throw new Error('Failed to create first microcycle');
            }
            console.log(`[Onboarding] Successfully created first microcycle for ${user.id}`);
        } catch (error) {
            console.error(`[Onboarding] Failed to create first microcycle for ${user.id}:`, error);
            throw error;
        }
    }
    /**
   * Create first workout with pre-generated message
   * Step 3 of onboarding entity creation
   * Requires fitness plan and microcycle to exist
   *
   * @param user - The user to create workout for
   * @throws Error if creation fails
   */ async createFirstWorkout(user) {
        console.log(`[Onboarding] Creating first workout for ${user.id}`);
        try {
            const targetDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).startOf('day');
            const workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
            if (!workout) {
                throw new Error('Failed to create first workout');
            }
            console.log(`[Onboarding] Successfully created first workout for ${user.id}`);
        } catch (error) {
            console.error(`[Onboarding] Failed to create first workout for ${user.id}:`, error);
            throw error;
        }
    }
    /**
   * Send onboarding messages (combined plan+week + workout)
   * Called after both onboarding and payment are complete
   *
   * Sends two messages in order using queue system:
   * 1. Combined plan summary + first week breakdown
   * 2. First workout message
   *
   * @param user - The user to send messages to
   * @throws Error if any step fails
   */ async sendOnboardingMessages(user) {
        console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);
        try {
            // Prepare both messages
            const planMicrocycleMessage = await this.prepareCombinedPlanMicrocycleMessage(user);
            const workoutMessage = await this.prepareWorkoutMessage(user);
            // Enqueue both messages for ordered delivery
            const messages = [
                {
                    content: planMicrocycleMessage
                },
                {
                    content: workoutMessage
                }
            ];
            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageQueueService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageQueueService"].enqueueMessages(user.id, messages, 'onboarding');
            console.log(`[Onboarding] Successfully queued onboarding messages for ${user.id}`);
        } catch (error) {
            console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
            throw error;
        }
    }
    /**
   * Prepare combined plan + first week message
   * Combines pre-generated plan and microcycle messages into a single onboarding message
   */ async prepareCombinedPlanMicrocycleMessage(user) {
        const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
        if (!plan) {
            throw new Error(`No fitness plan found for user ${user.id}`);
        }
        if (!plan.message) {
            throw new Error(`No plan message found for user ${user.id}`);
        }
        // Get current microcycle using date-based approach
        const currentDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate();
        const { microcycle } = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
        if (!microcycle) {
            throw new Error(`No microcycle found for user ${user.id}`);
        }
        if (!microcycle.message) {
            throw new Error(`No microcycle message found for user ${user.id}`);
        }
        // Get current weekday for the user's timezone
        const currentWeekday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDayOfWeek"])(undefined, user.timezone);
        // Generate combined message using messaging agent service
        const message = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$messaging$2f$messagingAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messagingAgentService"].generatePlanMicrocycleCombinedMessage(plan.message, microcycle.message, currentWeekday);
        console.log(`[Onboarding] Prepared combined plan+microcycle message for ${user.id}`);
        return message;
    }
    /**
   * Prepare workout message
   */ async prepareWorkoutMessage(user) {
        const targetDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfDay"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$utils$2f$date$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["now"])(user.timezone).toJSDate(), user.timezone);
        const workout = await this.dailyMessageService.getTodaysWorkout(user.id, targetDate);
        if (!workout) {
            throw new Error(`No workout found for user ${user.id} on ${targetDate.toISOString()}`);
        }
        if (!workout.message) {
            throw new Error(`No workout message found for ${workout.id}`);
        }
        console.log(`[Onboarding] Prepared workout message for ${user.id}`);
        return workout.message;
    }
}
const onboardingService = OnboardingService.getInstance();
}),
"[project]/packages/shared/src/server/services/user/onboardingDataService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OnboardingDataService",
    ()=>OnboardingDataService,
    "onboardingDataService",
    ()=>onboardingDataService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/onboardingRepository.ts [app-route] (ecmascript)");
;
class OnboardingDataService {
    static instance;
    repository;
    constructor(){
        this.repository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OnboardingRepository"]();
    }
    static getInstance() {
        if (!OnboardingDataService.instance) {
            OnboardingDataService.instance = new OnboardingDataService();
        }
        return OnboardingDataService.instance;
    }
    /**
   * Create a new onboarding record for a user
   * Called during signup to initialize onboarding tracking
   */ async createOnboardingRecord(userId, signupData) {
        console.log(`[OnboardingDataService] Creating onboarding record for user ${userId}`);
        return await this.repository.create(userId, signupData);
    }
    /**
   * Mark onboarding as started (status: pending → in_progress)
   */ async markStarted(userId) {
        console.log(`[OnboardingDataService] Marking onboarding started for user ${userId}`);
        return await this.repository.markStarted(userId);
    }
    /**
   * Update current step for progress tracking
   */ async updateCurrentStep(userId, stepNumber) {
        console.log(`[OnboardingDataService] Updating step to ${stepNumber} for user ${userId}`);
        return await this.repository.updateCurrentStep(userId, stepNumber);
    }
    /**
   * Mark onboarding as completed (status: in_progress → completed)
   */ async markCompleted(userId) {
        console.log(`[OnboardingDataService] Marking onboarding completed for user ${userId}`);
        return await this.repository.markCompleted(userId);
    }
    /**
   * Update onboarding status with optional error message
   * Used for marking as failed or updating status manually
   */ async updateStatus(userId, status, errorMessage) {
        console.log(`[OnboardingDataService] Updating status to '${status}' for user ${userId}`);
        return await this.repository.updateStatus(userId, status, errorMessage);
    }
    /**
   * Get onboarding status for a client
   */ async getStatus(clientId) {
        const record = await this.repository.findByClientId(clientId);
        return record ? record.status : null;
    }
    /**
   * Get complete onboarding record by client ID
   */ async findByClientId(clientId) {
        return await this.repository.findByClientId(clientId);
    }
    /**
   * Get signup data for a user
   * Used during async onboarding to retrieve form data
   */ async getSignupData(userId) {
        return await this.repository.getSignupData(userId);
    }
    /**
   * Clear signup data after profile extraction
   * Cleanup to remove temporary form data
   */ async clearSignupData(userId) {
        console.log(`[OnboardingDataService] Clearing signup data for user ${userId}`);
        return await this.repository.clearSignupData(userId);
    }
    /**
   * Mark final program messages as sent
   * Used for idempotency - ensures messages only sent once
   */ async markMessagesSent(userId) {
        console.log(`[OnboardingDataService] Marking messages sent for user ${userId}`);
        return await this.repository.markMessagesSent(userId);
    }
    /**
   * Check if final messages have been sent
   * Used to prevent duplicate message sending
   */ async hasMessagesSent(userId) {
        return await this.repository.hasMessagesSent(userId);
    }
    /**
   * Delete onboarding record (full cleanup)
   * Optional: can be used to clean up old records
   */ async delete(userId) {
        console.log(`[OnboardingDataService] Deleting onboarding record for user ${userId}`);
        return await this.repository.delete(userId);
    }
}
const onboardingDataService = OnboardingDataService.getInstance();
}),
"[project]/packages/shared/src/server/repositories/subscriptionRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SubscriptionRepository",
    ()=>SubscriptionRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class SubscriptionRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new subscription
   */ async create(data) {
        const subscription = {
            clientId: data.clientId,
            stripeSubscriptionId: data.stripeSubscriptionId,
            status: data.status,
            planType: data.planType,
            currentPeriodStart: data.currentPeriodStart,
            currentPeriodEnd: data.currentPeriodEnd
        };
        return await this.db.insertInto('subscriptions').values(subscription).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Update subscription by Stripe subscription ID
   */ async updateByStripeId(stripeSubscriptionId, data) {
        return await this.db.updateTable('subscriptions').set(data).where('stripeSubscriptionId', '=', stripeSubscriptionId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Find subscription by client ID
   */ async findByClientId(clientId) {
        return await this.db.selectFrom('subscriptions').selectAll().where('clientId', '=', clientId).orderBy('createdAt', 'desc').execute();
    }
    /**
   * Find subscription by Stripe subscription ID
   */ async findByStripeId(stripeSubscriptionId) {
        return await this.db.selectFrom('subscriptions').selectAll().where('stripeSubscriptionId', '=', stripeSubscriptionId).executeTakeFirst() ?? null;
    }
    /**
   * Get active subscription for client
   */ async getActiveSubscription(clientId) {
        return await this.db.selectFrom('subscriptions').selectAll().where('clientId', '=', clientId).where('status', '=', 'active').orderBy('createdAt', 'desc').executeTakeFirst() ?? null;
    }
    /**
   * Check if client has active subscription
   */ async hasActiveSubscription(clientId) {
        const subscription = await this.getActiveSubscription(clientId);
        return subscription !== null;
    }
    /**
   * Cancel subscription
   */ async cancel(stripeSubscriptionId, canceledAt) {
        return await this.db.updateTable('subscriptions').set({
            status: 'canceled',
            canceledAt
        }).where('stripeSubscriptionId', '=', stripeSubscriptionId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Schedule subscription for cancellation at period end
   * Sets status to 'cancel_pending' - messages will stop immediately
   */ async scheduleCancellation(stripeSubscriptionId) {
        return await this.db.updateTable('subscriptions').set({
            status: 'cancel_pending'
        }).where('stripeSubscriptionId', '=', stripeSubscriptionId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Reactivate subscription (clear pending cancellation)
   * Sets status back to 'active'
   */ async reactivate(stripeSubscriptionId) {
        return await this.db.updateTable('subscriptions').set({
            status: 'active'
        }).where('stripeSubscriptionId', '=', stripeSubscriptionId).returningAll().executeTakeFirstOrThrow();
    }
    /**
   * Find active subscription eligible for messaging
   * Only returns subscriptions with status 'active' (excludes 'cancel_pending')
   */ async findActiveForMessaging(clientId) {
        return await this.db.selectFrom('subscriptions').selectAll().where('clientId', '=', clientId).where('status', '=', 'active').orderBy('createdAt', 'desc').executeTakeFirst() ?? null;
    }
}
}),
"[project]/packages/shared/src/server/services/subscription/subscriptionService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SubscriptionService",
    ()=>SubscriptionService,
    "subscriptionService",
    ()=>subscriptionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$14$2e$25$2e$0$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/stripe@14.25.0/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$subscriptionRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/subscriptionRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/userRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/config/secrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/shared/config/index.ts [app-route] (ecmascript) <locals>");
;
;
;
;
;
const { secretKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$config$2f$secrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStripeSecrets"])();
const stripe = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$14$2e$25$2e$0$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](secretKey, {
    apiVersion: '2023-10-16'
});
class SubscriptionService {
    static instance;
    subscriptionRepo;
    userRepo;
    constructor(){
        this.subscriptionRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$subscriptionRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SubscriptionRepository"]();
        this.userRepo = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRepository"]();
    }
    static getInstance() {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }
    /**
   * Cancel user's subscription via STOP command
   * Sets cancel_at_period_end in Stripe and status to 'cancel_pending' locally
   * User keeps access but messages stop immediately
   */ async cancelSubscription(userId) {
        try {
            // Get active subscription
            const subscription = await this.subscriptionRepo.getActiveSubscription(userId);
            if (!subscription) {
                // Check if already pending cancellation
                const subscriptions = await this.subscriptionRepo.findByClientId(userId);
                const pendingSub = subscriptions.find((s)=>s.status === 'cancel_pending');
                if (pendingSub) {
                    return {
                        success: true,
                        periodEndDate: new Date(pendingSub.currentPeriodEnd)
                    };
                }
                return {
                    success: false,
                    error: 'No active subscription found'
                };
            }
            // Cancel in Stripe (at period end)
            const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                cancel_at_period_end: true
            });
            // Update local DB to 'cancel_pending'
            await this.subscriptionRepo.scheduleCancellation(subscription.stripeSubscriptionId);
            console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} scheduled for cancellation`);
            return {
                success: true,
                periodEndDate: new Date(stripeSubscription.current_period_end * 1000)
            };
        } catch (error) {
            console.error('[SubscriptionService] Cancel failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Reactivate user's subscription via START command
   * If cancel_at_period_end was set, clears it and sets status back to 'active'
   * If fully canceled, returns checkout URL for new subscription
   */ async reactivateSubscription(userId) {
        try {
            // Get user's most recent subscription
            const subscriptions = await this.subscriptionRepo.findByClientId(userId);
            const subscription = subscriptions[0]; // Most recent
            if (!subscription) {
                // No subscription history - need new subscription
                return await this.createResubscriptionSession(userId);
            }
            // If already active, nothing to do
            if (subscription.status === 'active') {
                return {
                    success: true,
                    reactivated: false,
                    requiresNewSubscription: false
                };
            }
            // If cancel_pending, try to reactivate in Stripe
            if (subscription.status === 'cancel_pending') {
                try {
                    // Check Stripe subscription state
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
                    if (stripeSubscription.status === 'active' && stripeSubscription.cancel_at_period_end) {
                        // Can reactivate by clearing cancel_at_period_end
                        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                            cancel_at_period_end: false
                        });
                        // Update local DB
                        await this.subscriptionRepo.reactivate(subscription.stripeSubscriptionId);
                        console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} reactivated`);
                        return {
                            success: true,
                            reactivated: true,
                            requiresNewSubscription: false
                        };
                    }
                } catch (stripeError) {
                    console.error('[SubscriptionService] Stripe reactivation failed:', stripeError);
                // Fall through to create new subscription
                }
            }
            // If canceled or Stripe reactivation failed, need new subscription
            if (subscription.status === 'canceled' || subscription.status === 'cancel_pending') {
                return await this.createResubscriptionSession(userId);
            }
            // Unknown state
            return {
                success: false,
                reactivated: false,
                requiresNewSubscription: false,
                error: 'Unknown subscription state'
            };
        } catch (error) {
            console.error('[SubscriptionService] Reactivate failed:', error);
            return {
                success: false,
                reactivated: false,
                requiresNewSubscription: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Check if user should receive messages
   * Only users with status='active' (not 'cancel_pending') receive messages
   */ async shouldReceiveMessages(userId) {
        const subscription = await this.subscriptionRepo.findActiveForMessaging(userId);
        return subscription !== null;
    }
    /**
   * Create a new checkout session for resubscription
   */ async createResubscriptionSession(userId) {
        try {
            const user = await this.userRepo.findById(userId);
            if (!user) {
                return {
                    success: false,
                    reactivated: false,
                    requiresNewSubscription: true,
                    error: 'User not found'
                };
            }
            const { publicBaseUrl, baseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUrlsConfig"])();
            const resolvedBaseUrl = publicBaseUrl || baseUrl;
            const { priceId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$shared$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getStripeConfig"])();
            const session = await stripe.checkout.sessions.create({
                customer: user.stripeCustomerId || undefined,
                mode: 'subscription',
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],
                success_url: `${resolvedBaseUrl}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${resolvedBaseUrl}/`,
                metadata: {
                    userId
                },
                client_reference_id: userId
            });
            console.log(`[SubscriptionService] Created resubscription checkout session for user ${userId}`);
            return {
                success: true,
                reactivated: false,
                requiresNewSubscription: true,
                checkoutUrl: session.url || undefined
            };
        } catch (error) {
            console.error('[SubscriptionService] Create checkout session failed:', error);
            return {
                success: false,
                reactivated: false,
                requiresNewSubscription: true,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
const subscriptionService = SubscriptionService.getInstance();
}),
"[project]/packages/shared/src/server/services/training/chainRunnerService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChainRunnerService",
    ()=>ChainRunnerService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/fitnessProfileService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/onboardingRepository.ts [app-route] (ecmascript)");
// Agent services for full chain operations and sub-agents
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/workoutAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/microcycleAgentService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
class ChainRunnerService {
    static instance;
    fitnessPlanService;
    microcycleService;
    workoutService;
    userService;
    fitnessProfileService;
    onboardingRepository;
    constructor(){
        this.fitnessPlanService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanService"].getInstance();
        this.microcycleService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleService"].getInstance();
        this.workoutService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceService"].getInstance();
        this.userService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserService"].getInstance();
        this.fitnessProfileService = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessProfileService"].getInstance();
        this.onboardingRepository = new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OnboardingRepository"]();
    }
    static getInstance() {
        if (!ChainRunnerService.instance) {
            ChainRunnerService.instance = new ChainRunnerService();
        }
        return ChainRunnerService.instance;
    }
    // ============================================
    // PROFILE OPERATIONS
    // ============================================
    /**
   * Regenerate a user's profile from their signup data
   * Creates a new profile from scratch using the ProfileUpdateAgent
   */ async runProfileRegeneration(userId) {
        const startTime = Date.now();
        console.log(`[ChainRunner] Regenerating profile for user ${userId}`);
        // Fetch the user with profile
        const user = await this.userService.getUser(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        // Fetch signup data
        const signupData = await this.onboardingRepository.getSignupData(userId);
        if (!signupData) {
            throw new Error(`No signup data found for user: ${userId}`);
        }
        // Regenerate profile from signup data
        const profile = await this.fitnessProfileService.createFitnessProfile(user, signupData);
        if (!profile) {
            throw new Error(`Failed to regenerate profile for user: ${userId}`);
        }
        console.log(`[ChainRunner] Profile regenerated for user ${userId}`);
        return {
            success: true,
            profile,
            executionTimeMs: Date.now() - startTime
        };
    }
    // ============================================
    // FITNESS PLAN OPERATIONS
    // ============================================
    /**
   * Run a chain operation for a fitness plan
   */ async runFitnessPlanChain(planId, operation) {
        const startTime = Date.now();
        // Fetch the plan
        const plan = await this.fitnessPlanService.getPlanById(planId);
        if (!plan) {
            throw new Error(`Fitness plan not found: ${planId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(plan.clientId);
        if (!user) {
            throw new Error(`User not found: ${plan.clientId}`);
        }
        let updatedPlan;
        switch(operation){
            case 'full':
                updatedPlan = await this.runFullFitnessPlanChain(plan, user);
                break;
            case 'structured':
                updatedPlan = await this.runFitnessPlanStructuredChain(plan);
                break;
            case 'message':
                updatedPlan = await this.runFitnessPlanMessageChain(plan, user);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedPlan,
            executionTimeMs: Date.now() - startTime,
            operation
        };
    }
    async runFullFitnessPlanChain(plan, user) {
        console.log(`[ChainRunner] Running full fitness plan chain for plan ${plan.id}`);
        // Use fitness plan agent service for full chain
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanAgentService"].generateFitnessPlan(user);
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            description: result.description,
            message: result.message,
            structured: result.structure
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    async runFitnessPlanStructuredChain(plan) {
        console.log(`[ChainRunner] Running structured chain for plan ${plan.id}`);
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanAgentService"].getStructuredAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            description: plan.description || ''
        });
        const result = await agent.invoke(inputJson);
        const structure = result.response;
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            structured: structure
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    async runFitnessPlanMessageChain(plan, user) {
        console.log(`[ChainRunner] Running message chain for plan ${plan.id}`);
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$fitnessPlanAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanAgentService"].getMessageAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            description: plan.description || '',
            user
        });
        const result = await agent.invoke(inputJson);
        const message = result.response;
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            message
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    // ============================================
    // MICROCYCLE OPERATIONS
    // ============================================
    /**
   * Run a chain operation for a microcycle
   */ async runMicrocycleChain(microcycleId, operation) {
        const startTime = Date.now();
        // Fetch the microcycle
        const microcycle = await this.microcycleService.getMicrocycleById(microcycleId);
        if (!microcycle) {
            throw new Error(`Microcycle not found: ${microcycleId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(microcycle.clientId);
        if (!user) {
            throw new Error(`User not found: ${microcycle.clientId}`);
        }
        // Fetch the user's current plan for full regeneration
        const plan = await this.fitnessPlanService.getCurrentPlan(microcycle.clientId);
        if (!plan) {
            throw new Error(`No active fitness plan found for client: ${microcycle.clientId}`);
        }
        let updatedMicrocycle;
        switch(operation){
            case 'full':
                updatedMicrocycle = await this.runFullMicrocycleChain(microcycle, plan, user);
                break;
            case 'structured':
                updatedMicrocycle = await this.runMicrocycleStructuredChain(microcycle);
                break;
            case 'message':
                updatedMicrocycle = await this.runMicrocycleMessageChain(microcycle);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedMicrocycle,
            executionTimeMs: Date.now() - startTime,
            operation
        };
    }
    async runFullMicrocycleChain(microcycle, plan, user) {
        console.log(`[ChainRunner] Running full microcycle chain for microcycle ${microcycle.id}`);
        // Use microcycle agent service for full chain
        // Fitness plan is auto-fetched by context service
        // isDeload is determined by agent from plan's Progression Strategy
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleAgentService"].generateMicrocycle(user, microcycle.absoluteWeek);
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            days: result.days,
            description: result.description,
            isDeload: result.isDeload,
            message: result.message,
            structured: result.structure
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    async runMicrocycleStructuredChain(microcycle) {
        console.log(`[ChainRunner] Running structured chain for microcycle ${microcycle.id}`);
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleAgentService"].getStructuredAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            overview: microcycle.description || '',
            days: microcycle.days,
            absoluteWeek: microcycle.absoluteWeek,
            isDeload: microcycle.isDeload
        });
        const result = await agent.invoke(inputJson);
        const structure = result.response;
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            structured: structure
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    async runMicrocycleMessageChain(microcycle) {
        console.log(`[ChainRunner] Running message chain for microcycle ${microcycle.id}`);
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$microcycleAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleAgentService"].getMessageAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            overview: microcycle.description || '',
            days: microcycle.days,
            isDeload: microcycle.isDeload
        });
        const result = await agent.invoke(inputJson);
        const message = result.response;
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            message
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    // ============================================
    // WORKOUT OPERATIONS
    // ============================================
    /**
   * Run a chain operation for a workout
   */ async runWorkoutChain(workoutId, operation) {
        const startTime = Date.now();
        // Fetch the workout
        const workout = await this.workoutService.getWorkoutByIdInternal(workoutId);
        if (!workout) {
            throw new Error(`Workout not found: ${workoutId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(workout.clientId);
        if (!user) {
            throw new Error(`User not found: ${workout.clientId}`);
        }
        // Fetch microcycle for full regeneration
        let microcycle = null;
        if (workout.microcycleId) {
            microcycle = await this.microcycleService.getMicrocycleById(workout.microcycleId);
        }
        let updatedWorkout;
        switch(operation){
            case 'full':
                updatedWorkout = await this.runFullWorkoutChain(workout, user, microcycle);
                break;
            case 'structured':
                updatedWorkout = await this.runWorkoutStructuredChain(workout);
                break;
            case 'message':
                updatedWorkout = await this.runWorkoutMessageChain(workout);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedWorkout,
            executionTimeMs: Date.now() - startTime,
            operation
        };
    }
    async runFullWorkoutChain(workout, user, microcycle) {
        console.log(`[ChainRunner] Running full workout chain for workout ${workout.id}`);
        // Determine day overview and activity type from microcycle
        let dayOverview = workout.goal || 'General workout';
        let activityType;
        if (microcycle) {
            const workoutDate = new Date(workout.date);
            const dayOfWeek = workoutDate.getDay(); // 0 = Sunday
            // Convert to microcycle days array index (0 = Monday)
            const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            if (microcycle.days[dayIndex]) {
                dayOverview = microcycle.days[dayIndex];
            }
            // Get activity type from structured data
            const structuredDay = microcycle.structured?.days?.[dayIndex];
            activityType = structuredDay?.activityType;
        }
        // Use workout agent service for full chain
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].generateWorkout(user, dayOverview, microcycle?.isDeload || false, activityType);
        const updated = await this.workoutService.updateWorkout(workout.id, {
            description: result.response,
            message: result.message,
            structured: result.structure
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
    }
    async runWorkoutStructuredChain(workout) {
        console.log(`[ChainRunner] Running structured chain for workout ${workout.id}`);
        if (!workout.description) {
            throw new Error(`Workout ${workout.id} has no description to parse`);
        }
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].getStructuredAgent();
        const result = await agent.invoke(workout.description);
        const structure = result.response;
        const updated = await this.workoutService.updateWorkout(workout.id, {
            structured: structure
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
    }
    async runWorkoutMessageChain(workout) {
        console.log(`[ChainRunner] Running message chain for workout ${workout.id}`);
        if (!workout.description) {
            throw new Error(`Workout ${workout.id} has no description to create message from`);
        }
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$training$2f$workoutAgentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutAgentService"].getMessageAgent();
        const result = await agent.invoke(workout.description);
        const message = result.response;
        const updated = await this.workoutService.updateWorkout(workout.id, {
            message
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
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
"[project]/packages/shared/src/server/repositories/adminActivityLogRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminActivityLogRepository",
    ()=>AdminActivityLogRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class AdminActivityLogRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    async log(params) {
        await this.db.insertInto('adminActivityLogs').values({
            actorClientId: params.actorClientId ?? null,
            targetClientId: params.targetClientId,
            action: params.action,
            // JSON stringify/parse to ensure it's JSON-serializable for jsonb
            payload: JSON.parse(JSON.stringify(params.payload ?? {})),
            result: params.result,
            errorMessage: params.errorMessage ?? null
        }).execute();
    }
    async listForClient(targetClientId, options = {}) {
        const page = options.page ?? 1;
        const pageSize = options.pageSize ?? 20;
        const rows = await this.db.selectFrom('adminActivityLogs').selectAll().where('targetClientId', '=', targetClientId).orderBy('createdAt', 'desc').offset((page - 1) * pageSize).limit(pageSize).execute();
        return rows;
    }
}
}),
"[project]/packages/shared/src/server/repositories/profileUpdateRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileUpdateRepository",
    ()=>ProfileUpdateRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class ProfileUpdateRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new profile update audit record
   */ async create(update) {
        const result = await this.db.insertInto('profileUpdates').values(update).returningAll().executeTakeFirstOrThrow();
        return result;
    }
    /**
   * Get profile updates for a specific client
   */ async getClientUpdates(clientId, limit = 10) {
        const updates = await this.db.selectFrom('profileUpdates').where('clientId', '=', clientId).orderBy('createdAt', 'desc').limit(limit).selectAll().execute();
        return updates;
    }
    /**
   * Get recent profile updates across all users (for monitoring)
   */ async getRecentUpdates(limit = 50) {
        const updates = await this.db.selectFrom('profileUpdates').orderBy('createdAt', 'desc').limit(limit).selectAll().execute();
        return updates;
    }
    /**
   * Get profile updates by source (e.g., 'chat', 'admin', 'api')
   */ async getUpdatesBySource(source, limit = 50) {
        const updates = await this.db.selectFrom('profileUpdates').where('source', '=', source).orderBy('createdAt', 'desc').limit(limit).selectAll().execute();
        return updates;
    }
    /**
   * Count profile updates for a client
   */ async countClientUpdates(clientId) {
        const result = await this.db.selectFrom('profileUpdates').where('clientId', '=', clientId).select(this.db.fn.count('id').as('count')).executeTakeFirstOrThrow();
        return Number(result.count);
    }
}
}),
"[project]/packages/shared/src/server/repositories/userAuthRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserAuthRepository",
    ()=>UserAuthRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/baseRepository.ts [app-route] (ecmascript)");
;
class UserAuthRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$baseRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseRepository"] {
    /**
   * Create a new authentication code for a phone number
   */ async createAuthCode(phoneNumber, code, expiresAt) {
        await this.db.insertInto('userAuthCodes').values({
            phoneNumber,
            code,
            expiresAt,
            createdAt: new Date()
        }).execute();
    }
    /**
   * Find a valid (non-expired) auth code for a phone number
   * Returns the code if found and not expired, null otherwise
   */ async findValidCode(phoneNumber, code) {
        const result = await this.db.selectFrom('userAuthCodes').select([
            'id',
            'phoneNumber'
        ]).where('phoneNumber', '=', phoneNumber).where('code', '=', code).where('expiresAt', '>', new Date()).executeTakeFirst();
        return result || null;
    }
    /**
   * Delete all auth codes for a phone number
   * Used after successful verification or to clear old codes
   */ async deleteCodesForPhone(phoneNumber) {
        await this.db.deleteFrom('userAuthCodes').where('phoneNumber', '=', phoneNumber).execute();
    }
    /**
   * Delete all expired auth codes
   * Should be run periodically to clean up the database
   */ async deleteExpiredCodes() {
        const result = await this.db.deleteFrom('userAuthCodes').where('expiresAt', '<', new Date()).executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
   * Count recent auth code requests for a phone number
   * Used for rate limiting
   */ async countRecentRequests(phoneNumber, since) {
        const result = await this.db.selectFrom('userAuthCodes').select((eb)=>eb.fn.countAll().as('count')).where('phoneNumber', '=', phoneNumber).where('createdAt', '>=', since).executeTakeFirst();
        return Number(result?.count || 0);
    }
}
}),
"[project]/packages/shared/src/server/repositories/factory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Repository Factory
 *
 * Creates repository instances with a specific database connection.
 * Used for environment switching in the admin app.
 *
 * @example
 * const ctx = await createEnvContext();
 * const repos = createRepositories(ctx.db);
 * const users = await repos.user.findAll();
 */ __turbopack_context__.s([
    "createRepositories",
    ()=>createRepositories,
    "getRepositories",
    ()=>getRepositories
]);
// Import all repository classes
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/userRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/messageRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/profileRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/fitnessPlanRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/workoutInstanceRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$microcycleRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/microcycleRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$subscriptionRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/subscriptionRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/onboardingRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$promptRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/promptRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$dayConfigRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/dayConfigRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageQueueRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/messageQueueRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$shortLinkRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/shortLinkRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$referralRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/referralRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$pageVisitRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/pageVisitRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$adminActivityLogRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/adminActivityLogRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$uploadedImageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/uploadedImageRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileUpdateRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/profileUpdateRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userAuthRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/userAuthRepository.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Cache repositories by database connection string (approximated by object identity)
const repoCache = new WeakMap();
function createRepositories(db) {
    // Return cached instance if available
    const cached = repoCache.get(db);
    if (cached) {
        return cached;
    }
    // Create new repository instances
    const repos = {
        user: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRepository"](db),
        message: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageRepository"](db),
        profile: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileRepository"](db),
        fitnessPlan: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$fitnessPlanRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FitnessPlanRepository"](db),
        workoutInstance: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$workoutInstanceRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkoutInstanceRepository"](db),
        microcycle: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$microcycleRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MicrocycleRepository"](db),
        subscription: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$subscriptionRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SubscriptionRepository"](db),
        onboarding: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$onboardingRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OnboardingRepository"](db),
        prompt: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$promptRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PromptRepository"](db),
        dayConfig: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$dayConfigRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DayConfigRepository"](db),
        messageQueue: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$messageQueueRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageQueueRepository"](db),
        shortLink: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$shortLinkRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ShortLinkRepository"](db),
        referral: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$referralRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReferralRepository"](db),
        pageVisit: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$pageVisitRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageVisitRepository"](db),
        adminActivityLog: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$adminActivityLogRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminActivityLogRepository"](db),
        uploadedImage: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$uploadedImageRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UploadedImageRepository"](db),
        profileUpdate: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileUpdateRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileUpdateRepository"](db),
        userAuth: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$userAuthRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserAuthRepository"](db)
    };
    // Cache for reuse
    repoCache.set(db, repos);
    return repos;
}
function getRepositories(ctx) {
    return createRepositories(ctx.db);
}
}),
"[project]/packages/shared/src/server/services/factory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Service Factory
 *
 * Creates service instances with a specific environment context.
 * Used for environment switching in the admin app.
 *
 * This factory provides context-aware versions of services that need
 * database, Twilio, or Stripe access. Services created through this
 * factory will use the context's connections instead of the default singletons.
 *
 * @example
 * const ctx = await createEnvContext();
 * const services = getServices(ctx);
 * await services.user.getUser(userId);
 */ __turbopack_context__.s([
    "clearServiceCache",
    ()=>clearServiceCache,
    "getServices",
    ()=>getServices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/factory.ts [app-route] (ecmascript)");
;
// Cache service containers by environment mode
const containerCache = new Map();
function getServices(ctx) {
    const cacheKey = ctx.mode;
    // Return cached container if available
    const cached = containerCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    // Create new service container
    const container = {
        repos: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRepositories"])(ctx.db),
        ctx
    };
    // Cache for reuse
    containerCache.set(cacheKey, container);
    return container;
}
function clearServiceCache() {
    containerCache.clear();
}
}),
"[project]/packages/shared/src/server/services/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Entity services (from /services/training/, /services/user/, /services/messaging/)
// NOTE: These must be imported first as they're used to initialize ContextService
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/fitnessPlanService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/workoutInstanceService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/microcycleService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$progressService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/progressService.ts [app-route] (ecmascript)");
// Context service initialization (must happen before any agent services are used)
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/context/contextService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/repositories/profileRepository.ts [app-route] (ecmascript)");
// Agent orchestration services (from /services/agents/)
// These use static methods - call directly e.g. ChatService.handleIncomingMessage()
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$chat$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/chat/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$modifications$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/modifications/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$agents$2f$profile$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/agents/profile/index.ts [app-route] (ecmascript)");
// Non-agent orchestration services (from /services/orchestration/)
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$dailyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/orchestration/dailyMessageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$weeklyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/orchestration/weeklyMessageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$onboardingService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/orchestration/onboardingService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$fitnessProfileService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/fitnessProfileService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$onboardingDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/onboardingDataService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$messaging$2f$messageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/messaging/messageService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$subscription$2f$subscriptionService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/subscription/subscriptionService.ts [app-route] (ecmascript)");
// Chain runner service for testing/improving AI outputs
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$chainRunnerService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/training/chainRunnerService.ts [app-route] (ecmascript)");
// Calendar services
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$calendar$2f$dayConfigService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/calendar/dayConfigService.ts [app-route] (ecmascript)");
// Service factory (for environment context switching)
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/factory.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$context$2f$contextService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContextService"].initialize({
    fitnessPlanService: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$fitnessPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fitnessPlanService"],
    workoutInstanceService: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$workoutInstanceService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workoutInstanceService"],
    microcycleService: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$training$2f$microcycleService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["microcycleService"],
    profileRepository: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$repositories$2f$profileRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProfileRepository"]()
});
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/apps/admin/src/app/api/admin/users/[id]/messages/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/user/userService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$dailyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/server/services/orchestration/dailyMessageService.ts [app-route] (ecmascript)");
;
;
;
async function POST(_req, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'User ID is required'
            }, {
                status: 400
            });
        }
        // Fetch the user from the database
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$user$2f$userService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userService"].getUser(id);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'User not found'
            }, {
                status: 404
            });
        }
        const messageResult = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$server$2f$services$2f$orchestration$2f$dailyMessageService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dailyMessageService"].sendDailyMessage(user);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: messageResult.success,
            messageId: messageResult.messageId,
            error: messageResult.error
        });
    } catch (error) {
        console.error('Error sending daily message:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e31e26ba._.js.map