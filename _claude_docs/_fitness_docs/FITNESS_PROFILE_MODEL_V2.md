# Fitness Profile Model Design V2 - Single JSON Document Approach

## Overview

A single, comprehensive JSON document per user that serves as the living fitness profile. This approach simplifies schema management, makes patching straightforward, and provides maximum flexibility while maintaining structure where beneficial.

## Core Design Principles

1. **Single Source of Truth**: One JSON document contains entire fitness profile
2. **Flexible Schema**: Mix of structured fields (where consistency helps) and open strings (where flexibility is needed)
3. **Patch-Based Updates**: Simple partial updates using same schema
4. **Progressive Enhancement**: Start minimal, build over time
5. **Enum vs String Balance**: Use enums only where standardization is critical for logic

## Database Structure

### 1. Primary Profile Table (`fitness_profiles`)

```sql
CREATE TABLE fitness_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  version INTEGER DEFAULT 1,
  
  -- The entire profile as a single JSON document
  profile JSONB NOT NULL DEFAULT '{}',
  
  -- Extracted fields for querying/indexing
  primary_goal TEXT GENERATED ALWAYS AS (profile->>'primaryGoal') STORED,
  experience_level TEXT GENERATED ALWAYS AS (profile->>'experienceLevel') STORED,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_fitness_profiles_user_id ON fitness_profiles(user_id);
CREATE INDEX idx_fitness_profiles_primary_goal ON fitness_profiles(primary_goal);
CREATE INDEX idx_fitness_profiles_experience ON fitness_profiles(experience_level);
```

### 2. Profile Updates Ledger (`profile_updates`)

```sql
CREATE TABLE profile_updates (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES fitness_profiles(id),
  version INTEGER NOT NULL,
  
  -- The patch that was applied (partial profile object)
  patch JSONB NOT NULL,
  
  -- Metadata about the update
  source TEXT NOT NULL, -- 'user', 'coach', 'system', 'import'
  reason TEXT,
  conversation_id UUID, -- Link to conversation that triggered update
  
  applied_at TIMESTAMP DEFAULT NOW()
);
```

## Profile Schema

```typescript
interface FitnessProfile {
  // ===== IDENTITY & DEMOGRAPHICS =====
  // These rarely change
  birthDate?: string // ISO date
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' // Enum - needed for some calculations
  heightCm?: number
  
  // ===== GOALS & PROGRAM =====
  // Mixed approach: primary uses enum, secondary/specific are strings
  primaryGoal?: 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_health' | 'sport_performance' | 'rehabilitation' // Enum - drives program logic
  secondaryGoals?: string[] // Flexible strings
  specificObjective?: string // "Run first marathon", "500lb deadlift", "return to climbing after surgery"
  eventDate?: string // ISO date
  timelineWeeks?: number
  
  // ===== EXPERIENCE & BACKGROUND =====
  experienceLevel?: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite' // Enum - affects programming
  trainingAge?: number // Years
  currentActivity?: string // "Running 20 miles/week", "CrossFit 3x/week"
  athleticBackground?: string[] // Flexible strings: ["college swimmer", "weekend warrior", "former dancer"]
  
  // ===== AVAILABILITY & ACCESS =====
  availability?: {
    daysPerWeek?: number
    minutesPerSession?: number
    preferredTimes?: string[] // Flexible: ["early morning", "lunch break", "after 8pm"]
    blackoutDays?: string[] // Flexible: ["Sunday", "Wednesdays"]
  }
  
  equipment?: {
    access?: 'commercial_gym' | 'home_gym' | 'minimal' | 'bodyweight_only' // Enum - affects exercise selection
    location?: string // Flexible: "24 Hour Fitness", "garage gym", "apartment"
    specificEquipment?: string[] // Flexible: ["barbell", "20lb dumbbells", "resistance bands"]
    cardioOptions?: string[] // Flexible: ["treadmill", "bike", "rowing machine", "outdoor running"]
  }
  
  // ===== PREFERENCES & STYLE =====
  preferences?: {
    enjoyedExercises?: string[] // Flexible strings
    dislikedExercises?: string[] // Flexible strings  
    workoutStyle?: string // Flexible: "fast-paced", "heavy and slow", "variety"
    musicPreference?: string // Flexible: "heavy metal", "no music", "podcasts"
    trainingPartner?: boolean
  }
  
  // ===== CURRENT METRICS =====
  // All optional, can be progressively filled
  metrics?: {
    // Body composition
    bodyweight?: { value: number; unit: 'kg' | 'lbs'; date?: string }
    bodyFatPercent?: number
    measurements?: Record<string, number> // Flexible: {"waist": 32, "chest": 40}
    
    // Strength - mix of common lifts and flexible custom
    maxLifts?: {
      squat?: { weight: number; unit: 'kg' | 'lbs'; reps?: number; date?: string }
      bench?: { weight: number; unit: 'kg' | 'lbs'; reps?: number; date?: string }
      deadlift?: { weight: number; unit: 'kg' | 'lbs'; reps?: number; date?: string }
      [exerciseName: string]: any // Allow any other lift
    }
    
    // Cardio - flexible structure
    cardioMetrics?: {
      restingHeartRate?: number
      vo2Max?: number
      [activity: string]: any // {"5k_time": "22:00", "mile_pace": "7:30"}
    }
    
    // Movement quality - simple and flexible
    mobility?: Record<string, string> // {"overhead": "limited", "hips": "good"}
  }
  
  // ===== CONSTRAINTS (Active issues affecting programming) =====
  constraints?: Array<{
    id: string
    type: 'injury' | 'pain' | 'travel' | 'schedule' | 'medical' | 'equipment' // Enum - affects handling
    label: string // Flexible: "Lower back pain", "Vacation to Europe", "Broken home gym AC"
    
    // Temporal
    startDate?: string
    endDate?: string // null = ongoing
    
    // Impact (all optional, AI interprets based on label if not specified)
    severity?: 'mild' | 'moderate' | 'severe' // Enum when specified
    affectedAreas?: string[] // Flexible: ["lower back", "heavy squats", "morning workouts"]
    modifications?: string // Flexible: "No axial loading, replace squats with leg press"
    
    // Metadata
    note?: string
    source?: 'user' | 'medical' | 'coach' // Enum
    status?: 'active' | 'improving' | 'resolved' // Enum
  }>
  
  // ===== NUTRITION & RECOVERY =====
  nutrition?: {
    approach?: 'tracking_macros' | 'tracking_calories' | 'intuitive' | 'meal_plan' | 'not_tracking' // Enum
    restrictions?: string[] // Flexible: ["vegetarian", "gluten-free", "no dairy"]
    currentCalories?: number
    proteinGramsPerDay?: number
    supplements?: string[] // Flexible: ["creatine", "vitamin D", "fish oil"]
  }
  
  recovery?: {
    averageSleepHours?: number
    stressLevel?: 1 | 2 | 3 | 4 | 5 // Scale is standardized
    occupation?: string // Flexible: "desk job", "construction worker", "nurse"
    otherActivities?: string[] // Flexible: ["weekend basketball", "hiking", "yoga class"]
  }
  
  // ===== TRAINING STATUS =====
  currentTraining?: {
    programName?: string // Flexible: "StrongLifts 5x5", "Couch to 5k", "custom PPL"
    weeksCompleted?: number
    weeklyHours?: number
    lastDeloadDate?: string
    perceivedExertion?: 1 | 2 | 3 | 4 | 5 // Scale is standardized
    notes?: string
  }
  
  // ===== COACHING NOTES =====
  // For AI context and coach observations
  coachingNotes?: {
    observations?: string[]
    focusAreas?: string[]
    recentWins?: string[]
    watchPoints?: string[]
  }
}
```

## Update Mechanism

### Simple Patch Application

Since both the profile and patches use the same schema, updates are straightforward:

```typescript
// Applying a patch
async function applyProfilePatch(
  userId: string, 
  patch: Partial<FitnessProfile>,
  source: 'user' | 'coach' | 'system',
  reason?: string
) {
  // Get current profile
  const current = await getProfile(userId);
  
  // Deep merge patch into current profile
  const updated = deepMerge(current.profile, patch);
  
  // Update version and save
  await db.transaction(async (trx) => {
    // Update main profile
    await trx.updateTable('fitness_profiles')
      .set({
        profile: JSON.stringify(updated),
        version: current.version + 1,
        updated_at: new Date()
      })
      .where('user_id', '=', userId)
      .execute();
    
    // Log the patch
    await trx.insertInto('profile_updates')
      .values({
        profile_id: current.id,
        version: current.version + 1,
        patch: JSON.stringify(patch),
        source,
        reason,
        applied_at: new Date()
      })
      .execute();
  });
  
  return updated;
}
```

### Example Patches

```typescript
// Onboarding creates initial profile
const onboardingPatch: Partial<FitnessProfile> = {
  primaryGoal: 'fat_loss',
  experienceLevel: 'intermediate',
  availability: {
    daysPerWeek: 4,
    minutesPerSession: 45
  },
  equipment: {
    access: 'commercial_gym'
  }
};

// User reports injury via SMS
const injuryPatch: Partial<FitnessProfile> = {
  constraints: [
    ...existingConstraints,
    {
      id: generateId(),
      type: 'injury',
      label: 'Shoulder impingement',
      severity: 'moderate',
      affectedAreas: ['pressing movements', 'overhead work'],
      modifications: 'No overhead press, use dumbbells for chest work',
      startDate: '2024-01-15',
      status: 'active',
      source: 'user'
    }
  ]
};

// Progress update from workout completion
const progressPatch: Partial<FitnessProfile> = {
  metrics: {
    ...existingMetrics,
    maxLifts: {
      ...existingMaxLifts,
      squat: {
        weight: 315,
        unit: 'lbs',
        reps: 1,
        date: '2024-01-20'
      }
    }
  },
  currentTraining: {
    ...existingCurrentTraining,
    weeksCompleted: 8,
    perceivedExertion: 4
  }
};
```

## Enum vs String Decision Framework

### Use Enums When:
1. **The field drives program logic** (primaryGoal, experienceLevel)
2. **Standardization improves AI reasoning** (equipment.access, constraint.type)
3. **The domain is well-bounded** (gender, severity levels)
4. **We need consistent calculations** (scales like 1-5 ratings)

### Use Strings When:
1. **Flexibility is paramount** (exercise names, equipment brands)
2. **Domain is open-ended** (athletic background, occupation)
3. **User expression matters** (specific objectives, preferences)
4. **Future options are unpredictable** (supplement names, diet restrictions)

### Hybrid Approach Examples:
- **Goals**: Primary goal is enum (drives programming), secondary goals are strings (flexibility)
- **Constraints**: Type is enum (categorization), label/description is string (specificity)
- **Metrics**: Common lifts have known fields, but allow any string key for custom exercises

## Benefits of Single JSON Approach

1. **Schema Simplicity**: One schema serves for both full profile and patches
2. **Flexible Evolution**: Add new fields without migrations
3. **Easy Patching**: Partial updates are trivial with deep merge
4. **Reduced Complexity**: No complex joins or multiple table updates
5. **AI-Friendly**: Single document provides complete context
6. **Progressive Enhancement**: Start with {} and build over time

## Querying Patterns

```typescript
// Get effective profile for a date (considering active constraints)
function getEffectiveProfile(profile: FitnessProfile, date: Date) {
  const activeConstraints = profile.constraints?.filter(c => {
    const start = new Date(c.startDate || 0);
    const end = c.endDate ? new Date(c.endDate) : new Date('2099-12-31');
    return date >= start && date <= end && c.status !== 'resolved';
  });
  
  // Apply constraint effects
  let effective = { ...profile };
  
  for (const constraint of activeConstraints || []) {
    // Adjust based on constraint type and severity
    if (constraint.type === 'injury' && constraint.severity === 'severe') {
      // Reduce intensity, avoid affected areas
    }
    if (constraint.type === 'travel') {
      // Use equipment access modifications
    }
  }
  
  return effective;
}

// Get profile at a specific version
async function getProfileAtVersion(userId: string, version: number) {
  // Start with empty profile
  let profile = {};
  
  // Apply all patches up to target version
  const patches = await db.selectFrom('profile_updates')
    .where('profile_id', '=', profileId)
    .where('version', '<=', version)
    .orderBy('version', 'asc')
    .execute();
  
  for (const patch of patches) {
    profile = deepMerge(profile, patch.patch);
  }
  
  return profile;
}
```

## Migration from Current System

```typescript
// Transform current simple profile to new structure
function migrateProfile(old: CurrentFitnessProfile): FitnessProfile {
  return {
    primaryGoal: mapGoal(old.fitnessGoals),
    experienceLevel: mapExperience(old.skillLevel),
    gender: old.gender,
    metrics: {
      bodyweight: old.weight ? { value: old.weight, unit: 'lbs' } : undefined
    },
    availability: {
      daysPerWeek: parseFrequency(old.exerciseFrequency)
    }
    // Start minimal, enhance through conversation
  };
}
```

## Context Generation for AI Agents

```typescript
function generateAIContext(profile: FitnessProfile): string {
  // Extract key points for concise context
  const context = {
    goal: profile.primaryGoal,
    experience: profile.experienceLevel,
    constraints: profile.constraints?.filter(c => c.status === 'active'),
    recentMetrics: profile.metrics,
    preferences: profile.preferences?.enjoyedExercises?.slice(0, 5),
    equipment: profile.equipment?.access
  };
  
  return JSON.stringify(context, null, 2);
}
```

## Open Questions

1. Should we implement profile versioning with snapshots for faster historical queries?
2. Do we need computed fields (like BMI) stored or calculate on-demand?
3. Should constraint resolution automatically happen based on endDate?
4. How do we handle conflicting patches applied simultaneously?
5. Should we implement a profile validation service that ensures consistency?