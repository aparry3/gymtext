import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * Transform database agent to API response format
 */
function transformAgent(agent: any) {
  const temp = agent.temperature;
  const tempValue = typeof temp === 'object' && temp !== null ? Number(temp.value) : Number(temp);
  
  return {
    agent_id: agent.agentId,
    description: agent.description,
    is_active: agent.isActive,
    system_prompt: agent.systemPrompt,
    user_prompt_template: agent.userPromptTemplate,
    examples: agent.examples,
    model: agent.model,
    temperature: tempValue,
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

    const agent = await db
      .selectFrom('agentDefinitions')
      .selectAll()
      .where('agentId', '=', agentId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!agent) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformAgent(agent)
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

    // Check if agent exists
    const existing = await db
      .selectFrom('agentDefinitions')
      .selectAll()
      .where('agentId', '=', agentId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    // Build update values (only provided fields)
    const updateValues: Record<string, unknown> = {};
    
    if (system_prompt !== undefined) updateValues.systemPrompt = system_prompt;
    if (model !== undefined) updateValues.model = model;
    if (max_tokens !== undefined) updateValues.maxTokens = max_tokens;
    if (temperature !== undefined) updateValues.temperature = temperature;
    if (max_iterations !== undefined) updateValues.maxIterations = max_iterations;
    if (description !== undefined) updateValues.description = description;
    if (user_prompt_template !== undefined) updateValues.userPromptTemplate = user_prompt_template;
    if (tool_ids !== undefined) updateValues.toolIds = tool_ids;
    if (examples !== undefined) updateValues.examples = examples;
    if (eval_rubric !== undefined) updateValues.evalRubric = eval_rubric;

    // Update the agent
    const result = await db
      .updateTable('agentDefinitions')
      .set(updateValues)
      .where('agentId', '=', agentId)
      .where('isActive', '=', true)
      .returningAll()
      .executeTakeFirstOrThrow();

    return NextResponse.json({
      success: true,
      data: transformAgent(result)
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

    // Check if agent exists
    const existing = await db
      .selectFrom('agentDefinitions')
      .selectAll()
      .where('agentId', '=', agentId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      );
    }

    // Mark as inactive (soft delete)
    await db
      .updateTable('agentDefinitions')
      .set({ isActive: false })
      .where('agentId', '=', agentId)
      .execute();

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
