import { NextRequest } from 'next/server';
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
export declare function checkAuthorization(request: NextRequest, requestedUserId: string): AuthResult;
/**
 * Get the authenticated user ID from the session cookie
 * Returns null if not authenticated
 */
export declare function getAuthenticatedUserId(request: NextRequest): string | null;
/**
 * Check if the request has admin authentication
 * Returns true if gt_admin cookie is set to 'ok'
 */
export declare function isAdminAuthenticated(request: NextRequest): boolean;
//# sourceMappingURL=authMiddleware.d.ts.map