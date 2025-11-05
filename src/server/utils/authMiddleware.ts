import { NextRequest } from 'next/server';
import { decryptUserId } from './sessionCrypto';

/**
 * Authorization result from checking request credentials
 */
export interface AuthResult {
  isAuthorized: boolean;
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}

/**
 * Check if a request is authorized to access a specific user's data
 *
 * Authorization rules:
 * - Admin (gt_admin cookie) can access any user
 * - Regular user (gt_user_session cookie) can only access their own data
 *
 * @param request - The Next.js request object
 * @param requestedUserId - The user ID being requested
 * @returns AuthResult with authorization status
 */
export function checkAuthorization(
  request: NextRequest,
  requestedUserId: string
): AuthResult {
  // Check if user is admin
  const isAdmin = request.cookies.get('gt_admin')?.value === 'ok';

  if (isAdmin) {
    return {
      isAuthorized: true,
      isAdmin: true,
      userId: null, // Admin doesn't have a specific user ID
    };
  }

  // Check if user has a valid session
  const userSession = request.cookies.get('gt_user_session')?.value;

  if (!userSession) {
    return {
      isAuthorized: false,
      isAdmin: false,
      userId: null,
      error: 'No authentication credentials provided',
    };
  }

  // Decrypt the user ID from session
  const authenticatedUserId = decryptUserId(userSession);

  if (!authenticatedUserId) {
    return {
      isAuthorized: false,
      isAdmin: false,
      userId: null,
      error: 'Invalid session token',
    };
  }

  // Check if the authenticated user matches the requested user
  if (authenticatedUserId !== requestedUserId) {
    return {
      isAuthorized: false,
      isAdmin: false,
      userId: authenticatedUserId,
      error: 'Unauthorized to access this user data',
    };
  }

  return {
    isAuthorized: true,
    isAdmin: false,
    userId: authenticatedUserId,
  };
}

/**
 * Get the authenticated user ID from the session cookie
 * Returns null if not authenticated
 */
export function getAuthenticatedUserId(request: NextRequest): string | null {
  const userSession = request.cookies.get('gt_user_session')?.value;

  if (!userSession) {
    return null;
  }

  return decryptUserId(userSession);
}
