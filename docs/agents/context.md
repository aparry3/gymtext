# Context Providers

Context providers supply data to agents at runtime. They're resolved via the Context Registry based on the agent's `context_types` configuration.

## Context Registry

```typescript
// packages/shared/src/server/agents/context/contextRegistry.ts
export const contextRegistry = {
  user: userContextProvider,
  userProfile: userProfileContextProvider,
  fitnessPlan: fitnessPlanContextProvider,
  currentWorkout: currentWorkoutContextProvider,
  dateContext: dateContextProvider,
  currentMicrocycle: currentMicrocycleContextProvider,
  experienceLevel: experienceLevelContextProvider,
  // ... more providers
};
```

## Available Context Types

### user

Basic user information.

```typescript
{
  id: string,
  phone: string,
  name: string | null,
  createdAt: Date,
}
```

### userProfile

Complete fitness profile data.

```typescript
{
  goal: string,
  experienceLevel: string,
  availableEquipment: string[],
  limitations: string[],
  preferences: WorkoutPreferences,
  fitnessLevel: FitnessLevel,
  // ... more profile fields
}
```

### fitnessPlan

User's current fitness plan.

```typescript
{
  id: string,
  name: string,
  goal: string,
  startDate: Date,
  mesocycles: Mesocycle[],
  currentMesocycle: Mesocycle | null,
}
```

### currentWorkout

Today's workout (if exists).

```typescript
{
  id: string,
  date: Date,
  exercises: WorkoutExercise[],
  notes: string | null,
  status: 'pending' | 'completed' | 'skipped',
}
```

### dateContext

Current date and time context.

```typescript
{
  today: string,          // YYYY-MM-DD
  dayOfWeek: string,     // Monday, Tuesday, etc.
  isWeekend: boolean,
  weekOfYear: number,
}
```

### currentMicrocycle

Current weekly training pattern.

```typescript
{
  id: string,
  weekNumber: number,
  days: DayConfig[],
  focus: string,
  isDeload: boolean,
}
```

### experienceLevel

User's training experience.

```typescript
{
  level: 'beginner' | 'intermediate' | 'advanced',
  yearsTraining: number,
  primaryFocus: string,
}
```

## How Context Resolution Works

1. Agent definition specifies `context_types` array
2. AgentRunner fetches all context types in parallel
3. Context Registry resolves each type to actual data
4. Context is injected into prompt template

```typescript
// Example agent definition
{
  agent_id: 'chat:generate',
  context_types: ['user', 'userProfile', 'currentWorkout', 'dateContext'],
  // ...
}
```

## Adding New Context Providers

1. **Create provider function** in `agents/context/providers/`
2. **Register in Context Registry** in `agents/context/contextRegistry.ts`
3. **Add context type to agent definition** in database

```typescript
// Example new provider
async function customContextProvider(params: ContextParams): Promise<ContextData> {
  const { userId, services } = params;
  
  // Fetch and return data
  return await services.customService.getData(userId);
}

// Register
export const contextRegistry = {
  // ...existing
  customData: customContextProvider,
};
```

## Context Caching

Context is cached for performance. Cache duration is configurable per context type.

## Related Documentation

- [Agent System](./index.md) - Agent system overview
- [Tools](./tools.md) - Available agent tools
- [Agent Definitions](./definitions.md) - Agent reference
