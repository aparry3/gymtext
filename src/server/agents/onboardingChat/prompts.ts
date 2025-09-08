import type { FitnessProfile } from '@/server/models/user/schemas';

/**
 * Build a simplified profile summary focused on key facts for next questions
 * Replaces the complex buildRichProfileSummary with essential context only
 */
function buildSimplifiedProfileSummary(profile: FitnessProfile | null): string {
  if (!profile) return 'No profile information yet.';
  
  const keyFacts = [];
  
  // Primary goal and objective (highest priority)
  if (profile.primaryGoal) {
    let goalText = `Goal: ${profile.primaryGoal}`;
    if (profile.specificObjective) {
      goalText += ` (${profile.specificObjective})`;
    }
    if (profile.eventDate) {
      goalText += ` by ${profile.eventDate}`;
    }
    keyFacts.push(goalText);
  }
  
  // Current activity level
  if (profile.currentActivity) {
    keyFacts.push(`Current activity: ${profile.currentActivity}`);
  }
  
  // Key constraints or limitations
  if (profile.constraints && profile.constraints.length > 0) {
    const activeConstraints = profile.constraints.filter(c => c.status === 'active');
    if (activeConstraints.length > 0) {
      keyFacts.push(`Constraints: ${activeConstraints.map(c => c.label).join(', ')}`);
    }
  }
  
  // Equipment access
  if (profile.equipment?.access) {
    keyFacts.push(`Equipment: ${profile.equipment.access}`);
  }
  
  return keyFacts.length > 0 ? keyFacts.join(' | ') : 'No profile information yet.';
}


/**
 * Build onboarding-focused system prompt with comprehensive context awareness.
 * - Uses rich profile context instead of limited 4-field summary
 * - Context-aware profile building guidelines
 * - Focus on efficient profile completion, not recommendations
 */
export function buildOnboardingChatSystemPrompt(
  profile: FitnessProfile | null,
  pendingRequiredFields: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal' | 'gender'>
): string {
  const essentials = pendingRequiredFields.length > 0
    ? `Essentials missing: ${pendingRequiredFields.join(', ')}.`
    : 'Essentials complete.';

  // Simplified profile context - focus on key facts for next questions
  const profileSummary = buildSimplifiedProfileSummary(profile);

  // Essential batching rules when missing multiple essentials
  const batchingGuidelines = pendingRequiredFields.length > 1 ? `

ESSENTIAL BATCHING RULES:
- When missing multiple essentials (name, phone, timezone, preferred time, gender): ask for ALL remaining essentials in ONE message
- Use natural language: "What's your name? Also, for reaching you with workouts, what phone number should I use, and what time works best for daily workouts (with timezone)? Lastly, to better tailor your program, are you male, female, non-binary, or would you prefer not to say?"
- Don't ask essentials one at a time - batch them together for efficiency
- For gender: Always offer all options (male, female, non-binary, prefer not to say) - never assume` : '';

  // Simplified activity-specific guidelines only when essentials complete
  const activityGuidelines = pendingRequiredFields.length === 0 ? `

ACTIVITY-FOCUSED QUESTIONING:
- For running goals: Ask about weekly mileage + longest run + current pace together
- For strength goals: Ask about experience + current lifts + gym access together  
- For general fitness: Ask about current activity + experience + schedule together
- Reference their specific goal (e.g., "For your Army Ten Miler prep...")
- Batch related questions to reduce back-and-forth` : '';

  return `You are GymText's onboarding coach. Be professional, warm, and efficient.

PRIMARY GOAL: Build a complete fitness profile through smart conversation batching.

Approach:
- Batch essential questions together for efficiency
- Group related activity questions in single messages
- Acknowledge information naturally without excessive enthusiasm
- Focus on profile building, not workout recommendations

Context:
${essentials}
Profile Summary:
${profileSummary}${batchingGuidelines}${activityGuidelines}

Conversation Style:
- Professional but warm tone - avoid excessive exclamation marks
- Use natural acknowledgments: "Got it", "Good base to work with", "Solid foundation"
- Avoid repetitive "Thanks [name]!" openings
- Keep responses under 100 words
- Be conversational, not robotic

CRITICAL RULES:
- NEVER ask about information already captured in the profile above
- When multiple essentials are missing, ask for them ALL in one message
- Batch related questions together (don't ask one at a time)
- Reference their specific goal when transitioning between topics
- Accept multiple details without excessive confirmation
`;
}

/**
 * Detect contextual gaps in the profile that need to be filled
 * Uses activityData field when available for accurate gap detection
 * Falls back to specificObjective analysis only when activityData is not present
 */
export function computeContextualGaps(profile: FitnessProfile): string[] {
  const gaps: string[] = [];
  
  // First, check if we have activity-specific data (when available)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityData = (profile as any).activityData;
  
  if (activityData && activityData.type) {
    // Activity-specific gap detection
    switch (activityData.type) {
      case 'hiking':
        if (!activityData.experienceLevel) gaps.push('hiking-experience-level');
        if (!activityData.keyMetrics?.longestHike) gaps.push('hiking-distance-experience');
        if (!activityData.keyMetrics?.elevationComfort) gaps.push('hiking-elevation-comfort');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!activityData.keyMetrics?.packWeight && activityData.goals?.some((g: any) => g.includes('backpack'))) {
          gaps.push('hiking-pack-experience');
        }
        if (!activityData.equipment?.length) gaps.push('hiking-equipment');
        break;
        
      case 'running':
        if (!activityData.experienceLevel) gaps.push('running-experience-level');
        if (!activityData.keyMetrics?.weeklyMileage) gaps.push('running-weekly-volume');
        if (!activityData.keyMetrics?.longestRun) gaps.push('running-distance-experience');
        if (!activityData.keyMetrics?.averagePace) gaps.push('running-pace-baseline');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (activityData.goals?.some((g: any) => g.includes('marathon') || g.includes('race')) && !activityData.keyMetrics?.racesCompleted) {
          gaps.push('running-race-experience');
        }
        break;
        
      case 'strength':
        if (!activityData.experienceLevel) gaps.push('strength-experience-level');
        if (!activityData.keyMetrics?.trainingDays) gaps.push('strength-training-frequency');
        if (!activityData.keyMetrics?.benchPress && !activityData.keyMetrics?.squat && !activityData.keyMetrics?.deadlift) {
          gaps.push('strength-current-lifts');
        }
        if (!activityData.equipment?.length) gaps.push('strength-equipment-access');
        break;
        
      case 'cycling':
        if (!activityData.experienceLevel) gaps.push('cycling-experience-level');
        if (!activityData.keyMetrics?.weeklyHours) gaps.push('cycling-training-volume');
        if (!activityData.keyMetrics?.longestRide) gaps.push('cycling-distance-experience');
        if (!activityData.keyMetrics?.terrainTypes?.length) gaps.push('cycling-terrain-comfort');
        break;
        
      case 'skiing':
        if (!activityData.experienceLevel) gaps.push('skiing-experience-level');
        if (!activityData.keyMetrics?.daysPerSeason) gaps.push('skiing-seasonal-experience');
        if (!activityData.keyMetrics?.terrainComfort?.length) gaps.push('skiing-terrain-comfort');
        if (!activityData.equipment?.length) gaps.push('skiing-equipment-ownership');
        break;
        
      case 'other':
        if (!activityData.activityName) gaps.push('custom-activity-name');
        if (!activityData.experienceLevel) gaps.push('activity-experience-level');
        if (!activityData.keyMetrics || Object.keys(activityData.keyMetrics).length === 0) {
          gaps.push('activity-specific-metrics');
        }
        break;
    }
    
    // Common activity data gaps
    if (!activityData.goals?.length) gaps.push('activity-goals');
  } 
  
  // No fallback - activityData should always be populated by profile agent
  else {
    // If no activityData exists, this indicates the profile agent needs to detect and populate it
    // The gap detection will identify that activity-specific data is missing
    if (profile.specificObjective && !profile.experienceLevel) {
      gaps.push('activity-detection-needed');
    }
  }
  
  // Universal gap detection (applies regardless of activity)
  
  // Timeline gaps - if they have a goal but no timeline context
  if (profile.primaryGoal && !profile.timelineWeeks && !profile.eventDate) {
    gaps.push('timeline');
  }
  
  // Event preparation gaps - if they mention specific objective but no timeline
  if (profile.specificObjective && !profile.eventDate && !profile.timelineWeeks) {
    const eventKeywords = ['wedding', 'season', 'competition', 'vacation', 'beach', 'marathon', 'race', 'hike', 'trip'];
    const hasEventKeyword = eventKeywords.some(keyword => 
      profile.specificObjective?.toLowerCase().includes(keyword)
    );
    if (hasEventKeyword) {
      gaps.push('event-timeline');
    }
  }
  
  // Equipment detail gaps - if they have equipment access but no specifics
  if (profile.equipment?.access === 'home-gym' && (!profile.equipment?.items || profile.equipment.items.length === 0)) {
    gaps.push('equipment-details');
  }
  
  // Schedule preference gaps - if they have availability but no timing preferences
  if (profile.availability?.daysPerWeek && !profile.availability?.preferredTimes) {
    gaps.push('schedule-preferences');
  }
  
  // Constraint modification gaps - if they have moderate/severe constraints but no modifications noted
  if (profile.constraints && profile.constraints.length > 0) {
    const severeConstraints = profile.constraints.filter(c => 
      c.status === 'active' && (c.severity === 'moderate' || c.severity === 'severe')
    );
    const hasModifications = profile.constraints.some(c => c.modifications);
    
    if (severeConstraints.length > 0 && !hasModifications) {
      gaps.push('constraint-modifications');
    }
  }
  
  // Physical baseline gaps - if they have body composition goals but no current metrics
  if ((profile.primaryGoal === 'fat-loss' || profile.primaryGoal === 'muscle-gain') && 
      !profile.metrics?.bodyweight) {
    gaps.push('physical-baseline');
  }
  
  // Current activity gaps - if they have goals/schedule but no current training context
  if (profile.primaryGoal && profile.availability?.daysPerWeek && 
      !profile.currentActivity && !profile.currentTraining?.programName) {
    gaps.push('current-training');
  }
  
  return gaps;
}
