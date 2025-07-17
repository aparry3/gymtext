# Mesocycle Breakdown Implementation Checklist

## Overview
This checklist tracks the implementation of the mesocycle breakdown functionality that populates each MesoCycle with its MicroCycles, DailyWorkouts, and workout breakdowns.

## Implementation Tasks

### Phase 1: Schema Updates
- [x] Create `MesocyclePlan` type in `src/shared/types/cycles.ts`
  - [x] Define lightweight mesocycle structure without microcycles
  - [x] Include: id, phase, weeks, weeklyTargets
  - [x] Add proper TypeScript/Zod descriptions
- [x] Create `MesocycleDetailed` type in `src/shared/types/cycles.ts`
  - [x] Extend MesocyclePlan fields
  - [x] Add microcycles array field
  - [x] Ensure strict validation
- [x] Update `Macrocycle` type to use `MesocyclePlan`
  - [x] Change mesocycles array type from Mesocycle to MesocyclePlan
  - [x] Update related imports and type references
- [x] Test schema changes compile without errors

### Phase 2: Prompt Template Development
- [ ] Create `mesocycleBreakdownPrompt` in `src/server/prompts/templates.ts`
  - [ ] Define function signature with proper parameters
  - [ ] Include user profile context
  - [ ] Add mesocycle plan details
  - [ ] Incorporate fitness profile string
  - [ ] Handle start date for workout scheduling
- [ ] Design prompt content structure:
  - [ ] System role definition (elite fitness coach)
  - [ ] Clear task instructions
  - [ ] Schema requirements and constraints
  - [ ] Progressive overload guidelines
  - [ ] Exercise selection criteria
  - [ ] Example output format
- [ ] Add prompt variations for different program types:
  - [ ] Strength-focused programs
  - [ ] Endurance programs
  - [ ] Shred/cutting programs
  - [ ] Hybrid programs

### Phase 3: Agent Function Implementation
- [ ] Create `breakdownMesocycleChain` function
  - [ ] Set up in `fitnessOutlineAgent.ts` or new agent file
  - [ ] Implement RunnableSequence structure
  - [ ] Add context preparation step
  - [ ] Implement LLM structured output call
  - [ ] Create MesocycleDetailed assembly step
- [ ] Define `MicrocyclesSchema` for structured output
  - [ ] Use z.array(Microcycle) validation
  - [ ] Set appropriate min/max constraints
- [ ] Add error handling:
  - [ ] LLM timeout handling
  - [ ] Schema validation failures
  - [ ] Retry logic with exponential backoff
- [ ] Implement logging for debugging

### Phase 4: Integration Logic
- [ ] Create orchestration function for processing all mesocycles
  - [ ] Iterate through each mesocycle plan
  - [ ] Call breakdownMesocycleChain for each
  - [ ] Handle sequential date calculations
  - [ ] Aggregate results into complete program
- [ ] Add caching mechanism:
  - [ ] Cache generated microcycles by mesocycle ID
  - [ ] Implement cache invalidation strategy
  - [ ] Consider Redis integration
- [ ] Create API endpoint for mesocycle breakdown
  - [ ] Accept program ID and mesocycle ID
  - [ ] Return populated mesocycle data
  - [ ] Handle partial generation (single mesocycle)

### Phase 5: Validation & Testing
- [ ] Create validation functions:
  - [ ] Verify microcycle count matches mesocycle weeks
  - [ ] Check workout dates are sequential
  - [ ] Validate session types match split patterns
  - [ ] Ensure progressive overload is applied
- [ ] Write unit tests:
  - [ ] Schema transformation tests
  - [ ] Prompt generation tests
  - [ ] Date calculation tests
  - [ ] Split pattern matching tests
- [ ] Integration testing:
  - [ ] Test with various user profiles
  - [ ] Test different program types
  - [ ] Test edge cases (minimal equipment, injuries)
  - [ ] Performance testing for multiple mesocycles

### Phase 6: Error Handling & Edge Cases
- [ ] Handle incomplete user profiles
- [ ] Manage equipment limitations gracefully
- [ ] Account for injury modifications
- [ ] Support schedule constraints (limited days)
- [ ] Implement fallback exercises
- [ ] Add user preference overrides

### Phase 7: Documentation & Deployment
- [ ] Document new API endpoints
- [ ] Update type definitions documentation
- [ ] Create usage examples
- [ ] Add migration guide for existing data
- [ ] Update README with new functionality
- [ ] Prepare deployment checklist

## Success Criteria
- [ ] All mesocycles can be populated with detailed microcycles
- [ ] Generated workouts follow split patterns accurately
- [ ] Progressive overload is correctly implemented
- [ ] Dates calculate properly across weeks
- [ ] System handles errors gracefully
- [ ] Performance is acceptable (<5s per mesocycle)
- [ ] All tests pass with >90% coverage

## Notes
- Consider parallel processing for multiple mesocycles after initial sequential implementation
- Monitor token usage and optimize prompts if needed
- Gather user feedback on generated workouts for future improvements