import type { ProgramVersion } from '@/server/models/programVersion';

/**
 * Build program version context string
 *
 * Wraps the freeform program content (templateMarkdown) in XML tags
 * for injection into agent context.
 *
 * @param programVersion - Program version with template content
 * @returns Formatted context string with XML tags, or empty string if no content
 */
export const buildProgramVersionContext = (
  programVersion: ProgramVersion | null | undefined
): string => {
  if (!programVersion?.templateMarkdown) {
    return '';
  }

  let content = '<ProgramVersion>\n';
  content += programVersion.templateMarkdown.trim();
  content += '\n</ProgramVersion>';
  return content;
};
