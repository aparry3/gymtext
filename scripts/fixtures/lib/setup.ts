/**
 * Environment setup for fixture scripts.
 *
 * Must be imported BEFORE any @gymtext/shared code to:
 * 1. Shim Next.js-only modules (server-only)
 * 2. Load environment variables from .env.local
 */

/* eslint-disable @typescript-eslint/no-require-imports */

// Load environment variables before anything else
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

// 'server-only' is a Next.js build-time guard that throws when imported
// outside of a React Server Component context. Shared package code imports
// it via `import 'server-only'`. Since the package is not installed in the
// scripts context, we hook Module._resolveFilename to return a no-op.
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request: string, ...args: unknown[]) {
  if (request === 'server-only') {
    return __filename;
  }
  return originalResolve.call(this, request, ...args);
};
