import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/images/:id
 * Get a specific image by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();
    const image = await services.dayConfig.getImageById(id);

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error fetching image:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch image',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/images/:id
 * Delete an image from the library
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    // Verify image exists
    const image = await services.dayConfig.getImageById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    await services.dayConfig.deleteImage(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to delete image',
      },
      { status: 500 }
    );
  }
}
