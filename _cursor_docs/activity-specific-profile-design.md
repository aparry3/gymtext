# Activity-Specific Fitness Profile Design

## Problem Statement

Currently, the fitness profile captures general information (primaryGoal, experienceLevel, specificObjective) but lacks activity-specific details that would enable:

1. **More relevant onboarding conversations** (asking about hiking experience vs. generic fitness level)
2. **Better program generation** (creating hiking-specific training vs. generic endurance programs)
3. **Accurate progress tracking** (tracking activity-specific metrics)
4. **Improved user engagement** (users feel understood in their specific pursuits)

## Current State Analysis

### Existing Profile Structure
```typescript
interface FitnessProfile {
  primaryGoal: 'strength' | 'endurance' | 'athletic-performance' | etc.
  specificObjective?: string  // "Grand Canyon hike", "marathon PR"
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  // ... other general fields
}
```

### Limitations
- Generic experience levels don't capture activity-specific expertise
- No activity-specific metrics (weekly mileage, pack weight comfort, current lifts)
- Agents must infer activity needs from vague objectives
- Workout generation lacks activity-specific context

## Design Options Analysis

### Option 1: Single ActivitySpecific Field (Flexible JSON)

```typescript
interface FitnessProfile {
  // ... existing fields
  activitySpecific?: {
    primaryActivity: ActivityType
    activities: Record<ActivityType, ActivityData>
  }
}

type ActivityType = 'hiking' | 'running' | 'strength' | 'cycling' | 'skiing' | 'swimming' | 'climbing'

interface ActivityData {
  experienceLevel: ExperienceLevel
  metrics: Record<string, number | string | boolean>
  equipment: string[]
  goals: string[]
  constraints: string[]
  lastUpdated: Date
}
```

**Pros:**
- Flexible schema accommodates any activity
- Easy to extend with new activities
- Single database field change

**Cons:**
- Less type safety
- Complex queries for specific activity data
- Harder to validate activity-specific fields

### Option 2: Dedicated Activity Profile Fields

```typescript
interface FitnessProfile {
  // ... existing fields
  hikingProfile?: HikingProfile
  runningProfile?: RunningProfile
  strengthProfile?: StrengthProfile
  cyclingProfile?: CyclingProfile
  // ... etc
}

interface HikingProfile {
  experienceLevel: ExperienceLevel
  longestHike: number // miles
  elevationExperience: 'flat' | 'moderate' | 'high-altitude' | 'extreme'
  terrainTypes: ('trail' | 'off-trail' | 'technical' | 'scrambling')[]
  packWeightComfort: number // lbs
  overnightExperience: boolean
  weatherConditions: string[]
  equipment: string[]
}
```

**Pros:**
- Full type safety
- Easy validation per activity
- Clear schema documentation
- Optimized queries per activity

**Cons:**
- Many optional fields in main profile
- Schema changes needed for new activities
- Potential for unused fields

### Option 3: Normalized Activity Profiles (Separate Table)

```typescript
// New table: activity_profiles
interface ActivityProfile {
  id: string
  userId: string
  activityType: ActivityType
  experienceLevel: ExperienceLevel
  metrics: JsonObject // activity-specific data
  equipment: string[]
  goals: string[]
  constraints: string[]
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

// FitnessProfile references primary activity
interface FitnessProfile {
  // ... existing fields
  primaryActivityId?: string
}
```

**Pros:**
- Clean separation of concerns
- Multiple activities per user
- Efficient queries
- Easy to add/remove activities

**Cons:**
- More complex joins
- Additional table to manage
- Migration complexity

## Revised Recommendation: Hybrid Approach (Flexible + Type Safety)

After reconsidering the type explosion problem, a **hybrid approach** combining flexibility with type safety is better:

### Core Activity Profile Structure
```typescript
interface FitnessProfile {
  // ... existing fields
  activityProfiles?: ActivityProfile[]
  primaryActivity?: string // references the main activity
}

interface ActivityProfile {
  activityType: ActivityType
  experienceLevel: ExperienceLevel
  data: ActivityData // flexible JSON with known structure
  lastUpdated: Date
}

type ActivityType = 'hiking' | 'running' | 'strength' | 'cycling' | 'skiing' | 'climbing' | 'swimming'

// Known activity data structures for validation/UI, not database schema
type ActivityData = HikingData | RunningData | StrengthData | GeneralActivityData

interface GeneralActivityData {
  // Fallback for any activity
  experience?: string
  equipment?: string[]
  goals?: string[]
  metrics?: Record<string, number | string | boolean>
}
```

This approach:
- **Avoids type explosion** - one ActivityProfile interface
- **Maintains flexibility** - new activities don't require schema changes  
- **Provides structure** - known activities have typed data shapes
- **Scales easily** - add new ActivityType values as needed

## Better Approach: Start Simple, Scale Smart

### Minimal Viable Implementation

Instead of complex schemas, start with a **simple, extensible approach**:

```typescript
interface FitnessProfile {
  // ... existing fields
  
  // Simple activity-specific data
  activityType?: ActivityType
  activityData?: {
    experienceLevel?: string // activity-specific experience
    keyMetrics?: Record<string, string | number> // flexible metrics
    equipment?: string[]
    goals?: string[]
    experience?: string // free-form experience description
  }
}

type ActivityType = 'hiking' | 'running' | 'strength' | 'cycling' | 'skiing' | 'other'
```

### Gradual Enhancement Strategy

**Phase 1: Basic Activity Detection**
- Add `activityType` field
- Use simple `activityData` object  
- Detect activity from user objectives
- Ask activity-relevant questions

**Phase 2: Common Patterns**  
- Identify common fields across activities
- Add structured sub-fields as needed
- Example: `keyMetrics.weeklyVolume`, `keyMetrics.longestSession`

**Phase 3: Activity-Specific Enhancement**
- Add activity-specific validation
- Create activity-aware UI components  
- Enhance agents with activity knowledge

### Example Usage

```typescript
// Hiking user
{
  activityType: 'hiking',
  activityData: {
    experienceLevel: 'day-hiker',
    keyMetrics: {
      longestHike: 15,
      elevationComfort: 'moderate',
      packWeight: 25
    },
    equipment: ['hiking boots', 'backpack', 'trekking poles'],
    experience: 'I hike most weekends, comfortable with 10-15 mile day hikes'
  }
}

// Running user  
{
  activityType: 'running',
  activityData: {
    experienceLevel: 'recreational',
    keyMetrics: {
      weeklyMileage: 25,
      longestRun: 13,
      averagePace: '8:30'
    },
    equipment: ['running shoes', 'GPS watch'],
    experience: 'Been running for 2 years, completed several half marathons'
  }
}
```

This approach:
- ✅ **No type explosion** - single flexible structure
- ✅ **Easy to extend** - add new activities without schema changes
- ✅ **Backward compatible** - existing profiles work unchanged  
- ✅ **Progressive enhancement** - can add structure over time

#### Original Complex Schemas (Reference Only)

*The detailed activity schemas below are kept for reference but NOT recommended for initial implementation:*

#### Hiking/Backpacking Data Structure
```typescript
// Reference - don't implement initially  
interface HikingData {
  experienceLevel: 'novice' | 'day-hiker' | 'backpacker' | 'mountaineer'
  longestDayHike: number // miles
  longestBackpack: number // days
  elevationExperience: 'sea-level' | 'moderate' | 'high-altitude' | 'technical'
  terrainComfort: ('trail' | 'off-trail' | 'scrambling' | 'technical-climbing')[]
  packWeightComfort: number // lbs for multi-day
  weatherExperience: ('summer' | 'winter' | 'desert' | 'alpine' | 'tropical')[]
  navigationSkills: 'guided-only' | 'marked-trails' | 'map-compass' | 'gps-proficient'
  equipment: ('tent' | 'sleeping-system' | 'cooking' | 'navigation' | 'safety')[]
  hikingGoals: string[]
  physicalConcerns: string[] // knee issues, altitude sensitivity, etc.
}
```

#### Running Profile
```typescript
interface RunningProfile {
  experienceLevel: 'beginner' | 'recreational' | 'competitive' | 'elite'
  weeklyMileage: number
  longestRun: number // miles
  preferredDistances: ('5k' | '10k' | 'half-marathon' | 'marathon' | 'ultra')[]
  paceZones: {
    easyPace: string // 'mm:ss/mile'
    tempopace: string
    racePace: string
  }
  terrainPreference: ('road' | 'trail' | 'track' | 'treadmill')[]
  raceHistory: {
    distance: string
    time: string
    date: string
  }[]
  runningInjuries: string[]
  trainingPhilosophy: 'time-based' | 'mileage-based' | 'heart-rate' | 'power-based'
}
```

#### Strength Training Profile
```typescript
interface StrengthProfile {
  experienceLevel: 'novice' | 'intermediate' | 'advanced' | 'expert'
  trainingStyle: ('powerlifting' | 'olympic' | 'bodybuilding' | 'functional' | 'crossfit')[]
  currentLifts: {
    squat?: { weight: number, reps: number, unit: 'lbs' | 'kg' }
    bench?: { weight: number, reps: number, unit: 'lbs' | 'kg' }
    deadlift?: { weight: number, reps: number, unit: 'lbs' | 'kg' }
    overhead?: { weight: number, reps: number, unit: 'lbs' | 'kg' }
  }
  preferredRepRanges: ('1-3' | '4-6' | '6-8' | '8-12' | '12+')[]
  trainingFrequency: number // days per week
  competitionExperience: boolean
  formConfidence: 'needs-coaching' | 'basic-form' | 'confident' | 'can-teach-others'
  injuryHistory: string[]
}
```

#### Cycling Profile
```typescript
interface CyclingProfile {
  experienceLevel: 'beginner' | 'recreational' | 'competitive' | 'racing'
  weeklyHours: number
  longestRide: number // miles
  bikeTypes: ('road' | 'mountain' | 'gravel' | 'hybrid' | 'ebike')[]
  terrainComfort: ('flat' | 'rolling' | 'climbing' | 'technical' | 'urban')[]
  groupRideExperience: boolean
  racingExperience: boolean
  powerMeter: boolean
  avgSpeed: number // mph
  climbingComfort: 'avoid-hills' | 'moderate-climbs' | 'love-climbing' | 'cat-1-climbs'
  maintenanceSkills: 'none' | 'basic' | 'intermediate' | 'advanced'
}
```

#### Skiing Profile
```typescript
interface SkiingProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  skiTypes: ('alpine' | 'nordic' | 'backcountry' | 'freestyle' | 'racing')[]
  terrainComfort: ('green' | 'blue' | 'black' | 'double-black' | 'backcountry')[]
  conditionsExperience: ('groomed' | 'powder' | 'ice' | 'moguls' | 'trees')[]
  verticalPerDay: number // feet
  daysPerSeason: number
  avalancheSafety: boolean // backcountry only
  equipmentOwned: ('skis' | 'boots' | 'bindings' | 'safety-gear')[]
  physicalConcerns: string[] // knee issues, altitude, etc.
}
```

## Implementation Strategy

### Phase 1: Schema Design & Migration
1. **Add activity profile fields to FitnessProfile schema**
2. **Create migration scripts** for existing users
3. **Update TypeScript types** and validation schemas
4. **Test with sample data**

### Phase 2: Agent Integration
1. **Update profile extraction agent** to recognize activity-specific information
2. **Enhance onboarding chat prompts** with activity-specific questions
3. **Modify gap detection** to identify missing activity-specific fields
4. **Create activity-specific question flows**

### Phase 3: Conversation Enhancement
1. **Activity detection logic** from user objectives
2. **Smart question routing** based on detected activity
3. **Experience inference** from activity-specific responses
4. **Progressive disclosure** of activity details

### Phase 4: Program Generation Integration
1. **Update workout generation agents** to use activity-specific data
2. **Create activity-specific workout templates**
3. **Implement progressive overload** based on activity metrics
4. **Add activity-specific progress tracking**

## Benefits Analysis

### For Users
- **More relevant conversations** ("What's your longest hike?" vs "What's your fitness level?")
- **Better program fit** (hiking-specific strength training vs generic endurance)
- **Accurate progress tracking** (trail distance vs general cardio minutes)
- **Personalized recommendations** (gear, techniques, progressions)

### For Agents
- **Richer context** for conversation flow
- **Specific data points** for program generation
- **Better user modeling** for recommendations
- **Activity-aware coaching** responses

### For Product
- **Higher engagement** through relevant experiences
- **Better outcomes** through specialized programming
- **Differentiation** from generic fitness apps
- **Data insights** into activity-specific user needs

## Implementation Considerations

### Database Impact
- **Storage increase**: ~50-200 bytes per activity profile
- **Query complexity**: Minimal impact with proper indexing
- **Migration strategy**: Gradual rollout with fallbacks

### UI/UX Changes
- **Progressive disclosure** of activity-specific questions
- **Activity selection flow** in onboarding
- **Profile editing** for multiple activities
- **Dashboard customization** per activity

### Agent Complexity
- **Activity detection** logic and keyword matching
- **Question prioritization** based on activity type
- **Cross-activity insights** (running fitness helps hiking)
- **Fallback strategies** for unknown activities

## Success Metrics

### Engagement Metrics
- **Question relevance** (fewer "I don't know" responses)
- **Conversation completion** rates
- **Profile completion** depth

### Outcome Metrics
- **Program adherence** (activity-specific programs)
- **User satisfaction** with program relevance
- **Goal achievement** rates
- **Retention** in activity-specific segments

## Risk Mitigation

### Technical Risks
- **Migration complexity**: Phased rollout with extensive testing
- **Performance impact**: Query optimization and caching
- **Data consistency**: Validation rules and constraints

### Product Risks
- **Over-complexity**: Start with 3-4 core activities
- **User confusion**: Clear activity selection and explanation
- **Maintenance burden**: Automated testing and validation

## Next Steps

1. **Validate approach** with stakeholders and users
2. **Design detailed schemas** for top 4 activities
3. **Create migration plan** and timeline
4. **Prototype activity detection** logic
5. **Design conversation flows** for each activity type

This activity-specific approach would transform GymText from a generic fitness app into a specialized coaching platform that truly understands each user's unique activity pursuits.