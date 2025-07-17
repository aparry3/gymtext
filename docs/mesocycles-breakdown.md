# Mesocycle Breakdown Implementation Plan

## Overview

This document outlines the implementation plan for creating a prompt template that populates each MesoCycle with its MicroCycles, DailyWorkouts, and workout breakdowns. This is the second phase of the workout plan creation process, following the initial FitnessProgram → MacroCycle → MesoCycles generation.

## Current State Analysis

### Existing Structure
1. **Phase 1 (Implemented)**: `fitnessOutlineAgent.ts` generates:
   - FitnessProgram with overview
   - MacroCycle (typically 1)
   - MesoCycles (2+ per macrocycle)
   - WeeklyTargets with `split` field (e.g., "Upper-Lower-HIIT-Rest")
   - Empty `microcycles` arrays

2. **Current Schema Discrepancy**:
   - JSON schema (`cycles.json`) includes `microcycles` in Mesocycle
   - TypeScript schema (`cycles.ts`) is missing `microcycles` field in Mesocycle type
   - This needs to be fixed before implementation

### Data Flow Hierarchy
```
FitnessProgram
└── MacroCycle (1)
    └── MesoCycles (2+)
         └── WeeklyTargets (3-4 per mesocycle) //High level breakdown of the mesocycle weeks
         └── MicroCycles (to be generated) //Detailed breakdown of each individiual week, fully populated with days and workouts
               └── WorkoutInstance (7 per microcycle)
                  └── Blocks (warmup, main, cooldown)
                     └── Activities (specific exercises)
```

## Architecture Decision: Separate Mesocycle Types

### Rationale for Two Types

We will create two separate Mesocycle types to optimize the LLM interaction:

1. **MesocyclePlan** (lightweight)
   - Used in the initial FitnessProgram generation
   - Contains only high-level planning data (id, phase, weeks, weeklyTargets)
   - Reduces schema complexity for the planning prompt
   - Prevents LLM from attempting to generate detailed workouts prematurely

2. **MesocycleDetailed** (complete)
   - Used for storing and working with fully populated mesocycles
   - Includes all MesocyclePlan fields plus the microcycles array
   - Represents the complete workout data structure

### Benefits
- **Reduced token usage**: Smaller schemas in prompts
- **Clearer separation of concerns**: Planning vs. implementation phases
- **Better LLM performance**: More focused prompts with less room for confusion
- **Easier debugging**: Clear distinction between generated plans and detailed workouts

## Implementation Plan

### Step 1: Update TypeScript Schema with Separate Types

Create two separate Mesocycle types in `src/shared/types/cycles.ts`:

1. **MesocyclePlan** - Used in FitnessProgram structured output (lightweight)
```typescript
const MesocyclePlan = z.object({
  id: z.string().describe("Mesocycle identifier"),
  phase: z.string().describe("Training phase label"),
  weeks: z.number().int().describe("Duration in weeks"),
  weeklyTargets: z.array(WeeklyTarget).min(1)
                 .describe("Progression targets per week"),
}).strict().describe("High-level mesocycle plan without detailed workouts.");
```

2. **MesocycleDetailed** - Full mesocycle with populated microcycles
```typescript
const MesocycleDetailed = z.object({
  id: z.string().describe("Mesocycle identifier"),
  phase: z.string().describe("Training phase label"),
  weeks: z.number().int().describe("Duration in weeks"),
  weeklyTargets: z.array(WeeklyTarget).min(1)
                 .describe("Progression targets per week"),
  microcycles: z.array(Microcycle).min(1)
               .describe("Detailed weekly workout plans")
}).strict().describe("Complete mesocycle with all workout details.");
```

3. **Update Macrocycle to use MesocyclePlan**
```typescript
const Macrocycle = z.object({
  id: z.string().describe("Macrocycle identifier"),
  startDate: z.string().optional()
             .describe("Optional start date YYYY-MM-DD"),
  lengthWeeks: z.number().int()
                .describe("Total weeks in macrocycle"),
  mesocycles: z.array(MesocyclePlan).min(1)  // Changed from Mesocycle
               .describe("Sequential mesocycle plans")
}).strict().describe("Top-level goal window with mesocycle plans.");
```

### Step 2: Create Mesocycle Breakdown Prompt Template

Create a new prompt template in `src/server/prompts/templates.ts`:

```typescript
export const mesocycleBreakdownPrompt = (
  user: UserWithProfile,
  mesocyclePlan: MesocyclePlan,  // Using the lightweight plan type
  fitnessProfile: string,
  programType: string,
  startDate: Date
) => `prompt content here...`
```

#### Prompt Design Considerations

1. **Input Context**:
   - User's fitness profile (experience, goals, equipment, preferences)
   - Specific mesocycle with its phase, weeklyTargets, and split patterns
   - Start date for proper date calculation
   - Program type (strength, endurance, shred, etc.)

2. **Progressive Overload Logic**:
   - Use weeklyTargets to guide progression
   - Implement deload weeks as specified
   - Respect intensity percentages (avgIntensityPct1RM)
   - Follow split patterns from weeklyTargets

3. **Exercise Selection**:
   - Match exercises to the mesocycle phase
   - Consider user's skill level and available equipment
   - Vary exercises week-to-week to prevent adaptation
   - Include appropriate warm-up and cooldown

4. **Output Structure**:
   - Generate microcycles array matching the mesocycle weeks
   - Each microcycle contains 7 WorkoutInstance objects
   - Follow the split pattern for session types
   - Include specific blocks and activities

### Step 3: Create Mesocycle Breakdown Agent Function

Create a new function in `fitnessOutlineAgent.ts` or a separate agent file:

```typescript
export const breakdownMesocycleChain = RunnableSequence.from([
  // Step 1: Prepare context
  async ({ userId, mesocyclePlan, programType, startDate }) => {
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);
    const fitnessProfile = fitnessProfileSubstring(user);
    return { user, mesocyclePlan, fitnessProfile, programType, startDate };
  },

  // Step 2: Generate microcycles using structured output
  async ({ user, mesocyclePlan, fitnessProfile, programType, startDate }) => {
    const prompt = mesocycleBreakdownPrompt(
      user, 
      mesocyclePlan, 
      fitnessProfile, 
      programType,
      startDate
    );
    
    // Define a schema for just the microcycles array
    const MicrocyclesSchema = z.array(Microcycle);
    
    const structuredModel = llm.withStructuredOutput(MicrocyclesSchema);
    const microcycles = await structuredModel.invoke(prompt);
    
    return { mesocyclePlan, microcycles };
  },

  // Step 3: Create complete MesocycleDetailed object
  async ({ mesocyclePlan, microcycles }) => {
    return {
      ...mesocyclePlan,
      microcycles
    } as MesocycleDetailed;
  }
]);
```

### Step 4: Integration Strategy

1. **When to Call**: After initial program generation, iterate through each mesocycle
2. **Batch vs Sequential**: Consider processing mesocycles sequentially to maintain date continuity
3. **Error Handling**: Implement retry logic for LLM failures
4. **Validation**: Ensure generated microcycles match mesocycle duration

### Step 5: Prompt Template Structure

The prompt should include:

1. **System Context**:
   - Role as elite fitness coach
   - Task to create detailed weekly plans

2. **Schema Requirements**:
   - Microcycle structure with WorkoutInstance details
   - Proper date calculations
   - Session type mapping to split pattern

3. **Content Guidelines**:
   - Progressive overload implementation
   - Exercise variety and appropriateness
   - Rest and recovery considerations
   - Equipment limitations

4. **Example Output**:
   - Show a complete microcycle with all workouts
   - Demonstrate proper block structure
   - Include realistic exercise selections

## Key Considerations

1. **Performance**: Each mesocycle breakdown is a separate LLM call - consider caching
2. **Consistency**: Ensure workout progression aligns with weeklyTargets
3. **Flexibility**: Allow for user preferences and constraints
4. **Validation**: Verify dates, workout counts, and schema compliance
5. **Start Date Handling**: Account for mid-week signups with transition microcycles

## Handling Mid-Week Signups

### The Challenge
- Users may sign up on any day of the week and should start their program immediately
- Standard microcycles run Monday-Sunday for consistency
- First mesocycle needs special handling for non-Monday start dates

### Solution: Transition Microcycle
When a user signs up on any day except Monday, the first mesocycle will include an additional "transition microcycle" at the beginning:

1. **Transition Microcycle Structure**:
   - Duration: From signup day to the following Sunday
   - Content: Adapted workouts that prepare for the full program
   - Purpose: Allows immediate start while maintaining week alignment

2. **Implementation Details**:
   - If signup is Monday: Standard mesocycle (no transition needed)
   - If signup is Tuesday-Sunday: Add transition microcycle + standard weeks
   - Transition microcycle uses the first week's split pattern, adjusted for fewer days

3. **Example Scenarios**:
   - **Wednesday signup**: 5-day transition (Wed-Sun) + full weeks
   - **Friday signup**: 3-day transition (Fri-Sun) + full weeks
   - **Sunday signup**: 1-day transition (Sun only) + full weeks

4. **Workout Distribution**:
   - Prioritize key workouts for the available days
   - Maintain rest day ratios
   - Ensure progressive entry into the program

### Prompt Modifications
The `mesocycleBreakdownPrompt` should include:
```typescript
// Additional context for transition handling
const daysUntilMonday = (8 - startDate.getDay()) % 7;
const needsTransition = daysUntilMonday > 0;
const transitionDays = needsTransition ? daysUntilMonday : 0;
```

### Schema Considerations
- First mesocycle may have `weeks + 1` microcycles if transition is needed
- Transition microcycle has fewer than 7 workout instances
- Date calculations must account for the transition period

## Next Steps

1. Create separate MesocyclePlan and MesocycleDetailed types in TypeScript schema
2. Update Macrocycle to use MesocyclePlan instead of Mesocycle
3. Implement the mesocycleBreakdownPrompt template
4. Create the breakdownMesocycleChain function
5. Add integration logic to process MesocyclePlan → MesocycleDetailed
6. Test with various mesocycle types and user profiles
7. Add error handling and validation