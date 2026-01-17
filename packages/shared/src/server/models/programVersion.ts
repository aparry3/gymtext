import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ProgramVersions } from './_types';
import type { PlanStructure } from './fitnessPlan';

export type ProgramVersionDB = Selectable<ProgramVersions>;
export type NewProgramVersion = Insertable<ProgramVersions>;
export type ProgramVersionUpdate = Updateable<ProgramVersions>;

export type ProgramVersionStatus = 'draft' | 'published' | 'archived';

/**
 * Generation configuration for AI-generated plans
 *
 * This flexible structure supports future evolution of generation prompts
 */
export interface GenerationConfig {
  /** References to prompts table for chain execution */
  promptIds?: string[];
  /** Optional inline prompt overrides */
  promptOverrides?: {
    system?: string;
    user?: string;
  };
  /** Contextual guidance for generation */
  context?: {
    /** Areas to emphasize (e.g., "olympic lifting", "mobility") */
    emphasis?: string[];
    /** Hard constraints (e.g., "no running", "home equipment only") */
    constraints?: string[];
    /** Tone/style (e.g., "concise", "detailed", "motivational") */
    style?: string;
  };
  /** Supporting materials */
  resources?: {
    /** Uploaded PDFs, spreadsheets */
    fileRefs?: string[];
    /** Exercise demos, etc. */
    imageRefs?: string[];
  };
}

/**
 * Difficulty metadata for program versions
 */
export interface DifficultyMetadata {
  /** Minimum experience level required */
  minExperienceLevel?: string;
  /** Maximum experience level (for beginner programs) */
  maxExperienceLevel?: string;
  /** Estimated intensity (1-10) */
  intensityScore?: number;
  /** Required equipment */
  requiredEquipment?: string[];
  /** Estimated weekly time commitment in hours */
  weeklyHoursEstimate?: number;
}

/**
 * Program Version - the "recipe" for generating user plans
 *
 * A program version represents a specific version of a program template.
 * For AI programs, it contains generation_config for personalizing plans.
 * For coach programs, it contains template_markdown and template_structured.
 */
export interface ProgramVersion {
  id: string;
  programId: string;
  versionNumber: number;
  status: ProgramVersionStatus;
  /** Raw markdown template for coach-created programs */
  templateMarkdown: string | null;
  /** Parsed structured plan data for UI rendering */
  templateStructured: PlanStructure | null;
  /** Configuration for AI plan generation */
  generationConfig: GenerationConfig | null;
  /** Default duration for fixed-length programs */
  defaultDurationWeeks: number | null;
  /** Difficulty/requirements metadata */
  difficultyMetadata: DifficultyMetadata | null;
  createdAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

export class ProgramVersionModel {
  static fromDB(row: ProgramVersionDB): ProgramVersion {
    return {
      id: row.id,
      programId: row.programId,
      versionNumber: row.versionNumber,
      status: row.status as ProgramVersionStatus,
      templateMarkdown: row.templateMarkdown,
      templateStructured: row.templateStructured as PlanStructure | null,
      generationConfig: row.generationConfig as GenerationConfig | null,
      defaultDurationWeeks: row.defaultDurationWeeks,
      difficultyMetadata: row.difficultyMetadata as DifficultyMetadata | null,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      publishedAt: row.publishedAt ? new Date(row.publishedAt as unknown as string | number | Date) : null,
      archivedAt: row.archivedAt ? new Date(row.archivedAt as unknown as string | number | Date) : null,
    };
  }
}

/** Well-known program version IDs */
export const AI_PROGRAM_VERSION_ID = '00000000-0000-0000-0000-000000000003';
