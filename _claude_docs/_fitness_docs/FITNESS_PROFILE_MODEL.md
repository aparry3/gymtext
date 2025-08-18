# Comprehensive Fitness Profile Model Design

## Overview

The fitness profile should serve as a comprehensive, evolving source of truth for all aspects of a user's fitness journey. It needs to be flexible enough to support various fitness modalities while maintaining structure for AI agents to effectively generate personalized content.

## Core Design Principles

1. **Living Document Pattern**: Profile evolves through a ledger of patches/updates
2. **Flexible Schema**: Extensive use of optional fields to support diverse fitness goals
3. **Temporal Awareness**: Track changes over time with constraints having lifecycle
4. **Multi-Modal Support**: From powerlifting to marathon training to yoga
5. **Context-Rich**: Provide sufficient detail for AI agents to generate nuanced responses

## Proposed Architecture

### 1. Core Profile Table (`fitness_profiles`)

The main profile contains immutable and slowly-changing attributes:

```typescript
interface FitnessProfile {
  // Identity
  id: string
  userId: string
  version: number // Incremented with each update
  
  // Demographics (immutable/rarely changes)
  birthDate?: Date // Better than age - calculate dynamically
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
  height?: {
    value: number
    unit: 'cm' | 'inches'
    measuredAt?: Date
  }
  
  // Core Goals & Program Type
  primaryGoal: GoalType
  secondaryGoals?: GoalType[]
  programFamily: ProgramFamily
  specificObjective?: string // "First marathon", "500lb deadlift", etc.
  eventDate?: Date // Target competition/event
  horizonWeeks?: number // If no specific event
  
  // Experience & Background
  experienceLevel: ExperienceLevel
  trainingAge?: number // Years of consistent training
  athleticBackground?: string[] // ["collegiate_swimmer", "high_school_football"]
  
  // Availability & Access
  availability: {
    daysPerWeek: number
    minutesPerSession: number
    preferredTimes?: TimePreference[]
    blackoutDays?: DayOfWeek[]
  }
  
  equipmentAccess: {
    primary: AccessType
    alternates?: AccessType[]
    specificEquipment?: string[] // ["barbell", "dumbbells", "pull_up_bar"]
    modalities?: string[] // ["running", "cycling", "swimming", "rowing"]
  }
  
  // Preferences
  preferences: {
    exercises?: {
      loved?: string[]
      neutral?: string[]
      avoided?: string[] // Not injuries, just preferences
    }
    trainingStyle?: TrainingStyle[]
    musicPreference?: string
    socialPreference?: 'solo' | 'partner' | 'group' | 'flexible'
  }
  
  // Nutrition & Recovery
  nutritionApproach?: NutritionTracking
  dietaryRestrictions?: string[]
  supplementation?: string[]
  recoveryFactors?: {
    typicalSleepHours?: number
    stressLevel?: 1 | 2 | 3 | 4 | 5
    occupation?: 'sedentary' | 'light_activity' | 'moderate_activity' | 'heavy_labor'
  }
  
  // Current Training Status
  currentTrainingStatus?: {
    weeklyVolume?: number // Current hours/week
    recentConsistency?: number // Weeks of consistent training
    lastDeloadWeek?: Date
    perceivedReadiness?: 1 | 2 | 3 | 4 | 5
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### 2. Metrics Table (`fitness_metrics`)

Separate table for evolving measurements and performance data:

```typescript
interface FitnessMetrics {
  id: string
  profileId: string
  
  // Body Composition
  bodyweight?: {
    value: number
    unit: 'kg' | 'lbs'
    trend?: 'gaining' | 'losing' | 'maintaining'
  }
  bodyFatPercentage?: number
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    thigh?: number
    arm?: number
    unit: 'cm' | 'inches'
  }
  
  // Strength Metrics
  maxLifts?: {
    // Core lifts
    squat?: LiftMetric
    bench?: LiftMetric
    deadlift?: LiftMetric
    overheadPress?: LiftMetric
    
    // Olympic lifts
    clean?: LiftMetric
    snatch?: LiftMetric
    
    // Bodyweight
    pullUps?: { max_reps: number, weighted_max?: number }
    pushUps?: { max_reps: number }
    
    // Custom lifts (extensible)
    custom?: Record<string, LiftMetric>
  }
  
  // Endurance Metrics
  cardioMetrics?: {
    vo2Max?: number
    restingHeartRate?: number
    
    running?: {
      weeklyMileage?: number
      longestRun?: number
      paces?: {
        easy?: string // "8:30/mi"
        tempo?: string
        interval?: string
        race?: Record<string, string> // {"5k": "20:00", "marathon": "3:30:00"}
      }
    }
    
    cycling?: {
      weeklyDistance?: number
      ftp?: number // Functional Threshold Power
    }
    
    swimming?: {
      weeklyDistance?: number
      pace100m?: string
    }
  }
  
  // Movement Quality
  mobilityMetrics?: {
    overheadSquatScore?: 1 | 2 | 3
    shoulderFlexibility?: 'limited' | 'normal' | 'hypermobile'
    hipFlexibility?: 'limited' | 'normal' | 'hypermobile'
    ankleFlexibility?: 'limited' | 'normal' | 'hypermobile'
  }
  
  recordedAt: Date
  source: 'user_input' | 'calculated' | 'imported' | 'coach_estimated'
}

interface LiftMetric {
  weight: number
  unit: 'kg' | 'lbs'
  reps: number
  estimated1RM?: number
  testedDate?: Date
  isEstimated: boolean
}
```

### 3. Constraints Table (`fitness_constraints`)

Active constraints that affect programming:

```typescript
interface FitnessConstraint {
  id: string
  profileId: string
  alias?: string // Short reference for LLM (I1, T1, etc.)
  
  type: ConstraintType
  severity?: 'mild' | 'moderate' | 'severe'
  status: ConstraintStatus
  
  // Temporal
  startDate: Date
  endDate?: Date // null = ongoing
  
  // Scope
  scope?: {
    bodyPart?: BodyPart
    side?: 'left' | 'right' | 'bilateral'
    movement?: string[]
    activity?: string[]
  }
  
  // Effects
  affects?: {
    // Movement modifications
    movementMods?: {
      avoid?: string[]
      substitute?: Record<string, string> // {"back_squat": "goblet_squat"}
      rpeCap?: number
      loadCap?: number // percentage of normal
      volumeCap?: number // percentage of normal
    }
    
    // Access changes
    accessOverrides?: {
      temporaryAccess?: AccessType
      unavailableEquipment?: string[]
      availableEquipment?: string[]
    }
    
    // Schedule changes
    scheduleMods?: {
      maxDaysPerWeek?: number
      maxMinutesPerSession?: number
      blackoutDays?: DayOfWeek[]
    }
  }
  
  // Metadata
  note?: string
  source: 'user' | 'coach' | 'medical' | 'system'
  confidence?: number // 0-1, how certain we are about this constraint
  requiresReassessment?: Date
  
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolutionNote?: string
}

type ConstraintType = 
  | 'injury'
  | 'pain'
  | 'travel'
  | 'equipment_change'
  | 'schedule_change'
  | 'medical_restriction'
  | 'pregnancy'
  | 'postpartum'
  | 'surgery_recovery'
  | 'illness'
  | 'stress_management'

type ConstraintStatus =
  | 'scheduled' // Future constraint
  | 'active'    // Currently affecting programming
  | 'improving' // Getting better, may need less modification
  | 'resolved'  // No longer affecting programming
  | 'expired'   // Past its end date
  | 'cancelled' // Was scheduled but didn't happen
```

### 4. Profile Updates Table (`profile_patches`)

Ledger of all changes to maintain history:

```typescript
interface ProfilePatch {
  id: string
  profileId: string
  version: number // Sequential version number
  
  patch: {
    op: 'add' | 'update' | 'remove'
    path: string // JSONPath to field
    value?: any
    previousValue?: any
  }
  
  category: PatchCategory
  source: 'user' | 'coach' | 'system' | 'import'
  confidence?: number
  
  reason?: string // Why this change was made
  evidenceUrl?: string // Link to conversation/workout that prompted change
  
  appliedAt: Date
  appliedBy?: string // User ID if manual
}

type PatchCategory = 
  | 'goal_change'
  | 'metrics_update'
  | 'constraint_add'
  | 'constraint_resolve'
  | 'preference_update'
  | 'availability_change'
  | 'progress_milestone'
  | 'program_adjustment'
```

### 5. Profile Snapshots Table (`profile_snapshots`)

Periodic full snapshots for quick access and rollback:

```typescript
interface ProfileSnapshot {
  id: string
  profileId: string
  version: number
  
  snapshot: {
    profile: FitnessProfile
    metrics: FitnessMetrics
    activeConstraints: FitnessConstraint[]
  }
  
  reason: 'scheduled' | 'before_major_change' | 'milestone' | 'backup'
  createdAt: Date
}
```

## Key Enumerations

```typescript
enum GoalType {
  // Primary Goals
  FAT_LOSS = 'fat_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  ATHLETIC_PERFORMANCE = 'athletic_performance',
  GENERAL_HEALTH = 'general_health',
  REHABILITATION = 'rehabilitation',
  
  // Specific Goals
  BODYBUILDING = 'bodybuilding',
  POWERLIFTING = 'powerlifting',
  WEIGHTLIFTING = 'weightlifting',
  CROSSFIT = 'crossfit',
  RUNNING = 'running',
  CYCLING = 'cycling',
  TRIATHLON = 'triathlon',
  SPORT_SPECIFIC = 'sport_specific',
  
  // Wellness Goals
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  STRESS_MANAGEMENT = 'stress_management',
  POSTURE = 'posture',
  PAIN_MANAGEMENT = 'pain_management'
}

enum ProgramFamily {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  POWER = 'power',
  HYBRID = 'hybrid',
  SPORT = 'sport',
  REHABILITATION = 'rehabilitation',
  GENERAL = 'general'
}

enum ExperienceLevel {
  BEGINNER = 'beginner',        // <1 year
  NOVICE = 'novice',            // 1-2 years
  INTERMEDIATE = 'intermediate', // 2-5 years
  ADVANCED = 'advanced',        // 5-10 years
  ELITE = 'elite'               // 10+ years / competitive
}

enum AccessType {
  COMMERCIAL_GYM = 'commercial_gym',
  HOME_GYM_FULL = 'home_gym_full',
  HOME_GYM_BASIC = 'home_gym_basic',
  MINIMAL = 'minimal',
  BODYWEIGHT_ONLY = 'bodyweight_only',
  OUTDOOR = 'outdoor',
  HOTEL_GYM = 'hotel_gym',
  CROSSFIT_BOX = 'crossfit_box',
  POWERLIFTING_GYM = 'powerlifting_gym',
  TRACK = 'track',
  POOL = 'pool'
}

enum TrainingStyle {
  HIGH_INTENSITY = 'high_intensity',
  VOLUME_FOCUS = 'volume_focus',
  STRENGTH_FOCUS = 'strength_focus',
  CIRCUIT_TRAINING = 'circuit_training',
  SUPERSTES = 'supersets',
  STRAIGHT_SETS = 'straight_sets',
  CLUSTER_SETS = 'cluster_sets',
  REST_PAUSE = 'rest_pause',
  TEMPO_WORK = 'tempo_work',
  EXPLOSIVE = 'explosive'
}

enum NutritionTracking {
  MACROS = 'macros',
  CALORIES = 'calories',
  HAND_PORTIONS = 'hand_portions',
  INTUITIVE = 'intuitive',
  MEAL_PLAN = 'meal_plan',
  NOT_TRACKING = 'not_tracking'
}
```

## Usage Patterns

### 1. Profile Evolution
- Start with minimal required fields during onboarding
- Progressively enhance through conversations
- Each update creates a patch record
- Periodic snapshots for performance

### 2. Constraint Management
- Constraints have lifecycle (scheduled → active → resolved)
- Multiple constraints can be active simultaneously
- System combines constraints to determine effective limitations
- AI agents reference constraints by alias for clarity

### 3. Context Generation for AI
When generating context for AI agents:
1. Load current profile + active constraints
2. Include recent metrics
3. Apply constraint effects to get "effective profile"
4. Include relevant patch history for recent changes

### 4. Progress Tracking
- Metrics table tracks performance over time
- Can graph progress trends
- Patches show when/why adjustments were made
- Milestones trigger snapshots

## Benefits of This Model

1. **Comprehensive**: Covers all fitness modalities and edge cases
2. **Flexible**: Optional fields allow gradual profile building
3. **Temporal**: Full history and future planning capability  
4. **AI-Friendly**: Structured data with clear semantics
5. **User-Centric**: Captures preferences and constraints respectfully
6. **Scalable**: Normalized structure with efficient querying
7. **Auditable**: Complete change history with reasoning

## Migration Strategy

1. Create new tables alongside existing ones
2. Write migration script to transform current data
3. Dual-write period for safety
4. Update agents to use new model
5. Deprecate old tables after validation

## Open Questions for Consideration

1. Should we store workout preferences per muscle group or movement pattern?
2. How granular should equipment tracking be? (Brand/model specific?)
3. Should we track injuries in a separate medical history table?
4. Do we need a goals history table for tracking goal changes over time?
5. Should preferences be versioned separately from the main profile?
6. How do we handle partner/group training preferences?
7. Should we integrate with wearables for automatic metric updates?

## Next Steps

1. Review and refine enumeration values
2. Define exact JSON schemas for complex fields
3. Design API contracts for profile updates
4. Create validation rules for constraint combinations
5. Define aggregation queries for AI context generation
6. Design privacy controls for sensitive health data