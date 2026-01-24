/**
 * Movement Model Types
 *
 * Type definitions for canonical movements used for progress tracking.
 * Movements group related exercises (e.g., all squat variations → "squat" movement).
 */

import type { Selectable, Insertable, Updateable } from 'kysely';
import type { Movements } from './_types';

export type Movement = Selectable<Movements>;
export type NewMovement = Insertable<Movements>;
export type MovementUpdate = Updateable<Movements>;

export type MetricType = 'strength' | 'reps_only' | 'cardio_distance' | 'cardio_duration';
