import { Kysely } from 'kysely';

/**
 * Migration: Update Mesocycle Schema
 *
 * This migration documents the schema evolution for mesocycles in fitness_plans.
 * The mesocycles column is already JSON/JSONB, so no structural database changes are needed.
 *
 * Schema changes:
 * - Old mesocycle format: { name, weeks, focus, deload }
 * - New mesocycle format: { name, objective, focus, durationWeeks, startWeek, endWeek,
 *   volumeTrend, intensityTrend, conditioningFocus, weeklyVolumeTargets, avgRIRRange,
 *   keyThemes, longFormDescription, microcycles[] }
 *
 * The application code supports both formats for backward compatibility.
 */

export async function up(db: Kysely<any>): Promise<void> {
  // No database schema changes required - JSON column already supports the new structure
  // This migration serves as documentation of the schema evolution
  console.log('Mesocycle schema updated in application code - no DB changes needed');
}

export async function down(db: Kysely<any>): Promise<void> {
  // No database schema changes to rollback
  console.log('No DB changes to rollback - mesocycle schema managed at application level');
}
