/**
 * Centralized workout schema exports
 *
 * This module provides all workout schemas and utilities for both Gemini and OpenAI models.
 * Use getWorkoutSchemas() to automatically select the appropriate schemas based on the model.
 */
import { z } from 'zod';
export { IntensitySchema, WorkoutActivitySchema, WorkoutSectionSchema, WorkoutStructureSchema, type WorkoutStructure, type WorkoutActivity, type WorkoutSection, type Intensity, } from './workoutStructure';
export { GeminiWorkoutBlockItemSchema, GeminiWorkoutWorkItemSchema, GeminiWorkoutBlockSchema, GeminiWorkoutModificationSchema, GeminiWorkoutSessionContextSchema, GeminiWorkoutTargetMetricsSchema, GeminiWorkoutSummarySchema, GeminiEnhancedWorkoutInstanceSchema, GeminiUpdatedWorkoutInstanceSchema, convertGeminiToStandard, type GeminiWorkoutBlockItem, type GeminiWorkoutWorkItem, type GeminiWorkoutBlock, type GeminiWorkoutModification, type GeminiWorkoutSessionContext, type GeminiWorkoutTargetMetrics, type GeminiWorkoutSummary, type GeminiEnhancedWorkoutInstance, type GeminiUpdatedWorkoutInstance, } from './geminiSchema';
export { _WorkoutBlockItemSchema, _WorkoutWorkItemSchema, _WorkoutBlockSchema, _WorkoutModificationSchema, _WorkoutSessionContextSchema, _WorkoutTargetMetricsSchema, _WorkoutSummarySchema, _EnhancedWorkoutInstanceSchema, _UpdatedWorkoutInstanceSchema, _WorkoutInstanceSchema, type WorkoutBlockItem, type WorkoutBlock, type WorkoutModification, type EnhancedWorkoutInstance, type UpdatedWorkoutInstance, } from './openAISchema';
export { FormattedWorkoutSchema, EnhancedFormattedWorkoutSchema, UpdatedFormattedWorkoutSchema, type FormattedWorkout, type EnhancedFormattedWorkout, type UpdatedFormattedWorkout, } from './formattedSchema';
export { SESSION_TYPE_MAP, DB_SESSION_TYPES, LLM_SESSION_TYPES, mapSessionType, isValidDBSessionType, type DBSessionType, type LLMSessionType, } from './sessionTypes';
/**
 * Supported model types for workout generation
 */
export type WorkoutModelType = 'gpt-5-nano' | 'gemini-2.5-flash' | 'gpt-4o' | 'gemini-2.5-flash-lite' | string;
/**
 * Schema bundle returned by getWorkoutSchemas
 */
export interface WorkoutSchemas {
    enhanced: z.ZodTypeAny;
    updated: z.ZodTypeAny;
    isGemini: boolean;
}
/**
 * Determines if a model is a Gemini model based on its name
 * @param model - The model identifier
 * @returns true if the model is a Gemini model
 */
export declare function isGeminiModel(model?: string): boolean;
/**
 * Returns the appropriate workout schemas based on the model type
 *
 * @param model - The model identifier (e.g., 'gemini-2.5-flash-lite', 'gpt-5-nano')
 * @returns Object containing the appropriate schemas for the model
 *
 * @example
 * ```typescript
 * const schemas = getWorkoutSchemas('gemini-2.5-flash-lite');
 * // Use schemas.enhanced for EnhancedWorkoutInstance
 * // Use schemas.updated for UpdatedWorkoutInstance (with modificationsApplied)
 * ```
 */
export declare function getWorkoutSchemas(model?: WorkoutModelType): WorkoutSchemas;
//# sourceMappingURL=index.d.ts.map