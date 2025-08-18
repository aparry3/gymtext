# Fitness Profile Model Design V5 - Simplified Context Generation & Clear Update Mechanics

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

## Constraint Update Mechanics - CLARIFICATION

### How Constraints Work

Constraints are **REPLACED IN FULL** with each update, not individually patched. The constraints array is treated as a single unit that gets completely replaced when updated.

```typescript
// IMPORTANT: Constraints are NOT individually updated by ID
// The entire constraints array is replaced with each patch

interface ConstraintUpdate {
  // When updating constraints, you must:
  // 1. Get the current constraints array
  // 2. Modify it (add, update, or remove items)
  // 3. Send the ENTIRE new array as the patch
}
```

### Constraint Update Examples

```typescript
// Adding a new constraint
async function addConstraint(userId: string, newConstraint: Constraint) {
  const profile = await getProfile(userId);
  const currentConstraints = profile.constraints || [];
  
  // Create new constraint with ID
  const constraintWithId = {
    ...newConstraint,
    id: generateId(),
    startDate: newConstraint.startDate || new Date().toISOString()
  };
  
  // Patch replaces entire constraints array
  const patch = {
    constraints: [...currentConstraints, constraintWithId]
  };
  
  return applyProfilePatch(userId, patch, 'user', 'Added new constraint');
}

// Updating an existing constraint by ID
async function updateConstraint(userId: string, constraintId: string, updates: Partial<Constraint>) {
  const profile = await getProfile(userId);
  const currentConstraints = profile.constraints || [];
  
  // Map over constraints, updating the one with matching ID
  const updatedConstraints = currentConstraints.map(c => 
    c.id === constraintId 
      ? { ...c, ...updates }
      : c
  );
  
  // Patch replaces entire constraints array
  const patch = {
    constraints: updatedConstraints
  };
  
  return applyProfilePatch(userId, patch, 'system', 'Updated constraint status');
}

// Resolving a constraint
async function resolveConstraint(userId: string, constraintId: string) {
  const profile = await getProfile(userId);
  const currentConstraints = profile.constraints || [];
  
  // Update status and endDate
  const updatedConstraints = currentConstraints.map(c => 
    c.id === constraintId 
      ? { ...c, status: 'resolved', endDate: new Date().toISOString() }
      : c
  );
  
  // Patch replaces entire constraints array
  const patch = {
    constraints: updatedConstraints
  };
  
  return applyProfilePatch(userId, patch, 'user', 'Resolved constraint');
}

// Removing old resolved constraints (cleanup)
async function cleanupResolvedConstraints(userId: string, daysOld: number = 30) {
  const profile = await getProfile(userId);
  const currentConstraints = profile.constraints || [];
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  // Filter out old resolved constraints
  const activeConstraints = currentConstraints.filter(c => {
    if (c.status !== 'resolved') return true;
    if (!c.endDate) return true;
    return new Date(c.endDate) > cutoffDate;
  });
  
  // Only update if something was removed
  if (activeConstraints.length !== currentConstraints.length) {
    const patch = {
      constraints: activeConstraints
    };
    return applyProfilePatch(userId, patch, 'system', 'Cleaned up old resolved constraints');
  }
}
```

## Simplified AI Context Generation

### Simple, Readable Context Generator

```typescript
function generateAIContext(profile: FitnessProfile): string {
  const lines: string[] = [];
  
  // Basic info
  if (profile.primaryGoal) {
    lines.push(`Goal: ${profile.primaryGoal}`);
  }
  
  if (profile.experienceLevel) {
    lines.push(`Experience: ${profile.experienceLevel}`);
  }
  
  // Availability
  if (profile.availability?.daysPerWeek) {
    lines.push(`Training Days: ${profile.availability.daysPerWeek} per week`);
  }
  
  if (profile.availability?.minutesPerSession) {
    lines.push(`Session Length: ${profile.availability.minutesPerSession} minutes`);
  }
  
  // Equipment
  if (profile.equipment?.access) {
    lines.push(`Equipment Access: ${profile.equipment.access}`);
  }
  
  // Active constraints (critical for programming)
  const activeConstraints = profile.constraints?.filter(c => 
    c.status === 'active' || !c.status
  );
  
  if (activeConstraints?.length) {
    lines.push('\nActive Limitations:');
    activeConstraints.forEach(c => {
      lines.push(`- ${c.label}`);
      if (c.modifications) {
        lines.push(`  Modifications: ${c.modifications}`);
      }
    });
  }
  
  // Current metrics
  if (profile.metrics?.bodyweight) {
    lines.push(`\nCurrent Weight: ${profile.metrics.bodyweight.value} ${profile.metrics.bodyweight.unit}`);
  }
  
  // Training preferences
  if (profile.preferences?.workoutStyle) {
    lines.push(`Workout Style: ${profile.preferences.workoutStyle}`);
  }
  
  return lines.join('\n');
}
```

### Compact JSON Context

```typescript
function generateCompactContext(profile: FitnessProfile): object {
  // Only essential fields, flat structure where possible
  const context: any = {};
  
  // Core info
  if (profile.primaryGoal) context.goal = profile.primaryGoal;
  if (profile.experienceLevel) context.experience = profile.experienceLevel;
  
  // Schedule
  if (profile.availability?.daysPerWeek) {
    context.daysPerWeek = profile.availability.daysPerWeek;
  }
  if (profile.availability?.minutesPerSession) {
    context.minutesPerSession = profile.availability.minutesPerSession;
  }
  
  // Equipment
  if (profile.equipment?.access) context.equipment = profile.equipment.access;
  
  // Only active constraints
  const activeConstraints = profile.constraints?.filter(c => c.status === 'active' || !c.status);
  if (activeConstraints?.length) {
    context.constraints = activeConstraints.map(c => ({
      type: c.type,
      label: c.label,
      mods: c.modifications
    }));
  }
  
  // Current status
  if (profile.currentTraining?.perceivedExertion) {
    context.recentIntensity = profile.currentTraining.perceivedExertion;
  }
  
  return context;
}
```

### Task-Specific Context Examples

```typescript
// For daily workout generation - minimal context
function getWorkoutContext(profile: FitnessProfile): string {
  const parts = [];
  
  // Only what affects today's workout
  parts.push(`Goal: ${profile.primaryGoal || 'general fitness'}`);
  parts.push(`Experience: ${profile.experienceLevel || 'intermediate'}`);
  parts.push(`Time Available: ${profile.availability?.minutesPerSession || 60} minutes`);
  
  if (profile.equipment?.specificEquipment?.length) {
    parts.push(`Equipment: ${profile.equipment.specificEquipment.join(', ')}`);
  }
  
  // Active constraints are critical
  const constraints = profile.constraints?.filter(c => c.status === 'active');
  if (constraints?.length) {
    parts.push('\nAvoid:');
    constraints.forEach(c => {
      parts.push(`- ${c.label}`);
    });
  }
  
  return parts.join('\n');
}

// For conversational response - more personal
function getChatContext(profile: FitnessProfile): string {
  const parts = [];
  
  // Key identity markers for personalization
  if (profile.primaryGoal) {
    parts.push(`User's goal: ${profile.primaryGoal}`);
  }
  
  if (profile.currentTraining?.programName) {
    parts.push(`Currently doing: ${profile.currentTraining.programName}`);
  }
  
  if (profile.coachingNotes?.communicationStyle) {
    parts.push(`Communication preference: ${profile.coachingNotes.communicationStyle}`);
  }
  
  // Recent context
  if (profile.coachingNotes?.recentWins?.length) {
    const recentWin = profile.coachingNotes.recentWins[0];
    parts.push(`Recent achievement: ${recentWin}`);
  }
  
  return parts.join('\n');
}
```

## Update Mechanism Clarification

### Deep Merge vs Replace Behavior

```typescript
// The patch mechanism uses deep merge for nested objects
// BUT arrays are REPLACED, not merged

async function applyProfilePatch(
  userId: string, 
  patch: Partial<FitnessProfile>,
  source: string,
  reason?: string
) {
  const current = await getProfile(userId);
  
  // Deep merge behavior:
  // - Objects are merged recursively
  // - Arrays are REPLACED entirely
  // - Primitives are overwritten
  const updated = deepMerge(current.profile, patch);
  
  // Save to database...
}

// Examples of merge behavior:

// OBJECTS MERGE (nested properties preserved)
const current = {
  availability: {
    daysPerWeek: 3,
    minutesPerSession: 45
  }
};

const patch = {
  availability: {
    daysPerWeek: 4  // Only updating days
  }
};

// Result: { availability: { daysPerWeek: 4, minutesPerSession: 45 } }
// minutesPerSession is preserved!

// ARRAYS REPLACE (entire array replaced)
const current = {
  constraints: [
    { id: '1', type: 'injury', label: 'Shoulder pain' },
    { id: '2', type: 'travel', label: 'Vacation' }
  ]
};

const patch = {
  constraints: [
    { id: '1', type: 'injury', label: 'Shoulder pain - improving' },
    { id: '2', type: 'travel', label: 'Vacation' },
    { id: '3', type: 'medical', label: 'Doctor ordered rest' }
  ]
};

// Result: constraints array is completely replaced with patch version
```

### Best Practices for Updates

```typescript
// Helper functions for common update patterns

class ProfileUpdateHelpers {
  // For array fields - get current, modify, replace
  static async updateArrayField<T>(
    userId: string,
    fieldPath: string,
    updateFn: (current: T[]) => T[]
  ): Promise<void> {
    const profile = await getProfile(userId);
    const currentArray = _.get(profile, fieldPath, []) as T[];
    const updatedArray = updateFn(currentArray);
    
    const patch = _.set({}, fieldPath, updatedArray);
    await applyProfilePatch(userId, patch, 'system', `Updated ${fieldPath}`);
  }
  
  // For nested object fields - partial update
  static async updateNestedObject(
    userId: string,
    fieldPath: string,
    updates: object
  ): Promise<void> {
    const patch = _.set({}, fieldPath, updates);
    await applyProfilePatch(userId, patch, 'system', `Updated ${fieldPath}`);
  }
  
  // Safe constraint operations
  static async addConstraint(userId: string, constraint: Omit<Constraint, 'id'>) {
    return this.updateArrayField(userId, 'constraints', (current) => [
      ...current,
      { ...constraint, id: generateId() }
    ]);
  }
  
  static async updateConstraintStatus(userId: string, constraintId: string, status: string) {
    return this.updateArrayField(userId, 'constraints', (current) =>
      current.map(c => c.id === constraintId ? { ...c, status } : c)
    );
  }
}
```

## Benefits Summary

### Clear Update Semantics
1. **Arrays Replace**: Entire array is replaced, not merged
2. **Objects Merge**: Nested properties are preserved
3. **ID-Based Updates**: Must be done manually by getting, modifying, and replacing array
4. **Atomic Operations**: Each patch is a single transaction

### Simplified Context Generation
1. **Less Prose**: Direct key-value pairs instead of sentences
2. **Flat Structure**: Minimize nesting for easier parsing
3. **Task-Specific**: Only include relevant fields for each use case
4. **Predictable Format**: Consistent structure for LLM consumption

### Practical Patterns
1. **Helper Functions**: Encapsulate common update patterns
2. **Clear Examples**: Show exact merge vs replace behavior
3. **Safety Checks**: Validate constraints have IDs before updates
4. **Audit Trail**: Every update logged with source and reason