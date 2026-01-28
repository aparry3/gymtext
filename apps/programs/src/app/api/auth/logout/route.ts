import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Clear the program owner session cookie
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear the owner session cookie
  response.cookies.set('gt_programs_owner', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
