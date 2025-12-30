/**
 * Mock for Next.js 'server-only' package
 *
 * This package only exports nothing - its purpose is to throw at build time
 * if imported from client code. In tests, we just need an empty module.
 */
export {};
