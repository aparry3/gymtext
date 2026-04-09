import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ProgramVersions } from './_types';

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
  /**
   * Program-specific formatting guidance entries. Each format has a title,
   * an instruction, and optional few-shot example messages. All defined
   * formats are injected into the `workout:format` agent context (via
   * MarkdownService under the `programFormat` key) so sport-specific
   * programs can shape how individual day messages are rendered. A program
   * can define multiple formats (e.g. "Practice Day" vs "Game Day").
   */
  formats?: ProgramFormat[];
  /** Supporting materials */
  resources?: {
    /** Uploaded PDFs, spreadsheets */
    fileRefs?: string[];
    /** Exercise demos, etc. */
    imageRefs?: string[];
  };
}

/**
 * A single formatting guidance entry for a program version.
 *
 * Rendered into the `workout:format` agent context under `## Program
 * Formatting Guidance` → `### {title}`, with instruction text and any
 * example messages. Empty entries (no instruction and no examples) are
 * skipped at render time.
 */
export interface ProgramFormat {
  /** Human label, e.g. "Daily Message Format" or "Game Day" */
  title: string;
  /** The actual guidance the agent should apply */
  instruction: string;
  /** Few-shot example messages illustrating the format */
  examples: string[];
}

/**
 * Custom question for program enrollment
 *
 * Program owners can define custom questions to collect from users
 * during the enrollment process.
 */
export interface ProgramQuestion {
  /** Unique identifier for this question */
  id: string;
  /** The question text to display to users */
  questionText: string;
  /** Type of input to collect */
  questionType: 'text' | 'select' | 'multiselect' | 'scale' | 'boolean';
  /** Options for select/multiselect question types */
  options?: string[];
  /** Whether this question must be answered */
  isRequired: boolean;
  /** Optional help text to clarify the question */
  helpText?: string;
  /** Order in which to display this question */
  sortOrder: number;
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
 * For coach programs, it contains content (markdown).
 */
export interface ProgramVersion {
  id: string;
  programId: string;
  versionNumber: number;
  status: ProgramVersionStatus;
  /** Content for coach-created programs */
  content: string | null;
  /** Configuration for AI plan generation */
  generationConfig: GenerationConfig | null;
  /** Default duration for fixed-length programs */
  defaultDurationWeeks: number | null;
  /** Difficulty/requirements metadata */
  difficultyMetadata: DifficultyMetadata | null;
  /** Custom questions for enrollment */
  questions: ProgramQuestion[] | null;
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
      content: row.content,
      generationConfig: row.generationConfig as GenerationConfig | null,
      defaultDurationWeeks: row.defaultDurationWeeks,
      difficultyMetadata: row.difficultyMetadata as DifficultyMetadata | null,
      questions: row.questions as ProgramQuestion[] | null,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      publishedAt: row.publishedAt ? new Date(row.publishedAt as unknown as string | number | Date) : null,
      archivedAt: row.archivedAt ? new Date(row.archivedAt as unknown as string | number | Date) : null,
    };
  }
}

/** Well-known program version IDs */
export const AI_PROGRAM_VERSION_ID = '00000000-0000-0000-0000-000000000003';
