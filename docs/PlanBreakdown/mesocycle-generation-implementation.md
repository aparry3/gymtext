# Mesocycle Generation Implementation Plan

## Overview
This document outlines the implementation plan for updating the mesocycle generation logic to properly store generated mesocycles, microcycles, and workout instances in their respective database tables.

## Current State Analysis

### Existing Schema Structure (src/shared/types/cycles.ts)
- **FitnessProgram**: Top-level program with macrocycles
- **Macrocycle**: Contains multiple mesocycle plans
- **MesocyclePlan**: High-level plan without detailed workouts
- **MesocycleDetailed**: Complete mesocycle with microcycles
- **Microcycle**: Weekly training block with workouts
- **WorkoutInstance**: Individual workout sessions

### Current Process Flow
1. `outlinePrompt` generates a FitnessProgram with macrocycles containing MesocyclePlans
2. `mesocycleBreakdownPrompt` takes a MesocyclePlan and generates a MesocycleDetailed (with microcycles and workouts)
3. Generated MesocycleDetailed is currently not persisted to database tables

### Data Flow
```
FitnessProgram.macrocycles[x].mesocycles[x] (MesocyclePlan)
    ↓ (input to mesocycleBreakdownPrompt)
MesocycleDetailed (with microcycles array)
    ↓ (add DB fields: user_id, fitness_program_id, dates, etc.)
MesocycleDB → mesocycles table
```

## Required Updates

### 1. Database Table Structure Verification
Ensure the following tables exist with proper relationships:
- `mesocycles` - Stores mesocycle data with foreign key to fitness program
- `microcycles` - Stores weekly cycles with foreign key to mesocycle
- `workout_instances` - Stores individual workouts with foreign key to microcycle

### 2. Schema Updates

#### Create MesocycleDB Type
```typescript
// Create database-specific type for mesocycles table
// This extends MesocycleDetailed (output from AI) with DB fields
export const MesocycleDB = MesocycleDetailed.extend({
  fitness_program_id: z.string().uuid(),
  client_id: z.string().uuid(),
  order_index: z.number().int(),
  start_date: z.date(),
  end_date: z.date(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Note: MesocycleDetailed already contains:
// - id, phase, weeks, weeklyTargets, microcycles
```

#### Update Microcycle Type
```typescript
// Add database-specific fields to Microcycle
export const MicrocycleDB = Microcycle.extend({
  client_id: z.string().uuid()
  mesocycle_id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});
```

#### Update WorkoutInstance Type
```typescript
// Add database-specific fields to WorkoutInstance
export const WorkoutInstanceDB = WorkoutInstance.extend({
  microcycle_id: z.string().uuid(),
  client_id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'skipped']).default('scheduled'),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});
```

### 3. Prompt Template Updates

#### Update mesocycleBreakdownPrompt
- Ensure the prompt generates unique IDs that can be used as database primary keys
- Add explicit instructions for ID generation format (e.g., UUID format or consistent slug format)
- Ensure date calculations are accurate for database storage

### 4. New Helper Functions

#### createMesocycleWithDetails
```typescript
async function createMesocycleWithDetails(
  mesocycleDetailed: MesocycleDetailed, // Output from AI
  fitnessProgramId: string,
  macrocycleId: string,
  userId: string,
  orderIndex: number,
  startDate: Date
): Promise<void> {
  // 1. Convert MesocycleDetailed to MesocycleDB by adding DB fields
  // 2. Insert mesocycle into mesocycles table
  // 3. For each microcycle in mesocycleDetailed.microcycles, insert into microcycles table
  // 4. For each workout in each microcycle, insert into workout_instances table
  // 5. Handle transaction to ensure atomicity
}
```

#### generateDatabaseIds
```typescript
function generateDatabaseIds(
  microcycles: Microcycle[]
): {
  mesocycleId: string,
  microcycleIds: Map<number, string>,
  workoutIds: Map<string, string>
} {
  // Generate UUIDs for all entities before database insertion
  // Return mapping of generated IDs for mesocycle, microcycles, and workouts
}
```

#### calculateMicrocycleDates
```typescript
function calculateMicrocycleDates(
  startDate: Date,
  weekNumber: number,
  needsTransition: boolean
): { startDate: Date, endDate: Date } {
  // Calculate exact start and end dates for each microcycle
  // Account for transition weeks
}
```

### 5. Service Layer Updates

#### MesocycleGenerationService
Create a new service to handle the complete mesocycle generation flow:

```typescript
class MesocycleGenerationService {
  async generateAndStoreMesocycle(
    user: UserWithProfile,
    mesocyclePlan: MesocyclePlan, // Input from FitnessProgram
    fitnessProgramId: string,
    macrocycleId: string,
    startDate: Date,
    programType: string
  ): Promise<string> {
    // 1. Call AI to generate MesocycleDetailed using mesocycleBreakdownPrompt
    // 2. Parse and validate the generated MesocycleDetailed
    // 3. Add DB fields to create MesocycleDB object
    // 4. Calculate proper dates for each microcycle
    // 5. Store everything in database using transaction
    // 6. Return the created mesocycle ID
  }
}
```

### 6. Repository Updates

#### MesocycleRepository
```typescript
class MesocycleRepository extends BaseRepository {
  async createMesocycle(data: MesocycleDB): Promise<string>
  async getMesocycleById(id: string): Promise<MesocycleDB | null>
  async getMesocyclesByProgramId(programId: string): Promise<MesocycleDB[]>
  async getMesocyclesByMacrocycleId(macrocycleId: string): Promise<MesocycleDB[]>
}
```

#### MicrocycleRepository
```typescript
class MicrocycleRepository extends BaseRepository {
  async createMicrocycle(data: MicrocycleDB): Promise<string>
  async getMicrocyclesByMesocycleId(mesocycleId: string): Promise<MicrocycleDB[]>
  async updateMicrocycleMetrics(id: string, metrics: KeyValuePair[]): Promise<void>
}
```

#### WorkoutInstanceRepository
```typescript
class WorkoutInstanceRepository extends BaseRepository {
  async createWorkoutInstance(data: WorkoutInstanceDB): Promise<string>
  async getWorkoutsByMicrocycleId(microcycleId: string): Promise<WorkoutInstanceDB[]>
  async updateWorkoutStatus(id: string, status: 'completed' | 'skipped'): Promise<void>
}
```

### 7. Transaction Management

#### Database Transaction Flow
```typescript
async function storeMesocycleData(db: Database, data: {
  mesocycle: MesocycleDB,
  microcycles: MicrocycleDB[],
  workouts: WorkoutInstanceDB[]
}): Promise<void> {
  await db.transaction(async (trx) => {
    // 1. Insert mesocycle
    const mesocycleId = await trx.insertInto('mesocycles')
      .values(data.mesocycle)
      .returning('id')
      .executeTakeFirst();
    
    // 2. Insert all microcycles
    for (const microcycle of data.microcycles) {
      const microcycleId = await trx.insertInto('microcycles')
        .values({ ...microcycle, mesocycle_id: mesocycleId })
        .returning('id')
        .executeTakeFirst();
      
      // 3. Insert workouts for this microcycle
      const microcycleWorkouts = data.workouts
        .filter(w => w.microcycle_id === microcycle.id);
      
      if (microcycleWorkouts.length > 0) {
        await trx.insertInto('workout_instances')
          .values(microcycleWorkouts.map(w => ({
            ...w,
            microcycle_id: microcycleId
          })))
          .execute();
      }
    }
  });
}
```

### 8. Error Handling

#### Validation Errors
- Validate generated AI output against schemas before database insertion
- Handle missing required fields gracefully
- Provide meaningful error messages for debugging

#### Database Errors
- Handle unique constraint violations (duplicate IDs)
- Handle foreign key constraint violations
- Implement retry logic for transient failures

#### AI Generation Errors
- Handle cases where AI doesn't generate valid JSON
- Implement fallback logic for partial generation failures
- Log generation errors for monitoring

### 9. Implementation Steps

1. **Update Type Definitions**
   - Extend existing types with database fields
   - Export new DB-specific types

2. **Create Repositories**
   - Implement MesocycleRepository
   - Implement MicrocycleRepository
   - Implement WorkoutInstanceRepository

3. **Update Prompt Templates**
   - Enhance mesocycleBreakdownPrompt for better ID generation
   - Add explicit date format requirements

4. **Implement Helper Functions**
   - Create ID generation utilities
   - Create date calculation utilities
   - Create validation utilities

5. **Create MesocycleGenerationService**
   - Implement main generation flow
   - Add transaction management
   - Add error handling

6. **Update API Endpoints**
   - Modify existing endpoints to use new service
   - Ensure proper error responses

7. **Testing**
   - Unit tests for helper functions
   - Integration tests for repositories
   - End-to-end tests for generation flow

### 10. Migration Considerations

If updating existing code:
1. Create database migrations for any schema changes
2. Handle backward compatibility for existing data
3. Consider data migration strategy for existing mesocycles

### 11. Performance Optimizations

1. **Batch Insertions**
   - Insert multiple workout instances in single query
   - Use prepared statements for repeated operations

2. **Indexing**
   - Ensure proper indexes on foreign key columns
   - Add indexes for common query patterns

3. **Caching**
   - Cache generated mesocycles for quick retrieval
   - Implement cache invalidation strategy

## Conclusion

This implementation plan provides a comprehensive approach to storing generated mesocycles, microcycles, and workout instances in the database. The key data flow is:

1. **MesocyclePlan** (from FitnessProgram) → Input to AI prompt
2. **MesocycleDetailed** (with microcycles) → Output from AI prompt  
3. **MesocycleDB** → MesocycleDetailed + database fields for storage

Key aspects of the implementation:
- MesocyclePlan remains unchanged as part of the FitnessProgram schema
- mesocycleBreakdownPrompt generates MesocycleDetailed from MesocyclePlan
- MesocycleDB extends MesocycleDetailed with database-specific fields
- Proper repository layer for data access
- Transactional storage to ensure data consistency
- Robust error handling throughout the flow

This approach maintains clean separation between AI generation schemas and database storage while ensuring all generated fitness programs are properly persisted.