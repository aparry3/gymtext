import { cookies } from 'next/headers';
import { getAdminContext } from './context';

/**
 * Get the admin's phone number from the session cookie.
 * Returns null if not authenticated.
 */
export async function getAdminPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('gt_admin');
  return adminCookie?.value || null;
}

/**
 * Get the program owner ID for the current admin.
 * Looks up the program_owners table by the admin's phone number.
 * Returns null if the admin has no program owner record.
 */
export async function getAdminOwnerId(): Promise<string | null> {
  const phone = await getAdminPhone();
  if (!phone) return null;

  const { repos } = await getAdminContext();
  const owner = await repos.programOwner.findByPhone(phone);
  return owner?.id || null;
}
