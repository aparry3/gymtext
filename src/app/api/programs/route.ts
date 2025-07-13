import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/server/db/postgres/users';

// GET /api/programs - List user's programs
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // TODO: Implement database query to fetch user's programs
    // For now, return a placeholder response
    return NextResponse.json({
      programs: [],
      message: 'Program listing not yet implemented'
    });

  } catch (error) {
    console.error('Error listing programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}