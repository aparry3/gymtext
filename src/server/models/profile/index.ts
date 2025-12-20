/**
 * Profile Model
 *
 * Exports structured profile schemas and types for the
 * LLM-extracted profile data stored in profiles.structured.
 */

// Schema exports
export {
  StructuredProfileSchema,
  StructuredConstraintSchema,
  ExperienceLevelSchema,
} from './schema';

// Type exports
export type {
  StructuredProfile,
  StructuredConstraint,
  ExperienceLevel,
} from './schema';
