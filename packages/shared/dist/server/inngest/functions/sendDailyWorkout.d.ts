/**
 * Send Daily Workout Function (Inngest)
 *
 * Async function that generates and sends daily workout messages to users.
 * Triggered by the 'workout/scheduled' event from the cron job.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Generate workout (if needed) and message via DailyMessageService
 * 3. Send message via MessageService
 *
 * Benefits:
 * - Runs async (doesn't block cron)
 * - Automatic retries on failure (3 attempts)
 * - Step-by-step execution tracking
 * - Individual user isolation (one failure doesn't affect others)
 */
export declare const sendDailyWorkoutFunction: import("inngest").InngestFunction<Omit<import("inngest").InngestFunction.Options<import("inngest").Inngest<{
    id: string;
    name: string;
}>, import("inngest").InngestMiddleware.Stack, [{
    event: string;
}], import("inngest").Handler<import("inngest").Inngest<{
    id: string;
    name: string;
}>, string, {
    event: import("inngest").FailureEventPayload<import("inngest").EventPayload<any>>;
    logger: import("inngest").Logger;
    error: Error;
}>>, "triggers">, ({ event, step }: import("inngest").Context<import("inngest").Inngest<{
    id: string;
    name: string;
}>, string, {
    logger: import("inngest").Logger;
}>) => Promise<{
    success: boolean;
    userId: any;
    messageId: string | undefined;
    targetDate: any;
}>, import("inngest").Handler<import("inngest").Inngest<{
    id: string;
    name: string;
}>, string, {
    event: import("inngest").FailureEventPayload<import("inngest").EventPayload<any>>;
    logger: import("inngest").Logger;
    error: Error;
}>, import("inngest").Inngest<{
    id: string;
    name: string;
}>, import("inngest").InngestMiddleware.Stack, [{
    event: string;
}]>;
//# sourceMappingURL=sendDailyWorkout.d.ts.map