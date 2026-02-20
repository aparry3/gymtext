# Agent Tools

Agent tools allow AI agents to interact with the system - updating profiles, fetching workouts, and making modifications.

## Tool Registry

Tools are registered in the Tool Registry which maps string IDs to LangChain tool implementations:

```typescript
// packages/shared/src/server/agents/tools/toolRegistry.ts
export const toolRegistry = {
  update_profile: updateProfileTool,
  get_workout: getWorkoutTool,
  make_modification: makeModificationTool,
  modify_workout: modifyWorkoutTool,
  modify_week: modifyWeekTool,
  modify_plan: modifyPlanTool,
};
```

## Available Tools

### update_profile

Extracts and persists profile changes from user messages.

```typescript
{
  name: 'update_profile',
  description: 'Update the user fitness profile based on conversation. Use when user mentions goals, experience, equipment, injuries, or preferences.',
  parameters: {
    type: 'object',
    properties: {
      goal: { type: 'string', description: 'Primary fitness goal' },
      experience_level: { type: 'string', description: 'Training experience' },
      available_equipment: { type: 'string', description: 'Available gym equipment' },
      limitations: { type: 'string', description: 'Injuries or limitations' },
      preferences: { type: 'string', description: 'Workout preferences' },
    },
  },
}
```

**Example call:**
```json
{
  "name": "update_profile",
  "arguments": {
    "goal": "build muscle",
    "experience_level": "intermediate",
    "available_equipment": "full gym",
    "limitations": "none"
  }
}
```

### get_workout

Fetches or generates today's workout.

```typescript
{
  name: 'get_workout',
  description: 'Get the workout for today or a specific date. Generates a new workout if none exists.',
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format (optional)' },
    },
  },
}
```

**Example call:**
```json
{
  "name": "get_workout",
  "arguments": {
    "date": "2024-01-15"
  }
}
```

### make_modification

Routes modification requests to appropriate handlers.

```typescript
{
  name: 'make_modification',
  description: 'Make modifications to the user workout or program. Routes to appropriate sub-agent based on modification type.',
  parameters: {
    type: 'object',
    properties: {
      modification_type: { 
        type: 'string', 
        enum: ['workout', 'week', 'plan'],
        description: 'Type of modification' 
      },
      request: { type: 'string', description: 'What user wants to change' },
    },
  },
}
```

### modify_workout

Makes changes to a specific workout.

```typescript
{
  name: 'modify_workout',
  description: 'Modify a specific workout - change exercises, sets, reps, or swap movements.',
  parameters: {
    type: 'object',
    properties: {
      workout_id: { type: 'string', description: 'ID of workout to modify' },
      changes: { type: 'string', description: 'Description of changes needed' },
    },
  },
}
```

### modify_week

Makes changes to a weekly microcycle.

```typescript
{
  name: 'modify_week',
  description: 'Modify the weekly training pattern (microcycle).',
  parameters: {
    type: 'object',
    properties: {
      microcycle_id: { type: 'string', description: 'ID of microcycle' },
      changes: { type: 'string', description: 'Description of changes' },
    },
  },
}
```

### modify_plan

Makes changes to the overall fitness plan.

```typescript
{
  name: 'modify_plan',
  description: 'Modify the overall fitness plan structure.',
  parameters: {
    type: 'object',
    properties: {
      plan_id: { type: 'string', description: 'ID of fitness plan' },
      changes: { type: 'string', description: 'Description of changes' },
    },
  },
}
```

## Tool Execution Context

Tools receive a `ToolExecutionContext` with:

```typescript
interface ToolExecutionContext {
  user: User;
  message: string;
  services: ServiceContainer;
  // ... other context
}
```

This allows tools to access database and services:

```typescript
async function updateProfileTool(args: ProfileArgs, ctx: ToolExecutionContext) {
  const { user, services } = ctx;
  
  await services.profileService.update(user.id, args);
  
  return { success: true, message: 'Profile updated' };
}
```

## Adding New Tools

1. **Create tool definition** in `agents/tools/definitions/`
2. **Register in Tool Registry** in `agents/tools/toolRegistry.ts`
3. **Add tool ID to agent definition** in database

## Related Documentation

- [Agent System](./index.md) - Agent system overview
- [Agent Runner](./agent-runner.md) - Execution flow
- [Context Providers](./context.md) - Context resolution
