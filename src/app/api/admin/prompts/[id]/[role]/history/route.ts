import { NextRequest, NextResponse } from 'next/server';
import { promptRepository } from '@/server/repositories/promptRepository';
import type { PromptRole } from '@/server/models/prompt';

type RouteParams = { params: Promise<{ id: string; role: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, role } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const history = await promptRepository.getPromptHistory(id, role as PromptRole, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching prompt history:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching history',
      },
      { status: 500 }
    );
  }
}
