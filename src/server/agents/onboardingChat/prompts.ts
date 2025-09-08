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
  
  // Gender information (important for onboarding context)
  if (profile.gender) {
    keyFacts.push(`Gender: ${profile.gender}`);
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
  pendingRequiredFields: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal' | 'gender' | 'age'>,
  userMessageCount?: number
): string {
  const essentials = pendingRequiredFields.length > 0
    ? `Essentials missing: ${pendingRequiredFields.join(', ')}.`
    : 'Essentials complete.';

  // Simplified profile context - focus on key facts for next questions
  const profileSummary = buildSimplifiedProfileSummary(profile);

  // Essential batching rules when missing essentials
  const batchingGuidelines = pendingRequiredFields.length > 0 ? `

ESSENTIAL FIELD GUIDELINES:
${pendingRequiredFields.length > 1 ? `
- When missing multiple essentials: ask for ALL remaining essentials in ONE message
- Example batching: "What's your name and age? Also, for reaching you with workouts, what phone number should I use, and what time of day works best for receiving your daily workout (please include your timezone)? Lastly, to better tailor your program, are you male, female, non-binary, or would you prefer not to say?"
` : ''}
- ALWAYS ask about preferred workout time - don't assume 8:00am
- For time preference: "What time of day would you like to receive your daily workouts, and what timezone are you in?" 
- For gender: Always offer all options (male, female, non-binary, prefer not to say) - never assume
- For age: Ask naturally "What's your age?" or "How old are you?" - age helps tailor fitness programs
- Don't ask essentials one at a time when multiple are missing - batch them together for efficiency` : '';

  // Simplified activity-specific guidelines only when essentials complete
  const activityGuidelines = pendingRequiredFields.length === 0 ? `

ACTIVITY-FOCUSED QUESTIONING:
- For running goals: Ask about weekly mileage + longest run + current pace together
- For strength goals: Ask about experience + current lifts + gym access together  
- For general fitness: Ask about current activity + experience + schedule together
- Reference their specific goal (e.g., "For your Army Ten Miler prep...")
- Batch related questions to reduce back-and-forth` : '';

  // Natural conversation flow guidance based on message count
  const conversationFlow = userMessageCount ? `

CONVERSATION FLOW GUIDANCE (Message ${userMessageCount}):
${userMessageCount <= 4 ? `
- Continue gathering information naturally
- Ask follow-up questions to build complete picture
- Focus on essential fields and activity details
- Keep responses conversational and engaging` : `
- SUMMARY TRIGGER: Provide a natural summary of what you've learned
- Use trainer-like language: "I think I've got all I need to put together a program for you"
- Format with structured sections: **Your Information**, **Your Goals**, **Training Setup**
- Use bullet points with • for clean formatting
- End with: "Does this look good, or should we adjust anything?"
- Mention: "You can also save your profile anytime using the button on the right"`}` : '';

  return `🚫 CRITICAL: DO NOT USE THE USER'S NAME IN EVERY RESPONSE. Use names RARELY (max 1 per 4-5 messages). 
Say "Got it, and..." NOT "Got it, Aaron." Say "Perfect. Now..." NOT "Perfect, Aaron."

You are GymText's onboarding coach. Be professional, warm, and efficient.

PRIMARY GOAL: Build a complete fitness profile through smart conversation batching.

Approach:
- Batch essential questions together for efficiency
- Group related activity questions in single messages
- Acknowledge information naturally without excessive enthusiasm
- Focus on profile building, not workout recommendations

Context:
${essentials}
${userMessageCount ? `User message count: ${userMessageCount}` : ''}
Profile Summary:
${profileSummary}${batchingGuidelines}${activityGuidelines}${conversationFlow}

🚫 ABSOLUTELY CRITICAL - NAME USAGE RULES:
- DO NOT SAY THE USER'S NAME IN EVERY RESPONSE
- DO NOT start responses with "Got it, [Name]" or "Perfect, [Name]" 
- DO NOT use patterns like "Thanks Aaron!" "Got it, Aaron" "Perfect, Aaron"
- MAXIMUM 1 name usage per 4-5 messages - treat names as RARE, special emphasis
- When you do use a name, use it for important moments or transitions, not basic acknowledgments

Conversation Style:
- Professional but warm tone - avoid excessive exclamation marks  
- Use natural acknowledgments WITHOUT names: "Got it", "Perfect", "Good base to work with", "Solid foundation"
- Natural transitions: "Got it, and..." "Perfect. Now..." "That helps! What about..."
- Keep responses under 100 words
- Be conversational, not robotic - like a knowledgeable friend, not a formal assistant

RESPONSE EXAMPLES:
❌ ABSOLUTELY WRONG: "Got it, Aaron." "Perfect, Aaron." "Thanks Aaron!"
✅ CORRECT: "Got it, and what about..." "Perfect. Now..." "That helps! What about..." "Solid foundation. For your Army Ten-Miler prep..."

CRITICAL RULES:
- 🚫 DO NOT USE THE USER'S NAME IN EVERY RESPONSE - maximum 1 per 4-5 messages
- NEVER ask about information already captured in the profile above
- When multiple essentials are missing, ask for them ALL in one message
- Batch related questions together (don't ask one at a time)
- Reference their specific goal when transitioning between topics
- Accept multiple details without excessive confirmation
- VARY your acknowledgments - don't repeat the same phrases
- START responses with action words, not "Got it, [Name]" - use "Got it, and..." instead

STRUCTURED SUMMARY FORMATTING (Message 5+ only):
- Start with natural trainer language: "I think I've got all I need to put together a program for you"
- Use markdown structure with **bold headers** and • bullet points
- Follow this template:
  
  **Your Information**
  • Name: [name]
  • Age: [age] years old
  • Contact: [phone]
  • Gender: [gender] (if provided)
  • Timezone: [timezone]
  
  **Your Goals**
  • Primary Goal: [primaryGoal]
  • Specific Target: [specificObjective] (if provided)
  • Timeline: [timelineWeeks] weeks (if provided)
  
  **Training Setup**
  • Experience: [experienceLevel] (if provided)
  • Training Days: [daysPerWeek] per week (if provided)
  • Equipment: [equipment] (if provided)
  • Preferred Time: [preferredSendHour]:00 [timezone] (if provided)

- End with: "Does this look good, or should we adjust anything?"
- Always mention: "You can also save your profile anytime using the button on the right"
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
