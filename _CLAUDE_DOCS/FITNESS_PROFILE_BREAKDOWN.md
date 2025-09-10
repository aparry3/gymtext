# Fitness Profile Schema Breakdown

## Current Analysis

The current `FitnessProfileSchema` has grown organically and contains overlapping concerns. This document proposes a simplified, focused restructure aligned with the general fitness agent approach.

## Current Structure Issues

### 1. **Scattered Information**
- Experience level appears in both `currentActivity` (top-level) and individual `activityData` items
- Preferences are mixed between general `preferences` and activity-specific `goals`/`equipment`
- Equipment constraints split between `equipment.constraints` and `constraints` array

### 2. **Activity Complexity**
- Currently supports running, strength, cycling, and general activities
- Walking and running should be consolidated (similar metrics: distance, pace, frequency)
- Cycling adds complexity that's not core to gym+cardio focus

### 3. **Redundant Goal Tracking**
- `goals` (GoalAnalysisSchema) vs activity-specific `goals` arrays
- `currentTraining` overlaps with activity-specific experience data

## Proposed Simplified Structure

### Core Philosophy: Gym + Cardio Focus
- **Strength Training**: Gym-based resistance training
- **Cardio**: Running, walking, general cardio activities
- Future expansion: Sports, PT, specialized activities

### New Logical Sections

#### 1. **Equipment & Access**
```typescript
equipmentAccess: {
  summary?: string                      // Brief overview of equipment situation
  gymAccess: boolean                    // Do they have gym access?
  gymType: 'commercial' | 'home' | 'community' | 'none'
  homeEquipment: string[]               // Available home equipment
  limitations: string[]                 // Equipment constraints
}
```

#### 2. **Availability**
```typescript
availability: {
  summary?: string                      // Brief overview of schedule and availability
  daysPerWeek: number                   // 1-7
  minutesPerSession: number             // 15-240
  preferredTimes: string[]              // 'morning', 'afternoon', 'evening'
  schedule: string                      // Free text for schedule patterns
}
```

#### 3. **Goals**
```typescript
goals: {
  summary?: string                      // Brief overview of fitness goals and motivation
  primary: string                       // Main fitness objective
  timeline: number                      // Target weeks
  specific: string                      // Specific measurable goal
  motivation: string                    // Why this goal matters
}
```

#### 4. **Constraints**
```typescript
constraints: Array<{
  id: string
  type: 'injury' | 'mobility' | 'medical' | 'preference'
  description: string
  severity: 'mild' | 'moderate' | 'severe'
  affectedMovements: string[]
  status: 'active' | 'resolved'
}>
```

#### 5. **Activity Data** (Simplified)
```typescript
activityData: Array<StrengthData | CardioData>

// Strength focused on gym training
StrengthData: {
  type: 'strength'
  summary?: string                      // Brief overview of strength training background
  experience: 'beginner' | 'intermediate' | 'advanced'
  currentProgram: string?
  keyLifts: Record<string, number>      // Flexible exercise tracking (e.g., 'squat': 225, 'bench_press': 185)
  preferences: {
    workoutStyle: string
    likedExercises: string[]
    dislikedExercises: string[]
  }
  trainingFrequency: number             // days per week
}

// Cardio combining walking/running + general cardio
CardioData: {
  type: 'cardio'
  summary?: string                      // Brief overview of cardio activities and background
  experience: 'beginner' | 'intermediate' | 'advanced'
  primaryActivities: string[]           // 'running', 'walking', 'cycling', 'rowing', etc.
  keyMetrics: {
    weeklyDistance?: number             // For running/walking
    longestSession?: number             // Distance or time
    averagePace?: string               // For running/walking
    preferredIntensity: 'low' | 'moderate' | 'high'
  }
  preferences: {
    indoor: boolean
    outdoor: boolean
    groupVsIndividual: 'group' | 'individual' | 'both'
    timeOfDay: string[]
  }
  frequency: number                     // days per week
}
```

#### 6. **User Metrics** (Simplified)
```typescript
metrics: {
  summary?: string                      // Brief overview of physical stats and fitness level
  height: number                        // cm
  weight: {
    value: number
    unit: 'lbs' | 'kg'
    date?: string
  }
  bodyComposition?: number              // body fat %
  fitnessLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
}
```

## Key Simplifications

### 1. **Two Primary Activities**
- **Strength**: Gym-based resistance training with focus on key lifts
- **Cardio**: All cardiovascular activities (running, walking, etc.) grouped together

### 2. **Consolidated Experience**
- Experience level moves into activity-specific data
- Eliminates top-level `currentActivity` and `currentTraining`

### 3. **Focused Equipment**
- Single `equipmentAccess` section covering gym access and home equipment
- Constraints moved to dedicated constraints section

### 4. **Streamlined Goals**
- Single goals object with primary goal, timeline, and motivation
- Activity-specific preferences within each activity's data

### 5. **Activity-Centric Preferences**
- Workout preferences embedded within strength/cardio data
- Eliminates separate preferences schema

## Benefits

1. **Clearer Data Organization**: Each section has a single responsibility
2. **Reduced Redundancy**: No duplicate fields across schemas
3. **Focused Agent Training**: Easier for AI to understand and update specific sections
4. **Simplified Onboarding**: Clear progression through equipment → availability → goals → activities
5. **Future Extensibility**: Easy to add new activity types (sports, PT) without restructuring core sections

## Migration Considerations

- Current `RunningDataSchema` and `CyclingDataSchema` → `CardioData`
- `StrengthDataSchema` → Updated `StrengthData` with preferences embedded
- `PreferencesSchema` → Distributed into activity-specific preferences
- `CurrentTrainingSchema` → Merged into `StrengthData.currentProgram`
- `EquipmentSchema` → `equipmentAccess`
- `MetricsSchema` → Simplified `metrics`

This structure aligns with the general fitness agent approach focusing on gym-based strength training and cardiovascular fitness, while maintaining flexibility for future specialization.