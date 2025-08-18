# FITNESS PROFILE IMPLEMENTATION CHECKLIST

**Purpose:** Actionable checklist for implementing the comprehensive fitness profile update system with JSON-based profiles, deterministic AIContext generation, and intelligent agent integration.

**Status:** ⏳ Not Started

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
- [ ] Create migration file: `add_json_profile_support.ts`
  - [ ] Add `profile` JSONB column to `fitness_profiles`
  - [ ] Add generated columns for `primary_goal` and `experience_level`
  - [ ] Create `profile_updates` ledger table
  - [ ] Add necessary indexes
- [ ] Create migration file: `migrate_existing_profiles.ts`
  - [ ] Script to convert existing profile fields to JSON format
  - [ ] Validate data integrity after conversion
  - [ ] Create rollback migration

### 1.2 Database Types
- [ ] Run `pnpm db:codegen` after migration
- [ ] Verify TypeScript types are generated correctly
- [ ] Update existing repository interfaces

---

## Phase 2: Core Infrastructure 🏗️

### 2.1 TypeScript Models
- [ ] Create `src/server/models/fitnessProfile.ts`
  - [ ] Define `FitnessProfile` interface with all fields
  - [ ] Define `Constraint` interface and types
  - [ ] Define `ProfileUpdateOp` union type
  - [ ] Add validation schemas using Zod

### 2.2 AIContext Service
- [ ] Create `src/server/services/aiContextService.ts`
  - [ ] Implement `buildFacts()` method
  - [ ] Implement `buildAIContext()` method
  - [ ] Implement `buildDeterministicProse()` method
  - [ ] Add helper methods for constraints and metrics
  - [ ] Add optional LLM polish pass method

### 2.3 Profile Update Service
- [ ] Create `src/server/services/profileUpdateService.ts`
  - [ ] Implement `applyPatch()` for deep merge updates
  - [ ] Implement `applyOp()` for structured operations
  - [ ] Implement constraint management methods
  - [ ] Implement update ledger recording
  - [ ] Add JSON pointer utility for path-based updates

### 2.4 Repository Updates
- [ ] Update `src/server/repositories/profileRepository.ts`
  - [ ] Add methods for JSON profile operations
  - [ ] Add methods for reading update history
  - [ ] Maintain backward compatibility with existing methods
  - [ ] Add transaction support for atomic updates

---

## Phase 3: Agent Integration 🤖

### 3.1 Enhanced Onboarding Agent
- [ ] Create `src/server/agents/onboarding/structuredChain.ts`
  - [ ] Define profile extraction Zod schema
  - [ ] Create structured output parser
  - [ ] Implement enhanced prompt template
  - [ ] Add confidence scoring logic
- [ ] Create `src/server/agents/onboarding/enhancedAgent.ts`
  - [ ] Implement `processMessage()` method
  - [ ] Integrate with ProfileUpdateService
  - [ ] Add conversation context building
  - [ ] Implement extraction validation

### 3.2 Enhanced SMS Handler
- [ ] Update `src/server/agents/chat/chain.ts`
  - [ ] Add profile update detection logic
  - [ ] Define SMS extraction schema
  - [ ] Integrate AIContext in prompts
- [ ] Create `src/server/agents/chat/profileDetector.ts`
  - [ ] Implement constraint detection
  - [ ] Implement metric update detection
  - [ ] Implement goal change detection
  - [ ] Add confirmation flow logic

### 3.3 Agent Utilities
- [ ] Create shared extraction utilities
- [ ] Add confidence threshold configuration
- [ ] Implement extraction result validation
- [ ] Add agent-specific logging

---

## Phase 4: API Integration 🔌

### 4.1 Profile Context API
- [ ] Create `src/app/api/profiles/[id]/context/route.ts`
  - [ ] Implement GET endpoint for context retrieval
  - [ ] Add section filtering support
  - [ ] Add optional polish parameter
  - [ ] Add response caching

### 4.2 Profile Operations API
- [ ] Create `src/app/api/profiles/[id]/ops/route.ts`
  - [ ] Implement POST endpoint for operations
  - [ ] Add operation validation
  - [ ] Add authorization checks
  - [ ] Implement error handling

### 4.3 Profile History API
- [ ] Create `src/app/api/profiles/[id]/history/route.ts`
  - [ ] Implement GET endpoint for update history
  - [ ] Add pagination support
  - [ ] Add filtering by source/date

### 4.4 API Documentation
- [ ] Document new endpoints
- [ ] Create API usage examples
- [ ] Update existing API docs

---

## Phase 5: Service Integration 🔄

### 5.1 Update Existing Services
- [ ] Update `src/server/services/conversationService.ts`
  - [ ] Integrate enhanced SMS handler
  - [ ] Add profile update tracking
- [ ] Update `src/server/services/onboardingService.ts`
  - [ ] Integrate structured extraction agent
  - [ ] Add profile completion tracking
- [ ] Update `src/server/services/fitnessPlanService.ts`
  - [ ] Use AIContext for plan generation
  - [ ] Consider constraints in planning

### 5.2 Update Existing Agents
- [ ] Update `src/server/agents/dailyWorkout/agent.ts`
  - [ ] Use AIContext for workout generation
  - [ ] Consider active constraints
- [ ] Update `src/server/agents/microcyclePattern/agent.ts`
  - [ ] Use structured profile data
  - [ ] Apply equipment constraints

---

## Phase 6: Testing Implementation 🧪

### 6.1 Unit Tests
- [ ] Create tests for AIContextService
  - [ ] Test fact extraction
  - [ ] Test prose generation determinism
  - [ ] Test date handling
- [ ] Create tests for ProfileUpdateService
  - [ ] Test patch operations
  - [ ] Test constraint operations
  - [ ] Test ledger recording
- [ ] Create tests for enhanced agents
  - [ ] Test extraction accuracy
  - [ ] Test confidence scoring

### 6.2 Integration Tests
- [ ] Test onboarding flow with profile extraction
- [ ] Test SMS handler with profile updates
- [ ] Test API endpoints with various payloads
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
- [ ] All TypeScript types compile
- [ ] Database migrations apply cleanly
- [ ] Rollback scripts work correctly
- [ ] Basic unit tests pass

### After Phase 3-4 (Agent & API Integration)
- [ ] Agents extract profile data correctly
- [ ] API endpoints respond as expected
- [ ] Integration tests pass
- [ ] No performance regressions

### After Phase 5-6 (Full Integration & Testing)
- [ ] End-to-end flows work correctly
- [ ] All tests pass (unit, integration, e2e)
- [ ] Performance meets requirements
- [ ] Backward compatibility maintained

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

*Last Updated: [To be filled]*
*Owner: [To be assigned]*
*Target Completion: [To be determined]*