/**
 * Shared Types
 *
 * Central export for all shared types and Zod schemas.
 * These types are used across both server and client code.
 */

// User types and schemas
export * from './user';

// Profile types and schemas (structured LLM-extracted profiles)
export * from './profile';

// Fitness plan types and schemas
export * from './plan';

// Microcycle types and schemas
export * from './microcycle';

// Workout types and schemas (includes Gemini/OpenAI variants)
export * from './workout';

// Messaging types
export * from './messaging';

// Admin types (for admin API responses)
export * from './admin';
