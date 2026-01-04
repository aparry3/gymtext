/**
 * Agent Prompt IDs
 *
 * Use these constants in createAgent calls and migrations.
 * TypeScript will catch typos at compile time.
 */
export declare const PROMPT_IDS: {
    readonly CHAT_GENERATE: "chat:generate";
    readonly PROFILE_FITNESS: "profile:fitness";
    readonly PROFILE_STRUCTURED: "profile:structured";
    readonly PROFILE_USER: "profile:user";
    readonly PLAN_GENERATE: "plan:generate";
    readonly PLAN_STRUCTURED: "plan:structured";
    readonly PLAN_MESSAGE: "plan:message";
    readonly PLAN_MODIFY: "plan:modify";
    readonly WORKOUT_GENERATE: "workout:generate";
    readonly WORKOUT_STRUCTURED: "workout:structured";
    readonly WORKOUT_MESSAGE: "workout:message";
    readonly WORKOUT_MODIFY: "workout:modify";
    readonly MICROCYCLE_GENERATE: "microcycle:generate";
    readonly MICROCYCLE_STRUCTURED: "microcycle:structured";
    readonly MICROCYCLE_MESSAGE: "microcycle:message";
    readonly MICROCYCLE_MODIFY: "microcycle:modify";
    readonly MODIFICATIONS_ROUTER: "modifications:router";
};
export declare const CONTEXT_IDS: {
    readonly WORKOUT_FORMAT_TRAINING: "workout:message:format:training";
    readonly WORKOUT_FORMAT_ACTIVE_RECOVERY: "workout:message:format:active_recovery";
    readonly WORKOUT_FORMAT_REST: "workout:message:format:rest";
    readonly MICROCYCLE_EXP_BEGINNER: "microcycle:generate:experience:beginner";
    readonly MICROCYCLE_EXP_INTERMEDIATE: "microcycle:generate:experience:intermediate";
    readonly MICROCYCLE_EXP_ADVANCED: "microcycle:generate:experience:advanced";
    readonly WORKOUT_EXP_BEGINNER: "workout:generate:experience:beginner";
    readonly WORKOUT_EXP_INTERMEDIATE: "workout:generate:experience:intermediate";
    readonly WORKOUT_EXP_ADVANCED: "workout:generate:experience:advanced";
};
export declare const PROMPT_ROLES: {
    readonly SYSTEM: "system";
    readonly USER: "user";
    readonly CONTEXT: "context";
};
export type PromptId = (typeof PROMPT_IDS)[keyof typeof PROMPT_IDS];
export type ContextId = (typeof CONTEXT_IDS)[keyof typeof CONTEXT_IDS];
export type PromptRole = (typeof PROMPT_ROLES)[keyof typeof PROMPT_ROLES];
//# sourceMappingURL=promptIds.d.ts.map