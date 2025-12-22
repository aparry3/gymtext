import { NextResponse } from 'next/server';
import { promptRepository } from '@/server/repositories/promptRepository';
import { PROMPT_DOMAINS } from '@/components/admin/prompts/types';

export async function GET() {
  try {
    const promptIds = await promptRepository.getAllPromptIds();

    const domains = PROMPT_DOMAINS.map((domain) => ({
      ...domain,
      agents: domain.agents.map((agent) => ({
        ...agent,
        exists: promptIds.includes(agent.id),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: { domains },
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching prompts',
      },
      { status: 500 }
    );
  }
}
