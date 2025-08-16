import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const sort = url.searchParams.get('sort') || 'createdAt:desc';
    const createdFrom = url.searchParams.get('createdFrom') || undefined;
    const createdTo = url.searchParams.get('createdTo') || undefined;

    const repo = new UserRepository();
    const { users, total } = await repo.list({ q, page, pageSize, sort, createdFrom, createdTo });

    return NextResponse.json({ users, total, page, pageSize });
  } catch (err) {
    console.error('[admin users] GET failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
