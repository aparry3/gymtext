import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type DbAgent = {
  agentId: string
  description: string | null
  isActive: boolean
  systemPrompt: string | null
  userPromptTemplate: string | null
  examples: unknown | null
  model: string
  temperature: unknown
  maxTokens: number
  maxIterations: number
  toolIds: string[] | null
  createdAt: Date
  versionId: number
}

function parseTemperature(value: unknown): number {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return Number((value as { value: number | string }).value)
  }

  return Number(value)
}

/**
 * Transform database agent to API response format
 */
function transformAgent(agent: DbAgent) {
  return {
    agent_id: agent.agentId,
    description: agent.description,
    is_active: agent.isActive,
    system_prompt: agent.systemPrompt,
    user_prompt_template: agent.userPromptTemplate,
    examples: agent.examples,
    model: agent.model,
    temperature: parseTemperature(agent.temperature),
    max_tokens: agent.maxTokens,
    max_iterations: agent.maxIterations,
    max_retries: 3,
    tool_ids: agent.toolIds || [],
    context_types: null,
    sub_agents: null,
    schema_json: null,
    validation_rules: null,
    created_at: agent.createdAt,
    version_id: agent.versionId,
  };
}

async function getLatestVersion(db: Awaited<ReturnType<typeof getAdminContext>>['db'], agentId: string) {
  return db
    .selectFrom('agentDefinitions')
    .selectAll()
    .where('agentId', '=', agentId)
    .orderBy('versionId', 'desc')
    .executeTakeFirst()
}

/**
 * GET /api/agents/[id]
 * 
 * Get a single agent by agent_id.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const { db } = await getAdminContext();

    const agent = await getLatestVersion(db, agentId)

    if (!agent || !agent.isActive) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformAgent(agent as DbAgent)
    });

  } catch (error) {
    console.error('Error fetching agent:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agent'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agents/[id]
 * 
 * Update an existing agent.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      system_prompt,
      model,
      max_tokens,
      temperature,
      max_iterations,
      description,
      user_prompt_template,
      tool_ids,
      examples,
      eval_rubric,
    } = body;

    const { db } = await getAdminContext();

    // Get latest active version for append-only update
    const existing = await getLatestVersion(db, agentId)

    if (!existing || !existing.isActive) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    // Append a new version (never mutate historical rows)
    const result = await db
      .insertInto('agentDefinitions')
      .values({
        agentId: agentId,
        systemPrompt: system_prompt !== undefined ? system_prompt : existing.systemPrompt,
        model: model !== undefined ? model : existing.model,
        maxTokens: max_tokens !== undefined ? max_tokens : existing.maxTokens,
        temperature: temperature !== undefined ? temperature : existing.temperature,
        maxIterations: max_iterations !== undefined ? max_iterations : existing.maxIterations,
        description: description !== undefined ? description : existing.description,
        userPromptTemplate: user_prompt_template !== undefined ? user_prompt_template : existing.userPromptTemplate,
        toolIds: tool_ids !== undefined ? tool_ids : existing.toolIds,
        examples: examples !== undefined ? examples : existing.examples,
        evalRubric: eval_rubric !== undefined ? eval_rubric : existing.evalRubric,
        isActive: existing.isActive,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return NextResponse.json({
      success: true,
      data: transformAgent(result as DbAgent)
    });

  } catch (error) {
    console.error('Error updating agent:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating agent'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * 
 * Delete an agent (mark as inactive).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const { db } = await getAdminContext();

    // Get latest active version for append-only deactivate
    const existing = await getLatestVersion(db, agentId)

    if (!existing || !existing.isActive) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    // Append new inactive version (soft delete)
    await db
      .insertInto('agentDefinitions')
      .values({
        agentId: agentId,
        systemPrompt: existing.systemPrompt,
        model: existing.model,
        maxTokens: existing.maxTokens,
        temperature: existing.temperature,
        maxIterations: existing.maxIterations,
        description: existing.description,
        userPromptTemplate: existing.userPromptTemplate,
        toolIds: existing.toolIds,
        examples: existing.examples,
        evalRubric: existing.evalRubric,
        isActive: false,
      })
      .executeTakeFirstOrThrow();

    return NextResponse.json({
      success: true,
      data: { message: `Agent '${agentId}' has been deactivated` }
    });

  } catch (error) {
    console.error('Error deleting agent:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred deleting agent'
      },
      { status: 500 }
    );
  }
}
