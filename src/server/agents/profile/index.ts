/**
 * Profile Agents
 *
 * Agents responsible for maintaining user fitness profiles:
 * - ProfileUpdateAgent: Maintains the Markdown "Living Dossier" profile
 * - UserFieldsAgent: Extracts user preference updates (timezone, send time, name)
 * - StructuredProfileAgent: Extracts structured data from the Markdown dossier
 */

// Types
export * from './types';

// Schemas
export * from './schemas';

// Agents (main operations)
export * from './agents';

// Prompts (for advanced usage and testing)
export * from './prompts';
