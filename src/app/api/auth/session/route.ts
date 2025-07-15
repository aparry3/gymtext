import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { UserRepository } from '@/server/data/repositories/userRepository';
import { UserCookieData } from '@/shared/utils/cookies';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(req: NextRequest) {
  try {
    // Get the session_id and user_id from the URL
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing session_id or user_id' },
        { status: 400 }
      );
    }

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Invalid or incomplete session' },
        { status: 400 }
      );
    }

    // Get the user from the database
    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a cookie with user information
    const userInfo: UserCookieData = {
      id: user.id,
      name: user.name,
      isCustomer: true,
      checkoutCompleted: true,
      timestamp: new Date().toISOString(),
    };

    // Create the base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    
    // Create response with redirect to success page
    const redirectUrl = new URL('/success', baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    // Set the cookie and ensure proper options
    response.cookies.set({
      name: 'gymtext_user',
      value: JSON.stringify(userInfo),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cookies in redirects
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error setting session cookie:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 