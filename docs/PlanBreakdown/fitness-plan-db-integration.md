# Fitness Plan Database Integration Implementation Plan

## Overview

This plan outlines the implementation steps to persist fitness plans created during onboarding into the database instead of only storing them in vector memory. This will provide better structure, querying capabilities, and data integrity.

## Current State

- Fitness plans are generated using `outlinePrompt` in `fitnessOutlineAgent.ts`
- Plans are stored only in Pinecone vector memory with key "outline"
- Database schema exists but is unused for fitness plans
- The generated plan follows the `FitnessProgram` schema from `src/shared/types/cycles.ts`

## Design Decision

Since this project has no existing users, we will implement a clean solution without backward compatibility. This means:
- **Remove vector memory storage** for fitness plans entirely
- **Use database as the single source of truth**
- **Simplify the codebase** by removing dual storage logic

## Implementation Steps

### Phase 1: Schema Alignment and Type Updates

#### 1.1 Update Database Types
**File**: `src/shared/types/generated.ts` (after running type generation)
- Run Kysely type generation to include new tables
- Ensure types match the migration schema

#### 1.2 Update Existing Cycle Types
**File**: `src/shared/types/cycles.ts` (update existing)

The existing types are already well-structured for database storage. We just need to ensure they align with our database schema:

1. **No changes needed** to the core types - they already match what we need
2. **Add start date to FitnessProgram** for database storage (currently only in Macrocycle)
3. **Ensure programType values** match our database CHECK constraint

```typescript
// Update programType enum to match database constraint
programType: z.enum([
  "strength", "hypertrophy", "powerlifting", 
  "weightloss", "general_fitness", "athletic_performance"
])

// Consider adding these fields to FitnessProgram for database alignment:
// - goalStatement?: string
// - startDate: string (YYYY-MM-DD format)
```

#### 1.3 Create Database-Specific Interfaces
**File**: `src/shared/types/database-extensions.ts` (new file)
```typescript
import { FitnessProgram, Macrocycle } from './cycles';

// Extension types for database records
// Note: These use camelCase as Kysely's CamelCasePlugin handles the conversion
// from snake_case database columns to camelCase TypeScript properties
export interface FitnessPlanDB {
  id: string;
  clientId: string;
  programType: string;
  goalStatement?: string;
  overview: string;
  startDate: Date;
  macrocycles: Macrocycle[]; // JSONB stored as-is
  createdAt: Date;
  updatedAt: Date;
}

export interface MesocycleDB {
  id: string;
  clientId: string;
  fitnessPlanId: string;
  startDate: Date;
  cycleOffset: number; // Note: 'cycle_offset' in DB, camelCase in TS
  phase: string;
  lengthWeeks: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Phase 2: Repository Implementation

#### 2.1 Create FitnessPlanRepository
**File**: `src/server/data/repositories/FitnessPlanRepository.ts` (new file)
```typescript
import { FitnessProgram, Macrocycle } from '@/shared/types/cycles';
import { FitnessPlanDB } from '@/shared/types/database-extensions';

export class FitnessPlanRepository extends BaseRepository {
  async createFromProgram(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    const result = await this.db
      .insertInto('fitness_plans')
      .values({
        clientId: clientId,
        programType: program.programType,
        goalStatement: goalStatement,
        overview: program.overview,
        startDate: startDate,
        macrocycles: JSON.stringify(program.macrocycles) // JSONB
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return {
      ...result,
      macrocycles: program.macrocycles // Return typed version
    };
  }

  async findByClientId(clientId: string): Promise<FitnessPlanDB[]> {
    const results = await this.db
      .selectFrom('fitness_plans')
      .where('clientId', '=', clientId)
      .orderBy('startDate', 'desc')
      .selectAll()
      .execute();
    
    return results.map(r => ({
      ...r,
      macrocycles: r.macrocycles as Macrocycle[]
    }));
  }

  async findActiveByClientId(clientId: string): Promise<FitnessPlanDB | null> {
    // Find the most recent plan that has started but not ended
    const result = await this.db
      .selectFrom('fitness_plans')
      .where('clientId', '=', clientId)
      .where('startDate', '<=', new Date())
      .orderBy('startDate', 'desc')
      .selectAll()
      .executeTakeFirst();
    
    if (!result) return null;
    
    return {
      ...result,
      macrocycles: result.macrocycles as Macrocycle[]
    };
  }
}
```

#### 2.2 Create MesocycleRepository
**File**: `src/server/data/repositories/MesocycleRepository.ts` (new file)
```typescript
export class MesocycleRepository extends BaseRepository {
  async createBatch(fitnessPlanId: string, mesocycles: MesocycleCreationData[]): Promise<Mesocycle[]> {
    // Implementation
  }

  async findByFitnessPlanId(fitnessPlanId: string): Promise<Mesocycle[]> {
    // Implementation
  }
}
```

### Phase 3: Service Layer Updates

#### 3.1 Create FitnessPlanService
**File**: `src/server/services/fitness/FitnessPlanService.ts` (new file)
```typescript
export class FitnessPlanService {
  constructor(
    private fitnessPlanRepo: FitnessPlanRepository,
    private mesocycleRepo: MesocycleRepository
  ) {}

  async createFromProgram(
    userId: string, 
    program: FitnessProgram, 
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    // 1. Create fitness_plan record with macrocycles as JSONB
    const fitnessPlan = await this.fitnessPlanRepo.createFromProgram(
      userId,
      program,
      startDate,
      goalStatement
    );

    // 2. Extract and create mesocycle records for better querying
    const mesocyclePromises = program.macrocycles.flatMap((macro, macroIndex) => 
      macro.mesocycles.map((meso, mesoIndex) => {
        const mesoStartDate = this.calculateMesocycleStartDate(
          startDate, 
          macro, 
          macroIndex, 
          mesoIndex
        );
        
        return this.mesocycleRepo.create({
          clientId: userId,
          fitnessPlanId: fitnessPlan.id,
          startDate: mesoStartDate,
          cycleOffset: this.calculateGlobalOffset(program, macroIndex, mesoIndex),
          phase: meso.phase,
          lengthWeeks: meso.weeks,
          status: 'planned'
        });
      })
    );

    await Promise.all(mesocyclePromises);

    return fitnessPlan;
  }

  async getActivePlan(userId: string): Promise<FitnessPlanDB | null> {
    return this.fitnessPlanRepo.findActiveByClientId(userId);
  }

  async getActivePlanOrThrow(userId: string): Promise<FitnessPlanDB> {
    const plan = await this.getActivePlan(userId);
    if (!plan) {
      throw new Error('No active fitness plan found. Please complete onboarding first.');
    }
    return plan;
  }
}
```

### Phase 4: Agent Integration

#### 4.1 Update fitnessOutlineAgent
**File**: `src/server/agents/fitnessOutlineAgent.ts`
```typescript
// Add after generating the fitness program:
const fitnessPlanService = new FitnessPlanService(
  new FitnessPlanRepository(db),
  new MesocycleRepository(db)
);

// Determine start date (today or next Monday)
const startDate = determineStartDate(new Date());

// Save to database
const savedPlan = await fitnessPlanService.createFromProgram(
  user.id,
  program,
  startDate
);

// Return the saved plan for use in welcome message generation
```

### Phase 5: Remove Vector Memory Dependencies

#### 5.1 Clean Up Memory Service Usage
**Files to update**:
- Remove `remember` calls for fitness plans from all agents
- Remove `recall` calls that look for 'outline' or 'fitness_plan_id'
- Update any code that expects fitness plans in vector memory

### Phase 6: Data Retrieval Updates

#### 6.1 Update Workout Generation Services
**Files to update**:
- `src/server/agents/workoutGeneratorAgent.ts`
- `src/server/agents/workoutUpdateAgent.ts`
- `src/server/agents/breakdownMesocycle.ts`

These need to:
1. Fetch fitness plan from database using `FitnessPlanService`
2. Remove all vector memory retrieval logic
3. Throw clear errors if no active plan exists

### Phase 7: API Updates

#### 7.1 Update API Endpoints
**File**: `src/app/api/agent/route.ts`
- Update all actions to use `FitnessPlanService`
- Remove any vector memory lookups
- Return proper error messages when no plan exists

#### 7.2 Create New Endpoints (Optional)
**File**: `src/app/api/fitness-plans/route.ts` (new file)
- GET /api/fitness-plans - List user's plans
- GET /api/fitness-plans/:id - Get specific plan
- PUT /api/fitness-plans/:id - Update plan status

### Phase 8: Testing and Validation

#### 8.1 Unit Tests
- Repository tests for CRUD operations
- Service tests for plan creation and retrieval
- Agent tests for database integration

#### 8.2 Integration Tests
- Full onboarding flow with database persistence
- Workout generation from database-stored plans
- Verify vector memory is no longer used for plans

## Implementation Order

1. **Day 1**: Schema alignment and type updates (Phase 1)
2. **Day 2**: Repository implementation (Phase 2)
3. **Day 3**: Service layer and agent integration (Phases 3-4)
4. **Day 4**: Update retrieval logic (Phase 5)
5. **Day 5**: API updates and testing (Phases 6-7)

## Key Considerations

### 1. Schema Alignment Issues
- **programType mismatch**: The current `cycles.ts` has values like "endurance", "shred", "hybrid" but the database CHECK constraint expects "strength", "hypertrophy", "powerlifting", "weightloss", "general_fitness", "athletic_performance"
- **Solution**: Either update the database constraint or map between the two sets of values
- **cycleOffset**: The database column is `cycle_offset` (snake_case) but TypeScript uses `cycleOffset` (camelCase)

### 2. Naming Convention
- **Database**: Uses snake_case for column names (e.g., `client_id`, `fitness_plan_id`)
- **TypeScript**: Uses camelCase for properties (e.g., `clientId`, `fitnessPlanId`)
- **Kysely CamelCasePlugin**: Automatically converts between the two conventions
- **Important**: Write SQL with snake_case, TypeScript with camelCase

### 3. Clean Architecture Benefits
- Single source of truth (database)
- Simplified codebase without dual storage
- Better performance without vector lookups
- Easier debugging and maintenance

### 4. Data Integrity
- Ensure foreign key relationships are maintained
- Validate JSONB structures before storage
- Handle timezone considerations for dates

### 5. Performance
- Index queries for active plan lookups
- Consider caching active plans
- Optimize JSONB queries if needed

### 6. Error Handling
- Graceful fallback if database save fails
- Transaction support for multi-table operations
- Clear error messages for debugging

## Success Criteria

1. ✅ Fitness plans are saved to database during onboarding
2. ✅ All vector memory storage for fitness plans is removed
3. ✅ Workout generation uses database-stored plans exclusively
4. ✅ Clear error messages when no active plan exists
5. ✅ Ability to query and manage plans via database

## Future Enhancements

1. **Plan Versioning**: Track changes to fitness plans over time
2. **Plan Templates**: Pre-built plans for common goals
3. **Progress Tracking**: Link completed workouts to plans
4. **Plan Adjustments**: Modify active plans based on progress
5. **Analytics**: Report on plan completion and effectiveness