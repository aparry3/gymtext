import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Clear the user session cookie
 *
 * Response:
 * - success: boolean
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the session cookie
    response.cookies.delete('gt_user_session');

    return response;
  } catch (error) {
    console.error('Error in logout API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
