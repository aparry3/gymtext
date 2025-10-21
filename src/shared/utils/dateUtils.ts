/**
 * @deprecated This file is deprecated. Use '@/shared/utils/date' instead for all date operations.
 *
 * Migration guide:
 * - formatDate() → import { formatForUI } from '@/shared/utils/date'
 * - For other date operations, see @/shared/utils/date
 *
 * Only getDatesUntilSaturday remains here temporarily. Consider migrating to date utils.
 */

/**
 * Get all dates from startDate until the next Saturday (inclusive)
 * @deprecated Consider migrating to a more generic date utility in @/shared/utils/date
 */
export function getDatesUntilSaturday(startDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate); // Create a copy to avoid modifying the original

  // Ensure the loop runs until Saturday (day 6, where Sunday is 0)
  while (currentDate.getDay() !== 6) {
    dates.push(new Date(currentDate)); // Push a copy of the current date
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  dates.push(new Date(currentDate)); // Add Saturday

  return dates;
}