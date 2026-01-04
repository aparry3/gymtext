/**
 * Build training metadata context string
 *
 * @param data - Training metadata (isDeload, week numbers)
 * @returns Formatted context string with XML tags, or empty string if no data
 */
export const buildTrainingMetaContext = (data) => {
    const parts = [];
    if (data.isDeload !== undefined) {
        parts.push(`Is Deload Week: ${data.isDeload}`);
    }
    if (data.absoluteWeek !== undefined) {
        parts.push(`Absolute Week: ${data.absoluteWeek}`);
    }
    if (data.currentWeek !== undefined) {
        parts.push(`Current Week: ${data.currentWeek}`);
    }
    if (parts.length === 0) {
        return '';
    }
    return `<TrainingMeta>${parts.join(' | ')}</TrainingMeta>`;
};
