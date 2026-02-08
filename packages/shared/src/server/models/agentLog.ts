/**
 * Agent Log Model
 *
 * Stores every agent invocation (full message chain + response)
 * for review, debugging, and self-improvement.
 */

import type { Insertable, Selectable } from 'kysely';
import type { AgentLogs } from './_types';

export type AgentLog = Selectable<AgentLogs>;
export type NewAgentLog = Insertable<AgentLogs>;
