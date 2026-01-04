/**
 * Send Weekly Message Function (Inngest)
 *
 * Async function that sends weekly check-in messages to users.
 * Triggered by the 'weekly/scheduled' event from the cron job.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Advance user's progress to next week
 * 3. Generate next week's microcycle pattern
 * 4. Generate and send messages via WeeklyMessageService
 *
 * Benefits:
 * - Runs async (doesn't block cron)
 * - Automatic retries on failure (3 attempts)
 * - Step-by-step execution tracking
 * - Individual user isolation (one failure doesn't affect others)
 */
export declare const sendWeeklyMessageFunction: import("inngest").InngestFunction<Omit<import("inngest").InngestFunction.Options<import("inngest").Inngest<{
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
    messageIds: string[] | undefined;
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
//# sourceMappingURL=sendWeeklyMessage.d.ts.map