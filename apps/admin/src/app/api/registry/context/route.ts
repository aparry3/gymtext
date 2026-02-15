import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/registry/context
 * Returns metadata for all registered context providers.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const providers = services.contextRegistry.list();

    return NextResponse.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error('Error fetching context registry:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
