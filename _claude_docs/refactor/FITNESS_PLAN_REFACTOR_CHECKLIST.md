# Fitness Plan Refactor Implementation Checklist

## Overview
This checklist breaks down the fitness plan refactor into phased deliverables to enable incremental delivery, QA, and testing. Each phase builds upon the previous one and can be tested independently.

## Phase 1: Database Schema & Model Foundation
**Goal**: Update database schema and core models to support the simplified structure  
**Estimated Time**: 2-3 days  
**Testing**: Unit tests for models, migration rollback verification

### 1.1 Database Migration Preparation
- [ ] Create backup of production database
- [ ] Document current schema state for rollback reference
- [ ] Create migration file: `pnpm migrate:create fitness-plan-refactor`
- [ ] Implement migration with:
  - [ ] Add `mesocycles` JSON column to fitnessPlans
  - [ ] Add `lengthWeeks` INTEGER column to fitnessPlans  
  - [ ] Add `notes` TEXT column to fitnessPlans
  - [ ] Data transformation logic from macrocycles → mesocycles
  - [ ] Implement down() migration for rollback capability
- [ ] Test migration on local database
- [ ] Test rollback on local database
- [ ] Run migration on staging: `pnpm migrate:up`

### 1.2 Update TypeScript Types
- [ ] Run `pnpm db:codegen` to regenerate database types
- [ ] Verify generated types match expected schema
- [ ] Fix any type compilation errors

### 1.3 Update Core Models
- [ ] Update `src/server/models/fitnessPlan/index.ts`:
  - [ ] Remove `MacrocycleOverview` interface
  - [ ] Update `FitnessPlanOverview` interface
  - [ ] Add `MesocycleOverview` interface with simplified structure
- [ ] Update `src/server/models/fitnessPlan/schema.ts`:
  - [ ] Create `_MesocycleOverviewSchema`
  - [ ] Update `_FitnessPlanSchema` with new structure
  - [ ] Remove macrocycle-related schemas

### 1.4 Update Repository Layer
- [ ] Update `FitnessPlanRepository`:
  - [ ] Modify `insertFitnessPlan` to use mesocycles field
  - [ ] Update `getFitnessPlan` to parse new structure
  - [ ] Add `getCurrentPlan(userId)` method
- [ ] Update existing repository tests
- [ ] Add tests for new repository methods

### Phase 1 Deliverables & Testing
- [ ] Run `pnpm build` - ensure no compilation errors
- [ ] Run `pnpm lint` - ensure code quality
- [ ] Run repository unit tests
- [ ] Manual test: Create a fitness plan with old API (should fail gracefully)
- [ ] Document breaking changes for team

---

## Phase 2: Agent Prompt Updates (Plan Generation)
**Goal**: Update fitness plan generation to create simplified structure  
**Estimated Time**: 2 days  
**Testing**: Agent output validation, prompt testing with various profiles

### 2.1 Update Fitness Plan Agent
- [ ] Update `src/server/agents/fitnessPlan/prompts.ts`:
  - [ ] Remove macrocycle layer from prompt instructions
  - [ ] Add notes field guidance
  - [ ] Update example outputs to match new schema
  - [ ] Simplify mesocycle structure in prompts
- [ ] Update `src/server/agents/fitnessPlan/chain.ts`:
  - [ ] Ensure structured output matches new schema
  - [ ] Update response parsing logic

### 2.2 Update Fitness Plan Service
- [ ] Modify `FitnessPlanService.createFitnessPlan()`:
  - [ ] Handle new simplified structure from agent
  - [ ] Map agent response to database format
  - [ ] Add notes field handling
- [ ] Update service layer tests

### 2.3 Validation & Testing
- [ ] Create test suite for various user profiles:
  - [ ] Endurance athlete
  - [ ] Strength training focus
  - [ ] Hybrid program
  - [ ] Rehabilitation needs
- [ ] Validate agent outputs match schema
- [ ] Test with edge cases (injuries, travel notes)

### Phase 2 Deliverables & Testing
- [ ] Generate 5 test fitness plans with different profiles
- [ ] Verify plans save correctly to database
- [ ] Ensure backward compatibility checks pass
- [ ] Run `pnpm test` for affected components
- [ ] QA review of generated plan quality

---

## Phase 3: Mesocycle & Microcycle Refactor
**Goal**: Update mesocycle breakdown to create patterns without pre-generated workouts  
**Estimated Time**: 2-3 days  
**Testing**: Pattern generation validation, microcycle structure testing

### 3.1 Update Mesocycle Model
- [ ] Update `src/server/models/mesocycle/index.ts`:
  - [ ] Remove microcycleOverviews from interface
  - [ ] Update schema to match new structure
- [ ] Update `src/server/models/mesocycle/schema.ts`

### 3.2 Update Microcycle Model  
- [ ] Update `src/server/models/microcycle/schema.ts`:
  - [ ] Create simplified `_MicrocycleSchema`
  - [ ] Add daily pattern structure (theme, load, notes)
  - [ ] Remove workout array references
- [ ] Update `src/server/models/microcycle/index.ts`

### 3.3 Update Mesocycle Breakdown Agent
- [ ] Update `src/server/agents/mesocycleBreakdown/prompts.ts`:
  - [ ] Remove workout generation instructions
  - [ ] Focus on daily patterns and themes
  - [ ] Add progressive overload guidance
  - [ ] Update example outputs
- [ ] Update `src/server/agents/mesocycleBreakdown/chain.ts`:
  - [ ] Adjust structured output expectations
  - [ ] Remove workout instance creation

### 3.4 Update Mesocycle Service
- [ ] Modify `MesocycleService.getNextMesocycle()`:
  - [ ] Direct access to mesocycles array
  - [ ] Save microcycles with patterns only
  - [ ] Remove workout generation calls
- [ ] Add `getCurrentMesocycle()` method
- [ ] Update service tests

### 3.5 Update Repositories
- [ ] Add to `MesocycleRepository`:
  - [ ] `getCurrentMesocycle(planId, date)` method
- [ ] Add to `MicrocycleRepository`:
  - [ ] `getCurrentMicrocycle(mesocycleId, date)` method
- [ ] Add repository tests

### Phase 3 Deliverables & Testing
- [ ] Test mesocycle breakdown for various program types
- [ ] Verify microcycles contain only patterns (no workouts)
- [ ] Validate progressive overload logic in patterns
- [ ] Run integration tests for plan → mesocycle → microcycle flow
- [ ] Manual QA of generated patterns

---

## Phase 4: Workout Model Enhancement
**Goal**: Create enhanced workout structure with blocks and modifications  
**Estimated Time**: 2 days  
**Testing**: Schema validation, workout structure tests

### 4.1 Update Workout Schema
- [ ] Update `src/server/models/workout/schema.ts`:
  - [ ] Create `_WorkoutBlockItemSchema`
  - [ ] Create `_WorkoutBlockSchema`
  - [ ] Create `_WorkoutModificationSchema`
  - [ ] Update `_WorkoutInstanceSchema` with new structure
- [ ] Update `src/server/models/workout/index.ts`:
  - [ ] Update interfaces to match new schema
  - [ ] Add type exports for new structures

### 4.2 Update Workout Repository
- [ ] Add to `WorkoutRepository`:
  - [ ] `getRecentWorkouts(userId, days)` method
  - [ ] `getWorkoutByDate(userId, date)` method
  - [ ] Update `create()` to handle new structure
- [ ] Add comprehensive repository tests

### 4.3 Migration for Existing Workouts
- [ ] Create migration to transform existing workout data
- [ ] Test migration with sample production data
- [ ] Implement rollback for workout structure changes

### Phase 4 Deliverables & Testing
- [ ] Unit tests for new workout schemas
- [ ] Validate workout structure with sample data
- [ ] Test backward compatibility for existing workouts
- [ ] Run `pnpm build` and `pnpm lint`

---

## Phase 5: Daily Workout Generation Agent
**Goal**: Implement on-demand workout generation with context awareness  
**Estimated Time**: 3-4 days  
**Testing**: Agent testing, context validation, generation quality

### 5.1 Create Daily Workout Agent
- [ ] Create `src/server/agents/dailyWorkout/` directory
- [ ] Implement `src/server/agents/dailyWorkout/prompts.ts`:
  - [ ] Context-aware prompt generation
  - [ ] Recent workout consideration
  - [ ] Progressive overload logic
  - [ ] Modification handling
- [ ] Implement `src/server/agents/dailyWorkout/chain.ts`:
  - [ ] LLM configuration (Gemini 2.0 Flash)
  - [ ] Structured output with WorkoutInstanceSchema
  - [ ] Error handling and retries
- [ ] Add comprehensive prompt tests

### 5.2 Create Workout Generation Context
- [ ] Implement context builder for workout generation:
  - [ ] Current microcycle day pattern
  - [ ] Recent workout history
  - [ ] User fitness profile
  - [ ] Special considerations from notes
- [ ] Add context validation

### 5.3 Agent Testing Suite
- [ ] Test workout generation for each program type
- [ ] Validate progressive overload implementation
- [ ] Test modification generation for common issues
- [ ] Verify workout matches daily theme/load
- [ ] Performance testing (generation time)

### Phase 5 Deliverables & Testing
- [ ] Generate 20 sample workouts across different contexts
- [ ] Validate workout quality with fitness experts
- [ ] Measure generation latency (target < 3 seconds)
- [ ] Test error recovery and retry logic

---

## Phase 6: Daily Message Service Integration
**Goal**: Integrate on-demand workout generation into daily message flow  
**Estimated Time**: 3 days  
**Testing**: End-to-end flow testing, fallback mechanisms

### 6.1 Update Daily Message Service
- [ ] Update `src/server/services/dailyMessageService.ts`:
  - [ ] Implement `generateTodaysWorkout()` method
  - [ ] Add workout existence check
  - [ ] Integrate dailyWorkout agent
  - [ ] Add caching logic
  - [ ] Implement retry mechanism
- [ ] Update error handling and logging

### 6.2 Implement Fallback Mechanisms
- [ ] Create fallback template system:
  - [ ] Basic workout templates by theme
  - [ ] Emergency workout generation
  - [ ] Queue system for retries
- [ ] Add monitoring and alerting

### 6.3 Optimize Performance
- [ ] Implement workout pre-generation during off-peak
- [ ] Add Redis caching for recent contexts
- [ ] Optimize database queries
- [ ] Add performance monitoring

### 6.4 Update Cron Jobs
- [ ] Update daily message cron to handle new flow
- [ ] Add pre-generation cron (optional)
- [ ] Update monitoring and logging

### Phase 6 Deliverables & Testing
- [ ] End-to-end test: User signup → plan creation → daily messages
- [ ] Load test: 100 concurrent workout generations
- [ ] Test fallback mechanisms with API failures
- [ ] Verify caching effectiveness
- [ ] Monitor generation success rates

---

## Phase 7: Monitoring & Operations
**Goal**: Set up comprehensive monitoring and operational tooling  
**Estimated Time**: 2 days  
**Testing**: Alert validation, dashboard verification

### 7.1 Logging Infrastructure
- [ ] Add structured logging for:
  - [ ] Workout generation timing
  - [ ] Agent invocation metrics
  - [ ] Cache hit/miss rates
  - [ ] Error rates by type
- [ ] Set up log aggregation

### 7.2 Monitoring Dashboard
- [ ] Create dashboard showing:
  - [ ] Daily workout generation count
  - [ ] Average generation latency
  - [ ] Error rates and types
  - [ ] LLM API usage metrics
  - [ ] Cache performance
- [ ] Set up real-time alerts

### 7.3 Operational Procedures
- [ ] Document rollback procedures
- [ ] Create runbook for common issues
- [ ] Set up on-call rotation
- [ ] Create incident response plan

### Phase 7 Deliverables & Testing
- [ ] Verify all metrics are being collected
- [ ] Test alert triggers
- [ ] Validate dashboard accuracy
- [ ] Run fire drill for rollback procedure

---

## Phase 8: Cleanup & Optimization
**Goal**: Remove deprecated code and optimize performance  
**Estimated Time**: 2 days  
**Testing**: Regression testing, performance benchmarks

### 8.1 Code Cleanup
- [ ] Remove deprecated macrocycle code
- [ ] Clean up unused workout pre-generation logic
- [ ] Update all import statements
- [ ] Remove obsolete tests

### 8.2 Performance Optimization
- [ ] Profile and optimize hot paths
- [ ] Implement connection pooling improvements
- [ ] Optimize agent prompts for token usage
- [ ] Add database indexes where needed

### 8.3 Documentation Updates
- [ ] Update API documentation
- [ ] Update architecture diagrams
- [ ] Create migration guide for API consumers
- [ ] Update CLAUDE.md with new patterns

### 8.4 Final Testing
- [ ] Full regression test suite
- [ ] Performance benchmarks vs. old system
- [ ] Security audit of new code paths
- [ ] Accessibility testing

### Phase 8 Deliverables
- [ ] Clean codebase with no deprecated code
- [ ] Updated documentation
- [ ] Performance comparison report
- [ ] Final sign-off from QA

---

## Rollout Strategy

### Staging Deployment (Week 1-2)
1. Deploy Phases 1-3 to staging
2. Run integration tests
3. Internal team testing
4. Fix any issues found

### Beta Testing (Week 3-4)
1. Deploy Phases 4-6 to staging
2. Select 10-20 beta users
3. Monitor generation success rates
4. Gather feedback on workout quality
5. Iterate on prompts based on feedback

### Production Rollout (Week 5-6)
1. Deploy with feature flag (10% of users)
2. Monitor metrics closely for 48 hours
3. Gradual rollout: 25% → 50% → 100%
4. Keep old system running in parallel for rollback

### Post-Launch (Week 7)
1. Deploy Phase 7-8
2. Decommission old workout generation system
3. Archive deprecated code
4. Celebrate! 🎉

---

## Risk Mitigation Checklist

### Pre-Deployment
- [ ] Database backups verified
- [ ] Rollback procedures tested
- [ ] Feature flags configured
- [ ] Monitoring dashboards ready
- [ ] On-call schedule set

### During Deployment
- [ ] Monitor error rates continuously
- [ ] Check LLM API usage against limits
- [ ] Verify workout generation latency
- [ ] Watch for database performance issues
- [ ] Customer support briefed on changes

### Post-Deployment
- [ ] Daily metrics review for first week
- [ ] User feedback collection system active
- [ ] Performance benchmarks documented
- [ ] Lessons learned documented
- [ ] Technical debt logged for future work

---

## Success Criteria

### Technical Metrics
- ✅ Workout generation latency < 3 seconds (p95)
- ✅ Generation success rate > 99.5%
- ✅ Zero data loss during migration
- ✅ API response times maintained or improved
- ✅ Database storage reduced by 30%+

### Business Metrics
- ✅ User engagement maintained or increased
- ✅ Support ticket volume stable or decreased
- ✅ Workout quality ratings maintained (NPS)
- ✅ Cost per user reduced by 20%+

### Quality Metrics
- ✅ Test coverage > 80% for new code
- ✅ Zero critical bugs in production
- ✅ All lint and build checks passing
- ✅ Documentation complete and accurate

---

## Team Assignments

### Suggested Role Distribution
- **Backend Lead**: Phases 1, 2, 6
- **AI/ML Engineer**: Phases 2, 3, 5
- **Database Engineer**: Phases 1, 4
- **DevOps**: Phases 7, 8, Rollout
- **QA Lead**: Testing at each phase
- **Product Manager**: User communication, success metrics

---

## Notes

1. Each phase should be completed and tested before moving to the next
2. Keep the old system running in parallel until fully confident
3. Document all decisions and deviations from this plan
4. Regular check-ins with stakeholders at phase boundaries
5. Be prepared to pause or rollback if issues arise

This refactor is a significant architectural change that will improve system flexibility, reduce costs, and enable better user experiences. Take time to do it right!