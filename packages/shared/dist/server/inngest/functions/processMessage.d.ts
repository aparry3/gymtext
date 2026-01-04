/**
 * Process Message Function (Inngest)
 *
 * Async function that processes inbound messages and generates responses.
 * Triggered by the 'message/received' event from the SMS webhook.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Generate response using ChatService (can be slow)
 * 3. Send response via MessageService
 *
 * Benefits:
 * - Runs async (doesn't block webhook)
 * - Automatic retries on failure
 * - Step-by-step execution tracking
 * - Can send multiple messages over time
 */
export declare const processMessageFunction: import("inngest").InngestFunction<Omit<import("inngest").InngestFunction.Options<import("inngest").Inngest<{
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
    messageIds: string[];
    messageCount: number;
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
//# sourceMappingURL=processMessage.d.ts.map