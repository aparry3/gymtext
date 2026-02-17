# Agent Registry - Simplified Design

## Overview

The agent registry is the central orchestration system that defines:
- What agents exist
- What tools they have access to
- How they're invoked
- What format they return
- What sub-agents they spawn

**Core Principle:** Keep it simple. No 200-line JSON schemas. No nested input mappings. Just: tools, prompt, output format.

---

## Registry Schema

### Agent Definition (TypeScript)

```typescript
interface AgentDefinition {
  // Identity
  agent_id: string;                    // Unique identifier (e.g., 'fitness_plan')
  name: string;                        // Human-readable name
  description: string;                 // What this agent does
  
  // Model configuration
  model: string;                       // 'gpt-5.1', 'claude-sonnet-4-5', etc.
  temperature?: number;                // Default: 0.7
  max_tokens?: number;                 // Default: 4096
  
  // System prompt
  system_prompt: string;               // Complete system prompt (can be long)
  
  // Tools (context provision)
  tools: string[];                     // Array of tool IDs (e.g., ['read_user_dossier', 'read_example_plans'])
  
  // Output configuration
  output_format: 'markdown' | 'json' | 'text';  // MAIN AGENTS: always 'markdown'
  output_schema?: JSONSchema;          // Optional (only for JSON output)
  
  // Validation
  validation?: {
    type: 'markdown_sections' | 'json_schema' | 'custom';
    config: any;                       // Validation config (e.g., required sections)
  };
  
  // Sub-agents (format converters)
  sub_agents?: SubAgentConfig[];
  
  // Metadata
  cost_category?: 'low' | 'medium' | 'high';  // For budgeting
  timeout_seconds?: number;            // Default: 30
  retry_policy?: RetryPolicy;
}

interface SubAgentConfig {
  agent_id: string;                    // Sub-agent to invoke
  input_format: 'markdown' | 'json';   // What format to pass
  trigger: 'always' | 'on_demand';     // When to invoke
  cache_output?: boolean;              // Whether to cache result
}

interface RetryPolicy {
  max_retries: number;
  retry_on: ('validation_error' | 'timeout' | 'model_error')[];
  backoff_ms: number;
}
```

---

## Primary Agent Definitions

### Fitness Plan Agent

```typescript
{
  agent_id: 'fitness_plan',
  name: 'Fitness Plan Generator',
  description: 'Generates complete 12-week training plan from user dossier',
  
  model: 'gpt-5.1',
  temperature: 0.8,                    // Slightly creative
  max_tokens: 8192,                    // Large output (complete plan)
  
  system_prompt: `
You are a strength and conditioning coach creating a personalized 12-week training plan.

CONTEXT PROVIDED:
- User dossier (via read_user_dossier tool): Goals, experience, equipment, schedule, history
- Example plans (via read_example_plans tool): Reference structures in markdown

YOUR TASK:
1. Analyze the user's profile to understand their goals and constraints
2. Select an appropriate training methodology:
   - Beginner (< 1 year): Full body 3x/week
   - Intermediate (1-3 years): Upper/lower 4x/week or PPL 6x/week
   - Advanced (3+ years): Specialized programming (powerlifting, bodybuilding, etc.)
3. Generate a complete 12-week plan with 3-4 microcycle phases
4. Each microcycle should have:
   - Weekly pattern (detailed exercise list for each training day)
   - Progression strategy (weight increases, deload timing)
   - Exercise selection based on available equipment
5. Include program philosophy explaining the approach

OUTPUT FORMAT: Markdown following the example plan structure exactly.

CRITICAL REQUIREMENTS:
- Match exercises to available equipment only
- Respect training days and duration constraints
- Progress appropriately for experience level
- Include deload weeks (typically week 5, week 10)
- Add modification history entry with today's date

EXAMPLE STRUCTURE:
[Include one complete example plan here as reference]
  `,
  
  tools: [
    'read_user_dossier',
    'read_example_plans',
    'search_exercises'
  ],
  
  output_format: 'markdown',
  
  validation: {
    type: 'markdown_sections',
    config: {
      required_sections: [
        '# ',                          // Title
        '## Program Philosophy',
        '## Microcycle',               // At least one microcycle
        '### Weekly Pattern',
        '## Modification History'
      ],
      min_microcycles: 3
    }
  },
  
  sub_agents: [],                      // No sub-agents (plan stored as-is)
  
  cost_category: 'high',               // Large output, important
  timeout_seconds: 60,
  retry_policy: {
    max_retries: 2,
    retry_on: ['validation_error'],
    backoff_ms: 1000
  }
}
```

---

### Microcycle Agent (Weekly Generator)

```typescript
{
  agent_id: 'microcycle',
  name: 'Weekly Workout Generator',
  description: 'Generates 7 daily workouts for upcoming week based on plan and progression',
  
  model: 'gpt-5.1',
  temperature: 0.7,
  max_tokens: 12288,                   // 7 workouts × ~1500 tokens each
  
  system_prompt: `
You are a personal trainer generating this week's workouts from the training plan.

CONTEXT PROVIDED:
- User dossier (via read_user_dossier): Current state, preferences, modifications
- Training plan (via read_training_plan): Current microcycle section with weekly pattern
- Recent workouts (via read_recent_workouts): Last 1-2 weeks to track progression
- Example workouts (via read_example_workouts): Format reference

YOUR TASK:
Generate 7 detailed daily workout markdowns (Monday-Sunday) for the upcoming week.

FOR EACH TRAINING DAY:
1. Read the prescribed weekly pattern from the current microcycle section
2. Check recent workout history to determine appropriate weights:
   - If user completed all reps/sets last week → increase weight 5-10 lbs
   - If user struggled → keep same weight or reduce slightly
   - If first week of microcycle → use conservative weights
3. Generate detailed workout markdown with:
   - Warm-up exercises (5-10 min)
   - Main workout (exercises with specific sets, reps, weights, rest times)
   - Cool down (3-5 min stretching)
   - Notes section
4. Respect any modifications in dossier (e.g., "use goblet squats instead of barbell squats")
5. Include exercise instructions from database when helpful

FOR REST DAYS:
- Return simple rest day markdown (no workout, just recovery notes)

OUTPUT FORMAT: Array of 7 workout markdowns (one for each day Mon-Sun).

PROGRESSION RULES:
- Main lifts: +5-10 lbs per week if completed all sets/reps
- Accessories: +2.5-5 lbs or +1-2 reps
- Deload weeks: Reduce volume 40%, keep intensity at RPE 6-7
- Listen to dossier history (recent injuries, feedback) → adjust accordingly

EXAMPLE STRUCTURE:
[Include one complete example workout here as reference]
  `,
  
  tools: [
    'read_user_dossier',
    'read_training_plan',
    'read_recent_workouts',
    'read_example_workouts',
    'search_exercises'
  ],
  
  output_format: 'markdown',           // Returns array of 7 markdowns
  
  validation: {
    type: 'markdown_sections',
    config: {
      required_sections: [
        '# Workout -',
        '## Warm-Up',
        '## Main Workout',
        '## Cool Down'
      ],
      count: 7                         // Must return exactly 7 workouts
    }
  },
  
  sub_agents: [
    {
      agent_id: 'workout_message',     // Convert each workout → SMS
      input_format: 'markdown',
      trigger: 'always',
      cache_output: true               // Cache SMS in workouts.sms_message
    },
    {
      agent_id: 'workout_structure',   // Convert each workout → JSON for UI
      input_format: 'markdown',
      trigger: 'on_demand',            // Only when UI requests it
      cache_output: true
    }
  ],
  
  cost_category: 'high',
  timeout_seconds: 90,
  retry_policy: {
    max_retries: 2,
    retry_on: ['validation_error'],
    backoff_ms: 2000
  }
}
```

---

### Chat Agent

```typescript
{
  agent_id: 'chat',
  name: 'Personal Trainer Chat',
  description: 'Conversational agent for training advice, feedback, and plan adjustments',
  
  model: 'claude-sonnet-4-5',          // Better at conversation
  temperature: 0.8,
  max_tokens: 2048,
  
  system_prompt: `
You are the user's personal trainer in an ongoing conversation.

CONTEXT PROVIDED:
- User dossier: Goals, preferences, history
- Current training plan: Active program
- Today's workout (if applicable): Scheduled workout
- Recent workouts: Last 7 days
- Conversation history: Previous messages

YOUR ROLE:
- Answer training questions
- Provide exercise substitutions
- Adjust today's workout if needed (e.g., user is tired, injured)
- Log feedback and updates to dossier
- Motivate and support the user

AVAILABLE ACTIONS (via tools):
- update_user_dossier: Append to history section or modify profile
- update_todays_workout: Modify today's workout markdown
- search_exercises: Find exercise alternatives
- send_message: Deliver your response to user

TONE: Friendly, supportive, knowledgeable. Use emojis naturally (💪, 🔥, 👍).

EXAMPLES:
User: "My shoulder hurts, can I skip overhead press today?"
You: "Absolutely! Let's swap overhead press for lateral raises (lighter on the shoulder). I'll update today's workout. Rest up! 💪"
[Call update_todays_workout to modify workout]
[Call update_user_dossier to log shoulder issue]

User: "That bench press felt amazing!"
You: "Love it! 🔥 Great work. I'll bump the weight next week."
[Call update_user_dossier to log positive feedback]
  `,
  
  tools: [
    'read_user_dossier',
    'read_training_plan',
    'read_todays_workout',
    'read_recent_workouts',
    'update_user_dossier',
    'update_todays_workout',
    'search_exercises',
    'send_message'
  ],
  
  output_format: 'text',               // Natural conversation
  
  validation: null,                    // No validation (freeform chat)
  
  sub_agents: [],
  
  cost_category: 'medium',
  timeout_seconds: 30,
  retry_policy: {
    max_retries: 1,
    retry_on: ['model_error'],
    backoff_ms: 500
  }
}
```

---

## Format Conversion Sub-Agents

### Workout Message Agent (Markdown → SMS)

```typescript
{
  agent_id: 'workout_message',
  name: 'Workout SMS Formatter',
  description: 'Converts workout markdown to SMS-friendly text',
  
  model: 'gpt-4.5-mini',               // Lightweight model (simple task)
  temperature: 0.3,                    // Low creativity (formatting task)
  max_tokens: 1024,
  
  system_prompt: `
Convert workout markdown into an SMS-friendly message.

INPUT: Complete workout markdown
OUTPUT: Concise SMS text (max 1600 characters)

FORMAT RULES:
- Use emojis for visual separation (🏋️, 💪, 🔥)
- Abbreviate: DB = Dumbbell, BB = Barbell
- Group warm-up into summary line (don't list every exercise)
- List main exercises: [number emoji] [Exercise]: [Sets]×[Reps] @ [Weight] (rest [time])
- Keep cool down brief
- End with motivational message

EXAMPLE:
Input:
# Workout - Monday, February 16, 2026
## Warm-Up (8 min)
...
## Main Workout
### 1. Bench Press
4 sets × 4-6 reps @ 185-205 lbs
...

Output:
🏋️ Monday Upper Strength - Week 3

WARM-UP (8 min)
• Dynamic stretch + light cardio

MAIN WORKOUT
1️⃣ Bench: 4×4-6 @ 185-205 lbs (rest 3-4 min)
2️⃣ BB Row: 4×6-8 @ 155-165 lbs (rest 2-3 min)
...

COOL DOWN (5 min)
Stretching

💪 Let's crush it! Reply when done.
  `,
  
  tools: [],                           // No tools needed (pure transformation)
  
  output_format: 'text',
  
  validation: {
    type: 'custom',
    config: {
      max_length: 1600                 // SMS limit
    }
  },
  
  sub_agents: [],
  
  cost_category: 'low',
  timeout_seconds: 10,
  retry_policy: null
}
```

---

### Workout Structure Agent (Markdown → JSON)

```typescript
{
  agent_id: 'workout_structure',
  name: 'Workout JSON Extractor',
  description: 'Converts workout markdown to structured JSON for UI',
  
  model: 'gpt-4.5-mini',
  temperature: 0.1,                    // Very low (extraction task)
  max_tokens: 2048,
  
  system_prompt: `
Extract structured data from workout markdown.

INPUT: Workout markdown
OUTPUT: JSON object

Schema:
{
  "title": "Monday Upper Strength",
  "date": "2026-02-16",
  "program": "12-Week Upper/Lower",
  "week": 3,
  "day": 1,
  "focus": "Upper Strength",
  "warm_up": {
    "duration_min": 8,
    "exercises": ["Dynamic stretching", "Light cardio"]
  },
  "exercises": [
    {
      "order": 1,
      "name": "Barbell Bench Press",
      "sets": [
        { "set_number": 1, "weight_lbs": 185, "reps": 5, "rpe": null },
        { "set_number": 2, "weight_lbs": 205, "reps": 4, "rpe": 9 }
      ],
      "rest_seconds": 240,
      "notes": "Heavy sets"
    }
  ],
  "cool_down": {
    "duration_min": 5,
    "exercises": ["Chest stretch", "Lat stretch"]
  },
  "total_volume_lbs": 12500,
  "estimated_duration_min": 52
}

RULES:
- Extract all exercise details (sets, reps, weights, RPE if mentioned)
- Calculate total volume: sum(sets × reps × weight)
- Estimate duration: warm_up + (exercises × avg rest) + cool_down
- Parse date from title (format: YYYY-MM-DD)
  `,
  
  tools: [],
  
  output_format: 'json',
  output_schema: {/* JSON schema here */},
  
  validation: {
    type: 'json_schema',
    config: {/* schema validation config */}
  },
  
  sub_agents: [],
  
  cost_category: 'low',
  timeout_seconds: 15,
  retry_policy: {
    max_retries: 1,
    retry_on: ['validation_error'],
    backoff_ms: 500
  }
}
```

---

## Tool Definitions

### read_user_dossier

```typescript
{
  tool_id: 'read_user_dossier',
  name: 'Read User Dossier',
  description: 'Fetches user dossier markdown',
  
  parameters: {
    user_id: { type: 'string', required: true }
  },
  
  execute: async ({ user_id }: { user_id: string }) => {
    const result = await db.query(
      'SELECT markdown FROM user_dossiers WHERE user_id = $1',
      [user_id]
    );
    
    if (!result.rows[0]) {
      throw new Error('User dossier not found');
    }
    
    return result.rows[0].markdown;
  }
}
```

### read_training_plan

```typescript
{
  tool_id: 'read_training_plan',
  name: 'Read Training Plan',
  description: 'Fetches active training plan markdown for user',
  
  parameters: {
    user_id: { type: 'string', required: false },
    plan_id: { type: 'string', required: false }
  },
  
  execute: async ({ user_id, plan_id }: { user_id?: string; plan_id?: string }) => {
    let query: string;
    let params: any[];
    
    if (plan_id) {
      query = 'SELECT markdown FROM training_plans WHERE id = $1';
      params = [plan_id];
    } else if (user_id) {
      query = 'SELECT markdown FROM training_plans WHERE user_id = $1 AND is_active = true LIMIT 1';
      params = [user_id];
    } else {
      throw new Error('Must provide user_id or plan_id');
    }
    
    const result = await db.query(query, params);
    
    if (!result.rows[0]) {
      throw new Error('Training plan not found');
    }
    
    return result.rows[0].markdown;
  }
}
```

### read_recent_workouts

```typescript
{
  tool_id: 'read_recent_workouts',
  name: 'Read Recent Workouts',
  description: 'Fetches recent workout history (markdown array)',
  
  parameters: {
    user_id: { type: 'string', required: true },
    days: { type: 'number', default: 14 }
  },
  
  execute: async ({ user_id, days = 14 }: { user_id: string; days?: number }) => {
    const result = await db.query(
      `SELECT markdown, workout_date 
       FROM workouts 
       WHERE user_id = $1 
         AND workout_date >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY workout_date DESC`,
      [user_id]
    );
    
    // Return array of markdown strings with dates
    return result.rows.map(row => ({
      date: row.workout_date,
      markdown: row.markdown
    }));
  }
}
```

### read_example_plans

```typescript
{
  tool_id: 'read_example_plans',
  name: 'Read Example Plans',
  description: 'Fetches example training plan markdowns for reference',
  
  parameters: {
    experience_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    goal: { type: 'string', optional: true },
    limit: { type: 'number', default: 3 }
  },
  
  execute: async ({ experience_level, goal, limit = 3 }: any) => {
    const result = await db.query(
      `SELECT markdown 
       FROM plan_examples 
       WHERE experience_level = $1 
         AND ($2::text IS NULL OR primary_goal = $2)
         AND is_active = true
       ORDER BY usage_count DESC
       LIMIT $3`,
      [experience_level, goal, limit]
    );
    
    // Increment usage count
    const ids = result.rows.map(r => r.id);
    await db.query(
      'UPDATE plan_examples SET usage_count = usage_count + 1 WHERE id = ANY($1)',
      [ids]
    );
    
    // Return concatenated markdown (separated by ---) 
    return result.rows.map(r => r.markdown).join('\n\n---\n\n');
  }
}
```

### update_user_dossier

```typescript
{
  tool_id: 'update_user_dossier',
  name: 'Update User Dossier',
  description: 'Appends entry to dossier history or updates sections',
  
  parameters: {
    user_id: { type: 'string', required: true },
    update_markdown: { type: 'string', required: true },
    mode: { type: 'string', enum: ['append_history', 'replace_section'], default: 'append_history' }
  },
  
  execute: async ({ user_id, update_markdown, mode = 'append_history' }: any) => {
    const current = await db.query(
      'SELECT markdown FROM user_dossiers WHERE user_id = $1',
      [user_id]
    );
    
    let newMarkdown: string;
    
    if (mode === 'append_history') {
      // Append to ## Training History section
      newMarkdown = current.rows[0].markdown.replace(
        /(## Training History\n)/,
        `$1${update_markdown}\n\n`
      );
    } else {
      // Replace specific section (more complex logic)
      // ... implementation
    }
    
    await db.query(
      'UPDATE user_dossiers SET markdown = $1, profile_json = NULL, cache_version = cache_version WHERE user_id = $2',
      [newMarkdown, user_id]
    );
    
    return { success: true };
  }
}
```

---

## Agent Invocation Flow

### Example: Invoking Microcycle Agent

```typescript
async function generateWeeklyWorkouts(userId: string): Promise<Workout[]> {
  // 1. Load agent definition
  const agentDef = registry.get('microcycle');
  
  // 2. Prepare tools
  const tools = agentDef.tools.map(toolId => toolRegistry.get(toolId));
  
  // 3. Invoke agent
  const response = await llm.invoke({
    model: agentDef.model,
    system: agentDef.system_prompt,
    tools: tools,
    temperature: agentDef.temperature,
    max_tokens: agentDef.max_tokens
  });
  
  // 4. Validate output
  const validation = validateMarkdownArray(response.output, agentDef.validation.config);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }
  
  // 5. Store workouts
  const workouts = await Promise.all(
    response.output.map((markdown, index) => {
      return db.query(
        `INSERT INTO workouts (user_id, workout_date, markdown)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [userId, getNextMonday().add(index, 'days'), markdown]
      );
    })
  );
  
  // 6. Invoke sub-agents (Workout Message Agent)
  for (const workout of workouts) {
    const smsAgent = registry.get('workout_message');
    const smsText = await llm.invoke({
      model: smsAgent.model,
      system: smsAgent.system_prompt,
      input: workout.markdown
    });
    
    // Cache SMS
    await db.query(
      'UPDATE workouts SET sms_message = $1 WHERE id = $2',
      [smsText, workout.id]
    );
  }
  
  // 7. Log invocation
  await logAgentInvocation({
    agent_id: 'microcycle',
    user_id: userId,
    input_data: { tools_called: response.tool_calls },
    output_data: { workout_count: workouts.length },
    tokens: response.usage,
    duration_ms: response.duration,
    status: 'success'
  });
  
  return workouts;
}
```

---

## Next: Data Flow

See `04-data-flow.md` for detailed data flow diagrams and system interactions.
