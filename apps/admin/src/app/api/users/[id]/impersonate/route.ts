import { NextRequest, NextResponse } from 'next/server';
import { createImpersonationToken } from '@/server/utils/sessionCrypto';

/**
 * POST /api/users/[id]/impersonate
 *
 * Generates a time-limited impersonation token and returns a redirect URL
 * to the web app's impersonation endpoint.
 *
 * Auth is enforced by proxy middleware (gt_admin cookie check on all /api/* routes).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  const webApiUrl = process.env.WEB_API_URL;
  if (!webApiUrl) {
    return NextResponse.json(
      { success: false, message: 'WEB_API_URL not configured' },
      { status: 500 }
    );
  }

  const adminBackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/users/${userId}`;

  const token = createImpersonationToken(userId, { adminBackUrl });
  const redirectUrl = `${webApiUrl}/me/impersonate?token=${token}`;

  return NextResponse.json({ success: true, redirectUrl });
}
