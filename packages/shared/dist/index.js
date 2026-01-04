// Main entry point for @gymtext/shared
// NOTE: Prefer importing from specific subpaths:
//   - '@gymtext/shared/server' for server-side code
//   - '@gymtext/shared/shared' for client-safe utilities
// Re-export shared (client-safe) utilities
export * from './shared';
// Note: Server exports are NOT included here to avoid pulling server-only
// code into client bundles. Import from '@gymtext/shared/server' instead.
