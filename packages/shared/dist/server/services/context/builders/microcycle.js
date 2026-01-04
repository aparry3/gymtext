/**
 * Build current microcycle context string
 *
 * @param microcycle - Current microcycle data
 * @returns Formatted context string with XML tags
 */
export const buildMicrocycleContext = (microcycle) => {
    if (!microcycle) {
        return '<CurrentMicrocycle>No microcycle available</CurrentMicrocycle>';
    }
    // Format days array for context
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysFormatted = (microcycle.days || [])
        .map((day, index) => `${dayNames[index]}: ${day}`)
        .join('\n');
    return `<CurrentMicrocycle>
Week Overview: ${microcycle.description || 'N/A'}
Is Deload: ${microcycle.isDeload}
Absolute Week: ${microcycle.absoluteWeek}
Days:
${daysFormatted}
</CurrentMicrocycle>`;
};
