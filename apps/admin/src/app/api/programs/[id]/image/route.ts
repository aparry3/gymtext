import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { uploadImage } from '@gymtext/shared/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/programs/[id]/image
 * Upload an SMS image for a program
 *
 * Body: FormData with:
 * - file: File (required)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const ext = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const filename = `sms-image-${timestamp}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(filename, buffer, {
      folder: `programs/${id}`,
      contentType: file.type,
    });

    const updated = await services.program.update(id, { smsImageUrl: url });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Failed to update program' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url, program: updated },
    });
  } catch (error) {
    console.error('Error uploading program SMS image:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programs/[id]/image
 * Remove the SMS image from a program
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const updated = await services.program.update(id, { smsImageUrl: null });

    return NextResponse.json({
      success: true,
      data: { program: updated },
    });
  } catch (error) {
    console.error('Error removing program SMS image:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove image',
      },
      { status: 500 }
    );
  }
}
