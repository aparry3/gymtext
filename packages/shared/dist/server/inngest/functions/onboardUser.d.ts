/**
 * Onboard User Function (Inngest)
 *
 * Async function that processes user onboarding after signup.
 * Triggered by 'user/onboarding.requested' event from signup API.
 *
 * Uses a "get or create" pattern for each step:
 * - If data exists, returns it immediately (cached by Inngest)
 * - If not, creates it via LLM
 *
 * When forceCreate=true (for re-onboarding subscribed users):
 * - Always creates new profile, plan, microcycle, workout
 * - Old data is preserved for history
 *
 * This makes the flow idempotent - running multiple times produces same result.
 *
 * Data Flow:
 * Step 1 (loadData) → { initialUser, signupData }
 * Step 2 (profile)  → { user } (with profile)
 * Step 3 (plan)     → { plan }
 * Step 4 (microcycle) → { microcycle }
 * Step 5 (workout)  → { workout }
 * Step 6 (markCompleted)
 * Step 7 (sendMessages)
 */
export declare const onboardUserFunction: import("inngest").InngestFunction<Omit<import("inngest").InngestFunction.Options<import("inngest").Inngest<{
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
    messagesSent: boolean;
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
//# sourceMappingURL=onboardUser.d.ts.map