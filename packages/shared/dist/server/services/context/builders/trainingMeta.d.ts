/**
 * Training metadata input for context builder
 */
export interface TrainingMetaInput {
    isDeload?: boolean;
    absoluteWeek?: number;
    currentWeek?: number;
}
/**
 * Build training metadata context string
 *
 * @param data - Training metadata (isDeload, week numbers)
 * @returns Formatted context string with XML tags, or empty string if no data
 */
export declare const buildTrainingMetaContext: (data: TrainingMetaInput) => string;
//# sourceMappingURL=trainingMeta.d.ts.map