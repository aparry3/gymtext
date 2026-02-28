import { NextResponse } from 'next/server';
import { MODEL_CATALOG } from '@gymtext/shared/server';

/**
 * GET /api/models
 *
 * Returns all available models grouped by provider.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: MODEL_CATALOG,
  });
}
