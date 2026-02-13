import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * POST /api/registry/context/preview
 * Resolve context types for a real user and return rendered strings.
 *
 * Body: { userId: string, contextTypes: string[] }
 * Returns: { data: Array<{ contextType: string, rendered: string | null, error?: string }> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contextTypes } = body as {
      userId?: string;
      contextTypes?: string[];
    };

    if (!userId || !contextTypes || !Array.isArray(contextTypes) || contextTypes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'userId and contextTypes[] are required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Fetch the user (with profile) for context resolution
    const user = await services.user.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Resolve each context type individually so one failure doesn't block the rest
    const results = await Promise.all(
      contextTypes.map(async (contextType) => {
        try {
          const resolved = await services.contextRegistry.resolve(
            [contextType],
            { user }
          );
          return {
            contextType,
            rendered: resolved[0] ?? null,
          };
        } catch (err) {
          return {
            contextType,
            rendered: null,
            error: err instanceof Error ? err.message : 'Resolution failed',
          };
        }
      })
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error previewing context:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
