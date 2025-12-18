/**
 * Build change request context string
 *
 * @param changeRequest - User's modification request
 * @returns Formatted context string with XML tags, or empty string if no request
 */
export const buildChangeRequestContext = (changeRequest: string | undefined): string => {
  if (!changeRequest || changeRequest.trim().length === 0) {
    return '';
  }

  return `<ChangeRequest>${changeRequest.trim()}</ChangeRequest>`;
};
