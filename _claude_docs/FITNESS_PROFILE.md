#### 1.1 Create Migration for Enhanced Profile Schema
```sql
-- Migration: Add comprehensive profile support
ALTER TABLE fitness_profiles 
  ADD COLUMN profile JSONB DEFAULT '{}',

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
