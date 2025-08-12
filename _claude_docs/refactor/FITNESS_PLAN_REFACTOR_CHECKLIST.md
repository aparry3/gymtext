# Fitness Plan Refactor Implementation Checklist

## Overview
This checklist breaks down the fitness plan refactor into phased deliverables to enable incremental delivery, QA, and testing. Each phase builds upon the previous one and can be tested independently.

## Phase 0: Clean Slate Migration Preparation [UPDATED]
**Goal**: Prepare to drop all training data and keep only fitness plans  
**Estimated Time**: 1 day  
**Testing**: Backup verification, migration testing

### 0.1 Backup and Analysis
- [ ] Create CRITICAL database backup (all data will be deleted!)
- [ ] Analyze existing data for documentation:
  - [ ] Count total fitness plans to convert
  - [ ] Count total mesocycles to be DELETED
  - [ ] Count total microcycles to be DELETED
  - [ ] Count total workout instances to be DELETED
  - [ ] Document any edge cases in fitness plans
- [ ] Document clean slate approach:
  - [ ] FitnessPlan schema conversion (KEEP)
  - [ ] All mesocycles (DELETE)
  - [ ] All microcycles (DELETE)
  - [ ] All workout instances (DELETE)

### 0.2 Create Progress Initialization Scripts
- [ ] Implement `initializeProgress.ts` script
- [ ] Add methods:
  - [ ] `getActiveUsersWithPlans()` - find users with plans
  - [ ] `initializeProgressTracking()` - set initial progress values
  - [ ] `notifyUsersOfReset()` - communication strategy
- [ ] Add helper functions:
  - [ ] `extractFocusAreas()` - for mesocycle conversion

### 0.3 Migration Scripts
- [ ] Write migration for:
  - [ ] Fitness plan schema change with progress columns
  - [ ] DROP mesocycles table entirely
  - [ ] DROP microcycles table entirely
  - [ ] DELETE all workout instances
  - [ ] Optional: CREATE fitness_progress table
- [ ] Test migration on staging database
- [ ] Verify tables are dropped and data removed
- [ ] Document that rollback = restore from backup

### 0.4 User Communication Plan
- [ ] Draft user notification message
- [ ] Plan timing for migration (low-usage hours)
- [ ] Prepare support team for questions
- [ ] Create FAQ for common concerns

### Phase 0 Deliverables & Testing
- [ ] Backup verified and stored securely (CRITICAL)
- [ ] Migration tested on staging (drops tables)
- [ ] Progress initialization script ready
- [ ] User communication plan approved
- [ ] Team understands tables will be dropped

---

## Phase 1: Database Schema & Model Foundation
**Goal**: Update database schema and core models to support the simplified structure  
**Estimated Time**: 2-3 days  
**Testing**: Unit tests for models, migration rollback verification

### 1.1 Database Migration Implementation
- [ ] VERIFY backup exists (CRITICAL - no going back!)
- [ ] Create migration file: `pnpm migrate:create fitness-plan-clean-slate`
- [ ] Implement migration with:
  - [ ] Add `mesocycles` JSON column to fitnessPlans
  - [ ] Add `lengthWeeks` INTEGER column to fitnessPlans  
  - [ ] Add `notes` TEXT column to fitnessPlans
  - [ ] Add `currentMesocycleIndex` INTEGER column (default 0)
  - [ ] Add `currentMicrocycleWeek` INTEGER column (default 1)
  - [ ] Add `cycleStartDate` TIMESTAMP column
  - [ ] Convert fitness plans:
    - [ ] Extract mesocycles from macrocycles structure
    - [ ] Calculate lengthWeeks from first macrocycle
  - [ ] DROP mesocycles table: `dropTable('mesocycles')`
  - [ ] DROP microcycles table: `dropTable('microcycles')`
  - [ ] DELETE ALL workoutInstances: `deleteFrom('workoutInstances')`
  - [ ] Drop macrocycles column
  - [ ] One-way migration (no down() function)
- [ ] Test migration on staging database
- [ ] Verify mesocycles and microcycles tables dropped
- [ ] Verify workoutInstances table emptied
- [ ] Verify fitness plans converted with progress fields
- [ ] Run migration: `pnpm migrate:up`

### 1.2 Update TypeScript Types
- [ ] Run `pnpm db:codegen` to regenerate database types
- [ ] Verify generated types match expected schema
- [ ] Fix any type compilation errors

### 1.3 Update Core Models
- [ ] Update `src/server/models/fitnessPlan/index.ts`:
  - [ ] Remove `MacrocycleOverview` interface
  - [ ] Update `FitnessPlanOverview` interface
  - [ ] Add `MesocycleOverview` interface with simplified structure
  - [ ] Add progress tracking fields to FitnessPlan interface
- [ ] Update `src/server/models/fitnessPlan/schema.ts`:
  - [ ] Create `_MesocycleOverviewSchema`
  - [ ] Update `_FitnessPlanSchema` with new structure
  - [ ] Remove macrocycle-related schemas
- [ ] Remove `src/server/models/mesocycle/` directory entirely
- [ ] Remove `src/server/models/microcycle/` directory entirely
- [ ] Create `src/server/models/microcyclePattern/` for on-demand patterns

### 1.4 Update Repository Layer
- [ ] Update `FitnessPlanRepository`:
  - [ ] Modify `insertFitnessPlan` to use mesocycles field
  - [ ] Update `getFitnessPlan` to parse new structure
  - [ ] Add `getCurrentPlan(userId)` method
  - [ ] Add `updateProgress(userId, progress)` method
  - [ ] Add `getProgress(userId)` method
- [ ] Remove `MesocycleRepository` entirely
- [ ] Remove `MicrocycleRepository` entirely
- [ ] Update existing repository tests
- [ ] Add tests for new repository methods

### 1.5 Initialize Progress Tracking
- [ ] Run progress initialization script after migration
- [ ] For each active user:
  - [ ] Get converted fitness plan
  - [ ] Verify progress fields are set (defaults from migration)
  - [ ] Set cycleStartDate if needed
  - [ ] Log initialization status
- [ ] Verify all active users have progress tracking
- [ ] Handle any initialization issues
- [ ] Document users affected

### Phase 1 Deliverables & Testing
- [ ] Fitness plans successfully converted to new schema
- [ ] Mesocycles and microcycles tables DROPPED
- [ ] WorkoutInstances table emptied
- [ ] Active users have progress tracking initialized
- [ ] Run `pnpm build` - ensure no compilation errors
- [ ] Run `pnpm lint` - ensure code quality
- [ ] Run repository unit tests
- [ ] Manual test: Users can generate new workouts on-demand
- [ ] Manual test: Daily messages work with on-demand generation
- [ ] Manual test: No references to dropped tables
- [ ] Document table drops for compliance/audit

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

## Phase 3: Progress Tracking & Pattern Generation
**Goal**: Implement progress tracking and on-demand pattern generation  
**Estimated Time**: 2-3 days  
**Testing**: Progress tracking validation, pattern generation testing

### 3.1 Create Progress Service
- [ ] Create `src/server/services/progressService.ts`:
  - [ ] `getCurrentProgress(userId)` method
  - [ ] `advanceWeek(userId)` method
  - [ ] `advanceMesocycle(userId)` method
  - [ ] `resetProgress(userId)` method
- [ ] Add progress calculation logic
- [ ] Add week/mesocycle transition logic

### 3.2 Create Microcycle Pattern Model
- [ ] Create `src/server/models/microcyclePattern/index.ts`:
  - [ ] Define `MicrocyclePattern` interface
  - [ ] Define daily pattern structure
- [ ] Create `src/server/models/microcyclePattern/schema.ts`:
  - [ ] Create pattern validation schema
  - [ ] Not stored in DB - generated on-demand

### 3.3 Create Microcycle Pattern Agent
- [ ] Create `src/server/agents/microcyclePattern/prompts.ts`:
  - [ ] Generate single week patterns
  - [ ] Consider mesocycle focus and week number
  - [ ] Progressive overload guidance
  - [ ] Deload week handling
- [ ] Create `src/server/agents/microcyclePattern/chain.ts`:
  - [ ] Structured output for patterns
  - [ ] Caching logic for week patterns

### 3.4 Update Daily Message Service
- [ ] Integrate with ProgressService:
  - [ ] Get current progress on each run
  - [ ] Generate week pattern if not cached
  - [ ] Use pattern to generate daily workout
- [ ] Add pattern caching (Redis or in-memory)
- [ ] Update service tests

### 3.5 Add Progress Endpoints (Optional)
- [ ] Create API endpoints:
  - [ ] GET `/api/progress/:userId`
  - [ ] POST `/api/progress/:userId/advance`
- [ ] Add progress tracking UI (optional)

### Phase 3 Deliverables & Testing
- [ ] Test progress tracking for various scenarios
- [ ] Verify week pattern generation works on-demand
- [ ] Validate progressive overload logic in patterns
- [ ] Test week/mesocycle transitions
- [ ] Run integration tests for progress → pattern → workout flow
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

### 4.3 Fresh Workout Generation
- [ ] All old workouts have been DELETED
- [ ] New workout generation uses block structure only
- [ ] No need for legacy format handling
- [ ] Implement clean workout display logic:
  - [ ] Assume all workouts have `blocks` property
  - [ ] Display blocks in order (Warm-up, Main, etc.)
  - [ ] Show modifications when applicable
- [ ] Test workout generation thoroughly
- [ ] Verify no references to old workout format

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
  - [ ] Integrate with ProgressService
  - [ ] Add pattern generation for current week
  - [ ] Add workout existence check
  - [ ] Integrate dailyWorkout agent
  - [ ] Add pattern and workout caching
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
- [ ] Remove all mesocycle table references
- [ ] Remove all microcycle table references
- [ ] Clean up unused workout pre-generation logic
- [ ] Update all import statements
- [ ] Remove obsolete tests
- [ ] Remove unused repository files

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

## Clean Slate Migration & Rollout Strategy

### Pre-Deployment Preparation (Week 0)
1. CREATE CRITICAL BACKUP (all data will be deleted!)
2. Test migration on staging (verify deletion works)
3. Test regeneration script on staging
4. Prepare user communications
5. Get approval from team and stakeholders
6. Schedule migration for low-usage time

### Staging Deployment (Week 1-2)
1. Run clean slate migration on staging:
   - Convert fitness plans with progress fields
   - DROP mesocycles and microcycles tables
   - DELETE all workout instances
2. Initialize progress tracking for active users
3. Deploy Phases 1-3 to staging
4. Test scenarios:
   - Users get fresh workouts generated
   - Daily messages work with new format
   - No errors from missing old data
5. Internal team testing with fresh data
6. Verify no data integrity issues

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

### Migration Risks (Clean Slate)
- [ ] Risk: Data loss from deletion
  - [ ] Mitigation: CRITICAL backup before migration
  - [ ] Mitigation: Test deletion on staging first
  - [ ] Mitigation: Document all deleted data counts
- [ ] Risk: Regeneration script fails for some users
  - [ ] Mitigation: Log all failures for manual fixing
  - [ ] Mitigation: Test regeneration thoroughly
  - [ ] Mitigation: Have support team ready
- [ ] Risk: Users upset about losing history
  - [ ] Mitigation: Clear communication before migration
  - [ ] Mitigation: Explain benefits of fresh start
  - [ ] Mitigation: Consider exporting old data for records
- [ ] Risk: Fitness plan conversion fails
  - [ ] Mitigation: Simple extraction logic
  - [ ] Mitigation: Test all edge cases
  - [ ] Mitigation: Manual review of converted plans

### Pre-Deployment
- [ ] Database backups verified (with restoration tested)
- [ ] Data conversion completed successfully
- [ ] All existing user data verified working
- [ ] Rollback procedures tested (restore from backup)
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

## Critical Notes on Clean Slate Migration

### Clean Slate Approach
1. **COMPLETE DATA RESET**: All training data will be DELETED
2. **Fresh Start**: Every user gets newly generated training
3. **No Transition Period**: Old format completely removed
4. **Higher Risk**: Requires careful backup and communication
5. **Cleaner Codebase**: No legacy format handling needed

### Migration Checklist
- [ ] ⚠️ CREATE BACKUP - THIS IS CRITICAL
- [ ] Fitness plans: macrocycles → mesocycles structure + progress fields (KEEP)
- [ ] Mesocycles TABLE: DROPPED ❌
- [ ] Microcycles TABLE: DROPPED ❌
- [ ] Workout Instances: ALL DELETED ❌
- [ ] Progress tracking initialized for active users ✅
- [ ] User communication sent ✅
- [ ] Support team prepared ✅

### General Implementation Notes
1. **NO GOING BACK** - This is a one-way migration
2. **BACKUP IS CRITICAL** - Only way to recover if issues
3. **TABLES WILL BE DROPPED** - Mesocycles and microcycles tables gone
4. **User Communication Essential** - They will lose workout history
5. **Progress Tracking Must Work** - Users need to know where they are
6. **Pattern Generation Must Work** - Generated fresh each week
7. **Test Everything** - No old tables to fall back on
8. **Monitor Closely** - Watch for generation failures
9. **Support Ready** - Users may have questions/concerns

⚠️ **WARNING**: This approach DELETES all historical workout data. Ensure stakeholders understand and approve this decision before proceeding.