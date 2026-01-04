import { UserWithProfile } from '@/server/models/user';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
interface MessageResult {
    success: boolean;
    userId: string;
    error?: string;
    messageId?: string;
}
interface SchedulingResult {
    scheduled: number;
    failed: number;
    duration: number;
    errors: Array<{
        userId: string;
        error: string;
    }>;
}
export declare class DailyMessageService {
    private static instance;
    private userService;
    private workoutInstanceService;
    private workoutInstanceRepository;
    private messageService;
    private batchSize;
    private constructor();
    static getInstance(batchSize?: number): DailyMessageService;
    /**
     * Schedules daily messages for all users in a given UTC hour
     * Returns metrics about the scheduling operation
     *
     * This method uses catch-up logic: it schedules messages for users whose
     * preferred send hour has already passed today AND who haven't received
     * their workout message yet (no workout instance exists for today).
     */
    scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult>;
    /**
     * Sends a daily message to a single user
     */
    sendDailyMessage(user: UserWithProfile): Promise<MessageResult>;
    /**
     * Gets today's workout for a user
     */
    getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null>;
    /**
     * Generates a workout for a specific date (wrapper for onboarding)
     * Delegates to WorkoutInstanceService for business logic
     */
    generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutInstance | null>;
}
export declare const dailyMessageService: DailyMessageService;
export {};
//# sourceMappingURL=dailyMessageService.d.ts.map