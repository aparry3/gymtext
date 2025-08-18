# Fitness Profile Model Design V3 - Semi-Structured JSON with String Fields

## Overview

A single, comprehensive JSON document per user that serves as the living fitness profile. This approach uses a defined schema but with string fields instead of enums, creating a "semi-structured" format that's optimal for LLM consumption while maintaining consistent structure.

## Core Design Principles

1. **Single Source of Truth**: One JSON document contains entire fitness profile
2. **Semi-Structured Schema**: Defined structure with free-form string values
3. **LLM-Optimized**: String fields allow natural language expression while maintaining consistent paths
4. **Patch-Based Updates**: Simple partial updates using same schema
5. **Progressive Enhancement**: Start minimal, build over time

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
  birthDate?: string // ISO date or natural language: "1990-05-15" or "May 1990"
  gender?: string // "male", "female", "non-binary", "prefer not to say", etc.
  heightCm?: number // Still numeric for calculations
  
  // ===== GOALS & PROGRAM =====
  primaryGoal?: string // "fat loss", "build muscle", "get stronger", "run marathon", "general health"
  secondaryGoals?: string[] // ["improve cardio", "flexibility", "look good for summer"]
  specificObjective?: string // "Run first marathon", "500lb deadlift", "return to climbing after surgery"
  eventDate?: string // ISO date or natural: "2024-06-15" or "next summer"
  timelineWeeks?: number // Still numeric for calculations
  
  // ===== EXPERIENCE & BACKGROUND =====
  experienceLevel?: string // "beginner", "2 years lifting", "advanced powerlifter", "returning after break"
  trainingAge?: number // Years (numeric for calculations)
  currentActivity?: string // "Running 20 miles/week", "CrossFit 3x/week", "sedentary desk job"
  athleticBackground?: string[] // ["college swimmer", "weekend warrior", "former dancer", "played high school football"]
  
  // ===== AVAILABILITY & ACCESS =====
  availability?: {
    daysPerWeek?: number // Still numeric
    minutesPerSession?: number // Still numeric
    preferredTimes?: string[] // ["early morning before work", "lunch break", "after 8pm", "weekends only"]
    blackoutDays?: string[] // ["Sundays", "Wednesdays", "travel days", "when kids have soccer"]
  }
  
  equipment?: {
    access?: string // "commercial gym", "home gym", "apartment with dumbbells", "planet fitness", "CrossFit box"
    location?: string // "24 Hour Fitness on Main St", "garage gym", "apartment living room"
    specificEquipment?: string[] // ["barbell and plates", "adjustable dumbbells up to 50lbs", "resistance bands", "pull-up bar"]
    cardioOptions?: string[] // ["treadmill", "stationary bike", "can run outside", "rowing machine", "jump rope"]
  }
  
  // ===== PREFERENCES & STYLE =====
  preferences?: {
    enjoyedExercises?: string[] // ["heavy squats", "running", "yoga", "swimming", "hiking"]
    dislikedExercises?: string[] // ["burpees", "running", "anything with jumping", "isolation work"]
    workoutStyle?: string // "fast-paced circuits", "heavy and slow", "variety is key", "simple and effective"
    musicPreference?: string // "heavy metal", "no music", "podcasts", "whatever's on"
    trainingPartner?: boolean // Still boolean - clear yes/no
  }
  
  // ===== CURRENT METRICS =====
  // All optional, can be progressively filled
  metrics?: {
    // Body composition
    bodyweight?: { 
      value: number 
      unit: string // "kg", "lbs", "stone"
      date?: string // ISO or natural
    }
    bodyFatPercent?: number // Still numeric
    measurements?: Record<string, number> // {"waist": 32, "chest": 40, "arms": 15}
    
    // Strength - flexible structure
    maxLifts?: Record<string, {
      weight: number
      unit: string // "kg", "lbs"
      reps?: number
      date?: string
      notes?: string // "with belt", "touch and go", "competition lift"
    }>
    // Examples: {"squat": {...}, "bench press": {...}, "weighted pull-up": {...}}
    
    // Cardio - flexible structure
    cardioMetrics?: Record<string, any> 
    // {"5k time": "22:00", "mile pace": "7:30", "resting heart rate": 58, "VO2 max": 45}
    
    // Movement quality - descriptive strings
    mobility?: Record<string, string> 
    // {"overhead": "limited shoulder flexion", "hips": "good", "ankles": "tight, affects squat depth"}
  }
  
  // ===== CONSTRAINTS (Active issues affecting programming) =====
  constraints?: Array<{
    id: string
    type: string // "injury", "pain", "travel", "schedule change", "medical", "equipment unavailable"
    label: string // "Lower back pain when bending", "Vacation to Europe", "Broken home gym AC", "Doctor said no impact"
    
    // Temporal
    startDate?: string // ISO or natural
    endDate?: string // null = ongoing
    
    // Impact (all optional, AI interprets based on label if not specified)
    severity?: string // "mild", "moderate", "severe", "improving", "worsening"
    affectedAreas?: string[] // ["lower back", "all pressing movements", "morning workouts", "heavy loads"]
    modifications?: string // "No axial loading, replace squats with leg press, keep weights under 50% max"
    
    // Metadata
    note?: string // Additional context
    source?: string // "self-reported", "doctor", "physical therapist", "coach observation"
    status?: string // "active", "improving", "monitoring", "resolved"
  }>
  
  // ===== NUTRITION & RECOVERY =====
  nutrition?: {
    approach?: string // "tracking macros", "counting calories", "intuitive eating", "meal prep", "flexible dieting"
    restrictions?: string[] // ["vegetarian", "gluten-free", "no dairy", "keto", "intermittent fasting"]
    currentCalories?: number // Still numeric
    proteinGramsPerDay?: number // Still numeric
    supplements?: string[] // ["creatine 5g daily", "vitamin D", "fish oil", "pre-workout", "whey protein"]
  }
  
  recovery?: {
    averageSleepHours?: number // Still numeric
    stressLevel?: string // "low", "moderate", "high", "variable", "work is crazy right now"
    occupation?: string // "desk job", "construction worker", "nurse with 12-hour shifts", "remote software engineer"
    otherActivities?: string[] // ["weekend basketball league", "hiking with family", "yoga twice a week", "chasing toddlers"]
  }
  
  // ===== TRAINING STATUS =====
  currentTraining?: {
    programName?: string // "StrongLifts 5x5", "Couch to 5k week 4", "custom PPL split", "working with trainer"
    weeksCompleted?: number // Still numeric
    weeklyHours?: number // Still numeric
    lastDeloadDate?: string // ISO or natural
    perceivedExertion?: string // "easy", "moderate", "challenging", "near max", "need a break"
    adherence?: string // "perfect", "missing some sessions", "70%", "struggling with consistency"
    notes?: string // Open field for any relevant context
  }
  
  // ===== COACHING NOTES =====
  // For AI context and coach observations
  coachingNotes?: {
    observations?: string[] // ["responds well to higher volume", "needs extra warm-up time", "very motivated by PRs"]
    focusAreas?: string[] // ["improving squat depth", "building work capacity", "consistency"]
    recentWins?: string[] // ["hit 2-plate bench", "completed first 5k", "3 weeks perfect adherence"]
    watchPoints?: string[] // ["tendency to overtrain", "form breaks down when tired", "needs encouragement"]
    communicationStyle?: string // "prefers detailed explanations", "just wants the workout", "likes to understand why"
  }
  
  // ===== HISTORY & CONTEXT =====
  // Additional context that helps LLM understand the person
  additionalContext?: {
    whyStarted?: string // "doctor recommended", "want to be healthy for kids", "tired of feeling weak"
    previousAttempts?: string[] // ["tried CrossFit but got injured", "did P90X years ago", "was consistent until pandemic"]
    motivators?: string[] // ["seeing progress", "feeling strong", "stress relief", "community"]
    barriers?: string[] // ["time with young kids", "travel for work", "motivation when tired", "gym anxiety"]
    personalityNotes?: string // "Type A perfectionist", "laid back and flexible", "needs accountability"
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
  source: string, // 'user', 'coach', 'system', etc.
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
// Onboarding creates initial profile with natural language
const onboardingPatch: Partial<FitnessProfile> = {
  primaryGoal: 'lose 20 pounds and get stronger',
  experienceLevel: 'beginner, did some weights in college',
  availability: {
    daysPerWeek: 4,
    minutesPerSession: 45,
    preferredTimes: ['mornings before work', 'weekend afternoons']
  },
  equipment: {
    access: 'Planet Fitness near my office',
    specificEquipment: ['smith machine', 'dumbbells', 'cardio machines']
  }
};

// User reports injury via SMS conversation
const injuryPatch: Partial<FitnessProfile> = {
  constraints: [
    ...existingConstraints,
    {
      id: generateId(),
      type: 'injury',
      label: 'Tweaked shoulder doing overhead press',
      severity: 'moderate but improving',
      affectedAreas: ['all overhead movements', 'bench press'],
      modifications: 'No overhead work for 2 weeks, light bench only',
      startDate: '2024-01-15',
      status: 'active',
      source: 'self-reported via SMS'
    }
  ]
};

// Progress update from workout completion
const progressPatch: Partial<FitnessProfile> = {
  metrics: {
    ...existingMetrics,
    maxLifts: {
      ...existingMaxLifts,
      'back squat': {
        weight: 315,
        unit: 'lbs',
        reps: 1,
        date: '2024-01-20',
        notes: 'felt easy, had more in tank'
      }
    }
  },
  currentTraining: {
    ...existingCurrentTraining,
    weeksCompleted: 8,
    perceivedExertion: 'challenging but manageable',
    adherence: '90% - missed one session due to work'
  }
};

// Natural language preference update
const preferencePatch: Partial<FitnessProfile> = {
  preferences: {
    ...existingPreferences,
    enjoyedExercises: ['heavy deadlifts', 'pull-ups', 'farmer walks'],
    dislikedExercises: ['burpees make me want to quit', 'hate the leg press machine'],
    workoutStyle: 'like to go heavy with good rest, not into circuit training'
  }
};
```

## Benefits of String-Based Semi-Structured Approach

### For LLM Processing

1. **Natural Language Expression**: Users can express themselves naturally without fitting into predefined categories
2. **Context Preservation**: String fields preserve nuance and context that enums would lose
3. **Flexible Interpretation**: LLMs can understand variations like "beginner", "just starting out", "new to this"
4. **Rich Information**: Strings like "bad shoulder from old football injury" provide more context than enum "injury"

### For System Design

1. **No Migration Needed**: Can accept any string value without schema changes
2. **Progressive Enhancement**: Start with simple strings, add structure later if patterns emerge
3. **User-Friendly**: Direct storage of user input without transformation
4. **Future-Proof**: New exercise types, goals, or equipment don't require enum updates

### For Data Quality

1. **Consistent Structure**: Schema ensures data is organized consistently
2. **Optional Validation**: Can add validation rules without changing storage
3. **Gradual Standardization**: Can identify common patterns and suggest standardized options
4. **Preserve Original**: Always have the original user expression

## LLM Context Generation

```typescript
function generateAIContext(profile: FitnessProfile): string {
  // Create narrative context from profile
  const sections = [];
  
  if (profile.primaryGoal || profile.specificObjective) {
    sections.push(`Goals: ${profile.primaryGoal}. ${profile.specificObjective || ''}`);
  }
  
  if (profile.experienceLevel) {
    sections.push(`Experience: ${profile.experienceLevel}`);
  }
  
  if (profile.constraints?.some(c => c.status === 'active')) {
    const active = profile.constraints.filter(c => c.status === 'active');
    sections.push(`Current limitations: ${active.map(c => c.label).join(', ')}`);
  }
  
  if (profile.preferences?.workoutStyle) {
    sections.push(`Training preference: ${profile.preferences.workoutStyle}`);
  }
  
  // Return as natural language context
  return sections.join('\n');
}

// Alternative: Return structured JSON for different LLM prompting strategies
function generateStructuredContext(profile: FitnessProfile): object {
  return {
    user_goal: profile.primaryGoal,
    experience: profile.experienceLevel,
    constraints: profile.constraints?.filter(c => c.status === 'active').map(c => ({
      issue: c.label,
      modifications: c.modifications
    })),
    equipment_available: profile.equipment?.specificEquipment,
    training_style: profile.preferences?.workoutStyle
  };
}
```

## Migration from Current System

```typescript
// Transform current profile to new string-based structure
function migrateProfile(old: CurrentFitnessProfile): FitnessProfile {
  return {
    // Map enums to natural language strings
    primaryGoal: mapGoalToString(old.fitnessGoals), // 'FAT_LOSS' -> 'fat loss'
    experienceLevel: mapExperienceToString(old.skillLevel), // 'INTERMEDIATE' -> 'intermediate'
    gender: old.gender?.toLowerCase().replace('_', ' '), // 'PREFER_NOT_TO_SAY' -> 'prefer not to say'
    
    metrics: {
      bodyweight: old.weight ? { 
        value: old.weight, 
        unit: 'lbs' // Assume lbs for legacy data
      } : undefined
    },
    
    availability: {
      daysPerWeek: parseFrequency(old.exerciseFrequency)
    }
    // Start minimal, enhance through conversation
  };
}
```

## Validation and Standardization Layer (Optional)

While the storage layer accepts any string, we can add optional validation or standardization:

```typescript
// Soft validation - suggest but don't enforce
class ProfileValidator {
  // Suggest common values without enforcing
  suggestStandardValue(field: string, value: string): string[] {
    const suggestions = {
      primaryGoal: ['fat loss', 'muscle gain', 'strength', 'endurance'],
      experienceLevel: ['beginner', 'intermediate', 'advanced'],
      // ... other fields
    };
    
    // Use fuzzy matching to suggest similar standard values
    return findSimilar(value, suggestions[field] || []);
  }
  
  // Validate without restricting
  validateProfile(profile: FitnessProfile): ValidationResult {
    const warnings = [];
    
    if (profile.birthDate && !isValidDateString(profile.birthDate)) {
      warnings.push('birthDate appears to be in non-standard format');
    }
    
    // Return warnings, not errors - still save the data
    return { valid: true, warnings };
  }
}
```

## Future Considerations

1. **Pattern Recognition**: Analyze common string values to identify standardization opportunities
2. **LLM Enhancement**: Use LLM to normalize/enhance free-form inputs while preserving original
3. **Search and Filtering**: Build indexes on common string patterns for efficient querying
4. **Gradual Structure**: Add optional structure (like suggested values) without breaking flexibility
5. **Context Windows**: Implement smart summarization for large profiles to fit LLM context limits