import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name, ownerId } = body as { name?: string; ownerId?: string };

    const { services } = await getAdminContext();

    const program = await services.program.duplicate(id, { name, ownerId });

    return NextResponse.json({
      success: true,
      data: { program },
    });
  } catch (error) {
    console.error('Error duplicating program:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred duplicating program',
      },
      { status: 500 }
    );
  }
}
