/**
 * This file re-exports the generated database types.
 * When using the --camel-case option with kysely-codegen,
 * the generated types will have camelCase property names.
 */

export * from './generated-schema';

// Re-export the DB type as Database for backward compatibility
export type { DB as Database } from './generated-schema';