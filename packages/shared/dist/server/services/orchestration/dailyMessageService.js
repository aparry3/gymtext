import { MessageService } from '../messaging/messageService';
import { UserService } from '../user/userService';
import { now } from '@/shared/utils/date';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { inngest } from '@/server/connections/inngest/client';
import { messageQueueService } from '../messaging/messageQueueService';
import { getUrlsConfig } from '@/shared/config';
import { dayConfigService } from '../calendar/dayConfigService';
export class DailyMessageService {
    static instance;
    userService;
    workoutInstanceService;
    workoutInstanceRepository;
    messageService;
    batchSize;
    constructor(batchSize = 10) {
        this.userService = UserService.getInstance();
        this.workoutInstanceService = WorkoutInstanceService.getInstance();
        this.workoutInstanceRepository = new WorkoutInstanceRepository();
        this.messageService = MessageService.getInstance();
        this.batchSize = batchSize;
    }
    static getInstance(batchSize = 10) {
        if (!DailyMessageService.instance) {
            DailyMessageService.instance = new DailyMessageService(batchSize);
        }
        return DailyMessageService.instance;
    }
    /**
     * Schedules daily messages for all users in a given UTC hour
     * Returns metrics about the scheduling operation
     *
     * This method uses catch-up logic: it schedules messages for users whose
     * preferred send hour has already passed today AND who haven't received
     * their workout message yet (no workout instance exists for today).
     */
    async scheduleMessagesForHour(utcHour) {
        const startTime = Date.now();
        const errors = [];
        let scheduled = 0;
        let failed = 0;
        try {
            // Get candidate users (those whose local hour >= preferredSendHour)
            const candidateUsers = await this.userService.getUsersForHour(utcHour);
            console.log(`[DailyMessageService] Found ${candidateUsers.length} candidate users for hour ${utcHour}`);
            if (candidateUsers.length === 0) {
                return {
                    scheduled: 0,
                    failed: 0,
                    duration: Date.now() - startTime,
                    errors: []
                };
            }
            // Build user-specific date ranges (each user's "today" based on their timezone)
            const userDatePairs = candidateUsers.map(user => {
                const todayStart = now(user.timezone).startOf('day').toJSDate();
                const todayEnd = now(user.timezone).startOf('day').plus({ days: 1 }).toJSDate();
                return { userId: user.id, startOfDay: todayStart, endOfDay: todayEnd };
            });
            // Batch-check which users already have workouts for their "today"
            const userIdsWithWorkouts = await this.workoutInstanceRepository
                .findUserIdsWithWorkoutsForUserDates(userDatePairs);
            // Filter to only users WITHOUT workouts (they haven't been sent yet)
            const usersToSchedule = candidateUsers.filter(u => !userIdsWithWorkouts.has(u.id));
            console.log(`[DailyMessageService] ${userIdsWithWorkouts.size} users already have workouts, scheduling ${usersToSchedule.length} users`);
            if (usersToSchedule.length === 0) {
                return {
                    scheduled: 0,
                    failed: 0,
                    duration: Date.now() - startTime,
                    errors: []
                };
            }
            // Map users to Inngest events
            const events = usersToSchedule.map(user => {
                // Get target date in user's timezone (today at start of day)
                const targetDate = now(user.timezone)
                    .startOf('day')
                    .toISO();
                return {
                    name: 'workout/scheduled',
                    data: {
                        userId: user.id,
                        targetDate,
                    },
                };
            });
            // Send all events to Inngest in batch
            try {
                const { ids } = await inngest.send(events);
                scheduled = ids.length;
                console.log(`[DailyMessageService] Scheduled ${scheduled} Inngest jobs`);
            }
            catch (error) {
                console.error('[DailyMessageService] Failed to schedule Inngest jobs:', error);
                failed = events.length;
                errors.push({
                    userId: 'batch',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
            return {
                scheduled,
                failed,
                duration: Date.now() - startTime,
                errors
            };
        }
        catch (error) {
            console.error('[DailyMessageService] Error scheduling messages:', error);
            throw error;
        }
    }
    /**
     * Sends a daily message to a single user
     */
    async sendDailyMessage(user) {
        try {
            console.log(`Processing daily message for user ${user.id}`);
            // Get today's date in the user's timezone
            const targetDate = now(user.timezone).startOf('day');
            // First try to get existing workout
            let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());
            // If no workout exists, generate it on-demand
            if (!workout) {
                console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
                workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
                if (!workout) {
                    console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
                    return {
                        success: false,
                        userId: user.id,
                        error: 'Could not generate workout for today'
                    };
                }
            }
            // Extract message content (either pre-generated or need to generate)
            let workoutMessage;
            if ('message' in workout && workout.message) {
                workoutMessage = workout.message;
            }
            else if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
                // Fallback: Generate message if needed (shouldn't happen in production)
                const { workoutAgentService } = await import('@/server/services/agents/training');
                const messageAgent = await workoutAgentService.getMessageAgent();
                const result = await messageAgent.invoke(workout.description);
                workoutMessage = result.response;
            }
            else {
                throw new Error('Workout missing required fields for message generation');
            }
            // Send single message with both image and text
            // Check for day-specific custom image first
            const customImageUrl = await dayConfigService.getImageUrlForDate(targetDate.toJSDate());
            let mediaUrls;
            if (customImageUrl) {
                // Use day-specific custom image (e.g., holiday themed)
                mediaUrls = [customImageUrl];
                console.log(`Using custom day image for ${targetDate.toISODate()}`);
            }
            else {
                // Fall back to default logo
                const { publicBaseUrl, baseUrl } = getUrlsConfig();
                const resolvedBaseUrl = publicBaseUrl || baseUrl;
                mediaUrls = resolvedBaseUrl ? [`${resolvedBaseUrl}/OpenGraphGymtext.png`] : undefined;
                if (!resolvedBaseUrl) {
                    console.warn('BASE_URL not configured - sending workout without logo image');
                }
            }
            const queuedMessages = [{
                    content: workoutMessage,
                    mediaUrls
                }];
            await messageQueueService.enqueueMessages(user.id, queuedMessages, 'daily');
            console.log(`Successfully queued daily messages for user ${user.id}`);
            return {
                success: true,
                userId: user.id,
                messageId: undefined // Messages will be sent asynchronously by queue
            };
        }
        catch (error) {
            console.error(`Error sending daily message to user ${user.id}:`, error);
            return {
                success: false,
                userId: user.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Gets today's workout for a user
     */
    async getTodaysWorkout(userId, date) {
        // The date passed in is already the correct date at midnight in the user's timezone
        // We can use it directly for the query
        const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
        console.log(`Workout: ${workout}`);
        return workout || null;
    }
    /**
     * Generates a workout for a specific date (wrapper for onboarding)
     * Delegates to WorkoutInstanceService for business logic
     */
    async generateWorkout(user, targetDate) {
        return this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
    }
}
// Export singleton instance
export const dailyMessageService = DailyMessageService.getInstance();
