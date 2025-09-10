# Fitness Profile Schema Overhaul - Implementation Plan

## Executive Summary

This document outlines a comprehensive implementation plan for overhauling the GymText fitness profile system. The changes will RIP AND REPLACE the existing schema structure, focusing on gym + cardio activities and dramatically simplifying AI agent interactions. This is a complete system overhaul with no backward compatibility.

## Current State Analysis

### Schema Complexity Issues
- **Scattered Information**: Experience levels, preferences, and constraints are duplicated across multiple schema sections
- **Legacy Fields**: Old schema fields (`fitnessGoals`, `skillLevel`, `exerciseFrequency`) still referenced in some components
- **Activity Overlap**: Running, cycling, and walking have similar metrics that could be consolidated
- **Redundant Goal Tracking**: Multiple goal structures throughout the schema

### Critical Dependencies Identified
- **High Impact**: JSONB merge operations, AI agent tools, profile processing utilities
- **Medium Impact**: UI components, API validation, context generation
- **Low Impact**: Legacy references, documentation, type exports

## New Schema Design Goals

### Simplified Structure (5 Core Sections)
1. **Equipment & Access**: Gym access, equipment availability, limitations
2. **Availability**: Schedule, frequency, time preferences
3. **Goals**: Primary objective, timeline, motivation
4. **Constraints**: Injuries, medical, mobility limitations
5. **Activity Data**: Strength + Cardio activity-specific data

### Key Improvements
- **Two Primary Activities**: Strength (gym-based) + Cardio (running/walking/general)
- **Embedded Preferences**: Activity-specific preferences within each activity
- **Flexible Exercise Tracking**: `Record<string, number>` for any exercise/lift
- **Consolidated Experience**: Experience levels within activity data
- **Clean Data Organization**: Single responsibility per section

## Implementation Strategy

### Rip and Replace Approach
This overhaul will be implemented in 4 aggressive phases with complete replacement of the old system. No backward compatibility will be maintained.

---

## Phase 1: Complete Schema Replacement (Days 1-2)

### Objectives
- RIP OUT the entire existing schema structure
- REPLACE with new simplified schema
- Ensure build and lint continue to pass

### Progress Status ✅ PHASE 1 COMPLETED
- [x] 1.1 REPLACE Core Schema Definitions ✅ COMPLETED
- [x] 1.2 Database Wipe Strategy ✅ COMPLETED  
- [x] 1.3 Update ALL Type Exports ✅ COMPLETED
- [x] 1.4 Core Schema Migration ✅ COMPLETED

### What Was Accomplished
- ✅ **Complete schema replacement**: All old schemas (CurrentTrainingSchema, PreferencesSchema, MetricsSchema, etc.) removed
- ✅ **New simplified structure**: 5 logical sections (equipmentAccess, availability, goals, constraints, activityData)  
- ✅ **Two activity types**: Only strength + cardio (running/walking consolidated)
- ✅ **Flexible exercise tracking**: Record<string, number> for any lift/exercise
- ✅ **Database migration**: Users table structure updated and migration run
- ✅ **Core type updates**: All main schema files and types updated
- ✅ **Agent prompt updates**: Chat agents updated for new schema structure
- ✅ **Repository updates**: Database operations support new schema with defaults
- ✅ **Profile patch tool**: Updated for new schema structure with proper field handling
- ✅ **Activity inference**: Simplified for strength + cardio activities only
- ✅ **Summary fields added**: Each subsection now has optional summary field for AI context

### Remaining Items for Phase 2
- 🔄 **Frontend profile processors**: Update `profileProcessors.ts` and related UI utilities
- 🔄 **Complete agent overhaul**: Restore onboarding prompts with new schema
- 🔄 **API validation**: Update all API routes to use new schema validation  
- 🔄 **Frontend components**: Update profile display and editing components
- 🔄 **Test fixtures**: Update all test data and mocks
- 🔄 **Performance optimization**: Optimize JSONB operations for new structure

### Tasks

#### 1.1 REPLACE Core Schema Definitions
**File**: `src/server/models/user/schemas.ts`

**ACTION**: Delete ALL existing fitness profile schemas and replace with:

```typescript
// COMPLETELY NEW FITNESS PROFILE SCHEMA - NO BACKWARD COMPATIBILITY

export const EquipmentAccessSchema = z.object({
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'community', 'none']).optional(),
  homeEquipment: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
});

export const AvailabilitySchema = z.object({
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(15).max(240),
  preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
  schedule: z.string().optional(),
});

export const GoalsSchema = z.object({
  primary: z.string(),
  timeline: z.number().int().min(1).max(104), // 1-104 weeks
  specific: z.string().optional(),
  motivation: z.string().optional(),
});

export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'mobility', 'medical', 'preference']),
  description: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  affectedMovements: z.array(z.string()).optional(),
  status: z.enum(['active', 'resolved']),
});

export const StrengthDataSchema = z.object({
  type: z.literal('strength'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  currentProgram: z.string().optional(),
  keyLifts: z.record(z.string(), z.number()).optional(),
  preferences: z.object({
    workoutStyle: z.string().optional(),
    likedExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional(),
  }).optional(),
  trainingFrequency: z.number().int().min(1).max(7),
});

export const CardioDataSchema = z.object({
  type: z.literal('cardio'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryActivities: z.array(z.string()), // ['running', 'walking', 'cycling', etc.]
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().optional(),
    longestSession: z.number().positive().optional(),
    averagePace: z.string().optional(),
    preferredIntensity: z.enum(['low', 'moderate', 'high']).optional(),
  }).optional(),
  preferences: z.object({
    indoor: z.boolean().optional(),
    outdoor: z.boolean().optional(),
    groupVsIndividual: z.enum(['group', 'individual', 'both']).optional(),
    timeOfDay: z.array(z.string()).optional(),
  }).optional(),
  frequency: z.number().int().min(1).max(7),
});

export const UserMetricsSchema = z.object({
  height: z.number().positive().optional(),
  weight: z.object({
    value: z.number().positive(),
    unit: z.enum(['lbs', 'kg']),
    date: z.string().optional(),
  }).optional(),
  bodyComposition: z.number().min(1).max(50).optional(),
  fitnessLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional(),
});

// THE ONLY FITNESS PROFILE SCHEMA - COMPLETE REPLACEMENT
export const FitnessProfileSchema = z.object({
  userId: z.string().uuid().optional(),
  
  equipmentAccess: EquipmentAccessSchema,
  availability: AvailabilitySchema,
  goals: GoalsSchema,
  constraints: z.array(ConstraintSchema).optional(),
  metrics: UserMetricsSchema.optional(),
  
  activityData: z.array(z.union([
    StrengthDataSchema,
    CardioDataSchema,
  ])),
});

// DELETE ALL OLD SCHEMAS:
// - CurrentTrainingSchema ❌ DELETED
// - PreferencesSchema ❌ DELETED  
// - MetricsSchema ❌ DELETED
// - GoalAnalysisSchema ❌ DELETED
// - RunningDataSchema ❌ DELETED
// - CyclingDataSchema ❌ DELETED
// - GeneralActivityDataSchema ❌ DELETED
// - All old activity schemas ❌ DELETED
```

#### 1.2 Database Wipe Strategy
**NO MIGRATION SCRIPTS NEEDED**

**ACTION**: Complete database wipe and fresh start
- Wipe entire `users` table 
- Wipe `profile_updates` table
- Wipe all existing profile data
- Start completely fresh with new schema

#### 1.3 Update ALL Type Exports  
**File**: `src/server/models/user/schemas.ts`
- DELETE all old type exports
- REPLACE with only new schema types
- Remove any union types or version checking

### Testing
- Test new schema validation only
- No backward compatibility testing needed

---

## Phase 2: Complete AI Agents & Tools Replacement (Days 3-5)

### Objectives
- RIP OUT all existing AI agent logic
- REPLACE with new simplified schema-aware agents
- Complete rewrite of all agent prompts and tools

### Tasks

#### 2.1 Profile Patch Tool COMPLETE REWRITE
**File**: `src/server/agents/tools/profilePatchTool.ts`

```typescript
// Redesigned tool with new schema structure
export const profilePatchToolV2 = tool({
  name: "update_fitness_profile_v2",
  description: `Update user fitness profile using the new simplified structure.
  
  Structure:
  - equipmentAccess: gym access and equipment availability
  - availability: schedule and time commitments  
  - goals: primary fitness objective and timeline
  - constraints: injuries, limitations, medical conditions
  - activityData: array of strength and/or cardio activity data
  
  Activity Types:
  - strength: gym-based resistance training with flexible exercise tracking
  - cardio: running, walking, cycling, and other cardiovascular activities`,
  
  schema: z.object({
    updates: NewFitnessProfileSchema.partial(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
  }),
  
  func: async ({ updates, confidence, reasoning }) => {
    // Implement new update logic for V2 schema
    // Handle activity data merging with new structure
    // Apply updates only if confidence > 0.75
  }
});
```

#### 3.2 Update Agent Prompts
**Files**: 
- `src/server/agents/profile/chain.ts`
- `src/server/agents/chat/chain.ts`

Update prompts to reflect new schema structure:
- Focus on strength (gym) + cardio activities only
- Emphasize equipment access and availability as key factors
- Simplify goal tracking to single primary goal
- Update context formatting for new schema structure

#### 3.3 Context Generation Updates
**File**: `src/server/services/context/fitnessProfileContext.ts`
- Update profile context formatting for AI agents
- Handle both V1 and V2 profiles during transition
- Optimize context for new simplified structure

### Testing
- Test agent responses with new schema structure
- Validate profile extraction accuracy
- Ensure activity data merging works correctly

---

## Phase 4: Services Layer Integration (Days 11-13)

### Objectives
- Update all services to use new schema
- Maintain API compatibility during transition
- Implement service-level validation

### Tasks

#### 4.1 Onboarding Service Updates
**File**: `src/server/services/onboardingChatService.ts`
- Update required field validation for new schema
- Modify profile building logic for simplified structure
- Update completion criteria

#### 4.2 Profile Processing Service
**File**: `src/utils/profile/profileProcessors.ts`
- Update processing logic for new schema structure
- Handle activity data processing
- Update completeness calculations

#### 4.3 Fitness Planning Services
Update fitness plan generation services to use new schema:
- `src/server/agents/fitnessPlan/chain.ts`
- `src/server/agents/dailyWorkout/chain.ts`
- Activity inference utilities

### Testing
- Test service integration with new schema
- Validate profile processing accuracy
- Ensure fitness plan generation works with new structure

---

## Phase 5: API Routes & Frontend Components (Days 14-17)

### Objectives
- Update API validation schemas
- Redesign frontend profile components
- Implement new profile management interface

### Tasks

#### 5.1 API Route Updates
**Files**:
- `src/app/api/chat/onboarding/route.ts`
- `src/app/api/admin/users/[userId]/profile/route.ts`

```typescript
// Update validation schemas
export const UpdateProfileRequestSchema = z.object({
  updates: NewFitnessProfileSchema.partial(),
  source: z.enum(['chat', 'form', 'admin', 'api', 'system']),
  reason: z.string().optional(),
});
```

#### 5.2 Frontend Component Redesign
**Files**:
- `src/components/pages/chat/profile/ProfileView.tsx`
- `src/components/pages/chat/profile/sections/`

New component structure:
- `EquipmentAccessSection.tsx`
- `AvailabilitySection.tsx`
- `GoalsSection.tsx`
- `ConstraintsSection.tsx`
- `ActivityDataSection.tsx`

#### 5.3 Profile Management Interface
Create new profile management components:
- Equipment and gym access form
- Availability scheduling interface
- Goals setting and tracking
- Activity data management (strength + cardio)

### Testing
- Test API endpoints with new schema validation
- Validate frontend rendering with new profile structure
- Ensure profile editing functionality works correctly

---

## Phase 4: Testing & Documentation (Days 8-10)

### Objectives
- Complete system testing with new schema
- Update documentation
- Deploy the completely new system

### Tasks

#### 6.1 Comprehensive Testing
- End-to-end testing of complete profile flow
- Load testing with new JSONB operations
- Migration testing with production data samples

#### 6.2 Legacy Code Cleanup
- Remove old schema references
- Clean up unused type definitions
- Update test fixtures and mocks

#### 6.3 Documentation Updates
- Update API documentation
- Create migration guide for developers
- Update architectural documentation

#### 6.4 Performance Optimization
- Optimize JSONB queries for new schema structure
- Review and optimize agent processing performance
- Database indexing strategy for new profile structure

---

## Risk Assessment & Mitigation

### High-Risk Areas

#### 1. Data Migration
**Risk**: Loss of existing user profile data during schema transition
**Mitigation**: 
- Comprehensive backup procedures
- Gradual rollout with user cohorts
- Rollback procedures for each migration step

#### 2. AI Agent Performance
**Risk**: Degraded AI agent accuracy with new schema structure
**Mitigation**:
- Extensive testing with real conversation data
- A/B testing during transition period
- Performance monitoring and rollback triggers

#### 3. JSONB Operation Changes
**Risk**: Performance degradation or data corruption in database operations
**Mitigation**:
- Thorough testing of JSONB merge operations
- Database performance monitoring
- Staged rollout with performance benchmarks

### Medium-Risk Areas

#### 4. Frontend Component Compatibility
**Risk**: UI breaks or data display issues with new schema
**Mitigation**:
- Component-level testing with both schema versions
- Gradual component rollout
- Fallback rendering for edge cases

#### 5. API Backward Compatibility
**Risk**: Breaking changes for any external API consumers
**Mitigation**:
- API versioning strategy
- Deprecation notices for old endpoints
- Extended support period for legacy API versions

## Success Metrics

### Technical Metrics
- **Migration Success Rate**: >99.5% of user profiles migrated without data loss
- **AI Agent Accuracy**: Maintain or improve profile extraction confidence scores
- **Database Performance**: JSONB operations maintain <100ms average response time
- **API Response Times**: Maintain current API performance benchmarks

### User Experience Metrics
- **Profile Completeness**: Increase average profile completeness by 15%
- **Onboarding Completion**: Maintain current onboarding completion rates
- **User Satisfaction**: No degradation in user satisfaction scores

### System Health Metrics
- **Error Rates**: <0.1% error rate for profile operations
- **System Uptime**: >99.9% uptime during migration period
- **Code Quality**: Reduce cyclomatic complexity in profile-related code

## Deployment Strategy

### RIP AND REPLACE Deployment 

#### Stage 1: Development Testing (Days 1-8)
- Complete system replacement in development
- Internal testing of new schema and agents
- Performance validation

#### Stage 2: Production Deployment (Day 9)
- **SINGLE DAY DEPLOYMENT** - No gradual rollout
- Complete replacement of existing system
- All users start fresh with empty profiles

#### Stage 3: User Re-onboarding (Day 10+)
- Notify all users of system upgrade
- Guide users through new profile creation
- Monitor new onboarding flow performance

### No Rollback Procedures
- **No rollback capability** - this is a one-way migration
- **No data restoration** - we're intentionally starting fresh
- Commit to the new system completely

## Resource Requirements

### Development Team  
- **Lead Developer**: Full-time for 10 days
- **Backend Developer**: 8 days for services and agents
- **Frontend Developer**: 6 days for component updates
- **QA Engineer**: 6 days for testing and validation
- **Database Specialist**: NOT NEEDED - no migrations, just wipe and restart

### Infrastructure
- **Database**: NO BACKUP NEEDED - fresh start
- **Testing Environment**: Dedicated staging environment  
- **Monitoring**: Standard monitoring for new system

## Conclusion

This implementation plan provides a **RIP AND REPLACE** roadmap for completely overhauling the GymText fitness profile system. The aggressive approach accepts the cost of losing all existing data in exchange for dramatic simplification and improved AI agent performance.

The new simplified schema focusing on gym + cardio activities aligns perfectly with the general fitness agent approach. The implementation timeline of **10 days** allows for rapid execution with complete system replacement.

Success depends on:
- **Accepting complete data loss** as the price of simplification
- **Fast, aggressive implementation** with no backward compatibility
- **Thorough testing** of the completely new system
- **Clear user communication** about the fresh start

This approach trades short-term user disruption for long-term system simplicity and maintainability. All users will rebuild profiles from scratch, but the new system will be dramatically simpler and more powerful.