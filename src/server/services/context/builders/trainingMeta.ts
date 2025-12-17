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
export const buildTrainingMetaContext = (data: TrainingMetaInput): string => {
  const parts: string[] = [];

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
