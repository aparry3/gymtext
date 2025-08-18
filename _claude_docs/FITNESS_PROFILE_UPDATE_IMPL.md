# FITNESS_PROFILE_UPDATE_IMPL.md

**Purpose:** Implementation plan for integrating the new FitnessProfile update system with SMS handler and onboarding agents, based on the FITNESS_PROFILE_UPDATES.md specification.

## Executive Summary

This document outlines the implementation strategy for upgrading the current basic fitness profile system to a comprehensive JSON-based profile with deterministic AIContext generation, patch-based updates, and profile update ledger tracking. The implementation will enable SMS and onboarding agents to intelligently extract and update profile information through structured data extraction.

## Current State Analysis

### Existing Limitations

1. **Basic Profile Schema**: Current `fitnessProfiles` table only has 6 fields (age, gender, skillLevel, fitnessGoals, exerciseFrequency)
2. **No Structured Updates**: Direct field updates without history tracking
3. **No Context Generation**: Agents don't have a standardized way to consume profile data
4. **Limited Agent Integration**: Onboarding agent doesn't extract structured data; chat agent doesn't update profiles

## Implementation Phases

### Phase 1: Database Schema Migration
**Goal:** Upgrade database schema to support comprehensive JSON profiles and update ledger

#### 1.1 Create Migration for Enhanced Profile Schema
```sql
-- Migration: Add comprehensive profile support
ALTER TABLE fitness_profiles 
  ADD COLUMN profile JSONB DEFAULT '{}',
  ADD COLUMN primary_goal TEXT GENERATED ALWAYS AS (profile->>'primaryGoal') STORED,
  ADD COLUMN experience_level TEXT GENERATED ALWAYS AS (profile->>'experienceLevel') STORED;

-- Create profile updates ledger
CREATE TABLE profile_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  patch JSONB NOT NULL,
  path TEXT,
  source TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profile_updates_user_id ON profile_updates(user_id);
CREATE INDEX idx_profile_updates_created_at ON profile_updates(created_at);
```

#### 1.2 Migrate Existing Data
```typescript
// Migration script to convert existing profiles to JSON format
async function migrateExistingProfiles() {
  const profiles = await db.selectFrom('fitnessProfiles').selectAll().execute();
  
  for (const profile of profiles) {
    const jsonProfile = {
      primaryGoal: profile.fitnessGoals,
      experienceLevel: profile.skillLevel,
      availability: {
        daysPerWeek: parseFrequency(profile.exerciseFrequency)
      },
      identity: {
        age: profile.age,
        gender: profile.gender
      }
    };
    
    await db.updateTable('fitnessProfiles')
      .set({ profile: jsonProfile })
      .where('id', '=', profile.id)
      .execute();
  }
}
```

### Phase 2: Core Infrastructure

#### 2.1 FitnessProfile TypeScript Schema
**File:** `src/server/models/fitnessProfile.ts`

```typescript
export interface FitnessProfile {
  version?: number;
  userId?: string;
  
  // Goals
  primaryGoal?: string;
  specificObjective?: string;
  eventDate?: string;
  timelineWeeks?: number;
  experienceLevel?: string;
  
  // Training status
  currentActivity?: string;
  currentTraining?: {
    programName?: string;
    weeksCompleted?: number;
    focus?: string;
    notes?: string;
  };
  
  // Availability & access
  availability?: {
    daysPerWeek?: number;
    minutesPerSession?: number;
    preferredTimes?: string;
    travelPattern?: string;
    notes?: string;
  };
  
  equipment?: {
    access?: string;
    location?: string;
    items?: string[];
    constraints?: string[];
  };
  
  // Preferences
  preferences?: {
    workoutStyle?: string;
    enjoyedExercises?: string[];
    dislikedExercises?: string[];
    coachingTone?: 'friendly' | 'tough-love' | 'clinical' | 'cheerleader';
    musicOrVibe?: string;
  };
  
  // Metrics
  metrics?: {
    heightCm?: number;
    bodyweight?: { value: number; unit: 'lbs' | 'kg' };
    bodyFatPercent?: number;
    prLifts?: Record<string, { weight: number; unit: 'lbs' | 'kg'; reps?: number; date?: string }>;
  };
  
  // Constraints
  constraints?: Constraint[];
  
  // Additional sections...
}

export interface Constraint {
  id: string;
  type: 'injury' | 'equipment' | 'schedule' | 'mobility' | 'preference' | 'other';
  label: string;
  severity?: 'mild' | 'moderate' | 'severe';
  affectedAreas?: string[];
  modifications?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'resolved';
}
```

#### 2.2 AIContext Builder Service
**File:** `src/server/services/aiContextService.ts`

```typescript
export class AIContextService {
  buildFacts(profile: FitnessProfile) {
    // Implement fact extraction as per spec
    return {
      goal: {
        primary: profile.primaryGoal,
        objective: profile.specificObjective,
        eventDate: profile.eventDate,
      },
      training: {
        currentActivity: profile.currentActivity,
        weeksCompleted: profile.currentTraining?.weeksCompleted,
      },
      availability: {
        daysPerWeek: profile.availability?.daysPerWeek,
        minutesPerSession: profile.availability?.minutesPerSession,
        gym: profile.equipment?.access,
      },
      constraints: this.getActiveConstraints(profile),
      preferences: {
        style: profile.preferences?.workoutStyle,
        dislikes: profile.preferences?.dislikedExercises,
      },
      metrics: this.buildMetrics(profile),
    };
  }
  
  buildAIContext(profile: FitnessProfile, opts: { asOf?: string } = {}) {
    const facts = this.buildFacts(profile);
    const prose = this.buildDeterministicProse(facts, opts.asOf);
    return { facts, prose };
  }
  
  private buildDeterministicProse(facts: any, asOf?: string): string {
    const date = asOf || new Date().toISOString().slice(0, 10);
    const bullets: string[] = [];
    
    // Build bullets following spec format
    if (facts.goal?.primary) {
      bullets.push(`GOAL: ${facts.goal.primary}; ${facts.goal.objective || 'not specified'}${facts.goal.eventDate ? `; target date ${facts.goal.eventDate}` : ''}.`);
    }
    
    // Continue building other sections...
    
    return `USER PROFILE (as of ${date})\n${bullets.map(b => `- ${b}`).join('\n')}`;
  }
}
```

#### 2.3 Profile Update Service
**File:** `src/server/services/profileUpdateService.ts`

```typescript
export type ProfileUpdateOp =
  | { kind: 'add_constraint'; constraint: Omit<Constraint, 'id'|'status'> & { id?: string; status?: 'active' } }
  | { kind: 'update_constraint'; id: string; patch: Partial<Constraint> }
  | { kind: 'resolve_constraint'; id: string; endDate?: string }
  | { kind: 'set'; path: string; value: unknown };

export class ProfileUpdateService {
  constructor(
    private db: Kysely<Database>,
    private profileRepo: ProfileRepository
  ) {}
  
  async applyPatch(userId: string, patch: any, source: string, reason?: string) {
    // Deep merge patch with existing profile
    const current = await this.profileRepo.getProfile(userId);
    const merged = deepMerge(current.profile, patch);
    
    // Update profile
    await this.profileRepo.updateProfile(userId, merged);
    
    // Record in ledger
    await this.recordUpdate(userId, patch, null, source, reason);
    
    return merged;
  }
  
  async applyOp(userId: string, op: ProfileUpdateOp, source: string, reason?: string) {
    const current = await this.profileRepo.getProfile(userId);
    let patch: any = {};
    
    switch (op.kind) {
      case 'add_constraint':
        const id = op.constraint.id ?? crypto.randomUUID();
        const newConstraint = { status: 'active', ...op.constraint, id };
        patch = { 
          constraints: [...(current.profile.constraints || []), newConstraint] 
        };
        break;
        
      case 'update_constraint':
        patch = {
          constraints: (current.profile.constraints || []).map(c =>
            c.id === op.id ? { ...c, ...op.patch } : c
          )
        };
        break;
        
      case 'resolve_constraint':
        patch = {
          constraints: (current.profile.constraints || []).map(c =>
            c.id === op.id 
              ? { ...c, status: 'resolved', endDate: op.endDate || new Date().toISOString().slice(0,10) }
              : c
          )
        };
        break;
        
      case 'set':
        patch = this.setByJsonPointer(current.profile, op.path, op.value);
        break;
    }
    
    return this.applyPatch(userId, patch, source, reason);
  }
  
  private async recordUpdate(userId: string, patch: any, path: string | null, source: string, reason?: string) {
    await this.db.insertInto('profileUpdates')
      .values({
        userId,
        patch,
        path,
        source,
        reason,
        createdAt: new Date()
      })
      .execute();
  }
}
```

### Phase 3: Agent Integration

#### 3.1 Enhanced Onboarding Agent with Structured Extraction
**File:** `src/server/agents/onboarding/structuredChain.ts`

```typescript
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';

// Define extraction schema
const ProfileExtractionSchema = z.object({
  profileUpdates: z.object({
    primaryGoal: z.string().optional(),
    specificObjective: z.string().optional(),
    eventDate: z.string().optional(),
    experienceLevel: z.string().optional(),
    availability: z.object({
      daysPerWeek: z.number().optional(),
      minutesPerSession: z.number().optional(),
      preferredTimes: z.string().optional(),
    }).optional(),
    equipment: z.object({
      access: z.string().optional(),
      location: z.string().optional(),
      items: z.array(z.string()).optional(),
    }).optional(),
    preferences: z.object({
      workoutStyle: z.string().optional(),
      enjoyedExercises: z.array(z.string()).optional(),
      dislikedExercises: z.array(z.string()).optional(),
    }).optional(),
    metrics: z.object({
      heightCm: z.number().optional(),
      bodyweight: z.object({
        value: z.number(),
        unit: z.enum(['lbs', 'kg'])
      }).optional(),
    }).optional(),
    constraints: z.array(z.object({
      type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
      label: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe']).optional(),
      modifications: z.string().optional(),
    })).optional(),
  }),
  conversationResponse: z.string(),
  nextQuestion: z.string().optional(),
  confidenceScore: z.number().min(0).max(1),
});

const outputParser = StructuredOutputParser.fromZodSchema(ProfileExtractionSchema);

export const enhancedOnboardingPrompt = `You are a friendly fitness coach assistant for GYMTEXT conducting an onboarding conversation.

Your task is to:
1. Have a natural conversation to understand the user's fitness profile
2. Extract structured information from their responses
3. Ask relevant follow-up questions

${outputParser.getFormatInstructions()}

Current conversation context:
{conversationHistory}

User message: {userMessage}

Based on the user's message and conversation history:
1. Extract any new profile information mentioned
2. Generate a natural, encouraging response
3. Suggest a relevant follow-up question if more information is needed
4. Rate your confidence in the extracted information (0-1)

Remember to be conversational and supportive, not like a form or survey.`;

export class EnhancedOnboardingAgent {
  private llm: ChatGoogleGenerativeAI;
  private profileUpdateService: ProfileUpdateService;
  
  async processMessage(userId: string, message: string, history: OnboardingMessage[]) {
    // Generate structured response
    const prompt = await this.buildPrompt(message, history);
    const response = await this.llm.invoke(prompt);
    const parsed = await outputParser.parse(response.content);
    
    // Apply profile updates if extracted
    if (parsed.profileUpdates && Object.keys(parsed.profileUpdates).length > 0) {
      await this.profileUpdateService.applyPatch(
        userId,
        parsed.profileUpdates,
        'onboarding_agent',
        `Extracted from message: "${message.slice(0, 50)}..."`
      );
    }
    
    return {
      response: parsed.conversationResponse,
      nextQuestion: parsed.nextQuestion,
      profileUpdated: Object.keys(parsed.profileUpdates).length > 0,
      confidence: parsed.confidenceScore
    };
  }
}
```

#### 3.2 Enhanced SMS Handler with Profile Updates
**File:** `src/server/agents/chat/enhancedChain.ts`

```typescript
const SMSProfileExtractionSchema = z.object({
  detectedUpdates: z.array(z.object({
    type: z.enum(['constraint_add', 'constraint_resolve', 'metric_update', 'preference_change', 'goal_change']),
    data: z.any(),
    confidence: z.number(),
  })).optional(),
  response: z.string(),
  requiresConfirmation: z.boolean(),
});

export class EnhancedSMSHandler {
  private contextService: AIContextService;
  private profileUpdateService: ProfileUpdateService;
  
  async handleMessage(userId: string, message: string, conversationId: string) {
    // Get current profile context
    const profile = await this.profileRepo.getProfile(userId);
    const context = this.contextService.buildAIContext(profile);
    
    // Build prompt with context
    const prompt = `You are a fitness coach responding to a user's SMS message.

Current user profile:
${context.prose}

Conversation history:
{conversationHistory}

User message: ${message}

Instructions:
1. Detect if the user is reporting any profile updates (injuries, schedule changes, new goals, etc.)
2. Generate an appropriate response
3. If updates are detected, extract them in structured format
4. Indicate if confirmation is needed before applying updates

${outputParser.getFormatInstructions()}`;
    
    const response = await this.llm.invoke(prompt);
    const parsed = await outputParser.parse(response.content);
    
    // Process detected updates
    if (parsed.detectedUpdates && parsed.detectedUpdates.length > 0) {
      for (const update of parsed.detectedUpdates) {
        if (update.confidence > 0.7 && !parsed.requiresConfirmation) {
          await this.applyDetectedUpdate(userId, update);
        }
      }
    }
    
    return {
      response: parsed.response,
      updatesDetected: parsed.detectedUpdates?.length > 0,
      requiresConfirmation: parsed.requiresConfirmation
    };
  }
  
  private async applyDetectedUpdate(userId: string, update: any) {
    switch (update.type) {
      case 'constraint_add':
        await this.profileUpdateService.applyOp(
          userId,
          { kind: 'add_constraint', constraint: update.data },
          'sms_handler',
          'User reported via SMS'
        );
        break;
        
      case 'constraint_resolve':
        await this.profileUpdateService.applyOp(
          userId,
          { kind: 'resolve_constraint', id: update.data.id },
          'sms_handler',
          'User reported resolution via SMS'
        );
        break;
        
      case 'metric_update':
        await this.profileUpdateService.applyPatch(
          userId,
          { metrics: update.data },
          'sms_handler',
          'User reported metrics via SMS'
        );
        break;
        
      // Handle other update types...
    }
  }
}
```

### Phase 4: API Integration

#### 4.1 Profile Context API
**File:** `src/app/api/profiles/[id]/context/route.ts`

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const searchParams = new URL(request.url).searchParams;
  const sections = searchParams.get('sections')?.split(',');
  const polish = searchParams.get('polish') === 'true';
  
  const profileRepo = new ProfileRepository();
  const contextService = new AIContextService();
  
  const profile = await profileRepo.getProfile(params.id);
  const context = contextService.buildAIContext(profile);
  
  if (polish) {
    // Optional: Apply LLM polish pass
    const polished = await contextService.polishContext(context);
    return NextResponse.json(polished);
  }
  
  return NextResponse.json(context);
}
```

#### 4.2 Profile Operations API
**File:** `src/app/api/profiles/[id]/ops/route.ts`

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const updateService = new ProfileUpdateService();
  
  try {
    const updated = await updateService.applyOp(
      params.id,
      body.operation,
      body.source || 'api',
      body.reason
    );
    
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply operation' },
      { status: 400 }
    );
  }
}
```

### Phase 5: Testing Strategy

#### 5.1 Unit Tests
```typescript
// tests/unit/services/aiContext.test.ts
describe('AIContextService', () => {
  it('should build deterministic facts from profile', () => {
    const profile = mockProfile();
    const facts = service.buildFacts(profile);
    expect(facts.goal.primary).toBe('recomp');
    expect(facts.metrics.weightLbs).toBe(210);
  });
  
  it('should generate consistent prose format', () => {
    const context = service.buildAIContext(mockProfile());
    expect(context.prose).toContain('USER PROFILE (as of');
    expect(context.prose).toContain('GOAL:');
  });
});

// tests/unit/services/profileUpdate.test.ts
describe('ProfileUpdateService', () => {
  it('should apply patches with deep merge', () => {
    const result = await service.applyPatch(userId, patch, 'test');
    expect(result.preferences.workoutStyle).toBe('heavy');
  });
  
  it('should record updates in ledger', () => {
    await service.applyOp(userId, addConstraintOp, 'test');
    const updates = await getProfileUpdates(userId);
    expect(updates).toHaveLength(1);
  });
});
```

#### 5.2 Integration Tests
```typescript
// tests/integration/agents/onboarding.test.ts
describe('Enhanced Onboarding Agent', () => {
  it('should extract profile data from conversation', async () => {
    const result = await agent.processMessage(
      userId,
      "I want to lose 20 pounds and I go to Planet Fitness",
      []
    );
    
    expect(result.profileUpdated).toBe(true);
    const profile = await profileRepo.getProfile(userId);
    expect(profile.primaryGoal).toContain('loss');
    expect(profile.equipment?.access).toContain('Planet Fitness');
  });
});
```

### Phase 6: Migration Rollout

#### 6.1 Deployment Steps
1. **Deploy database migration** (Phase 1.1)
2. **Run data migration script** (Phase 1.2)
3. **Deploy core services** (Phase 2)
4. **Deploy enhanced agents** (Phase 3)
5. **Deploy API endpoints** (Phase 4)
6. **Monitor and validate**

#### 6.2 Rollback Plan
- Keep original profile fields intact during migration
- Implement feature flags for new agent behaviors
- Maintain backward compatibility in APIs

### Phase 7: Monitoring & Observability

#### 7.1 Key Metrics
- Profile update frequency by source
- Context generation latency
- Agent extraction confidence scores
- Update ledger growth rate

#### 7.2 Logging
```typescript
// Add structured logging for profile operations
logger.info('Profile update applied', {
  userId,
  source,
  patchSize: JSON.stringify(patch).length,
  operation: op.kind,
  timestamp: new Date().toISOString()
});
```

## Success Criteria

1. **Functional Requirements**
   - ✅ JSON-based profile schema with comprehensive fields
   - ✅ Deterministic AIContext generation
   - ✅ Profile update ledger with full audit trail
   - ✅ Onboarding agent extracts structured data
   - ✅ SMS handler detects and applies profile updates

2. **Performance Requirements**
   - Context generation < 100ms
   - Profile update application < 200ms
   - SMS response time < 2s with profile updates

3. **Quality Requirements**
   - 80% test coverage on new code
   - No data loss during migration
   - Backward compatibility maintained

## Timeline

- **Week 1**: Database migration and core services
- **Week 2**: Agent enhancements and structured extraction
- **Week 3**: API integration and testing
- **Week 4**: Deployment and monitoring

## Risk Mitigation

1. **Data Migration Risk**: Test migration on staging environment first
2. **Agent Accuracy Risk**: Implement confidence thresholds and confirmation flows
3. **Performance Risk**: Add caching for frequently accessed profiles
4. **Compatibility Risk**: Maintain dual-write to old fields during transition period

## Next Steps

1. Review and approve implementation plan
2. Create detailed migration scripts
3. Set up staging environment for testing
4. Begin Phase 1 implementation

---

*This implementation plan provides a comprehensive roadmap for upgrading the fitness profile system to support intelligent, context-aware interactions through SMS and onboarding agents.*