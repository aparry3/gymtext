import { NextRequest, NextResponse } from 'next/server';
import { userAuthService } from '@/server/services/auth/userAuthService';
import { normalizeUSPhoneNumber } from '@/shared/utils/phoneUtils';

/**
 * POST /api/auth/verify-code
 *
 * Verify a 6-digit code and create a user session
 *
 * Request body:
 * - phoneNumber: string
 * - code: string (6 digits)
 *
 * Response:
 * - success: boolean
 * - message?: string
 * - userId?: string
 *
 * On success, sets a gt_user_session cookie with encrypted user ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    // Validate input
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number is required',
        },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification code is required',
        },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizeUSPhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid phone number format. Please enter a valid US phone number.',
        },
        { status: 400 }
      );
    }

    // Verify the code
    const result = await userAuthService.verifyCode(normalizedPhone, code);

    if (!result.success || !result.userId) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Verification failed',
        },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = userAuthService.createSessionToken(result.userId);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Verification successful',
      userId: result.userId,
    });

    // Set secure session cookie
    response.cookies.set('gt_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in verify-code API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
