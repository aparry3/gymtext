(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__04e1aa8b._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Developer/GymText/gymtext/apps/web/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Developer/GymText/gymtext/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Developer/GymText/gymtext/node_modules/.pnpm/next@16.0.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
/**
 * Paths that should be tracked for analytics.
 * Dynamic segments will be normalized to placeholders.
 */ const TRACKED_PATH_PREFIXES = [
    '/',
    '/me',
    '/l'
];
/**
 * Check if a path should be tracked.
 */ function shouldTrack(pathname) {
    // Track root path exactly
    if (pathname === '/') return true;
    // Track paths starting with tracked prefixes
    return TRACKED_PATH_PREFIXES.some((prefix)=>prefix !== '/' && pathname.startsWith(prefix));
}
/**
 * Normalize path for analytics (replace dynamic segments with placeholders)
 */ function normalizePath(fullPath) {
    // Remove query string for normalization
    const pathOnly = fullPath.split('?')[0];
    // Replace UUID-like segments with placeholder
    return pathOnly.replace(/\/[a-f0-9-]{36}/gi, '/:id');
}
/**
 * Fire tracking event (non-blocking).
 */ function trackPageVisit(request) {
    const url = request.nextUrl;
    const fullPath = url.pathname + url.search;
    // Normalize the path for analytics
    const normalizedPage = normalizePath(fullPath);
    const source = url.searchParams.get('utm_source') || url.searchParams.get('ref') || null;
    // Build absolute URL for the tracking endpoint
    const trackUrl = new URL('/api/track', request.url);
    // Fire-and-forget: don't await, just catch errors
    fetch(trackUrl.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Forward visitor metadata
            'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
            'x-real-ip': request.headers.get('x-real-ip') ?? '',
            'user-agent': request.headers.get('user-agent') ?? '',
            referer: request.headers.get('referer') ?? ''
        },
        body: JSON.stringify({
            page: normalizedPage,
            source
        })
    }).catch((err)=>console.error('[Middleware] Tracking error:', err));
}
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Fire tracking for relevant pages (non-blocking)
    if (shouldTrack(pathname)) {
        trackPageVisit(request);
    }
    // User /me path protection
    const isClientPath = pathname.startsWith('/me');
    const isClientLoginPath = pathname === '/me/login' || pathname === '/me/login/';
    if (isClientPath) {
        // Allow access to the login page without cookie
        if (isClientLoginPath) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        }
        const userSession = request.cookies.get('gt_user_session')?.value;
        if (userSession) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        }
        // Redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/me/login';
        return __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Developer$2f$GymText$2f$gymtext$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        // Home page (tracking)
        '/',
        // User routes (auth + tracking)
        '/me',
        '/me/:path*',
        // Short links (tracking)
        '/l/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__04e1aa8b._.js.map