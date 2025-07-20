# Transition Week Bug Fix Triage

## Issue Summary
When a workout plan starts on a non-Monday (e.g., Friday July 18), the transition week (Week 0) is not correctly handled, causing Week 1 to start immediately instead of after the transition period ends.

**Expected Behavior:**
- Week 0 (Transition): July 18-20 (Fri-Sun)
- Week 1: July 21-27 (Mon-Sun)

**Actual Behavior:**
- Week 0 and Week 1 dates are overlapping or incorrectly calculated

## Root Cause Analysis

### 1. **Week Number Calculation Issue**
In `calculateMicrocycleDates` function (`src/server/data/types/cycleTypes.ts`):
```typescript
export function calculateMicrocycleDates(
  mesocycleStartDate: Date,
  weekNumber: number
): { startDate: Date; endDate: Date } {
  const startDate = new Date(mesocycleStartDate);
  startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  return { startDate, endDate };
}
```

**Problem**: This function assumes week numbers start at 1 and calculates dates linearly from the mesocycle start date. It doesn't account for transition weeks (week 0) or the fact that after a transition week, the next week should start on the following Monday.

### 2. **Transition Week Logic Gap**
While the `workoutGeneratorAgent.ts` has logic to detect and create transition weeks:
- `needsTransitionMicrocycle()` correctly identifies when a transition is needed
- `breakdownMesocycleWithTransition()` is called to handle the transition

However, the date calculation in `calculateMicrocycleDates` doesn't differentiate between:
- Regular weeks (which should be 7 days)
- Transition weeks (which are variable length until the next Monday)

### 3. **Missing Context in Date Calculation**
The `calculateMicrocycleDates` function lacks context about:
- Whether the current week is a transition week
- The actual program start date vs. the adjusted Monday start date

## Proposed Solution

### Option 1: Enhanced Date Calculation (Recommended)
Modify `calculateMicrocycleDates` to handle transition weeks:

```typescript
export function calculateMicrocycleDates(
  mesocycleStartDate: Date,
  weekNumber: number,
  isTransitionWeek?: boolean
): { startDate: Date; endDate: Date } {
  const startDate = new Date(mesocycleStartDate);
  
  if (isTransitionWeek || weekNumber === 0) {
    // Transition week: runs from start date to Sunday
    const endDate = new Date(startDate);
    const daysUntilSunday = (7 - startDate.getDay()) % 7 || 7;
    endDate.setDate(endDate.getDate() + daysUntilSunday - 1);
    return { startDate, endDate };
  } else {
    // Regular weeks: calculate from the Monday after transition
    const dayOfWeek = mesocycleStartDate.getDay();
    const daysToMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
    const mondayStart = new Date(mesocycleStartDate);
    mondayStart.setDate(mondayStart.getDate() + daysToMonday);
    
    // Now calculate based on adjusted week number
    const adjustedStartDate = new Date(mondayStart);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + (weekNumber - 1) * 7);
    
    const endDate = new Date(adjustedStartDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return { startDate: adjustedStartDate, endDate };
  }
}
```

### Option 2: Store Transition Information
Add a field to track transition weeks in the microcycle data:

1. Add `isTransition` boolean to microcycle table/type
2. Pass this information through the generation pipeline
3. Use it in date calculations

## Implementation Steps

1. **Update `calculateMicrocycleDates` function**
   - Add logic to handle week 0 as a transition week
   - Ensure week 1+ starts on Monday after transition period

2. **Update `MesocycleGenerationService`**
   - Pass transition week information to date calculation
   - Ensure microcycle offset accounts for partial transition weeks

3. **Update Database Schema (if Option 2)**
   - Add `is_transition` column to `microcycles` table
   - Update related types and repositories

4. **Add Tests**
   - Test Friday start date → transition week ends Sunday
   - Test Monday start date → no transition week
   - Test various start days of the week

5. **Verify Fix**
   - Run test for user +13392223571
   - Check that Week 0 is July 18-20
   - Check that Week 1 is July 21-27

## Testing Checklist

- [ ] Create workout plan starting on Friday
- [ ] Verify Week 0 dates (should be Fri-Sun)
- [ ] Verify Week 1 dates (should be Mon-Sun)
- [ ] Test all days of the week as start dates
- [ ] Ensure no date overlaps between weeks
- [ ] Verify workout instances have correct dates

## Related Files
- `src/server/data/types/cycleTypes.ts` - Date calculation function
- `src/server/services/fitness/mesocycleGenerationService.ts` - Mesocycle generation
- `src/server/agents/workoutGeneratorAgent.ts` - Transition week detection
- `src/server/prompts/templates.ts` - Prompt templates mentioning week numbers

## Notes
- The system correctly identifies the need for transition weeks
- The AI agent is instructed to create week 0 for transitions
- The bug is specifically in the date calculation logic, not in the workout generation itself