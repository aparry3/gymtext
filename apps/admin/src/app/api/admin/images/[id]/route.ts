import { NextResponse } from 'next/server';
import { dayConfigService } from '@/server/services';

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
    const image = await dayConfigService.getImageById(id);

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

    // Verify image exists
    const image = await dayConfigService.getImageById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    await dayConfigService.deleteImage(id);

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
