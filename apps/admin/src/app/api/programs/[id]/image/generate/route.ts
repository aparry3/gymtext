import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { uploadImage } from '@gymtext/shared/server';
import sharp from 'sharp';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Target dimensions matching OpenGraphGymtext.png (1003x527)
const CANVAS_WIDTH = 1003;
const CANVAS_HEIGHT = 527;

// Wordmark should occupy at most 60% of width and 40% of height
const MAX_LOGO_WIDTH_RATIO = 0.6;
const MAX_LOGO_HEIGHT_RATIO = 0.4;

/**
 * POST /api/programs/[id]/image/generate
 * Generate an SMS image by centering a wordmark/logo on a white background
 *
 * Body JSON: { sourceUrl: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'sourceUrl is required' },
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

    // Fetch the source image
    const imageResponse = await fetch(sourceUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch source image' },
        { status: 400 }
      );
    }

    const sourceBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Get source image dimensions
    const sourceMetadata = await sharp(sourceBuffer).metadata();
    if (!sourceMetadata.width || !sourceMetadata.height) {
      return NextResponse.json(
        { success: false, message: 'Could not read source image dimensions' },
        { status: 400 }
      );
    }

    // Calculate the max dimensions the logo can occupy
    const maxLogoWidth = Math.floor(CANVAS_WIDTH * MAX_LOGO_WIDTH_RATIO);
    const maxLogoHeight = Math.floor(CANVAS_HEIGHT * MAX_LOGO_HEIGHT_RATIO);

    // Scale the logo to fit within the max bounds while maintaining aspect ratio
    const scale = Math.min(
      maxLogoWidth / sourceMetadata.width,
      maxLogoHeight / sourceMetadata.height,
      1 // don't upscale
    );

    const logoWidth = Math.round(sourceMetadata.width * scale);
    const logoHeight = Math.round(sourceMetadata.height * scale);

    // Resize the logo
    const resizedLogo = await sharp(sourceBuffer)
      .resize(logoWidth, logoHeight, { fit: 'inside' })
      .png()
      .toBuffer();

    // Create white canvas and composite the logo centered
    const composited = await sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{
        input: resizedLogo,
        gravity: 'centre',
      }])
      .png()
      .toBuffer();

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const filename = `sms-image-generated-${timestamp}.png`;

    const url = await uploadImage(filename, composited, {
      folder: `programs/${id}`,
      contentType: 'image/png',
    });

    // Return the blob URL only — the program record is updated when the user saves
    return NextResponse.json({
      success: true,
      data: { url },
    });
  } catch (error) {
    console.error('Error generating program SMS image:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
