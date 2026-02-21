import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/agents
 * 
 * List all agents with optional category filter.
 * 
 * Query params:
 * - category: Filter by category (workouts, plans, weeks, profiles)
 *   - workouts: agentId starts with 'workout:'
 *   - plans: agentId starts with 'plan:'
 *   - weeks: agentId starts with 'week:'
 *   - profiles: agentId starts with 'profile:'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const { db } = await getAdminContext();

    // Build query - select only active agents by default
    let query = db
      .selectFrom('agentDefinitions')
      .selectAll()
      .where('isActive', '=', true);

    // Apply category filter if provided
    if (category) {
      const categoryPrefix: Record<string, string> = {
        workouts: 'workout:',
        plans: 'plan:',
        weeks: 'week:',
        profiles: 'profile:',
      };

      const prefix = categoryPrefix[category];
      if (prefix) {
        query = query.where('agentId', 'like', `${prefix}%`);
      }
    }

    // Order by agentId
    const agents = await query.orderBy('agentId', 'asc').execute();

    // Transform to response format (snake_case for API)
    const transformedAgents = agents.map((agent: any) => {
      const temp = agent.temperature;
      const tempValue = typeof temp === 'object' && temp !== null ? Number((temp as any).value) : Number(temp);
      
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
    });

    return NextResponse.json({
      success: true,
      data: {
        agents: transformedAgents,
        count: transformedAgents.length,
      }
    });

  } catch (error) {
    console.error('Error fetching agents:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agents'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * 
 * Create a new agent definition.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      agent_id,
      system_prompt,
      model = 'gpt-5-nano',
      max_tokens = 16000,
      temperature = 1.0,
      max_iterations = 5,
      description = null,
      user_prompt_template = null,
      tool_ids = [],
      examples = null,
      eval_rubric = null,
    } = body;

    // Validate required fields
    if (!agent_id || !system_prompt) {
      return NextResponse.json(
        { success: false, message: 'agent_id and system_prompt are required' },
        { status: 400 }
      );
    }

    const { db } = await getAdminContext();

    // Check if agent with this ID already exists and is active
    const existing = await db
      .selectFrom('agentDefinitions')
      .selectAll()
      .where('agentId', '=', agent_id)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Agent with agent_id '${agent_id}' already exists` },
        { status: 409 }
      );
    }

    // Create the agent
    const result = await db
      .insertInto('agentDefinitions')
      .values({
        agentId: agent_id,
        systemPrompt: system_prompt,
        model,
        maxTokens: max_tokens,
        temperature,
        maxIterations: max_iterations,
        description,
        userPromptTemplate: user_prompt_template,
        toolIds: tool_ids,
        examples,
        evalRubric: eval_rubric,
        isActive: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Transform to response format
    const temp = result.temperature as any;
    const tempValue = typeof temp === 'object' && temp !== null ? Number((temp as any).value) : Number(temp);

    const transformedAgent = {
      agent_id: result.agentId,
      description: result.description,
      is_active: result.isActive,
      system_prompt: result.systemPrompt,
      user_prompt_template: result.userPromptTemplate,
      examples: result.examples,
      model: result.model,
      temperature: tempValue,
      max_tokens: result.maxTokens,
      max_iterations: result.maxIterations,
      max_retries: 3,
      tool_ids: result.toolIds || [],
      context_types: null,
      sub_agents: null,
      schema_json: null,
      validation_rules: null,
      created_at: result.createdAt,
      version_id: result.versionId,
    };

    return NextResponse.json({
      success: true,
      data: transformedAgent
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating agent:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating agent'
      },
      { status: 500 }
    );
  }
}
