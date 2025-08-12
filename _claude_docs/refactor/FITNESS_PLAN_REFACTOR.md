# Fitness Plan Generation Refactor Documentation

## Executive Summary

This document outlines the refactoring of the fitness plan generation logic to simplify the data model by:
1. Removing the macrocycle layer (making FitnessPlan essentially a macrocycle)
2. Storing less detail in the initial fitness plan generation
3. Moving more detailed breakdowns to the mesocycle generation phase
4. Generating workouts on-demand during daily message flow instead of pre-generating all workouts
5. Updating JSON schemas to be more concise and focused

## Current Architecture Analysis

### Current Data Flow

```
1. FitnessPlan Generation (fitnessPlanAgent)
   └── Creates full plan with macrocycles → mesocycles → microcycleOverviews
   
2. Mesocycle Breakdown (mesocycleAgent)  
   └── Takes mesocycleOverview and creates:
       └── Microcycles with workouts (7 days each)
           └── WorkoutInstances with details (ALL pre-generated)

3. Daily Message Flow (dailyMessageService)
   └── Fetches pre-existing workout from database
       └── Formats workout into message (dailyMessageAgent)
```

### Proposed Data Flow

```
1. FitnessPlan Generation (fitnessPlanAgent)
   └── Creates simplified plan with mesocycles only
   
2. Mesocycle Breakdown (mesocycleAgent)  
   └── Creates microcycles with daily themes/patterns
       └── NO workout generation (only structure)

3. Daily Message Flow (dailyMessageService)
   └── Checks if workout exists for today
       └── If not: Generate workout on-demand (dailyWorkoutAgent)
           └── Save workout to database
       └── Format workout into message (dailyMessageAgent)
```

### Current Schema Structure

#### Database Tables
- `fitnessPlans`: Stores macrocycles as JSON, includes overview and program type
- `mesocycles`: Links to fitness plan, stores phase and length
- `microcycles`: Links to mesocycle and fitness plan, stores targets
- `workoutInstances`: Links to all levels, stores workout details as JSON

#### Current JSON Storage in FitnessPlan
```typescript
{
  programType: string,
  macrocycles: [{
    name: string,
    description: string,
    durationWeeks: number,
    mesocycles: [{
      phase: string,
      weeks: number,
      microcycleOverviews: [{
        index: number,
        split?: string,
        totalMileage?: number,
        longRunMileage?: number,
        avgIntensityPct1RM?: number,
        totalSetsMainLifts?: number,
        deload?: boolean
      }]
    }]
  }],
  overview: string
}
```

## Proposed Changes

### 1. Database Schema Changes

#### FitnessPlans Table
```sql
-- Current columns to modify:
macrocycles JSON → mesocycles JSON  -- Rename and restructure
-- Add new column:
macrocycle_weeks INTEGER  -- Total duration of the plan
notes TEXT  -- For travel, injuries, special considerations
```

#### Updated Type Definition
```typescript
// src/server/models/_types/index.ts
export interface FitnessPlans {
  clientId: string;
  createdAt: Generated<Timestamp>;
  goalStatement: string | null;
  id: Generated<string>;
  mesocycles: Json;  // Changed from macrocycles
  lengthWeeks: number;  // New field
  notes: string | null;  // New field
  overview: string | null;
  programType: string;
  startDate: Timestamp;
  updatedAt: Generated<Timestamp>;
}
```

### 2. Model Changes

#### FitnessPlan Model Updates
```typescript
// src/server/models/fitnessPlan/index.ts

export interface FitnessPlanOverview {
  programType: string;
  macrocycleWeeks: number;  // Total weeks
  mesocycles: MesocycleOverview[];  // Direct array, no macrocycle wrapper
  overview: string;
  notes?: string;  // Travel, injuries, etc.
}

export interface MesocycleOverview {
  name: string;  // e.g., "Accumulation"
  weeks: number;
  focus: string[];  // e.g., ["volume", "technique"]
  deload: boolean;  // Is last week a deload?
}

// Remove MacrocycleOverview interface entirely
```

#### FitnessPlan Schema Updates
```typescript
// src/server/models/fitnessPlan/schema.ts

export const _MesocycleOverviewSchema = z.object({
  name: z.string(),
  weeks: z.number(),
  focus: z.array(z.string()),
  deload: z.boolean()
});

export const _FitnessPlanSchema = z.object({
  programType: z.enum(['endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other']),
  macrocycleWeeks: z.number(),
  mesocycles: z.array(_MesocycleOverviewSchema),
  overview: z.string(),
  notes: z.string().optional()
});
```

### 3. Mesocycle Model Changes

#### Updated Mesocycle to Include Microcycle Details
```typescript
// src/server/models/mesocycle/index.ts

export interface MesocycleOverview {
  index: number;
  name: string;  // From fitness plan
  phase: string;  // Detailed phase description
  weeks: number;
  focus: string[];
  deload: boolean;
  // Remove microcycleOverviews - will be generated during breakdown
}
```

### 4. Microcycle Model Changes

#### Simplified Microcycle Structure
```typescript
// src/server/models/microcycle/schema.ts

export const _MicrocycleSchema = z.object({
  index: z.number(),
  weekIndex: z.number(),  // Week within mesocycle
  days: z.array(z.object({
    day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
    theme: z.string(),  // e.g., "Lower", "Upper Push"
    load: z.enum(['light', 'moderate', 'heavy']).optional(),
    notes: z.string().optional()
  }))
  // Remove workouts - will be generated individually day of
});
```

### 5. Workout Model Changes

#### Enhanced Workout Structure
```typescript
// src/server/models/workout/schema.ts

export const _WorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown']),
  exercise: z.string(),
  sets: z.number().optional(),
  reps: z.union([z.number(), z.string()]).optional(),  // "6-8" or 8
  durationSec: z.number().optional(),
  durationMin: z.number().optional(),
  RPE: z.number().optional(),
  percentageRM: z.number().optional()
});

export const _WorkoutBlockSchema = z.object({
  name: z.string(),  // "Warm-up", "Main", "Accessory"
  items: z.array(_WorkoutBlockItemSchema)
});

export const _WorkoutModificationSchema = z.object({
  condition: z.string(),  // "injury.lower_back.active"
  replace: z.object({
    exercise: z.string(),
    with: z.string()
  }).optional(),
  note: z.string()
});

export const _WorkoutInstanceSchema = z.object({
  date: z.date(),
  theme: z.string(),
  blocks: z.array(_WorkoutBlockSchema),
  modifications: z.array(_WorkoutModificationSchema).optional(),
});
```

### 6. Agent/Prompt Changes

#### FitnessPlan Agent Prompt Updates
```typescript
// src/server/agents/fitnessPlan/prompts.ts

// Update prompt to generate simpler structure:
// - No macrocycles array wrapper
// - Simplified mesocycle objects
// - Add notes field for special considerations

const updatedPrompt = `
...
<Content guidelines>
- Build a fitness plan spanning ${requestedWeeks} weeks total
- Divide into mesocycles of 3-6 weeks each
- Each mesocycle should have:
  • name: Phase name (e.g., "Accumulation", "Intensification")
  • weeks: Duration in weeks
  • focus: Array of focus areas (e.g., ["volume", "technique"])
  • deload: Boolean if last week is deload
- Include notes for any special considerations (travel, injuries)
- Do NOT include microcycle details - these will be generated later
</Content guidelines>

<Example output>
{
  "programType": "hybrid",
  "macrocycleWeeks": 12,
  "mesocycles": [
    {"name": "Accumulation", "weeks": 4, "focus": ["volume", "technique"], "deload": false},
    {"name": "Intensification", "weeks": 4, "focus": ["intensity"], "deload": true},
    {"name": "Peaking", "weeks": 4, "focus": ["performance"], "deload": false}
  ],
  "overview": "12-week hybrid program...",
  "notes": "Week 2 Monday off for travel; focus on lower back prehab throughout"
}
</Example output>
...
`;
```

#### Mesocycle Breakdown Agent Updates
```typescript
// src/server/agents/mesocycleBreakdown/prompts.ts

// Update to generate ONLY microcycle patterns, no workout details
// Will now be responsible for:
// 1. Determining weekly patterns based on mesocycle focus
// 2. Setting progressive overload targets within the mesocycle
// 3. Defining daily themes and load patterns

const updatedMesocyclePrompt = `
...
<Goal>
Generate ${mesocycle.weeks} microcycles with:
- Weekly training patterns appropriate for ${mesocycle.focus.join(', ')}
- Progressive overload targets across weeks
- Deload in final week if ${mesocycle.deload}
- Daily themes and load patterns (NO workout details)
</Goal>

<Example Microcycle>
{
  "index": 0,
  "weekIndex": 1,
  "days": [
    {"day": "Mon", "theme": "Lower Power", "load": "heavy", "notes": "Focus on explosive movements"},
    {"day": "Tue", "theme": "Upper Push", "load": "moderate"},
    {"day": "Wed", "theme": "Rest"},
    {"day": "Thu", "theme": "Lower Volume", "load": "moderate"},
    {"day": "Fri", "theme": "Upper Pull", "load": "moderate"},
    {"day": "Sat", "theme": "Full Body", "load": "light"},
    {"day": "Sun", "theme": "Rest"}
  ]
}
</Example>
...
`;
```

#### New Daily Workout Agent
```typescript
// src/server/agents/dailyWorkout/chain.ts

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { Microcycle } from '@/server/models/microcycle';
import { WorkoutInstance } from '@/server/models/workout';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { dailyWorkoutPrompt } from './prompts';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const dailyWorkoutAgent = {
  invoke: async ({ 
    user, 
    context 
  }: { 
    user: UserWithProfile;
    context: {
      date: Date;
      dayPlan: {
        day: string;
        theme: string;
        load?: string;
        notes?: string;
      };
      microcycle: Microcycle;
      mesocycle: Mesocycle;
      fitnessPlan: FitnessPlan;
      recentWorkouts?: WorkoutInstance[]; // Last 3-7 workouts for context
    }
  }): Promise<WorkoutInstance> => {
    const fitnessProfile = await new FitnessProfileContext(user).getContext();
    
    const prompt = dailyWorkoutPrompt(
      user,
      fitnessProfile,
      context.dayPlan,
      context.microcycle,
      context.mesocycle,
      context.fitnessPlan,
      context.recentWorkouts
    );
    
    const structuredModel = llm.withStructuredOutput(WorkoutInstanceSchema);
    const workout = await structuredModel.invoke(prompt);
    
    return {
      ...workout,
      date: context.date,
      clientId: user.id,
      fitnessPlanId: context.fitnessPlan.id,
      mesocycleId: context.mesocycle.id,
      microcycleId: context.microcycle.id
    };
  }
};
```

```typescript
// src/server/agents/dailyWorkout/prompts.ts

export const dailyWorkoutPrompt = (
  user: UserWithProfile,
  fitnessProfile: string,
  dayPlan: { theme: string; load?: string; notes?: string },
  microcycle: Microcycle,
  mesocycle: Mesocycle,
  fitnessPlan: FitnessPlan,
  recentWorkouts?: WorkoutInstance[]
) => `
You are an elite personal fitness coach creating today's workout.

<Goal>
Generate a detailed workout for ${user.name} based on:
- Today's theme: ${dayPlan.theme}
- Load level: ${dayPlan.load || 'moderate'}
- Special notes: ${dayPlan.notes || 'none'}
</Goal>

<Context>
- Program type: ${fitnessPlan.programType}
- Current mesocycle: ${mesocycle.name} (week ${microcycle.weekIndex} of ${mesocycle.weeks})
- Focus areas: ${mesocycle.focus.join(', ')}
- User considerations: ${fitnessPlan.notes || 'none'}
</Context>

<Recent Training>
${recentWorkouts ? formatRecentWorkouts(recentWorkouts) : 'No recent workouts'}
</Recent Training>

<Requirements>
1. Match the theme and load level exactly
2. Include warm-up, main work, and cooldown blocks
3. Consider recent workouts to avoid overtraining
4. Apply progressive overload principles
5. Include modifications for common issues
6. Specify all sets, reps, rest periods, and intensities
</Requirements>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

Output a complete workout following the enhanced schema.
`;
```

### 7. Service Layer Changes

#### FitnessPlanService
```typescript
// src/server/services/fitnessPlanService.ts

public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
  const agentResponse = await fitnessPlanAgent.invoke({ user });
  
  // Simplified - no macrocycle nesting
  const fitnessPlan = {
    programType: agentResponse.program.programType,
    mesocycles: agentResponse.program.mesocycles,
    macrocycleWeeks: agentResponse.program.macrocycleWeeks,
    overview: agentResponse.program.overview,
    notes: agentResponse.program.notes,
    clientId: user.id,
    startDate: new Date(),
  };
  
  return await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
}
```

#### MesocycleService
```typescript
// src/server/services/mesocycleService.ts

public async getNextMesocycle(user: UserWithProfile, fitnessPlan: FitnessPlan): Promise<DetailedMesocycle> {
  // Direct access to mesocycles, no macrocycle layer
  const mesocycleOverview = fitnessPlan.mesocycles[nextMesocycleIndex];
  
  // Generate microcycle patterns ONLY (no workouts)
  const breakdown = await mesocycleAgent.invoke({ 
    user, 
    context: { 
      mesocycleOverview,
      fitnessPlan,
      specialConsiderations: fitnessPlan.notes
    }
  });
  
  // Save microcycles with daily patterns but NO workouts
  const microcycles = await Promise.all(
    breakdown.value.map(async (microcycle) => {
      return await this.microcycleRepo.create({
        ...microcycle,
        clientId: user.id,
        fitnessPlanId: fitnessPlan.id,
        mesocycleId: mesocycle.id,
        // Store daily patterns in targets field
        targets: { days: microcycle.days }
      });
    })
  );
  
  return { ...mesocycle, microcycles };
}
```

#### DailyMessageService Updates
```typescript
// src/server/services/dailyMessageService.ts

private async sendDailyMessage(
  user: UserWithProfile,
  options: ProcessOptions = {}
): Promise<MessageResult> {
  try {
    // Get target date in user's timezone
    const targetDate = this.getTargetDate(user, options);
    
    // Check if workout already exists
    let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());
    
    // If no workout exists, generate it on-demand
    if (!workout) {
      workout = await this.generateTodaysWorkout(user, targetDate);
      
      if (!workout) {
        return {
          success: false,
          userId: user.id,
          error: 'Could not generate workout for today'
        };
      }
    }
    
    // Build and send the message
    const message = await this.messageService.buildDailyMessage(user, workout);
    
    if (options.dryRun) {
      console.log(`[DRY RUN] Would send message to user ${user.id}`);
    } else {
      await this.messageService.sendMessage(user, message);
    }
    
    return { success: true, userId: user.id };
  } catch (error) {
    // ... error handling
  }
}

private async generateTodaysWorkout(
  user: UserWithProfile, 
  targetDate: DateTime
): Promise<WorkoutInstance | null> {
  try {
    // Get current fitness plan
    const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
    if (!fitnessPlan) return null;
    
    // Get current mesocycle
    const mesocycle = await this.mesocycleRepo.getCurrentMesocycle(
      fitnessPlan.id, 
      targetDate.toJSDate()
    );
    if (!mesocycle) return null;
    
    // Get current microcycle
    const microcycle = await this.microcycleRepo.getCurrentMicrocycle(
      mesocycle.id,
      targetDate.toJSDate()
    );
    if (!microcycle) return null;
    
    // Get the day's training plan from microcycle
    const dayOfWeek = targetDate.toFormat('EEE'); // Mon, Tue, etc.
    const dayPlan = microcycle.targets?.days?.find(
      d => d.day === dayOfWeek
    );
    
    if (!dayPlan) return null;
    
    // Get recent workouts for context (last 7 days)
    const recentWorkouts = await this.workoutRepo.getRecentWorkouts(
      user.id,
      7
    );
    
    // Generate workout using new agent
    const workout = await dailyWorkoutAgent.invoke({
      user,
      context: {
        date: targetDate.toJSDate(),
        dayPlan,
        microcycle,
        mesocycle,
        fitnessPlan,
        recentWorkouts
      }
    });
    
    // Save the generated workout
    const savedWorkout = await this.workoutRepo.create(workout);
    
    console.log(`Generated workout for user ${user.id} on ${targetDate.toISODate()}`);
    return savedWorkout;
    
  } catch (error) {
    console.error(`Error generating workout for user ${user.id}:`, error);
    return null;
  }
}
```

### 8. Repository Changes

#### FitnessPlanRepository
```typescript
// src/server/repositories/fitnessPlanRepository.ts

async insertFitnessPlan(fitnessPlan: FitnessPlan): Promise<FitnessPlan> {    
  const result = await this.db
    .insertInto('fitnessPlans')
    .values({
      ...fitnessPlan,
      mesocycles: JSON.stringify(fitnessPlan.mesocycles),  // Changed from macrocycles
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return FitnessPlanModel.fromDB(result);
}
```

## Migration Strategy

### Step 1: Database Migration

Using Kysely migration infrastructure:

```typescript
// migrations/YYYYMMDD_refactor_fitness_plans.ts

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add new columns
  await db.schema
    .alterTable('fitnessPlans')
    .addColumn('mesocycles', 'json')
    .addColumn('lengthWeeks', 'integer')
    .addColumn('notes', 'text')
    .execute();

  // Migrate data from macrocycles to mesocycles
  await db
    .updateTable('fitnessPlans')
    .set({
      mesocycles: sql`(
        SELECT json_agg(mesocycle)
        FROM json_array_elements(macrocycles->'[0]'->'mesocycles') AS mesocycle
      )`,
      lengthWeeks: sql`(macrocycles->'[0]'->>'durationWeeks')::INTEGER`
    })
    .execute();

  // Drop old column
  await db.schema
    .alterTable('fitnessPlans')
    .dropColumn('macrocycles')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse migration
  await db.schema
    .alterTable('fitnessPlans')
    .addColumn('macrocycles', 'json')
    .execute();
    
  // Restore data structure
  await db
    .updateTable('fitnessPlans')
    .set({
      macrocycles: sql`json_build_array(
        json_build_object(
          'name', 'Main Cycle',
          'durationWeeks', length_weeks,
          'mesocycles', mesocycles
        )
      )`
    })
    .execute();
    
  await db.schema
    .alterTable('fitnessPlans')
    .dropColumn('mesocycles')
    .dropColumn('lengthWeeks')
    .dropColumn('notes')
    .execute();
}
```

### Step 2: Code Updates Order
1. Create database migration using `pnpm migrate:create`
2. Run migration with `pnpm migrate:up`
3. Update database types with `pnpm db:codegen`
4. Update model schemas and interfaces
5. Create new dailyWorkout agent
6. Update existing agent prompts
7. Update services (FitnessPlan, Mesocycle, DailyMessage)
8. Update repositories with new methods
9. Test thoroughly

## Benefits of Refactor

### Data Model Benefits
1. **Simpler Data Model**: Removing unnecessary nesting makes the code easier to understand
2. **Clearer Responsibilities**: Each layer has distinct, well-defined responsibilities
3. **Improved Maintainability**: Less complex JSON structures to manage

### On-Demand Workout Generation Benefits
1. **Flexibility for Changes**: Can easily adjust future workouts without regenerating entire plans
2. **Real-time Adaptation**: Workouts can consider recent performance and user feedback
3. **Reduced Storage**: No need to store hundreds of pre-generated workouts
4. **Better Context Awareness**: Each workout considers the most recent training history
5. **Easier User Modifications**: Can handle schedule changes, injuries, or preference updates
6. **Progressive Overload**: Can dynamically adjust based on actual completed workouts
7. **Cost Efficiency**: Only generate workouts that will actually be used

### System Architecture Benefits
1. **Better Separation of Concerns**: Plan structure vs. workout details are clearly separated
2. **Scalability**: System can handle more users without pre-generating massive amounts of data
3. **Enhanced Workout Details**: More structured workout representation with blocks and modifications
4. **Easier Testing**: Can test workout generation independently from plan generation

## Testing Considerations

### Unit Tests to Update
- FitnessPlanModel tests
- FitnessPlanService tests
- MesocycleService tests
- Agent prompt tests

### Integration Tests
- Full flow from plan creation to workout generation
- Migration verification
- Backward compatibility checks

### Manual Testing
- Generate plans with various program types
- Verify mesocycle breakdown works correctly
- Check workout detail generation
- Validate special notes handling

## Risks and Mitigations

### Risk 1: Data Migration Complexity
**Mitigation**: Create thorough Kysely migration with rollback capability, test on staging first

### Risk 2: Breaking Existing Functionality
**Mitigation**: Implement changes incrementally with feature flags if needed

### Risk 3: AI Agent Prompt Changes
**Mitigation**: Test prompts extensively with various user profiles before deployment

### Risk 4: On-Demand Generation Failures
**Mitigation**: 
- Implement retry logic for workout generation
- Cache generated workouts
- Have fallback templates for common workout types
- Generate next day's workout as backup during quiet hours

### Risk 5: Increased Latency in Daily Messages
**Mitigation**:
- Pre-generate workouts during off-peak hours (optional)
- Optimize agent prompts for speed
- Consider caching recent context data

### Risk 6: LLM API Rate Limits
**Mitigation**:
- Implement rate limiting and queueing
- Spread generation across time when possible
- Monitor API usage closely

## Implementation Checklist

### Database & Models
- [ ] Create Kysely migration for schema changes
- [ ] Run migration with `pnpm migrate:up`
- [ ] Run `pnpm db:codegen` to update TypeScript types
- [ ] Update FitnessPlan model and schema
- [ ] Remove MacrocycleOverview interface
- [ ] Update Mesocycle model
- [ ] Update Microcycle schema (remove workout array)
- [ ] Enhance Workout schema with new structure

### Agent Layer
- [ ] Create new dailyWorkout agent (chain & prompts)
- [ ] Update fitnessPlanAgent prompt (simpler structure)
- [ ] Update mesocycleBreakdownAgent (no workout generation)
- [ ] Keep existing dailyMessageAgent (formatting only)

### Service Layer
- [ ] Update FitnessPlanService
- [ ] Update MesocycleService (no workout creation)
- [ ] Update DailyMessageService with workout generation
- [ ] Add generateTodaysWorkout method
- [ ] Add workout caching logic

### Repository Layer
- [ ] Update FitnessPlanRepository
- [ ] Add getCurrentPlan method to FitnessPlanRepository
- [ ] Add getCurrentMesocycle method to MesocycleRepository
- [ ] Add getCurrentMicrocycle method to MicrocycleRepository
- [ ] Add getRecentWorkouts method to WorkoutRepository

### Testing
- [ ] Update unit tests for all changed components
- [ ] Create tests for dailyWorkout agent
- [ ] Test on-demand workout generation flow
- [ ] Test migration rollback
- [ ] Integration tests for full daily message flow
- [ ] Load testing for concurrent workout generation
- [ ] Manual testing with various user profiles

### Monitoring & Operations
- [ ] Add logging for workout generation timing
- [ ] Set up alerts for generation failures
- [ ] Monitor LLM API usage
- [ ] Create dashboard for workout generation metrics
- [ ] Document rollback procedures

## Conclusion

This refactor represents a significant architectural improvement that:

1. **Simplifies the data model** by removing the unnecessary macrocycle layer
2. **Improves system flexibility** through on-demand workout generation
3. **Enhances adaptability** by allowing real-time adjustments based on user progress
4. **Reduces storage and computational overhead** by generating only what's needed
5. **Creates clearer separation of concerns** between planning and execution

The shift from pre-generated to on-demand workouts is particularly important as it allows the system to be more responsive to user needs, handle changes gracefully, and scale more efficiently. This architecture better aligns with the dynamic nature of fitness training where adjustments are frequently needed based on progress, recovery, and life circumstances.

The implementation should be done incrementally, with careful attention to migration strategies and fallback mechanisms to ensure system reliability during the transition.