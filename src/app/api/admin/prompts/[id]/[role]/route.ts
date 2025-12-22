import { NextRequest, NextResponse } from 'next/server';
import { promptRepository } from '@/server/repositories/promptRepository';
import { promptService } from '@/server/services/prompts/promptService';
import type { PromptRole } from '@/server/models/prompt';

type RouteParams = { params: Promise<{ id: string; role: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, role } = await params;

  try {
    const history = await promptRepository.getPromptHistory(id, role as PromptRole, 1);
    const prompt = history[0] || null;

    return NextResponse.json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching prompt',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id, role } = await params;

  try {
    const body = await request.json();
    const { value } = body;

    if (!value || typeof value !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Prompt value is required' },
        { status: 400 }
      );
    }

    const newPrompt = await promptRepository.createPrompt({
      id,
      role: role as PromptRole,
      value,
    });

    // Invalidate cache for this agent
    promptService.invalidateCache(id);

    return NextResponse.json({
      success: true,
      data: newPrompt,
    });
  } catch (error) {
    console.error('Error saving prompt:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred saving prompt',
      },
      { status: 500 }
    );
  }
}
