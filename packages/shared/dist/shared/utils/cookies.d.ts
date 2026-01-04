import { NextResponse } from 'next/server';
/**
 * User information stored in the cookie
 */
export interface UserCookieData {
    id: string;
    name: string;
    isCustomer: boolean;
    checkoutCompleted: boolean;
    timestamp: string;
}
/**
 * Set a user cookie in the response
 */
export declare function setUserCookie(response: NextResponse, userData: UserCookieData): NextResponse;
/**
 * Get the user data from the cookie
 */
export declare function getUserFromCookie(): Promise<UserCookieData | null>;
/**
 * Check if the user is authenticated (has a valid cookie)
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Remove the user cookie (logout)
 */
export declare function removeUserCookie(response: NextResponse): NextResponse;
//# sourceMappingURL=cookies.d.ts.map