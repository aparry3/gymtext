/**
 * Maps LLM-generated session types to database-compatible session types
 *
 * Database expects: 'strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'
 * LLM generates: 'run', 'lift', 'metcon', 'mobility', 'rest', 'other'
 */
export declare const SESSION_TYPE_MAP: Record<string, string>;
export declare const DB_SESSION_TYPES: readonly ["strength", "cardio", "mobility", "recovery", "assessment", "deload"];
export type DBSessionType = typeof DB_SESSION_TYPES[number];
export declare const LLM_SESSION_TYPES: readonly ["run", "lift", "metcon", "mobility", "rest", "other"];
export type LLMSessionType = typeof LLM_SESSION_TYPES[number];
/**
 * Maps an LLM session type to a database-compatible session type
 * @param llmSessionType The session type from LLM
 * @returns The corresponding database session type
 */
export declare function mapSessionType(llmSessionType: string): DBSessionType;
/**
 * Validates if a session type is valid for the database
 * @param sessionType The session type to validate
 * @returns True if valid for database
 */
export declare function isValidDBSessionType(sessionType: string): sessionType is DBSessionType;
//# sourceMappingURL=sessionTypes.d.ts.map