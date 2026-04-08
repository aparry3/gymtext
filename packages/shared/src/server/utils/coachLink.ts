/**
 * Build a per-user Calendly URL for a program's coach.
 *
 * Strategy:
 * - Prefill name + email so the booking form is mostly filled in for UX.
 * - Append UTM params (utm_source, utm_medium, utm_campaign, utm_content) so
 *   we can attribute bookings back to the GymText user via the Calendly webhook.
 *   UTM params are not user-editable on Calendly's form, so attribution via
 *   `utm_content` (= GymText user id) is reliable.
 *
 * Returns null if the program doesn't have scheduling enabled or no URL set.
 */
export interface CoachLinkUserInput {
  id: string;
  name: string;
  email: string | null;
}

export interface CoachLinkProgramInput {
  schedulingEnabled: boolean;
  schedulingUrl: string | null;
}

export function buildCoachLink(
  user: CoachLinkUserInput,
  program: CoachLinkProgramInput,
): string | null {
  if (!program.schedulingEnabled || !program.schedulingUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(program.schedulingUrl);
  } catch {
    return null;
  }

  if (user.name) url.searchParams.set('name', user.name);
  if (user.email) url.searchParams.set('email', user.email);
  url.searchParams.set('utm_source', 'gymtext');
  url.searchParams.set('utm_medium', 'sms');
  url.searchParams.set('utm_campaign', 'coach_link');
  url.searchParams.set('utm_content', user.id);

  return url.toString();
}
