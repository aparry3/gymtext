import type { ProgramVersion } from '@/server/models/programVersion';

/**
 * Build program version context content (raw, without XML wrapper)
 *
 * @param programVersion - Program version with template content
 * @returns Raw content string (XML wrapper applied by template), or empty string if no content
 */
export const buildProgramVersionContext = (
  programVersion: ProgramVersion | null | undefined
): string => {
  if (!programVersion?.templateMarkdown) {
    return '';
  }

  return programVersion.templateMarkdown.trim();
};
