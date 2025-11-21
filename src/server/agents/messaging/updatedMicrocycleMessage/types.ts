import type { AgentDeps } from '@/server/agents/base';
import type { DayOfWeek } from '@/shared/utils/date';
import type { MicrocycleGenerationOutput } from '@/server/agents/training/microcycles/steps/generation/types';
import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Input for updated microcycle message agent
 * Used when a microcycle has been modified and we need to notify the user
 */
export interface UpdatedMicrocycleMessageInput {
  /** The modified microcycle with updated day overviews */
  modifiedMicrocycle: MicrocycleGenerationOutput;

  /** Explanation of what changed (from modify agent) */
  modifications: string;

  /** Current day of week to determine which days to show */
  currentWeekday: DayOfWeek;

  /** Optional user for personalization */
  user?: UserWithProfile;
}

/**
 * Output from updated microcycle message agent
 */
export type UpdatedMicrocycleMessageOutput = string;

/**
 * Dependencies for updated microcycle message agent
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdatedMicrocycleMessageAgentDeps extends AgentDeps {
  // Future: Could add SMS formatting service or message templates
}
