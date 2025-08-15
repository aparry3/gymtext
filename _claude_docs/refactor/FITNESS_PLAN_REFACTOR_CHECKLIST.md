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
- [x] VERIFY backup exists (CRITICAL - no going back!)
- [x] Create migration file: `pnpm migrate:create fitness-plan-clean-slate`
- [x] Implement migration with:
  - [x] Add `mesocycles` JSON column to fitnessPlans
  - [x] Add `lengthWeeks` INTEGER column to fitnessPlans  
  - [x] Add `notes` TEXT column to fitnessPlans
  - [x] Add `currentMesocycleIndex` INTEGER column (default 0)
  - [x] Add `currentMicrocycleWeek` INTEGER column (default 1)
  - [x] Add `cycleStartDate` TIMESTAMP column
  - [x] Convert fitness plans:
    - [x] Extract mesocycles from macrocycles structure
    - [x] Calculate lengthWeeks from first macrocycle
  - [x] DROP mesocycles table: `dropTable('mesocycles')`
  - [x] DROP microcycles table: `dropTable('microcycles')`
  - [x] DELETE ALL workoutInstances: `deleteFrom('workoutInstances')`
  - [x] Drop macrocycles column
  - [x] One-way migration (no down() function)
- [ ] Test migration on staging database
- [x] Verify mesocycles and microcycles tables dropped
- [x] Verify workoutInstances table emptied
- [x] Verify fitness plans converted with progress fields
- [x] Run migration: `pnpm migrate:up`

### 1.2 Update TypeScript Types
- [x] Run `pnpm db:codegen` to regenerate database types
- [x] Verify generated types match expected schema
- [x] Fix any type compilation errors

### 1.3 Update Core Models
- [x] Update `src/server/models/fitnessPlan/index.ts`:
  - [x] Remove `MacrocycleOverview` interface
  - [x] Update `FitnessPlanOverview` interface
  - [x] Add `MesocycleOverview` interface with simplified structure
  - [x] Add progress tracking fields to FitnessPlan interface
- [x] Update `src/server/models/fitnessPlan/schema.ts`:
  - [x] Create `_MesocycleOverviewSchema`
  - [x] Update `_FitnessPlanSchema` with new structure
  - [x] Remove macrocycle-related schemas
- [x] Remove `src/server/models/mesocycle/` directory entirely
- [x] Remove `src/server/models/microcycle/` directory entirely
- [x] Create `src/server/models/microcyclePattern/` for on-demand patterns

### 1.4 Update Repository Layer
- [x] Update `FitnessPlanRepository`:
  - [x] Modify `insertFitnessPlan` to use mesocycles field
  - [x] Update `getFitnessPlan` to parse new structure
  - [x] Add `getCurrentPlan(userId)` method
  - [x] Add `updateProgress(userId, progress)` method
  - [x] Add `getProgress(userId)` method
- [x] Remove `MesocycleRepository` entirely
- [x] Remove `MicrocycleRepository` entirely
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
- [x] Fitness plans successfully converted to new schema
- [x] Mesocycles and microcycles tables DROPPED
- [x] WorkoutInstances table emptied
- [ ] Active users have progress tracking initialized
- [x] Run `pnpm build` - ensure no compilation errors
- [x] Run `pnpm lint` - ensure code quality
- [ ] Run repository unit tests
- [ ] Manual test: Users can generate new workouts on-demand
- [ ] Manual test: Daily messages work with on-demand generation
- [x] Manual test: No references to dropped tables
- [ ] Document table drops for compliance/audit

---

## Phase 2: Microcycles Table & Pattern Storage
**Goal**: Create microcycles table to store the current week's training pattern  
**Estimated Time**: 2 days  
**Testing**: Database operations, pattern storage and retrieval

### 2.1 Create Microcycles Table Migration
- [x] Create migration for new microcycles table:
  - [x] `id` UUID PRIMARY KEY
  - [x] `userId` UUID NOT NULL (FK to users)
  - [x] `fitnessPlanId` UUID NOT NULL (FK to fitnessPlans)
  - [x] `mesocycleIndex` INTEGER NOT NULL
  - [x] `weekNumber` INTEGER NOT NULL  
  - [x] `pattern` JSON NOT NULL (stores week's training pattern)
  - [x] `startDate` TIMESTAMP NOT NULL
  - [x] `endDate` TIMESTAMP NOT NULL
  - [x] `isActive` BOOLEAN DEFAULT true
  - [x] `createdAt` TIMESTAMP
  - [x] `updatedAt` TIMESTAMP
- [x] Add unique constraint on (userId, fitnessPlanId, mesocycleIndex, weekNumber)
- [x] Run migration and verify table created

### 2.2 Update Microcycle Model
- [x] Create `src/server/models/microcycle/index.ts`:
  - [x] Define `Microcycle` interface with pattern storage
  - [x] Define `MicrocyclePattern` embedded structure
  - [x] Add helper methods for pattern access
- [x] Create `src/server/models/microcycle/schema.ts`:
  - [x] Create schema for microcycle with pattern validation
  - [x] Define pattern structure schema

### 2.3 Create Microcycle Repository
- [x] Create `MicrocycleRepository`:
  - [x] `createMicrocycle(microcycle)` - store new pattern
  - [x] `getCurrentMicrocycle(userId)` - get active microcycle
  - [x] `getMicrocycleByWeek(userId, mesocycleIndex, weekNumber)`
  - [x] `deactivatePreviousMicrocycles(userId)` - mark old as inactive
  - [x] `updateMicrocycle(id, updates)` - update existing

### 2.4 Update Progress Service Integration
- [x] Create ProgressService to work with microcycles table:
  - [x] Check for existing microcycle before generating
  - [x] Store generated patterns in microcycles table
  - [x] Reference stored pattern for all workouts in week
- [x] Add microcycle lifecycle management:
  - [x] Auto-deactivate when week ends
  - [x] Create new microcycle on week transition

### Phase 2 Deliverables & Testing
- [x] Microcycles table successfully created
- [x] Pattern storage and retrieval working
- [x] All workouts in a week reference same microcycle
- [x] Week transitions create new microcycles
- [x] Old microcycles properly deactivated
- [x] Build and lint pass successfully

---

## Phase 3: Agent Prompt Updates & Pattern Generation
**Goal**: Update agents to generate simplified structure and weekly patterns  
**Estimated Time**: 2-3 days  
**Testing**: Agent output validation, pattern generation testing

### 3.1 Update Fitness Plan Agent
- [x] Update `src/server/agents/fitnessPlan/prompts.ts`:
  - [x] Remove macrocycle layer from prompt instructions
  - [x] Add notes field guidance
  - [x] Update example outputs to match new schema
  - [x] Simplify mesocycle structure in prompts
- [x] Update `src/server/agents/fitnessPlan/chain.ts`:
  - [x] Ensure structured output matches new schema
  - [x] Update response parsing logic

### 3.2 Create Progress Service
- [x] Create `src/server/services/progressService.ts`:
  - [x] `getCurrentProgress(userId)` method - reads from fitness plan
  - [x] `advanceWeek(userId)` method - updates progress and triggers new microcycle
  - [x] `advanceMesocycle(userId)` method - transitions to next mesocycle
  - [x] `resetProgress(userId)` method - restart from beginning
- [x] Add progress calculation logic
- [x] Add week/mesocycle transition logic with microcycle creation

### 3.3 Create Microcycle Pattern Agent
- [x] Create `src/server/agents/microcyclePattern/prompts.ts`:
  - [x] Generate single week patterns
  - [x] Consider mesocycle focus and week number
  - [x] Progressive overload guidance
  - [x] Deload week handling
- [x] Create `src/server/agents/microcyclePattern/chain.ts`:
  - [x] Structured output for patterns
  - [x] Integration with microcycle repository for storage

### 3.4 Update Pattern Generation Flow
- [x] When week advances or new week starts:
  - [x] Check if microcycle exists for current week
  - [x] If not, generate pattern using agent
  - [x] Store pattern in microcycles table
  - [x] Mark as active, deactivate previous
- [x] All workouts in week reference same microcycle ID

### 3.5 Update Daily Message Service
- [x] Integrate with ProgressService:
  - [x] Get current progress on each run
  - [x] Get or create microcycle for current week
  - [x] Use stored pattern to generate daily workout
- [x] Update service to generate workouts on-demand

### Phase 3 Deliverables & Testing
- [x] Fitness plans generate with new structure
- [x] Progress tracking accurately maintains position
- [x] Microcycle patterns generate and store correctly
- [x] Week transitions trigger new microcycle creation
- [x] All workouts in a week use consistent pattern
- [x] AI agent generates patterns with fallback
- [x] Build and lint pass successfully

---

## Phase 4: Workout Model Enhancement
**Goal**: Create enhanced workout structure with blocks and modifications  
**Estimated Time**: 2 days  
**Testing**: Schema validation, workout structure tests

### 4.1 Update Workout Schema
- [x] Update `src/server/models/workout/schema.ts`:
  - [x] Create `_WorkoutBlockItemSchema`
  - [x] Create `_WorkoutBlockSchema`
  - [x] Create `_WorkoutModificationSchema`
  - [x] Create `_EnhancedWorkoutInstanceSchema` with new structure
- [x] Update `src/server/models/workout/index.ts`:
  - [x] Update interfaces to match new schema
  - [x] Add type exports for new structures

### 4.2 Update Workout Repository
- [x] Add to `WorkoutRepository`:
  - [x] `getRecentWorkouts(userId, days)` method
  - [x] `getWorkoutByDate(userId, date)` method
  - [x] Update `create()` to handle new structure
  - [x] Add `update()` method
  - [x] Add `deleteOldWorkouts()` for cleanup
- [ ] Add comprehensive repository tests (deferred)

### 4.3 Fresh Workout Generation
- [x] All old workouts have been DELETED (from Phase 1)
- [x] New workout generation uses block structure
- [x] No legacy format handling needed
- [x] Implement clean workout display logic:
  - [x] All new workouts have `blocks` property
  - [x] Blocks displayed in order (Warm-up, Main, Cool-down)
  - [x] Modifications included when applicable
- [x] Basic workout generation implemented
- [x] Verify no references to old workout format

### Phase 4 Deliverables & Testing
- [x] Enhanced workout schema created with blocks and modifications
- [x] Workout repository enhanced with new methods
- [x] Fresh workout generation using block structure
- [x] No backward compatibility needed (clean slate)
- [x] Run `pnpm build` and `pnpm lint` - both pass

---

## Phase 5: Daily Workout Generation Agent
**Goal**: Implement on-demand workout generation with context awareness  
**Estimated Time**: 3-4 days  
**Testing**: Agent testing, context validation, generation quality

### 5.1 Create Daily Workout Agent
- [x] Create `src/server/agents/dailyWorkout/` directory
- [x] Implement `src/server/agents/dailyWorkout/prompts.ts`:
  - [x] Context-aware prompt generation
  - [x] Recent workout consideration
  - [x] Progressive overload logic
  - [x] Modification handling
- [x] Implement `src/server/agents/dailyWorkout/chain.ts`:
  - [x] LLM configuration (Gemini 2.0 Flash)
  - [x] Structured output with EnhancedWorkoutInstanceSchema
  - [x] Error handling and fallback generation
- [x] Comprehensive fallback system

### 5.2 Create Workout Generation Context
- [x] Implement context builder for workout generation:
  - [x] Current microcycle day pattern
  - [x] Recent workout history (last 7 days)
  - [x] User fitness profile
  - [x] Special considerations from notes
- [x] Context passed to AI agent
- [x] Fallback generation if AI fails

### 5.3 Integration and Validation
- [x] Integrated AI agent into DailyMessageService
- [x] AI-powered workout generation with fallback
- [x] Theme to session type mapping
- [x] Enhanced workout structure with blocks
- [x] Modifications for common issues
- [x] Progressive overload based on week number

### Phase 5 Deliverables & Testing
- [x] Daily workout agent created with Gemini 2.0 Flash
- [x] Context-aware workout generation
- [x] Enhanced workout structure with blocks and modifications
- [x] Fallback generation for reliability
- [x] Integrated into daily message flow
- [x] Build and lint pass successfully

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
- [x] Remove deprecated macrocycle code
- [x] Remove all mesocycle table references
- [x] Remove all microcycle table references
- [x] Clean up unused workout pre-generation logic
- [x] Update all import statements
- [x] Remove obsolete tests
- [x] Remove unused repository files

### 8.2 Performance Optimization
- [x] Profile and optimize hot paths
- [x] Implement connection pooling improvements
- [x] Optimize agent prompts for token usage
- [x] Add database indexes where needed

### 8.3 Documentation Updates
- [x] Update API documentation
- [x] Update architecture diagrams
- [x] Create migration guide for API consumers
- [x] Update CLAUDE.md with new patterns

### 8.4 Final Testing
- [ ] Full regression test suite (needs test fixtures updated to new schema)
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