import type { JsonValue, WorkoutInstances } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;
export * from '@/shared/types/workout';
export declare class WorkoutInstanceModel implements NewWorkoutInstance {
    clientId: string;
    microcycleId: string | null | undefined;
    sessionType: string;
    createdAt: Date | string | undefined;
    date: Date | string;
    id: string | undefined;
    updatedAt: Date | string | undefined;
    goal: string | null | undefined;
    details: JsonValue;
    completedAt: Date | string | null | undefined;
    constructor(workoutInstance: NewWorkoutInstance);
}
//# sourceMappingURL=workout.d.ts.map