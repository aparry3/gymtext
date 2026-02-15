/**
 * Context Template Model
 *
 * Represents versioned templates for context providers.
 * Insert-only design enables version history.
 */

import type { Insertable, Selectable } from 'kysely';
import type { ContextTemplates } from './_types';

export type ContextTemplate = Selectable<ContextTemplates>;
export type NewContextTemplate = Insertable<ContextTemplates>;
