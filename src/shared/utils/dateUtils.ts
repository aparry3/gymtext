export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

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