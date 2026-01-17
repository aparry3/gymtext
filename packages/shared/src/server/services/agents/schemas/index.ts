/**
 * Agent-Specific Schemas
 *
 * Contains schemas for agent output formats only.
 * Domain types have been moved to @/server/models/
 */

// Profile agent schemas (ProfileUpdateOutputSchema, UserFieldsOutputSchema)
export * from './profile';

// Plans agent schemas (ModifyFitnessPlanOutputSchema)
export * from './plans';

// Microcycles agent schemas (MicrocycleGenerationOutputSchema, ModifyMicrocycleOutputSchema)
export * from './microcycles';

// Workouts agent schemas (ModifyWorkoutGenerationOutputSchema)
export * from './workouts';
