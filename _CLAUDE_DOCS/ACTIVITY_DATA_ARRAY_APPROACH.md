# Activity Data Array Implementation Approach

## Problem Analysis

The current FitnessProfile schema design has a critical issue where the `activityData` field gets **overwritten** instead of **accumulated** when users mention multiple activities (e.g., running and then strength training). This results in data loss and incomplete user profiles.

### Current Implementation Issues

#### 1. Schema Design Problem
**File**: `src/server/models/user/schemas.ts:179`
```typescript
// Current - single field that accepts any data
export const ActivityDataSchema = z.any().optional();

// In FitnessProfileSchema:
activityData: ActivityDataSchema, // Line 209 - Single field, not array
```

#### 2. Profile Update Mechanism Problem  
**File**: `src/server/agents/tools/profilePatchTool.ts:30-33`
```typescript
const updatedProfile: Partial<FitnessProfile> = {
  ...currentProfile,
  ...updates  // This OVERWRITES activityData completely
};
```

#### 3. Agent Prompt Problem
**File**: `src/server/agents/profile/prompts.ts:102-119`  
The prompt instructs the LLM to populate `activityData` as a single object, not append to an array:
```
- activityData: When users mention specific activities, structure as: {
    type: 'hiking' | 'running' | 'strength' | ...
    // Single object structure
  }
```

### Current Data Flow Problem

1. User mentions "I love running" → `activityData: {type: 'running', ...}` 
2. User mentions "I also do strength training" → `activityData: {type: 'strength', ...}` ← **OVERWRITES** running data
3. Running data is **lost forever**

## Proposed Solution

### 1. Schema Changes

#### Update FitnessProfileSchema to use array
**File**: `src/server/models/user/schemas.ts`

```typescript
// Replace ActivityDataSchema definition (line 179)
export const ActivityDataSchema = z.union([
  HikingDataSchema,
  RunningDataSchema, 
  StrengthDataSchema,
  CyclingDataSchema,
  SkiingDataSchema,
  GeneralActivityDataSchema
]).array().optional();

// In FitnessProfileSchema (line 209):
activityData: ActivityDataSchema, // Now an array of activity objects
```

### 2. Profile Patch Tool Enhancement

#### Smart Activity Data Merging
**File**: `src/server/agents/tools/profilePatchTool.ts`

Add specialized logic to handle `activityData` array merging:

```typescript
// Inside profilePatchTool, before the simple merge:
const mergeActivityData = (
  current: ActivityData[] = [], 
  newActivity: ActivityData
): ActivityData[] => {
  // Find existing activity of same type
  const existingIndex = current.findIndex(
    activity => activity.type === newActivity.type
  );
  
  if (existingIndex >= 0) {
    // Update existing activity (merge metrics, goals, etc.)
    const updated = [...current];
    updated[existingIndex] = mergeActivityDetails(current[existingIndex], newActivity);
    return updated;
  } else {
    // Add new activity type
    return [...current, newActivity];
  }
};

// Special handling for activityData in the merge logic
if (updates.activityData) {
  const currentActivities = currentProfile.activityData || [];
  updatedProfile.activityData = mergeActivityData(currentActivities, updates.activityData);
  delete updates.activityData; // Prevent simple overwrite
}

const updatedProfile: Partial<FitnessProfile> = {
  ...currentProfile,
  ...updates  // Now safe since activityData handled above
};
```

### 3. Agent Prompt Updates

#### Update Activity Data Instructions
**File**: `src/server/agents/profile/prompts.ts:102-119`

```typescript
// Update the activityData section:
- activityData: When users mention specific activities, APPEND to the array:
  [
    {
      type: 'running',
      experienceLevel: 'intermediate',
      keyMetrics: { weeklyMileage: 25, longestRun: 13.1 },
      goals: ['first marathon'],
      lastUpdated: Date
    },
    {
      type: 'strength', 
      experienceLevel: 'beginner',
      keyMetrics: { trainingDays: 3 },
      goals: ['build muscle'],
      lastUpdated: Date
    }
    // Multiple activities supported
  ]
```

### 4. Database Considerations

The current database schema supports this change **without migration** since:
- **Database**: `users.profile` is stored as `jsonb` (line 31 in migration)  
- **TypeScript**: `Users.profile` is typed as `Generated<Json | null>` (line 142 in _types)
- **Flexibility**: JSONB can store arrays naturally

## Implementation Strategy

### Phase 1: Schema & Type Updates
1. Update `ActivityDataSchema` to be an array
2. Update TypeScript types
3. Run `pnpm db:codegen` to regenerate types

### Phase 2: Profile Patch Tool Enhancement  
1. Add `mergeActivityData` function
2. Add special handling for `activityData` updates
3. Ensure backwards compatibility with existing single-object profiles

### Phase 3: Agent Prompt Refinement
1. Update prompts to instruct LLM to work with arrays
2. Add examples of multi-activity scenarios
3. Test extraction accuracy

### Phase 4: Testing & Validation
1. Test conversation flows: "I run" → "I also lift weights" 
2. Verify both activities are preserved
3. Test activity updates: "I now run 30 miles/week"
4. Ensure UI displays all activities correctly

## Benefits

1. **No Data Loss**: Multiple activities preserved permanently
2. **Rich Profiles**: Complete picture of user's fitness activities  
3. **Better Coaching**: AI can provide sport-specific advice
4. **Progressive Enhancement**: Activities can be refined over time
5. **Backwards Compatible**: Existing single-activity profiles still work

## Risk Mitigation

1. **Backwards Compatibility**: Handle existing single-object `activityData` 
2. **Migration Path**: Gradual conversion of legacy data
3. **Validation**: Ensure array structure is maintained
4. **Performance**: JSONB arrays are efficiently indexed in PostgreSQL

## Success Metrics

1. User mentions multiple activities → All activities saved
2. Activity-specific metrics preserved per activity type  
3. No regression in profile extraction accuracy
4. UI correctly displays multiple activities
5. AI coaching references appropriate activities

## Files Requiring Changes

1. `src/server/models/user/schemas.ts` - Schema definitions
2. `src/server/agents/tools/profilePatchTool.ts` - Merge logic  
3. `src/server/agents/profile/prompts.ts` - LLM instructions
4. Frontend profile display components (if any)
5. Tests covering multi-activity scenarios

## Next Steps

1. Implement schema changes and test type generation
2. Build and test activity merging logic in isolation
3. Update agent prompts with array-based examples
4. End-to-end testing with conversation flows
5. Monitor profile extraction accuracy in production

This approach transforms the activity data from a **lossy single-field design** to a **comprehensive activity portfolio** that grows with the user's fitness journey.