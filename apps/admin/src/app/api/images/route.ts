import { NextResponse } from 'next/server';
import { dayConfigService } from '@/server/services';

/**
 * GET /api/admin/images
 * List images from the library
 *
 * Query params:
 * - category: string (optional, filter by category)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? undefined;

    const images = await dayConfigService.getImageLibrary(category);

    return NextResponse.json({
      success: true,
      data: { images },
    });
  } catch (error) {
    console.error('Error fetching images:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch images',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/images
 * Upload a new image to the library
 *
 * Body: FormData with:
 * - file: File (required)
 * - displayName: string (optional)
 * - category: string (optional, defaults to 'general')
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const displayName = formData.get('displayName') as string | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Limit file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await dayConfigService.uploadImage(
      buffer,
      file.name,
      file.type,
      {
        displayName: displayName ?? undefined,
        category: category ?? 'general',
      }
    );

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error uploading image:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
