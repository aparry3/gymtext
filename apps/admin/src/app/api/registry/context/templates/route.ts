import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/registry/context/templates?types=user,userProfile,dateContext
 * Batch-fetch the latest raw template for each context type.
 */
export async function GET(request: NextRequest) {
  try {
    const typesParam = request.nextUrl.searchParams.get('types');
    if (!typesParam) {
      return NextResponse.json(
        { success: false, message: 'Missing "types" query parameter' },
        { status: 400 }
      );
    }

    const types = typesParam.split(',').map((t) => t.trim()).filter(Boolean);
    if (types.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const { repos } = await getAdminContext();

    const entries = await Promise.all(
      types.map(async (type) => {
        try {
          const record = await repos.contextTemplate.getLatest(type, 'default');
          return [type, record?.template ?? null] as const;
        } catch {
          return [type, null] as const;
        }
      })
    );

    const data: Record<string, string | null> = {};
    for (const [type, template] of entries) {
      data[type] = template;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching context templates batch:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
