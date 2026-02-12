/**
 * Agent Extension Model
 *
 * Represents versioned instructional extensions tied to agent definitions.
 * Insert-only design enables version history.
 */

import type { Insertable, Selectable } from 'kysely';
import type { AgentExtensions } from './_types';

export type AgentExtension = Selectable<AgentExtensions>;
export type NewAgentExtension = Insertable<AgentExtensions>;
