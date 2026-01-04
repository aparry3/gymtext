import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { Microcycle } from '@/server/models/microcycle';
import { DateTime } from 'luxon';
export declare class WorkoutInstanceService {
    private static instance;
    private workoutRepo;
    private fitnessPlanService;
    private progressService;
    private microcycleService;
    private constructor();
    static getInstance(): WorkoutInstanceService;
    /**
     * Get recent workouts for a user
     */
    getRecentWorkouts(userId: string, limit?: number): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    }[]>;
    /**
     * Get workouts by date range
     */
    getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    }[]>;
    /**
     * Get a specific workout by ID and verify it belongs to the user
     */
    getWorkoutById(workoutId: string, userId: string): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    } | null>;
    /**
     * Get a workout by ID without authorization check
     * For internal service-to-service use only
     */
    getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined>;
    /**
     * Get a workout by user ID and date
     */
    getWorkoutByUserIdAndDate(userId: string, date: Date): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    } | undefined>;
    /**
     * Update the message for a workout
     */
    updateWorkoutMessage(workoutId: string, message: string): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    } | undefined>;
    /**
     * Create a new workout instance
     */
    createWorkout(workout: NewWorkoutInstance): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    }>;
    /**
     * Update a workout with new details, description, reasoning, and message
     */
    updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate): Promise<{
        message: string | null;
        id: string;
        description: string | null;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reasoning: string | null;
        completedAt: Date | null;
        details: import("../..").JsonValue;
        goal: string | null;
        microcycleId: string | null;
        sessionType: string;
        structured: import("../..").JsonValue;
    } | undefined>;
    /**
     * Generate a workout for a specific date using AI
     *
     * This is the core business logic for workout generation:
     * 1. Gets user's fitness plan and current progress
     * 2. Determines day pattern from microcycle
     * 3. Generates workout using AI agent
     * 4. Saves workout with pre-generated message
     * 5. Creates short link and appends to message
     *
     * @param user - User with profile
     * @param targetDate - Date to generate workout for
     * @param providedMicrocycle - Optional pre-loaded microcycle (avoids extra DB query)
     * @returns Generated and saved workout instance
     */
    generateWorkoutForDate(user: UserWithProfile, targetDate: DateTime, providedMicrocycle?: Microcycle): Promise<WorkoutInstance | null>;
    /**
     * Maps theme to session type for database storage
     * Valid frontend types: run, lift, metcon, mobility, rest, other
     */
    private mapThemeToSessionType;
    /**
     * Delete a workout instance
     */
    deleteWorkout(workoutId: string, userId: string): Promise<boolean>;
    /**
     * Get workouts by microcycle ID
     */
    getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]>;
}
export declare const workoutInstanceService: WorkoutInstanceService;
//# sourceMappingURL=workoutInstanceService.d.ts.map