import { BaseRepository } from '@/server/repositories/baseRepository';
import type { NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
export declare class WorkoutInstanceRepository extends BaseRepository {
    /**
     * Create a new workout instance
     */
    create(data: NewWorkoutInstance): Promise<WorkoutInstance>;
    /**
     * Find workout instances for a client within a date range
     */
    findByClientIdAndDateRange(clientId: string, startDate: Date, endDate: Date): Promise<WorkoutInstance[]>;
    /**
     * Find a single workout instance by client ID and date
     */
    findByClientIdAndDate(clientId: string, date: Date): Promise<WorkoutInstance | undefined>;
    /**
     * Get recent workouts for a user
     * @param userId The user's ID
     * @param limit Number of workouts to return (default 10)
     */
    getRecentWorkouts(userId: string, limit?: number): Promise<WorkoutInstance[]>;
    /**
     * Get recent workouts for a user by date range
     * @param userId The user's ID
     * @param days Number of days to look back
     */
    getRecentWorkoutsByDays(userId: string, days?: number): Promise<WorkoutInstance[]>;
    /**
     * Get workout by specific date
     * @param userId The user's ID
     * @param date The specific date
     */
    getWorkoutByDate(userId: string, date: Date): Promise<WorkoutInstance | undefined>;
    /**
     * Update workout instance
     * @param id The workout ID
     * @param data The update data
     */
    update(id: string, data: Partial<NewWorkoutInstance>): Promise<WorkoutInstance | undefined>;
    /**
     * Delete old workout instances (cleanup)
     * @param daysToKeep Number of days to keep
     */
    deleteOldWorkouts(daysToKeep?: number): Promise<number>;
    /**
     * Get a workout by its ID
     * @param workoutId The workout's ID
     */
    getWorkoutById(workoutId: string): Promise<WorkoutInstance | undefined>;
    /**
     * Get workouts by microcycle
     * @param userId The user's ID
     * @param microcycleId The microcycle ID
     */
    getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]>;
    /**
     * Get workouts by date range for microcycle week view
     * @param userId The user's ID
     * @param startDate Start date of the week
     * @param endDate End date of the week
     */
    getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutInstance[]>;
    /**
     * Delete a workout instance by ID
     * @param workoutId The workout's ID
     */
    delete(workoutId: string): Promise<boolean>;
    /**
     * Find which users already have workouts for their respective "today"
     * Used for catch-up logic to avoid sending duplicate daily messages
     * @param userDatePairs Array of user IDs with their timezone-specific date ranges
     * @returns Set of user IDs that already have workouts
     */
    findUserIdsWithWorkoutsForUserDates(userDatePairs: Array<{
        userId: string;
        startOfDay: Date;
        endOfDay: Date;
    }>): Promise<Set<string>>;
}
//# sourceMappingURL=workoutInstanceRepository.d.ts.map