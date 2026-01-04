import { cookies } from 'next/headers';
import { isProductionEnvironment } from '@/shared/config/public';
const COOKIE_NAME = 'gymtext_user';
/**
 * Set a user cookie in the response
 */
export function setUserCookie(response, userData) {
    console.log('setting user cookie', userData);
    response.cookies.set({
        name: COOKIE_NAME,
        value: JSON.stringify(userData),
        httpOnly: true,
        secure: isProductionEnvironment(),
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
    return response;
}
/**
 * Get the user data from the cookie
 */
export async function getUserFromCookie() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(COOKIE_NAME);
    if (!userCookie) {
        return null;
    }
    try {
        return JSON.parse(userCookie.value);
    }
    catch (error) {
        console.error('Error parsing user cookie:', error);
        return null;
    }
}
/**
 * Check if the user is authenticated (has a valid cookie)
 */
export async function isAuthenticated() {
    const user = await getUserFromCookie();
    return user !== null && user.isCustomer === true;
}
/**
 * Remove the user cookie (logout)
 */
export function removeUserCookie(response) {
    response.cookies.delete(COOKIE_NAME);
    return response;
}
