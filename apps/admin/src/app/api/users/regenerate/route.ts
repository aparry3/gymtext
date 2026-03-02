import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * POST /api/users/regenerate
 *
 * Bulk regeneration for all active users with profiles.
 * Processes sequentially to avoid overloading LLM APIs.
 */
export async function POST() {
  const startTime = Date.now();

  try {
    const { services } = await getAdminContext();
    const result = await services.regeneration.regenerateAllUsers();
    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: result,
      executionTimeMs,
    });
  } catch (error) {
    console.error('[REGENERATE_ALL] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
