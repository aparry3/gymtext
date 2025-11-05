import { NextRequest, NextResponse } from 'next/server';
import { userAuthService } from '@/server/services/auth/userAuthService';

/**
 * POST /api/users/signup
 *
 * Create a new user and return a session token
 * This is used by the signup flow to automatically log in users
 *
 * Request body: same as /api/users POST
 *
 * Response:
 * - success: boolean
 * - userId: string
 * - sessionToken: string (for setting cookie client-side)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create user via existing API
    const userResponse = await fetch(
      new URL('/api/users', request.url).toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(errorData, { status: userResponse.status });
    }

    const userData = await userResponse.json();

    if (!userData.userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User created but ID not returned',
        },
        { status: 500 }
      );
    }

    // Create session token
    const sessionToken = userAuthService.createSessionToken(userData.userId);

    // Return response with session cookie
    const response = NextResponse.json({
      success: true,
      userId: userData.userId,
    });

    // Set session cookie
    response.cookies.set('gt_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
