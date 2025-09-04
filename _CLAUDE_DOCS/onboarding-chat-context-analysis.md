# Onboarding Chat Context Analysis

## Problem Statement

The onboarding chat system continues to ask basic questions like "What is your primary fitness goal?" even after users provide detailed, contextual information like "Help me get in shape for ski season - lots of legs and cardio." This suggests the system is not effectively utilizing the full context from the user's fitness profile.

**Important Scope Note**: The onboarding chat's purpose is **profile building only** - gathering comprehensive information about the user's goals, constraints, preferences, and situation. Program recommendations and training suggestions come later, using the completed profile.

## Root Cause Analysis

### 1. Limited Context in Chat Prompts

**Current Implementation** (`buildOnboardingChatSystemPrompt` in `src/server/agents/onboardingChat/prompts.ts:18-22`):

```typescript
const profileSummary = profile ? `
- Primary Goal: ${profile.primaryGoal || 'Not specified'}
- Experience: ${profile.experienceLevel || 'Not specified'}
- Availability: ${profile.availability?.daysPerWeek ?? 'Not specified'} days per week
- Equipment: ${profile.equipment?.access || 'Not specified'}` : 'No profile yet.';
```

**Problem**: Only 4 fields are being used from the comprehensive `FitnessProfile` type.

### 2. Rich Data Available But Unused

**Full FitnessProfile Schema** (from `src/server/models/user/schemas.ts:90-130`):

The `FitnessProfile` contains:
- **Goals**: `primaryGoal`, `specificObjective`, `eventDate`, `timelineWeeks`
- **Training Context**: `currentActivity`, `currentTraining` (program, focus, notes)
- **Detailed Availability**: `daysPerWeek`, `minutesPerSession`, `preferredTimes`, `travelPattern`, `notes`
- **Equipment Details**: `access`, `location`, `items`, `constraints`
- **Preferences**: `workoutStyle`, `enjoyedExercises`, `dislikedExercises`, `coachingTone`, `musicOrVibe`
- **Physical Metrics**: `heightCm`, `bodyweight`, `bodyFatPercent`, `prLifts`
- **Constraints**: Array of injuries, limitations, schedule conflicts
- **Legacy Fields**: `fitnessGoals`, `skillLevel`, `exerciseFrequency`, `gender`, `age`

### 3. Profile Extraction is Working Well

**Profile Agent Analysis** (`src/server/agents/profile/chain.ts`):
- Uses sophisticated prompts to extract detailed information
- Has confidence scoring system (0.75+ threshold for updates)
- Prioritizes goal extraction with high confidence
- Can interpret "ski season" → endurance + leg strength focus
- Uses tools to update multiple profile fields simultaneously

**The Issue**: Profile data is being extracted correctly but not utilized in chat responses.

### 4. Data Flow Confirmation

**Service Layer** (`src/server/services/onboardingChatService.ts:141`):
```typescript
const systemPrompt = buildOnboardingChatSystemPrompt(updatedProfile, pendingRequired);
```

The service passes the full `updatedProfile` object to the prompt builder, but only 4 fields are used.

## Impact Analysis

### Current User Experience
1. User: "Help me get in shape for ski season - lots of legs and cardio"
2. System extracts: `primaryGoal: "endurance"`, `specificObjective: "ski season cardio and leg strength"`
3. System responds: "What is your primary fitness goal?" (ignores extracted context)

### Missing Intelligence for Profile Building
- Cannot acknowledge specific objectives ("ski season") when asking follow-up questions
- Cannot reference current equipment or constraints when determining what else to ask
- Cannot build on user's stated preferences to ask relevant next questions
- Cannot provide contextual follow-up questions that complete the profile efficiently  
- Cannot summarize what profile information was captured

## Technical Solutions

### 1. Enhanced Profile Context (High Impact)

**Expand `buildOnboardingChatSystemPrompt` to include:**

```typescript
const buildRichProfileSummary = (profile: FitnessProfile | null): string => {
  if (!profile) return 'No profile yet.';
  
  const sections = [];
  
  // Goals & Objectives
  if (profile.primaryGoal || profile.specificObjective) {
    sections.push(`Goals: ${profile.primaryGoal || 'Not specified'}${
      profile.specificObjective ? ` (${profile.specificObjective})` : ''
    }${profile.eventDate ? ` by ${profile.eventDate}` : ''}`);
  }
  
  // Current Training Context
  if (profile.currentActivity || profile.currentTraining?.programName) {
    sections.push(`Current Training: ${profile.currentActivity || profile.currentTraining?.programName || 'Not specified'}`);
  }
  
  // Detailed Availability
  if (profile.availability) {
    const avail = profile.availability;
    sections.push(`Schedule: ${avail.daysPerWeek || '?'} days/week, ${avail.minutesPerSession || '?'} min/session${
      avail.preferredTimes ? `, prefers ${avail.preferredTimes}` : ''
    }`);
  }
  
  // Equipment & Location
  if (profile.equipment) {
    const eq = profile.equipment;
    sections.push(`Equipment: ${eq.access || 'Not specified'}${
      eq.location ? ` at ${eq.location}` : ''
    }${eq.items?.length ? ` (has: ${eq.items.join(', ')})` : ''}`);
  }
  
  // Experience & Preferences
  if (profile.experienceLevel || profile.preferences?.workoutStyle) {
    sections.push(`Experience: ${profile.experienceLevel || 'Not specified'}${
      profile.preferences?.workoutStyle ? `, prefers ${profile.preferences.workoutStyle}` : ''
    }`);
  }
  
  // Active Constraints
  if (profile.constraints?.length) {
    const activeConstraints = profile.constraints.filter(c => c.status === 'active');
    if (activeConstraints.length) {
      sections.push(`Constraints: ${activeConstraints.map(c => c.label).join(', ')}`);
    }
  }
  
  // Physical Context
  if (profile.metrics?.bodyweight || profile.metrics?.heightCm) {
    const metrics = [];
    if (profile.metrics.bodyweight) metrics.push(`${profile.metrics.bodyweight.value}${profile.metrics.bodyweight.unit}`);
    if (profile.metrics.heightCm) metrics.push(`${profile.metrics.heightCm}cm`);
    sections.push(`Physical: ${metrics.join(', ')}`);
  }
  
  return sections.join('\n- ');
};
```

### 2. Contextual Profile Building Guidelines (Medium Impact)

Update system prompt to include:
```typescript
const contextualGuidelines = pendingRequired.length === 0 ? `
CONTEXT AWARENESS FOR PROFILE BUILDING:
- Acknowledge specific objectives when asking follow-ups (e.g., "Great! For ski season prep, I need to know...")
- Reference equipment/constraints context when determining what else to ask
- Build on stated preferences to ask relevant profile completion questions
- Use current training context to inform what information gaps remain
- DO NOT make training recommendations - focus only on gathering complete profile information
` : '';
```

### 3. Smarter Missing Field Detection (Medium Impact)

Instead of just checking 4 essential fields, check for contextual completeness:

```typescript
const computeContextualGaps = (profile: FitnessProfile): string[] => {
  const gaps = [];
  
  // If they have a goal but no timeline
  if (profile.primaryGoal && !profile.timelineWeeks && !profile.eventDate) {
    gaps.push('timeline');
  }
  
  // If they mention equipment access but no details
  if (profile.equipment?.access === 'home-gym' && !profile.equipment?.items?.length) {
    gaps.push('equipment-details');
  }
  
  // If they have constraints but no modifications noted
  if (profile.constraints?.some(c => c.severity === 'moderate' || c.severity === 'severe') && 
      !profile.constraints?.some(c => c.modifications)) {
    gaps.push('modification-strategies');
  }
  
  return gaps;
};
```

### 4. Enhanced Conversation Context (Low Impact)

Pass more conversation history to profile extraction:
```typescript
// In onboardingChatService.ts
const maxContextMessages = 10; // Increase context window
```

## Implementation Priority

### Phase 1: Critical Context Fix
1. Expand `buildOnboardingChatSystemPrompt` to use 10-15 key fields instead of 4
2. Update system prompt to acknowledge specific objectives
3. Test with ski season example

### Phase 2: Enhanced Intelligence  
1. Add contextual gap detection
2. Include constraint awareness in prompts
3. Add preference-based suggestions

### Phase 3: Advanced Features
1. Dynamic prompt adaptation based on profile completeness
2. Proactive constraint handling
3. Progress-aware conversations

## Testing Strategy

### Test Cases for Profile Building
1. **Ski Season Example**: "Help me get in shape for ski season - lots of legs and cardio"
   - Should acknowledge ski season objective ("Great! For ski season prep...")
   - Should ask contextual follow-ups (timeline, current fitness level, skiing experience)
   - Should NOT ask "what's your goal?" (already captured)
   - Should NOT suggest specific exercises (that's for later program creation)

2. **Equipment Context**: "I have a home gym with dumbbells and a pull-up bar"
   - Should reference equipment when asking next questions ("Since you have home equipment...")
   - Should ask about schedule/availability next, not equipment details
   - Should NOT suggest specific workouts

3. **Constraint Awareness**: "I have a bad knee but want to get stronger"
   - Should acknowledge constraint ("I'll note your knee limitation...")
   - Should ask about severity, modifications, other constraints
   - Should NOT suggest specific exercises or modifications (that's program design)

## Expected Outcomes

After implementation:
- 80% reduction in redundant questions about already-captured information
- Contextual acknowledgment of specific objectives in follow-up questions
- Smarter, context-aware questions that efficiently complete the profile
- More engaging conversations focused on profile completion
- Faster progression from profile building to program creation phase
- Clear separation between profile building and program recommendation phases

## Risk Analysis

**Low Risk**: 
- Changes are primarily additive (more context)
- Profile extraction system already works
- Fallback behavior unchanged

**Potential Issues**:
- Longer system prompts (monitor token usage)
- Need to handle partial/malformed profile data gracefully
- Test edge cases where profile fields conflict