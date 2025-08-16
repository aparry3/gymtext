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
   └── Creates simplified plan with mesocycles array only
   
2. Progress Tracking (stored in fitnessPlans columns)
   └── Track current position: mesocycleIndex and microcycleWeek
       └── When week changes, generate new microcycle

3. Microcycle Management (microcycles table)
   └── Store current week's pattern in microcycles table
       └── All workouts in the week reference this microcycle
       └── Provides consistency across the week

4. Daily Message Flow (dailyMessageService)
   └── Get current progress from fitnessPlans
       └── Get or create microcycle for current week
           └── Generate workout on-demand using microcycle pattern
               └── Save workout to database with microcycleId reference
       └── Format workout into message (dailyMessageAgent)
```

### Current Schema Structure

#### Database Tables
- `fitnessPlans`: Stores mesocycles as JSON, includes overview, program type, and progress tracking
- `mesocycles`: (TO BE DROPPED - not needed with new architecture)
- `microcycles`: NEW TABLE - Stores weekly training patterns, one per user per week
- `workoutInstances`: Links to microcycle, stores workout details as JSON

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
-- Add new columns:
lengthWeeks INTEGER  -- Total duration of the plan
notes TEXT  -- For travel, injuries, special considerations
currentMesocycleIndex INTEGER DEFAULT 0  -- Current mesocycle position
currentMicrocycleWeek INTEGER DEFAULT 1  -- Current week within mesocycle
cycleStartDate TIMESTAMP  -- When current mesocycle started
```

#### New Microcycles Table
```sql
CREATE TABLE microcycles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  fitnessPlanId TEXT NOT NULL,
  mesocycleIndex INTEGER NOT NULL,
  weekNumber INTEGER NOT NULL,
  pattern JSON NOT NULL,  -- Stores the week's training pattern
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (fitnessPlanId) REFERENCES fitnessPlans(id),
  UNIQUE(userId, fitnessPlanId, mesocycleIndex, weekNumber)
);
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
  currentMesocycleIndex: Generated<number>;  // New field (default 0)
  currentMicrocycleWeek: Generated<number>;  // New field (default 1)
  cycleStartDate: Timestamp | null;  // New field
  overview: string | null;
  programType: string;
  startDate: Timestamp;
  updatedAt: Generated<Timestamp>;
}

// New microcycles table:
export interface Microcycles {
  id: Generated<string>;
  userId: string;
  fitnessPlanId: string;
  mesocycleIndex: number;
  weekNumber: number;
  pattern: Json;  // Stores the week's training pattern
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: Generated<boolean>;
  createdAt: Generated<Timestamp>;
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

### 3. Progress Tracking (No Mesocycle/Microcycle Tables)

#### Progress Tracking Logic
```typescript
// src/server/services/progressService.ts

export class ProgressService {
  async getCurrentProgress(userId: string): Promise<{
    mesocycleIndex: number;
    microcycleWeek: number;
    mesocycle: MesocycleOverview;
    dayOfWeek: number;
  }> {
    // Get from fitnessPlans columns OR fitness_progress table
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    
    return {
      mesocycleIndex: plan.currentMesocycleIndex,
      microcycleWeek: plan.currentMicrocycleWeek,
      mesocycle: plan.mesocycles[plan.currentMesocycleIndex],
      dayOfWeek: this.calculateDayOfWeek(plan.cycleStartDate)
    };
  }
  
  async advanceWeek(userId: string): Promise<void> {
    const progress = await this.getCurrentProgress(userId);
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    const currentMesocycle = plan.mesocycles[progress.mesocycleIndex];
    
    if (progress.microcycleWeek >= currentMesocycle.weeks) {
      // Move to next mesocycle
      await this.updateProgress(userId, {
        mesocycleIndex: progress.mesocycleIndex + 1,
        microcycleWeek: 1,
        cycleStartDate: new Date()
      });
    } else {
      // Just increment week
      await this.updateProgress(userId, {
        microcycleWeek: progress.microcycleWeek + 1
      });
    }
  }
}
```

### 4. Microcycle Pattern Generation & Storage

#### Microcycle Model with Pattern Storage
```typescript
// src/server/models/microcycle/index.ts

export interface MicrocyclePattern {
  weekIndex: number;  // Week within mesocycle
  days: Array<{
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    theme: string;  // e.g., "Lower", "Upper Push"
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  }>;
}

export interface Microcycle {
  id: string;
  userId: string;
  fitnessPlanId: string;
  mesocycleIndex: number;
  weekNumber: number;
  pattern: MicrocyclePattern;  // Stored in JSON column
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generate pattern when week starts, then store in microcycles table
// All workouts in the week reference the same microcycle
export async function generateAndStoreMicrocycle(
  user: UserWithProfile,
  fitnessPlan: FitnessPlan,
  mesocycle: MesocycleOverview,
  weekNumber: number
): Promise<Microcycle> {
  // Check if microcycle already exists
  const existing = await microcycleRepo.getMicrocycleByWeek(
    user.id, 
    mesocycle.index, 
    weekNumber
  );
  
  if (existing) return existing;
  
  // Generate new pattern using AI agent
  const pattern = await microcyclePatternAgent.invoke({
    mesocycle,
    weekNumber,
    programType: fitnessPlan.programType,
    notes: fitnessPlan.notes
  });
  
  // Store in database
  const microcycle = await microcycleRepo.create({
    userId: user.id,
    fitnessPlanId: fitnessPlan.id,
    mesocycleIndex: mesocycle.index,
    weekNumber,
    pattern,
    startDate: calculateWeekStart(),
    endDate: calculateWeekEnd(),
    isActive: true
  });
  
  // Deactivate previous weeks
  await microcycleRepo.deactivatePreviousMicrocycles(user.id);
  
  return microcycle;
}
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

#### Microcycle Pattern Agent (New - Replaces Mesocycle Breakdown)
```typescript
// src/server/agents/mesocycleBreakdown/prompts.ts

// Update to generate ONLY microcycle patterns, no workout details
// Will now be responsible for:
// 1. Determining weekly patterns based on mesocycle focus
// 2. Setting progressive overload targets within the mesocycle
// 3. Defining daily themes and load patterns

const microcyclePatternPrompt = `
...
<Goal>
Generate ONE week's training pattern for:
- Mesocycle: ${mesocycle.name} (${mesocycle.focus.join(', ')})
- Week ${weekNumber} of ${mesocycle.weeks}
- Progressive overload appropriate for week position
- Deload pattern if final week and ${mesocycle.deload}
- Daily themes and load patterns (NO workout details)
</Goal>

<Example Pattern>
{
  "weekIndex": 1,
  "days": [
    {"day": "MONDAY", "theme": "Lower Power", "load": "heavy", "notes": "Focus on explosive movements"},
    {"day": "TUESDAY", "theme": "Upper Push", "load": "moderate"},
    {"day": "WEDNESDAY", "theme": "Rest"},
    {"day": "THURSDAY", "theme": "Lower Volume", "load": "moderate"},
    {"day": "FRIDAY", "theme": "Upper Pull", "load": "moderate"},
    {"day": "SATURDAY", "theme": "Full Body", "load": "light"},
    {"day": "SUNDAY", "theme": "Rest"}
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

#### ProgressService (Replaces MesocycleService)
```typescript
// src/server/services/progressService.ts

public async getCurrentMesocycleAndWeek(userId: string): Promise<{
  mesocycle: MesocycleOverview;
  weekNumber: number;
  dayOfWeek: string;
}> {
  const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
  
  // Get progress from fitnessPlans columns or fitness_progress table
  const mesocycleIndex = plan.currentMesocycleIndex || 0;
  const microcycleWeek = plan.currentMicrocycleWeek || 1;
  
  const mesocycle = plan.mesocycles[mesocycleIndex];
  const dayOfWeek = this.getCurrentDayOfWeek();
  
  return {
    mesocycle,
    weekNumber: microcycleWeek,
    dayOfWeek
  };
}

public async getCurrentOrCreateMicrocycle(userId: string): Promise<Microcycle> {
  const { mesocycle, weekNumber } = await this.getCurrentMesocycleAndWeek(userId);
  const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
  
  // Check if microcycle exists for current week
  let microcycle = await this.microcycleRepo.getCurrentMicrocycle(userId);
  
  if (!microcycle || microcycle.weekNumber !== weekNumber) {
    // Generate new pattern for the week
    const pattern = await microcyclePatternAgent.invoke({
      mesocycle,
      weekNumber,
      programType: plan.programType,
      notes: plan.notes
    });
    
    // Store in database
    microcycle = await this.microcycleRepo.create({
      userId,
      fitnessPlanId: plan.id,
      mesocycleIndex: plan.currentMesocycleIndex,
      weekNumber,
      pattern,
      startDate: calculateWeekStart(),
      endDate: calculateWeekEnd(),
      isActive: true
    });
    
    // Deactivate previous microcycles
    await this.microcycleRepo.deactivatePreviousMicrocycles(userId);
  }
  
  return microcycle;
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
    // Get current fitness plan and progress
    const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
    if (!fitnessPlan) return null;
    
    // Get current position from progress tracking
    const progress = await this.progressService.getCurrentMesocycleAndWeek(user.id);
    const { mesocycle, weekNumber } = progress;
    
    // Get or create microcycle for current week (stored in DB)
    const microcycle = await this.progressService.getCurrentOrCreateMicrocycle(user.id);
    
    // Get the day's training plan from stored pattern
    const dayOfWeek = targetDate.toFormat('EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
    const dayPlan = microcycle.pattern.days.find(
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
        weekNumber,
        mesocycle,
        fitnessPlan,
        recentWorkouts
      }
    });
    
    // Save the generated workout with microcycle reference
    const savedWorkout = await this.workoutRepo.create({
      ...workout,
      microcycleId: microcycle.id  // Reference the stored microcycle
    });
    
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

### Overview of Data Migration Strategy

**CLEAN SLATE APPROACH**: We will perform a hard reset on training data:
1. Convert fitness plan schema (macrocycles → mesocycles structure)
2. **DROP** all existing mesocycles from the database
3. **DROP** all existing microcycles from the database
4. **DROP** all existing workout instances from the database
5. After migration, regenerate current mesocycle/microcycle for active users
6. Generate all future workouts on-demand with new format

#### Data Migration Scope:
1. **FitnessPlans**: Extract mesocycles from nested macrocycles structure, add progress tracking columns (KEEP)
2. **Mesocycles TABLE**: Drop entire table (DROP TABLE - not needed)
3. **Microcycles TABLE**: Drop old table, create NEW microcycles table with different structure
4. **WorkoutInstances**: Delete all records (TRUNCATE)
5. **Users/Profiles**: Unchanged (KEEP)
6. **Progress Tracking**: Use columns in fitnessPlans table

### Step 1: Database Migration with Full Data Conversion

Using Kysely migration infrastructure:

```typescript
// migrations/YYYYMMDD_refactor_fitness_plans.ts

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Step 1: Add new columns to fitnessPlans
  await db.schema
    .alterTable('fitnessPlans')
    .addColumn('mesocycles', 'json')
    .addColumn('lengthWeeks', 'integer')
    .addColumn('notes', 'text')
    .addColumn('currentMesocycleIndex', 'integer', (col) => col.defaultTo(0))
    .addColumn('currentMicrocycleWeek', 'integer', (col) => col.defaultTo(1))
    .addColumn('cycleStartDate', 'timestamp')
    .execute();
  
  // Create NEW microcycles table with different structure
  await db.schema
    .createTable('microcycles')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('fitnessPlanId', 'text', (col) => col.notNull())
    .addColumn('mesocycleIndex', 'integer', (col) => col.notNull())
    .addColumn('weekNumber', 'integer', (col) => col.notNull())
    .addColumn('pattern', 'json', (col) => col.notNull())
    .addColumn('startDate', 'timestamp', (col) => col.notNull())
    .addColumn('endDate', 'timestamp', (col) => col.notNull())
    .addColumn('isActive', 'boolean', (col) => col.defaultTo(true))
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('unique_user_week', ['userId', 'fitnessPlanId', 'mesocycleIndex', 'weekNumber'])
    .execute();

  // Step 2: Convert existing fitness plans
  const existingPlans = await db
    .selectFrom('fitnessPlans')
    .selectAll()
    .execute();

  for (const plan of existingPlans) {
    const macrocycles = JSON.parse(plan.macrocycles);
    const firstMacrocycle = macrocycles[0] || { mesocycles: [], durationWeeks: 12 };
    
    // Extract and simplify mesocycles
    const simplifiedMesocycles = firstMacrocycle.mesocycles.map((meso: any) => ({
      name: meso.phase || 'Training Phase',
      weeks: meso.weeks || 4,
      focus: extractFocusAreas(meso),
      deload: meso.microcycleOverviews?.some((m: any) => m.deload) || false
    }));

    await db
      .updateTable('fitnessPlans')
      .set({
        mesocycles: JSON.stringify(simplifiedMesocycles),
        lengthWeeks: firstMacrocycle.durationWeeks,
        notes: null // Will be populated if needed
      })
      .where('id', '=', plan.id)
      .execute();
  }

  // Step 3: DROP all existing training data and old tables (clean slate)
  console.log('Dropping all workout instances...');
  await db.deleteFrom('workoutInstances').execute();
  
  console.log('Dropping old microcycles table if exists...');
  await db.schema.dropTable('microcycles').ifExists().execute();
  
  console.log('Dropping mesocycles table...');
  await db.schema.dropTable('mesocycles').execute();
  
  console.log('Clean slate migration complete - old tables dropped, new microcycles table created');

  // Step 4: Drop old column
  await db.schema
    .alterTable('fitnessPlans')
    .dropColumn('macrocycles')
    .execute();
}

// Helper function for data conversion
function extractFocusAreas(mesocycle: any): string[] {
  const focus = [];
  if (mesocycle.phase?.toLowerCase().includes('accumulation')) focus.push('volume', 'technique');
  if (mesocycle.phase?.toLowerCase().includes('intensification')) focus.push('intensity');
  if (mesocycle.phase?.toLowerCase().includes('peaking')) focus.push('performance');
  if (focus.length === 0) focus.push('general');
  return focus;
}

export async function down(db: Kysely<any>): Promise<void> {
  // This is a one-way migration - no going back
  // All training data has been deleted and cannot be restored
  throw new Error('This migration cannot be reversed. Restore from backup if needed.');
}
```

### Step 2: Initialize Progress Tracking

After the migration, initialize progress tracking for active users:

```typescript
// scripts/initializeProgress.ts

import { db } from '@/server/connections/database';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { UserRepository } from '@/server/repositories/userRepository';

export async function initializeUserProgress() {
  const userRepo = new UserRepository(db);
  const fitnessPlanRepo = new FitnessPlanRepository(db);
  
  console.log('Initializing progress tracking for active users...');
  
  // Get all active users with fitness plans
  const activeUsers = await userRepo.getActiveUsersWithPlans();
  
  console.log(`Found ${activeUsers.length} active users`);
  
  for (const user of activeUsers) {
    try {
      // Get their converted fitness plan
      const plan = await fitnessPlanRepo.getCurrentPlan(user.id);
      
      if (!plan || !plan.mesocycles) {
        console.log(`Skipping user ${user.id} - no valid plan`);
        continue;
      }
      
      // Initialize progress tracking (already set via defaults in migration)
      // Just verify the progress fields are set
      console.log(`✓ User ${user.id} progress initialized`);
      console.log(`  - Mesocycle: ${plan.currentMesocycleIndex || 0}`);
      console.log(`  - Week: ${plan.currentMicrocycleWeek || 1}`);
      
    } catch (error) {
      console.error(`Failed to initialize for user ${user.id}:`, error);
    }
  }
  
  console.log('Progress initialization complete!');
}

// Run immediately after migration
initializeUserProgress();
```

### Step 3: User Communication

Since we're deleting all historical workout data, we need to communicate this to users:

```typescript
// src/server/services/migrationCommunicationService.ts

export class MigrationCommunicationService {
  async notifyUsersOfReset(): Promise<void> {
    const message = `
🔄 System Update: Training Plan Reset

We've upgraded our fitness plan system to provide better, more adaptive workouts!

What's changed:
• Your fitness plan has been updated to our new format
• Historical workout data has been reset
• Your current training week is being regenerated
• Future workouts will be created fresh each day based on your progress

What to expect:
• You'll receive your next workout as scheduled
• Workouts will be more personalized and adaptive
• Better progressive overload tracking

No action needed from you - just keep training! 💪
    `;
    
    // Send to all active users
    await this.sendToAllActiveUsers(message);
  }
}
```

### Step 3: Implementation Order

1. **Pre-Migration**
   - Create full database backup
   - Notify users of upcoming reset (optional)
   - Document current data state

2. **Migration Execution**
   - Create migration file: `pnpm migrate:create fitness-plan-clean-slate`
   - Test migration on staging
   - Run migration: `pnpm migrate:up`
   - Verify mesocycles and microcycles tables are dropped
   - Verify workoutInstances table is empty
   - Verify fitness plans are converted with progress fields

3. **Code Updates**
   - Update database types: `pnpm db:codegen`
   - Update all models and schemas
   - Create new dailyWorkout agent
   - Update existing agents
   - Update services
   - Update repositories

4. **Progress Initialization**
   - Run progress initialization script
   - Verify all users have progress tracking set
   - Test that workouts generate on-demand

5. **Testing & Deployment**
   - Test with fresh data
   - Deploy to production
   - Monitor workout generation
   - Send user notifications

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
- [ ] Remove Mesocycle model entirely
- [ ] Remove Microcycle model entirely
- [ ] Create MicrocyclePattern interface (not stored)
- [ ] Enhance Workout schema with new structure
- [ ] Add progress tracking to FitnessPlan or new table

### Agent Layer
- [ ] Create new dailyWorkout agent (chain & prompts)
- [ ] Update fitnessPlanAgent prompt (simpler structure)
- [ ] Create microcyclePatternAgent (replaces mesocycle breakdown)
- [ ] Keep existing dailyMessageAgent (formatting only)

### Service Layer
- [ ] Update FitnessPlanService
- [ ] Create ProgressService (replaces MesocycleService)
- [ ] Update DailyMessageService with workout generation
- [ ] Add generateTodaysWorkout method
- [ ] Add generateCurrentWeekPattern method
- [ ] Add progress tracking methods
- [ ] Add workout and pattern caching logic

### Repository Layer
- [ ] Update FitnessPlanRepository
- [ ] Add getCurrentPlan method to FitnessPlanRepository
- [ ] Add updateProgress method to FitnessPlanRepository
- [ ] Remove MesocycleRepository entirely
- [ ] Remove MicrocycleRepository entirely
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