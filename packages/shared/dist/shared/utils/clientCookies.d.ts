/**
 * Interface for user information stored in the cookie
 */
export interface UserClientCookieData {
    id: string;
    name: string;
    isCustomer: boolean;
    checkoutCompleted: boolean;
    timestamp: string;
}
/**
 * Parse cookies from the document.cookie string
 */
export declare function parseCookies(): {
    [key: string]: string;
};
/**
 * Get the user data from client-side cookie
 */
export declare function getUserFromClientCookie(): UserClientCookieData | null;
/**
 * Check if user is authenticated on the client side
 */
export declare function isClientAuthenticated(): boolean;
//# sourceMappingURL=clientCookies.d.ts.map