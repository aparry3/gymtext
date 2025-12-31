// Server-side exports for @gymtext/shared/server
// This provides all server-side functionality for the GymText apps

// Config (must be imported first)
export * from './config';

// Environment Context (for sandbox/production switching)
export * from './context';

// Models (types and database schema)
export * from './models';

// Connections (database, external services)
export * from './connections';

// Repositories (data access layer)
export * from './repositories';

// Agents - exported as namespace to avoid conflicts with models (Message, PromptRole)
export * as agents from './agents';

// Re-export commonly used agent items directly (with explicit names)
export { createAgent, PROMPT_IDS, CONTEXT_IDS, PROMPT_ROLES, initializeModel } from './agents';

// Services (business logic)
export * from './services';

// Utils
export * from './utils';
