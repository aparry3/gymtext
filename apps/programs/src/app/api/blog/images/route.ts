import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

/**
 * POST /api/blog/images
 * Upload an image for use as a blog cover
 *
 * Body: FormData with:
 * - file: File (required)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

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

    const { services } = await getProgramsContext();
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await services.dayConfig.uploadImage(
      buffer,
      file.name,
      file.type,
      {
        category: 'blog-covers',
        uploadedBy: ownerId,
      }
    );

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('[Blog Images API] Error uploading image:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
