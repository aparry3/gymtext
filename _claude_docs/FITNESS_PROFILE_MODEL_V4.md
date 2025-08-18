# Fitness Profile Model Design V4 - LLM-Optimized Semi-Structured JSON

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
```

## AI Context Generation - Best Practices

### Structured Context with Clear Sections

```typescript
function generateAIContext(profile: FitnessProfile): string {
  const sections: string[] = [];
  
  // ===== USER OVERVIEW =====
  sections.push('=== USER PROFILE ===');
  
  if (profile.gender || profile.birthDate) {
    const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
    const demographics = [
      profile.gender,
      age ? `${age} years old` : null
    ].filter(Boolean).join(', ');
    if (demographics) sections.push(`Demographics: ${demographics}`);
  }
  
  if (profile.experienceLevel) {
    sections.push(`Experience Level: ${profile.experienceLevel}`);
  }
  
  if (profile.athleticBackground?.length) {
    sections.push(`Athletic Background: ${profile.athleticBackground.join(', ')}`);
  }
  
  // ===== GOALS =====
  sections.push('\n=== GOALS ===');
  
  if (profile.primaryGoal) {
    sections.push(`Primary Goal: ${profile.primaryGoal}`);
  }
  
  if (profile.specificObjective) {
    sections.push(`Specific Objective: ${profile.specificObjective}`);
  }
  
  if (profile.secondaryGoals?.length) {
    sections.push(`Secondary Goals: ${profile.secondaryGoals.join(', ')}`);
  }
  
  if (profile.eventDate) {
    sections.push(`Target Date: ${profile.eventDate}`);
  }
  
  // ===== CURRENT STATUS =====
  if (profile.metrics?.bodyweight || profile.currentTraining) {
    sections.push('\n=== CURRENT STATUS ===');
    
    if (profile.metrics?.bodyweight) {
      sections.push(`Body Weight: ${profile.metrics.bodyweight.value} ${profile.metrics.bodyweight.unit}`);
    }
    
    if (profile.currentTraining?.programName) {
      sections.push(`Current Program: ${profile.currentTraining.programName}`);
    }
    
    if (profile.currentTraining?.perceivedExertion) {
      sections.push(`Training Intensity: ${profile.currentTraining.perceivedExertion}`);
    }
    
    if (profile.currentTraining?.adherence) {
      sections.push(`Program Adherence: ${profile.currentTraining.adherence}`);
    }
  }
  
  // ===== AVAILABILITY & EQUIPMENT =====
  sections.push('\n=== TRAINING LOGISTICS ===');
  
  if (profile.availability?.daysPerWeek) {
    sections.push(`Available Days: ${profile.availability.daysPerWeek} days per week`);
  }
  
  if (profile.availability?.minutesPerSession) {
    sections.push(`Session Duration: ${profile.availability.minutesPerSession} minutes`);
  }
  
  if (profile.availability?.preferredTimes?.length) {
    sections.push(`Preferred Times: ${profile.availability.preferredTimes.join(', ')}`);
  }
  
  if (profile.equipment?.access) {
    sections.push(`Equipment Access: ${profile.equipment.access}`);
  }
  
  if (profile.equipment?.specificEquipment?.length) {
    sections.push(`Available Equipment: ${profile.equipment.specificEquipment.join(', ')}`);
  }
  
  // ===== CONSTRAINTS & LIMITATIONS =====
  const activeConstraints = profile.constraints?.filter(c => 
    c.status === 'active' || c.status === 'improving'
  );
  
  if (activeConstraints?.length) {
    sections.push('\n=== ACTIVE CONSTRAINTS ===');
    
    activeConstraints.forEach(constraint => {
      sections.push(`\n${constraint.type.toUpperCase()}: ${constraint.label}`);
      if (constraint.severity) {
        sections.push(`  Severity: ${constraint.severity}`);
      }
      if (constraint.modifications) {
        sections.push(`  Modifications: ${constraint.modifications}`);
      }
      if (constraint.affectedAreas?.length) {
        sections.push(`  Affected Areas: ${constraint.affectedAreas.join(', ')}`);
      }
    });
  }
  
  // ===== PREFERENCES =====
  if (profile.preferences) {
    sections.push('\n=== PREFERENCES ===');
    
    if (profile.preferences.workoutStyle) {
      sections.push(`Workout Style: ${profile.preferences.workoutStyle}`);
    }
    
    if (profile.preferences.enjoyedExercises?.length) {
      sections.push(`Enjoys: ${profile.preferences.enjoyedExercises.join(', ')}`);
    }
    
    if (profile.preferences.dislikedExercises?.length) {
      sections.push(`Dislikes: ${profile.preferences.dislikedExercises.join(', ')}`);
    }
  }
  
  // ===== RECOVERY & LIFESTYLE =====
  if (profile.recovery || profile.nutrition) {
    sections.push('\n=== RECOVERY & LIFESTYLE ===');
    
    if (profile.recovery?.averageSleepHours) {
      sections.push(`Sleep: ${profile.recovery.averageSleepHours} hours per night`);
    }
    
    if (profile.recovery?.stressLevel) {
      sections.push(`Stress Level: ${profile.recovery.stressLevel}`);
    }
    
    if (profile.recovery?.occupation) {
      sections.push(`Occupation: ${profile.recovery.occupation}`);
    }
    
    if (profile.nutrition?.approach) {
      sections.push(`Nutrition Approach: ${profile.nutrition.approach}`);
    }
    
    if (profile.nutrition?.restrictions?.length) {
      sections.push(`Dietary Restrictions: ${profile.nutrition.restrictions.join(', ')}`);
    }
  }
  
  // ===== COACHING NOTES =====
  if (profile.coachingNotes?.focusAreas?.length || profile.coachingNotes?.recentWins?.length) {
    sections.push('\n=== COACHING NOTES ===');
    
    if (profile.coachingNotes.focusAreas?.length) {
      sections.push(`Focus Areas: ${profile.coachingNotes.focusAreas.join(', ')}`);
    }
    
    if (profile.coachingNotes.recentWins?.length) {
      sections.push(`Recent Wins: ${profile.coachingNotes.recentWins.join(', ')}`);
    }
    
    if (profile.coachingNotes.communicationStyle) {
      sections.push(`Communication Style: ${profile.coachingNotes.communicationStyle}`);
    }
  }
  
  return sections.join('\n');
}
```

### Conversational Context Generator

```typescript
function generateConversationalContext(profile: FitnessProfile): string {
  const parts: string[] = [];
  
  // Start with who they are
  parts.push('You are coaching a client with the following profile:');
  parts.push('');
  
  // Natural language summary
  if (profile.experienceLevel && profile.primaryGoal) {
    parts.push(`This is a ${profile.experienceLevel} trainee whose main goal is ${profile.primaryGoal}.`);
  }
  
  // Training availability
  if (profile.availability?.daysPerWeek && profile.availability?.minutesPerSession) {
    parts.push(`They can train ${profile.availability.daysPerWeek} days per week for ${profile.availability.minutesPerSession} minutes per session.`);
  }
  
  // Equipment situation
  if (profile.equipment?.access) {
    parts.push(`They have access to ${profile.equipment.access}.`);
  }
  
  // Important constraints
  const activeConstraints = profile.constraints?.filter(c => c.status === 'active');
  if (activeConstraints?.length) {
    parts.push('');
    parts.push('IMPORTANT LIMITATIONS TO CONSIDER:');
    activeConstraints.forEach(c => {
      parts.push(`- ${c.label}${c.modifications ? ` (${c.modifications})` : ''}`);
    });
  }
  
  // Preferences
  if (profile.preferences?.workoutStyle) {
    parts.push('');
    parts.push(`They prefer ${profile.preferences.workoutStyle} workouts.`);
  }
  
  // Recent progress
  if (profile.coachingNotes?.recentWins?.length) {
    parts.push('');
    parts.push('Recent achievements:');
    profile.coachingNotes.recentWins.forEach(win => {
      parts.push(`- ${win}`);
    });
  }
  
  return parts.join('\n');
}
```

### Compact JSON Context for Token Efficiency

```typescript
function generateCompactContext(profile: FitnessProfile): object {
  // Only include non-empty, relevant fields
  const compact: any = {};
  
  // Essential info only
  if (profile.primaryGoal) compact.goal = profile.primaryGoal;
  if (profile.experienceLevel) compact.experience = profile.experienceLevel;
  
  // Availability
  if (profile.availability?.daysPerWeek || profile.availability?.minutesPerSession) {
    compact.schedule = {
      days: profile.availability.daysPerWeek,
      minutes: profile.availability.minutesPerSession
    };
  }
  
  // Active constraints only
  const activeConstraints = profile.constraints?.filter(c => c.status === 'active');
  if (activeConstraints?.length) {
    compact.constraints = activeConstraints.map(c => ({
      issue: c.label,
      mods: c.modifications
    }));
  }
  
  // Equipment
  if (profile.equipment?.access) {
    compact.equipment = profile.equipment.access;
    if (profile.equipment.specificEquipment?.length) {
      compact.available = profile.equipment.specificEquipment;
    }
  }
  
  // Current metrics (latest only)
  if (profile.metrics?.bodyweight) {
    compact.weight = `${profile.metrics.bodyweight.value}${profile.metrics.bodyweight.unit}`;
  }
  
  // Training status
  if (profile.currentTraining?.perceivedExertion) {
    compact.intensity = profile.currentTraining.perceivedExertion;
  }
  
  return compact;
}
```

### Context Selection Based on Use Case

```typescript
class ProfileContextGenerator {
  // For workout generation
  getWorkoutContext(profile: FitnessProfile): string {
    const relevant = {
      goal: profile.primaryGoal,
      experience: profile.experienceLevel,
      equipment: profile.equipment?.specificEquipment,
      constraints: profile.constraints?.filter(c => c.status === 'active'),
      preferences: {
        enjoyed: profile.preferences?.enjoyedExercises,
        avoided: profile.preferences?.dislikedExercises,
        style: profile.preferences?.workoutStyle
      },
      timeAvailable: profile.availability?.minutesPerSession,
      recentExertion: profile.currentTraining?.perceivedExertion
    };
    
    return this.formatAsStructuredPrompt(relevant);
  }
  
  // For conversational coaching
  getConversationContext(profile: FitnessProfile): string {
    return generateConversationalContext(profile);
  }
  
  // For progress analysis
  getProgressContext(profile: FitnessProfile): string {
    const relevant = {
      startingPoint: this.getHistoricalMetrics(profile, 90), // Last 90 days
      currentMetrics: profile.metrics,
      trainingHistory: profile.currentTraining,
      recentWins: profile.coachingNotes?.recentWins,
      focusAreas: profile.coachingNotes?.focusAreas
    };
    
    return this.formatAsAnalyticalPrompt(relevant);
  }
  
  // For program design
  getProgramDesignContext(profile: FitnessProfile): string {
    return generateAIContext(profile); // Full structured context
  }
  
  private formatAsStructuredPrompt(data: any): string {
    // Format with clear headers and bullet points
    return `TRAINING PARAMETERS:
Goal: ${data.goal || 'general fitness'}
Experience: ${data.experience || 'intermediate'}
Time Available: ${data.timeAvailable || 60} minutes

EQUIPMENT:
${data.equipment?.map(e => `- ${e}`).join('\n') || '- Full gym access'}

CONSTRAINTS:
${data.constraints?.map(c => `- ${c.label}: ${c.modifications}`).join('\n') || 'None'}

PREFERENCES:
Style: ${data.preferences?.style || 'balanced'}
Enjoys: ${data.preferences?.enjoyed?.join(', ') || 'variety'}
Avoid: ${data.preferences?.avoided?.join(', ') || 'none specified'}

CURRENT STATUS:
Perceived Exertion: ${data.recentExertion || 'moderate'}`;
  }
  
  private formatAsAnalyticalPrompt(data: any): string {
    return JSON.stringify(data, null, 2);
  }
  
  private getHistoricalMetrics(profile: FitnessProfile, daysBack: number): any {
    // Implementation would fetch historical data
    // For now, return current metrics as baseline
    return profile.metrics;
  }
}
```

## Benefits of Improved Context Generation

### Better LLM Performance

1. **Clear Structure**: Section headers help LLMs understand context organization
2. **Relevant Information**: Only include data pertinent to the specific task
3. **Natural Language**: Conversational format for coaching interactions
4. **Compact Format**: JSON for token-efficient processing

### Flexible Context Types

1. **Structured**: For systematic tasks like workout generation
2. **Conversational**: For natural dialogue and coaching
3. **Analytical**: For data analysis and progress tracking
4. **Compact**: For token-limited situations

### Use Case Optimization

1. **Task-Specific**: Different context formats for different AI tasks
2. **Progressive Detail**: Start with essential info, add detail as needed
3. **Token Efficiency**: Compact formats when context window is limited
4. **Readability**: Human-readable formats for debugging and verification

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

## Implementation Notes

### Context Caching

```typescript
class ContextCache {
  private cache = new Map<string, { context: string, timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  getCachedContext(userId: string, contextType: string): string | null {
    const key = `${userId}:${contextType}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.context;
    }
    
    return null;
  }
  
  setCachedContext(userId: string, contextType: string, context: string): void {
    const key = `${userId}:${contextType}`;
    this.cache.set(key, { context, timestamp: Date.now() });
  }
}
```

### Profile Completeness Scoring

```typescript
function calculateProfileCompleteness(profile: FitnessProfile): number {
  const weights = {
    primaryGoal: 10,
    experienceLevel: 8,
    availability: 7,
    equipment: 6,
    metrics: 5,
    preferences: 4,
    constraints: 3,
    nutrition: 2,
    recovery: 2,
    coachingNotes: 1
  };
  
  let score = 0;
  let maxScore = 0;
  
  for (const [field, weight] of Object.entries(weights)) {
    maxScore += weight;
    if (profile[field] && Object.keys(profile[field]).length > 0) {
      score += weight;
    }
  }
  
  return Math.round((score / maxScore) * 100);
}
```

## Future Enhancements

1. **Smart Summarization**: Use LLM to create concise summaries of verbose profiles
2. **Context Templates**: Pre-built templates for common coaching scenarios
3. **Dynamic Context**: Adjust context based on conversation history
4. **Profile Enrichment**: Use LLM to enhance sparse profiles with inferred data
5. **Multi-Modal Context**: Include workout videos, form checks, progress photos