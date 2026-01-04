import { UserWithProfile } from '@/server/models/user';
interface MessageResult {
    success: boolean;
    userId: string;
    error?: string;
    messageIds?: string[];
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
export declare class WeeklyMessageService {
    private static instance;
    private userService;
    private messageService;
    private progressService;
    private microcycleService;
    private fitnessPlanService;
    private constructor();
    static getInstance(): WeeklyMessageService;
    /**
     * Schedules weekly messages for all users in a given UTC hour on Sunday
     * Returns metrics about the scheduling operation
     */
    scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult>;
    /**
     * Sends weekly check-in messages to a single user
     *
     * Flow:
     * 1. Calculate next Sunday's date in user's timezone
     * 2. Get progress for next week using date-based calculation
     * 3. Get/create next week's microcycle
     * 4. Check if it's a deload week
     * 5. Generate personalized feedback message using AI agent
     * 6. Retrieve breakdown message from stored microcycle.message
     * 7. Send both messages with delay
     */
    sendWeeklyMessage(user: UserWithProfile): Promise<MessageResult>;
}
export declare const weeklyMessageService: WeeklyMessageService;
export {};
//# sourceMappingURL=weeklyMessageService.d.ts.map