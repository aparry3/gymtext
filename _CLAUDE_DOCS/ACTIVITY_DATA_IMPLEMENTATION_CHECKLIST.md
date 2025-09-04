# Activity Data Array Implementation Checklist

## Phase 1: Schema & Type Updates

### 1.1 Update ActivityDataSchema Definition ✅
- [x] **File**: `src/server/models/user/schemas.ts`
- [x] **Line 179**: Replace `export const ActivityDataSchema = z.any().optional();`
- [x] **With**:
  ```typescript
  export const ActivityDataSchema = z.union([
    HikingDataSchema,
    RunningDataSchema, 
    StrengthDataSchema,
    CyclingDataSchema,
    SkiingDataSchema,
    GeneralActivityDataSchema
  ]).array().optional();
  ```
- [x] **Verify**: All activity schemas are properly imported and available

### 1.2 Update FitnessProfile Type Export ✅
- [x] **File**: `src/server/models/user/schemas.ts`
- [x] **Line 320**: Ensure `ActivityData` type reflects array change
- [x] **Add** explicit array type if needed:
  ```typescript
  export type ActivityDataArray = ActivityData; // Explicit array type alias
  ```

### 1.3 Regenerate Database Types ✅
- [x] **Command**: `pnpm db:codegen` (with `source .env.local`)
- [x] **Verify**: TypeScript compilation succeeds (`pnpm tsc --noEmit`)
- [x] **Check**: No breaking changes in dependent files
- [x] **Fixed**: Updated `activityInference.ts` to handle array format

### 1.4 Test Schema Validation ✅
- [x] Create test file: `tests/unit/models/user/activityDataSchema.test.ts`
- [x] Test empty array: `[]` ✅
- [x] Test single activity: `[{type: 'running', ...}]` ✅ 
- [x] Test multiple activities: `[{type: 'running', ...}, {type: 'strength', ...}]` ✅
- [x] Test invalid activity structure (should fail) ✅
- [x] **All 9 tests pass** including mixed activities, optional fields, and validation

## Phase 2: Profile Patch Tool Enhancement ✅

### 2.1 Add Activity Data Merge Helper ✅
- [x] **File**: `src/server/agents/tools/profilePatchTool.ts`
- [x] **Add** before the main tool function:
  ```typescript
  import type { ActivityData } from '@/server/models/user/schemas';

  /**
   * Merge activity data arrays, preserving existing activities and updating/adding new ones
   */
  function mergeActivityData(
    current: ActivityData[] = [], 
    newActivity: ActivityData
  ): ActivityData[] {
    // Find existing activity of same type
    const existingIndex = current.findIndex(
      activity => activity.type === newActivity.type
    );
    
    if (existingIndex >= 0) {
      // Update existing activity (merge metrics, goals, etc.)
      const existing = current[existingIndex];
      const updated = {
        ...existing,
        ...newActivity,
        // Merge arrays instead of overwriting
        equipment: [...(existing.equipment || []), ...(newActivity.equipment || [])].filter((item, index, arr) => arr.indexOf(item) === index),
        goals: [...(existing.goals || []), ...(newActivity.goals || [])].filter((item, index, arr) => arr.indexOf(item) === index),
        keyMetrics: { ...existing.keyMetrics, ...newActivity.keyMetrics },
        lastUpdated: new Date()
      };
      
      const result = [...current];
      result[existingIndex] = updated;
      return result;
    } else {
      // Add new activity type
      return [...current, { ...newActivity, lastUpdated: new Date() }];
    }
  }
  ```

### 2.2 Update Profile Patch Logic ✅
- [x] **File**: `src/server/agents/tools/profilePatchTool.ts`
- [x] **Location**: Inside the tool function, around line 80-90
- [x] **Add** special handling for activityData:
  ```typescript
  // Handle activityData array merging specially
  if (updates.activityData && !Array.isArray(updates.activityData)) {
    // Convert single activity to array format for consistency
    updates.activityData = [updates.activityData] as ActivityData[];
  }

  let mergedActivityData = currentProfile.activityData;
  if (updates.activityData && Array.isArray(updates.activityData)) {
    const currentActivities = (currentProfile.activityData as ActivityData[]) || [];
    
    // Merge each new activity
    mergedActivityData = updates.activityData.reduce(
      (acc, newActivity) => mergeActivityData(acc, newActivity),
      currentActivities
    );
    
    // Remove from updates to prevent simple overwrite
    delete updates.activityData;
  }

  // Merge updates into current profile
  const updatedProfile: Partial<FitnessProfile> = {
    ...currentProfile,
    ...updates,
    // Apply merged activity data
    ...(mergedActivityData && { activityData: mergedActivityData })
  };
  ```

### 2.3 Update Field Change Tracking ✅
- [x] **File**: `src/server/agents/tools/profilePatchTool.ts`
- [x] **Location**: Around line 113-116  
- [x] **Update** to handle activityData array changes:
  ```typescript
  // Get list of fields that were updated
  const fieldsUpdated = Object.keys(updates).filter(key => 
    updates[key as keyof FitnessProfile] !== undefined
  );
  
  // Add activityData to fieldsUpdated if it was merged
  if (mergedActivityData !== currentProfile.activityData) {
    fieldsUpdated.push('activityData');
  }
  ```

### 2.4 Test Profile Patch Tool ✅
- [x] Create comprehensive unit tests: `tests/unit/agents/tools/profilePatchTool.test.ts`
- [x] Test: Empty profile + new activity → [new activity] ✅
- [x] Test: Existing activity + same type → merged activity with preserved data ✅
- [x] Test: Existing activity + different type → [existing, new] ✅
- [x] Test: Multiple activities in single update → properly merged ✅
- [x] Test: Duplicate goals/equipment removal ✅
- [x] Test: Confidence threshold validation ✅
- [x] Test: Field change tracking ✅
- [x] Test: Error handling and edge cases ✅
- [x] **12 tests pass** with comprehensive coverage of merging logic
- [x] **ESLint and TypeScript compilation pass** ✅

## Phase 3: Agent Prompt Updates ✅

### 3.1 Update Activity Data Instructions ✅
- [x] **File**: `src/server/agents/profile/prompts.ts`
- [x] **Lines 102-126**: Update activityData section to array format
- [x] **Replace** single object example with array-focused instructions:
  ```typescript
  🎯 ACTIVITY-SPECIFIC DATA EXTRACTION (CRITICAL PRIORITY):
  - When users mention ANY specific activities, you MUST populate/append to the activityData ARRAY
  - Activity detection is MANDATORY for: hiking, running, lifting, strength training, cycling, skiing, etc.
  - ALWAYS work with activityData as an array of activity objects
  - Each activity object should have: type, experienceLevel, keyMetrics, equipment, goals, experience
  - If user mentions multiple activities in one message, create multiple activity objects
  - If activity type already exists, UPDATE the existing entry rather than duplicating

  ACTIVITY DATA STRUCTURE (ARRAY FORMAT):
  activityData: [
    {
      type: 'running',
      experienceLevel: 'intermediate',
      keyMetrics: { weeklyMileage: 25, longestRun: 13.1 },
      equipment: ['running shoes', 'GPS watch'],
      goals: ['first marathon', 'sub-4:00 time'],
      experience: 'running for 2 years',
      lastUpdated: Date
    },
    {
      type: 'strength',
      experienceLevel: 'beginner', 
      keyMetrics: { trainingDays: 3, benchPress: 135 },
      equipment: ['home gym', 'dumbbells'],
      goals: ['build muscle', 'bench bodyweight'],
      experience: 'just started lifting',
      lastUpdated: Date
    }
    // Support for multiple simultaneous activities
  ]
  ```

### 3.2 Add Multi-Activity Examples ✅
- [x] **File**: `src/server/agents/profile/prompts.ts`
- [x] **Lines 64-74**: Add multi-activity examples:
  ```typescript
  MULTI-ACTIVITY DETECTION EXAMPLES (BOTH ACTIVITIES REQUIRED):
  - "I run and also do strength training" → MUST extract BOTH:
    * primaryGoal: "endurance" + activityData: [{type: 'running', goals: ['cardio fitness']}, {type: 'strength', goals: ['cross-training']}]
  - "Training for a marathon but also hitting the gym" → MUST extract BOTH:
    * primaryGoal: "endurance" + activityData: [{type: 'running', goals: ['marathon training']}, {type: 'strength', goals: ['support training']}]  
  - "I ski in winter and hike in summer" → MUST extract BOTH:
    * primaryGoal: "endurance" + activityData: [{type: 'skiing', goals: ['winter fitness']}, {type: 'hiking', goals: ['summer fitness']}]
  - "I'm a runner but I also lift weights twice a week" → MUST extract BOTH:
    * primaryGoal: "endurance" + activityData: [{type: 'running', experienceLevel: 'experienced'}, {type: 'strength', keyMetrics: {trainingDays: 2}}]
  - "CrossFit and cycling are my main activities" → MUST extract BOTH:
    * primaryGoal: "athletic-performance" + activityData: [{type: 'other', activityName: 'CrossFit'}, {type: 'cycling'}]
  ```

### 3.3 Update Single Activity Examples ✅
- [x] **File**: `src/server/agents/profile/prompts.ts`  
- [x] **Lines 76-90**: Updated all examples to array format:
  ```typescript
  - "help me get in shape for ski season" → MUST extract primaryGoal: "endurance" + activityData: [{type: 'skiing', goals: ['ski season preparation']}]
  - "getting back into lifting weights" → MUST extract primaryGoal: "strength" + activityData: [{type: 'strength', experienceLevel: 'returning', goals: ['return to weightlifting']}]
  - "I run marathons" → MUST extract primaryGoal: "endurance" + activityData: [{type: 'running', experienceLevel: 'experienced', keyMetrics: {racesCompleted: 'multiple'}}]
  - Plus 5 more examples all updated to array format
  ```
- [x] **Added Critical Reminders**: Array format requirements and merge tool behavior explanation

## Phase 4: Testing & Validation

### 4.1 Unit Tests
- [ ] **Create**: `src/server/agents/tools/__tests__/profilePatchTool.test.ts`
- [ ] Test activityData array merging logic
- [ ] Test backwards compatibility with single activity objects  
- [ ] Test field change tracking includes activityData

### 4.2 Integration Tests  
- [ ] **Create**: `src/server/agents/profile/__tests__/multiActivity.test.ts`
- [ ] Test conversation flow: "I run" → profile has `[{type: 'running'}]`
- [ ] Test addition: "I also lift" → profile has `[{type: 'running'}, {type: 'strength'}]` 
- [ ] Test update: "I run 30 miles/week now" → running activity updated, strength preserved
- [ ] Test complex: "I run marathons and powerlift" → both activities extracted in single message

### 4.3 Agent Response Testing
- [ ] Test userProfileAgent with multi-activity messages
- [ ] Verify confidence scoring works with arrays
- [ ] Verify updateSummary correctly reports activityData changes
- [ ] Test with recentMessages context

### 4.4 End-to-End Testing
- [ ] **Manual Test**: Chat interface conversation flows
- [ ] Test: User mentions running → verify stored as array
- [ ] Test: User mentions additional activity → verify both preserved  
- [ ] Test: User updates existing activity → verify merge works
- [ ] **Verify**: UI displays multiple activities correctly (if applicable)

## Phase 5: Performance & Monitoring

### 5.1 Performance Testing
- [ ] Test profile extraction speed with large activity arrays
- [ ] Test database query performance with JSONB arrays
- [ ] Verify no memory leaks in activity merging logic

### 5.2 Monitoring Setup
- [ ] Add logging for activity data updates
- [ ] Monitor profile extraction confidence scores
- [ ] Track number of activities per user profile
- [ ] Alert on failed activity data merges

## Phase 6: Deployment & Rollout

### 6.1 Backwards Compatibility Testing
- [ ] Test existing profiles with single activityData object
- [ ] Verify graceful handling of legacy data
- [ ] Test migration of old format to new format

### 6.2 Gradual Rollout
- [ ] Deploy with feature flag (if available)
- [ ] Monitor extraction accuracy in production
- [ ] Validate no regression in overall profile building
- [ ] Full rollout after validation period

## Success Criteria

- [ ] ✅ User mentions multiple activities → all activities preserved in profile
- [ ] ✅ Activity-specific metrics maintained per activity type
- [ ] ✅ No data loss when activities are mentioned in separate messages  
- [ ] ✅ Profile extraction confidence remains high (>0.75)
- [ ] ✅ Existing single-activity profiles continue to work
- [ ] ✅ Agent generates contextual responses using all user activities

## Rollback Plan

If issues arise:
1. **Schema**: Revert `ActivityDataSchema` to `z.any().optional()`
2. **Tool**: Remove activity merging logic, restore simple merge
3. **Prompts**: Revert to single activity object instructions
4. **Database**: Data remains intact (JSONB flexibility)
5. **Regenerate**: Run `pnpm db:codegen` to restore types

---

**Estimated Implementation Time**: 2-3 days  
**Risk Level**: Low (backwards compatible, no DB migration required)  
**Impact**: High (eliminates activity data loss, improves user profiles)