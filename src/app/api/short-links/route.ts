import { NextRequest, NextResponse } from 'next/server';
import { shortLinkService } from '@/server/services/links/shortLinkService';

/**
 * POST /api/short-links
 *
 * Create a new short link
 *
 * Request body:
 * - userId: string - User ID to associate with the link
 * - targetPath: string - Path to redirect to (e.g., /me/program/workouts/123)
 * - code?: string - Optional custom code (5 alphanumeric chars)
 * - expiresAt?: string - Optional expiration date (ISO 8601)
 *
 * Response:
 * - success: boolean
 * - link?: ShortLink
 * - url?: string - Full URL (e.g., https://gtxt.ai/l/aSxc2)
 * - message?: string
 *
 * NOTE: This endpoint is for internal/admin use only
 * In production, it should be protected by authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetPath, code, expiresAt } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'userId is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!targetPath || typeof targetPath !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'targetPath is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (code && (typeof code !== 'string' || !/^[A-Za-z0-9]{5}$/.test(code))) {
      return NextResponse.json(
        {
          success: false,
          message: 'code must be 5 alphanumeric characters',
        },
        { status: 400 }
      );
    }

    // Parse expiration date if provided
    let expiresAtDate: Date | undefined;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: 'expiresAt must be a valid ISO 8601 date',
          },
          { status: 400 }
        );
      }
    }

    // Create the short link
    const link = await shortLinkService.createShortLink(userId, targetPath, {
      code,
      expiresAt: expiresAtDate,
    });

    const fullUrl = shortLinkService.getFullUrl(link.code);

    return NextResponse.json({
      success: true,
      link,
      url: fullUrl,
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create short link',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/short-links
 *
 * List short links (for admin/debugging)
 *
 * Query params:
 * - userId?: string - Filter by user ID
 *
 * NOTE: This endpoint is for internal/admin use only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get links for specific user
      const repository = new (await import('@/server/repositories/shortLinkRepository')).ShortLinkRepository();
      const links = await repository.findByUserId(userId);

      return NextResponse.json({
        success: true,
        links,
      });
    }

    // For now, don't allow listing all links (could be a lot)
    return NextResponse.json(
      {
        success: false,
        message: 'userId query parameter is required',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error listing short links:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list short links',
      },
      { status: 500 }
    );
  }
}
