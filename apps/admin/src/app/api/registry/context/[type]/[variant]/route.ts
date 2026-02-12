import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ type: string; variant: string }> };

/**
 * GET /api/registry/context/[type]/[variant]
 * Returns the latest context template for a given type and variant.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { type, variant } = await params;

  try {
    const { services } = await getAdminContext();
    const template = await services.contextTemplate.getTemplate(type, variant);

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching context template:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/registry/context/[type]/[variant]
 * Creates a new version of a context template.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { type, variant } = await params;

  try {
    const body = await request.json();
    const { template } = body;

    if (!template || typeof template !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Template value is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const saved = await services.contextTemplate.saveTemplate(type, variant, template);

    // Invalidate cache for this template
    services.contextTemplate.invalidateCache(type, variant);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error saving context template:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
