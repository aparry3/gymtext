/**
 * Retry Message Function (Inngest)
 *
 * Async function that retries failed message deliveries with exponential backoff.
 * Triggered by the 'message/delivery-failed' event from the status callback.
 *
 * Flow:
 * 1. Check delivery attempts (max 4)
 * 2. Wait using step.sleepUntil() with backoff (immediate, 5min, 30min)
 * 3. Retry sending the message
 * 4. Increment delivery attempts
 *
 * Benefits:
 * - Non-blocking sleep (no server capacity used)
 * - Custom backoff schedule
 * - Automatic tracking of attempts
 */
export declare const retryMessageFunction: import("inngest").InngestFunction<Omit<import("inngest").InngestFunction.Options<import("inngest").Inngest<{
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
    attempt: number;
    providerMessageId: string;
    success: boolean;
} | {
    success: boolean;
    reason: string;
    attempts: number;
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
//# sourceMappingURL=retryMessage.d.ts.map