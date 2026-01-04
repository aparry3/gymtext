const COOKIE_NAME = 'gymtext_user';
/**
 * Parse cookies from the document.cookie string
 */
export function parseCookies() {
    const cookies = {};
    if (typeof document === 'undefined')
        return cookies;
    const cookieStr = document.cookie;
    if (!cookieStr)
        return cookies;
    cookieStr.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        const value = parts.slice(1).join('=');
        if (name)
            cookies[name] = decodeURIComponent(value);
    });
    return cookies;
}
/**
 * Get the user data from client-side cookie
 */
export function getUserFromClientCookie() {
    const cookies = parseCookies();
    const userCookie = cookies[COOKIE_NAME];
    if (!userCookie)
        return null;
    try {
        return JSON.parse(userCookie);
    }
    catch (error) {
        console.error('Error parsing user cookie:', error);
        return null;
    }
}
/**
 * Check if user is authenticated on the client side
 */
export function isClientAuthenticated() {
    const user = getUserFromClientCookie();
    return user !== null && user.isCustomer === true;
}
