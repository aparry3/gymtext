import { formatForAI } from '@/shared/utils/date';
/**
 * Build date/timezone context string
 *
 * @param timezone - User's timezone (IANA format)
 * @param date - Date to format (defaults to now)
 * @returns Formatted context string with XML tags
 */
export const buildDateContext = (timezone, date) => {
    const effectiveTimezone = timezone || 'America/New_York';
    const effectiveDate = date || new Date();
    const formattedDate = formatForAI(effectiveDate, effectiveTimezone);
    return `<DateContext>
Today is ${formattedDate}.
Timezone: ${effectiveTimezone}
</DateContext>`;
};
