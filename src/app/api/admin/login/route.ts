import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const provided = body?.secret as string | undefined;
    const expected = process.env.ADMIN_SECRET;

    if (!expected) {
      return NextResponse.json({ error: 'Server not configured (ADMIN_SECRET missing)' }, { status: 500 });
    }

    if (!provided || provided !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('gt_admin', 'ok', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
