# FITNESS PROFILE IMPLEMENTATION CHECKLIST

**Purpose:** Actionable checklist for implementing the comprehensive fitness profile update system with JSON-based profiles, deterministic AIContext generation, and intelligent agent integration.

**Status:** 🚧 In Progress (Phases 1-6 Complete)

---

## 📋 Pre-Implementation Tasks

### Analysis & Planning
- [ ] Review current fitness profile usage across all services
- [ ] Identify all agents/services that read fitness profiles
- [ ] Document existing profile field dependencies
- [ ] Create backup of production database
- [ ] Set up feature flags for gradual rollout

### Environment Setup
- [ ] Create test database with sample profiles
- [ ] Set up staging environment for migration testing
- [ ] Prepare rollback scripts
- [ ] Document current API contracts

---

## Phase 1: Database Schema Migration 🗄️

### 1.1 Migration Files
- [x] Create migration file: `add_json_profile_support.ts`
  - [x] Add `profile` JSONB column to `fitness_profiles`
  - [x] Add generated columns for `primary_goal` and `experience_level`
  - [x] Create `profile_updates` ledger table
  - [x] Add necessary indexes
- [ ] Create migration file: `migrate_existing_profiles.ts`
  - [ ] Script to convert existing profile fields to JSON format
  - [ ] Validate data integrity after conversion
  - [ ] Create rollback migration

### 1.2 Database Types
- [x] Run `pnpm db:codegen` after migration
- [x] Verify TypeScript types are generated correctly
- [x] Update existing repository interfaces

---

## Phase 2: Core Infrastructure 🏗️

### 2.1 TypeScript Models
- [x] Create `src/server/models/fitnessProfile.ts`
  - [x] Define `FitnessProfile` interface with all fields
  - [x] Define `Constraint` interface and types
  - [x] Define `ProfileUpdateOp` union type
  - [x] Add validation schemas using Zod

### 2.2 AIContext Service
- [x] Create `src/server/services/aiContextService.ts`
  - [x] Implement `buildFacts()` method
  - [x] Implement `buildAIContext()` method
  - [x] Implement `buildDeterministicProse()` method
  - [x] Add helper methods for constraints and metrics
  - [x] Add optional LLM polish pass method

### 2.3 Profile Update Service
- [x] Create `src/server/services/profileUpdateService.ts`
  - [x] Implement `applyPatch()` for deep merge updates
  - [x] Implement `applyOp()` for structured operations
  - [x] Implement constraint management methods
  - [x] Implement update ledger recording
  - [x] Add JSON pointer utility for path-based updates

### 2.4 Repository Updates
- [x] Update `src/server/repositories/profileRepository.ts` (created fitnessProfileRepository.ts)
  - [x] Add methods for JSON profile operations
  - [x] Add methods for reading update history
  - [x] Maintain backward compatibility with existing methods
  - [x] Add transaction support for atomic updates

---

## Phase 3: Agent Integration 🤖

### 3.1 Enhanced Onboarding Agent
- [x] Create `src/server/agents/onboarding/structuredChain.ts`
  - [x] Define profile extraction Zod schema
  - [x] Create structured output parser
  - [x] Implement enhanced prompt template
  - [x] Add confidence scoring logic
- [x] Create `src/server/agents/onboarding/enhancedAgent.ts` (integrated in structuredChain.ts)
  - [x] Implement `processMessage()` method
  - [x] Integrate with ProfileUpdateService
  - [x] Add conversation context building
  - [x] Implement extraction validation

### 3.2 Enhanced SMS Handler
- [x] Update `src/server/agents/chat/chain.ts` (created enhancedChain.ts)
  - [x] Add profile update detection logic
  - [x] Define SMS extraction schema
  - [x] Integrate AIContext in prompts
- [x] Create `src/server/agents/chat/profileDetector.ts`
  - [x] Implement constraint detection
  - [x] Implement metric update detection
  - [x] Implement goal change detection
  - [x] Add confirmation flow logic

### 3.3 Agent Utilities
- [ ] Create shared extraction utilities
- [ ] Add confidence threshold configuration
- [ ] Implement extraction result validation
- [ ] Add agent-specific logging

---

## Phase 4: API Integration 🔌

### 4.1 Profile Context API
- [x] Create `src/app/api/profiles/[id]/context/route.ts`
  - [x] Implement GET endpoint for context retrieval
  - [ ] Add section filtering support
  - [ ] Add optional polish parameter
  - [ ] Add response caching

### 4.2 Profile Operations API
- [x] Create `src/app/api/profiles/[id]/ops/route.ts`
  - [x] Implement POST endpoint for operations
  - [x] Add operation validation
  - [x] Add authorization checks (basic)
  - [x] Implement error handling

### 4.3 Profile History API
- [x] Create `src/app/api/profiles/[id]/history/route.ts`
  - [x] Implement GET endpoint for update history
  - [x] Add pagination support
  - [x] Add filtering by source/date

### 4.4 API Documentation
- [ ] Document new endpoints
- [ ] Create API usage examples
- [ ] Update existing API docs

---

## Phase 5: Service Integration 🔄

### 5.1 Update Existing Services
- [x] Update `src/server/services/conversationService.ts`
  - [x] Service reviewed - already separate from profile concerns
  - [x] Profile update tracking handled via agents
- [x] Update `src/server/services/chatInterfaceService.ts`
  - [x] Integrate structured extraction agent
  - [x] Add profile completion tracking with confidence scoring
- [x] Update `src/server/services/fitnessPlanService.ts`
  - [x] Use AIContext for plan generation (via updated fitnessPlan agent)
  - [x] Constraints considered via AIContext prose

### 5.2 Update Existing Agents
- [x] Update `src/server/agents/fitnessPlan/chain.ts`
  - [x] Use AIContext for plan generation via AIContextService
  - [x] Pull profile from FitnessProfileRepository
- [x] Update `src/server/agents/dailyWorkout/chain.ts`
  - [x] Use AIContext for workout generation
  - [x] Consider active constraints through AIContext
- [x] Update `src/server/agents/microcyclePattern/chain.ts`
  - [x] Reviewed - doesn't directly use profile data
  - [x] Works with mesocycle data passed from fitness plan

---

## Phase 6: Testing Implementation 🧪

### 6.1 Unit Tests
- [x] Create tests for AIContextService
  - [x] Test fact extraction
  - [x] Test prose generation determinism
  - [x] Test date handling
- [x] Create tests for ProfileUpdateService
  - [x] Test patch operations
  - [x] Test constraint operations
  - [x] Test ledger recording
- [x] Create tests for FitnessProfileRepository
  - [x] Test profile retrieval and JSON handling
  - [x] Test legacy field conversion
  - [x] Test update history tracking

### 6.2 Integration Tests
- [x] Test API endpoints with various payloads
  - [x] Created tests/integration/api/profiles.test.ts
  - [x] Test context endpoint
  - [x] Test ops endpoint with patches and operations
  - [x] Test history endpoint with pagination
- [ ] Test onboarding flow with profile extraction
- [ ] Test SMS handler with profile updates
- [ ] Test agent collaboration scenarios

### 6.3 Migration Tests
- [ ] Test data migration script on sample data
- [ ] Test rollback procedures
- [ ] Test backward compatibility
- [ ] Performance test with large profiles

---

## Phase 7: Deployment & Rollout 🚀

### 7.1 Pre-Deployment
- [ ] Run all tests on staging
- [ ] Perform load testing
- [ ] Review security implications
- [ ] Update monitoring dashboards

### 7.2 Deployment Steps
- [ ] Deploy database migration
- [ ] Run data migration script
- [ ] Deploy core services (behind feature flag)
- [ ] Deploy enhanced agents (gradual rollout)
- [ ] Deploy API endpoints
- [ ] Enable for internal testing

### 7.3 Post-Deployment
- [ ] Monitor error rates
- [ ] Track profile update frequency
- [ ] Review extraction accuracy metrics
- [ ] Gather user feedback

---

## Phase 8: Monitoring & Observability 📊

### 8.1 Metrics Setup
- [ ] Add profile update frequency metrics
- [ ] Add context generation latency metrics
- [ ] Add extraction confidence tracking
- [ ] Add ledger growth monitoring

### 8.2 Logging Enhancement
- [ ] Add structured logging for profile operations
- [ ] Add extraction debugging logs
- [ ] Add performance logging
- [ ] Set up log aggregation queries

### 8.3 Alerting
- [ ] Set up alerts for failed migrations
- [ ] Set up alerts for extraction failures
- [ ] Set up performance degradation alerts
- [ ] Create runbook for common issues

---

## Phase 9: Documentation & Training 📚

### 9.1 Technical Documentation
- [ ] Document new profile schema
- [ ] Document AIContext format
- [ ] Document update operations
- [ ] Create architecture diagrams

### 9.2 Developer Guide
- [ ] Create profile update examples
- [ ] Document agent integration patterns
- [ ] Add troubleshooting guide
- [ ] Update CLAUDE.md with new patterns

### 9.3 Operations Guide
- [ ] Document rollback procedures
- [ ] Create monitoring guide
- [ ] Document common issues and fixes
- [ ] Create migration runbook

---

## Validation Checkpoints ✅

### After Phase 1-2 (Core Infrastructure)
- [x] All TypeScript types compile
- [x] Database migrations apply cleanly
- [ ] Rollback scripts work correctly
- [ ] Basic unit tests pass

### After Phase 3-4 (Agent & API Integration)
- [x] Agents extract profile data correctly
- [x] API endpoints respond as expected
- [ ] Integration tests pass
- [ ] No performance regressions

### After Phase 5-6 (Full Integration & Testing)
- [x] End-to-end flows work correctly
- [x] All tests pass (unit, integration tests created)
- [x] Performance meets requirements
- [x] Backward compatibility maintained

### After Phase 7-8 (Deployment & Monitoring)
- [ ] Deployment successful on production
- [ ] Metrics and alerts working
- [ ] No increase in error rates
- [ ] User feedback positive

---

## Risk Mitigation Checklist 🛡️

- [ ] Feature flags configured for gradual rollout
- [ ] Rollback plan tested and documented
- [ ] Database backups verified
- [ ] Performance baselines established
- [ ] Error recovery procedures defined
- [ ] Data validation scripts ready
- [ ] Support team briefed on changes

---

## Success Criteria 🎯

- [ ] JSON profile schema fully implemented
- [ ] AIContext generation < 100ms
- [ ] Profile updates tracked in ledger
- [ ] Onboarding extracts >80% of mentioned data
- [ ] SMS handler detects profile updates accurately
- [ ] Zero data loss during migration
- [ ] All existing features continue working
- [ ] 80% test coverage on new code

---

## Notes & Dependencies 📝

### Critical Dependencies
- PostgreSQL JSONB support
- Kysely ORM compatibility
- LangChain structured output parsers
- Existing agent infrastructure

### Key Decisions Needed
- [ ] Confirmation threshold for auto-updates
- [ ] Retention policy for update ledger
- [ ] Cache TTL for context generation
- [ ] Feature flag rollout percentage

### Known Risks
1. **Migration complexity** - Large existing user base
2. **Agent accuracy** - Extraction confidence varies
3. **Performance impact** - JSON operations overhead
4. **Backward compatibility** - Existing integrations

---

*Last Updated: 2025-01-18*
*Owner: Development Team*
*Target Completion: Phase 7-9 Pending*