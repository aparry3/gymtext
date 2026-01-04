/**
 * Build day overview context string
 *
 * @param dayOverview - Day instruction/overview from microcycle
 * @returns Formatted context string with XML tags
 */
export const buildDayOverviewContext = (dayOverview) => {
    if (!dayOverview || dayOverview.trim().length === 0) {
        return '<DayOverview>No day instruction provided</DayOverview>';
    }
    return `<DayOverview>${dayOverview.trim()}</DayOverview>`;
};
