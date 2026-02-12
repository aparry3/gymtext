/**
 * Build day overview context content (raw, without XML wrapper)
 *
 * @param dayOverview - Day instruction/overview from microcycle
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildDayOverviewContext = (dayOverview: string | undefined): string => {
  if (!dayOverview || dayOverview.trim().length === 0) {
    return 'No day instruction provided';
  }
  return dayOverview.trim();
};
