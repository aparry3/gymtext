import { NextResponse } from 'next/server';
import { isProductionEnvironment } from '@/shared/config/public';

/**
 * POST /api/auth/admin/logout
 *
 * Log out admin user by clearing the gt_admin cookie
 *
 * Response:
 * - success: boolean
 * - message: string
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully',
    });

    // Clear the admin cookie
    response.cookies.set('gt_admin', '', {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AdminAuth] Error in logout API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
