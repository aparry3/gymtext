import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/logout
 *
 * Clear the user session cookie and redirect.
 * Used by server components that can't delete cookies directly.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect') || '/start';
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete('gt_user_session');
  return response;
}

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
