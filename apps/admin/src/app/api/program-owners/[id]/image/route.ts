import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { uploadImage } from '@gymtext/shared/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/program-owners/[id]/image
 * Upload an avatar or wordmark image for a program owner
 *
 * Body: FormData with:
 * - file: File (required)
 * - type: 'avatar' | 'wordmark' (required)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['avatar', 'wordmark'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type must be "avatar" or "wordmark"' },
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

    // Limit file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Check owner exists
    const owner = await services.programOwner.getById(id);
    if (!owner) {
      return NextResponse.json(
        { success: false, message: 'Program owner not found' },
        { status: 404 }
      );
    }

    // Generate filename with timestamp
    const ext = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.${ext}`;

    // Upload to Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(filename, buffer, {
      folder: `program-owners/${id}`,
      contentType: file.type,
    });

    // Update owner with new URL
    const updateField = type === 'avatar' ? 'avatarUrl' : 'wordmarkUrl';
    const updated = await services.programOwner.update(id, {
      [updateField]: url,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Failed to update program owner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        owner: updated,
      },
    });
  } catch (error) {
    console.error('Error uploading program owner image:', error);

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
