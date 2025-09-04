import type { FitnessProfile } from '@/server/models/user/schemas';

/**
 * Build a comprehensive profile summary using all available context
 * This replaces the limited 4-field summary with rich contextual information
 */
function buildRichProfileSummary(profile: FitnessProfile | null): string {
  if (!profile) return 'No profile yet.';
  
  const sections = [];
  
  // Goals & Objectives (highest priority)
  if (profile.primaryGoal || profile.specificObjective) {
    let goalSection = `Goals: ${profile.primaryGoal || 'Not specified'}`;
    if (profile.specificObjective) {
      goalSection += ` (${profile.specificObjective})`;
    }
    if (profile.eventDate) {
      goalSection += ` by ${profile.eventDate}`;
    }
    if (profile.timelineWeeks) {
      goalSection += ` (${profile.timelineWeeks} week timeline)`;
    }
    sections.push(goalSection);
  }
  
  // Activity-Specific Context (NEW - high priority)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityData = (profile as any).activityData;
  if (activityData && activityData.type) {
    let activitySection = `Activity Focus: ${activityData.type.charAt(0).toUpperCase() + activityData.type.slice(1)}`;
    
    if (activityData.experienceLevel) {
      activitySection += ` (${activityData.experienceLevel} level)`;
    }
    
    if (activityData.goals && activityData.goals.length > 0) {
      activitySection += ` - Goals: ${activityData.goals.join(', ')}`;
    }
    
    if (activityData.keyMetrics && Object.keys(activityData.keyMetrics).length > 0) {
      const metrics = Object.entries(activityData.keyMetrics).map(([key, value]) => 
        `${key}: ${value}`
      ).join(', ');
      activitySection += ` - Metrics: ${metrics}`;
    }
    
    if (activityData.equipment && activityData.equipment.length > 0) {
      activitySection += ` - Equipment: ${activityData.equipment.join(', ')}`;
    }
    
    sections.push(activitySection);
  }
  
  // Current Training Context
  if (profile.currentActivity || profile.currentTraining?.programName) {
    let trainingSection = 'Current Training: ';
    if (profile.currentActivity) {
      trainingSection += profile.currentActivity;
    } else if (profile.currentTraining?.programName) {
      trainingSection += profile.currentTraining.programName;
    }
    if (profile.currentTraining?.focus) {
      trainingSection += ` (focus: ${profile.currentTraining.focus})`;
    }
    sections.push(trainingSection);
  }
  
  // Detailed Availability
  if (profile.availability) {
    const avail = profile.availability;
    let scheduleSection = 'Schedule: ';
    const scheduleParts = [];
    
    if (avail.daysPerWeek) scheduleParts.push(`${avail.daysPerWeek} days/week`);
    if (avail.minutesPerSession) scheduleParts.push(`${avail.minutesPerSession} min/session`);
    if (avail.preferredTimes) scheduleParts.push(`prefers ${avail.preferredTimes}`);
    
    scheduleSection += scheduleParts.length > 0 ? scheduleParts.join(', ') : 'Not specified';
    sections.push(scheduleSection);
  }
  
  // Equipment & Location
  if (profile.equipment) {
    const eq = profile.equipment;
    let equipmentSection = `Equipment: ${eq.access || 'Not specified'}`;
    
    if (eq.location) {
      equipmentSection += ` at ${eq.location}`;
    }
    if (eq.items && eq.items.length > 0) {
      equipmentSection += ` (has: ${eq.items.join(', ')})`;
    }
    if (eq.constraints && eq.constraints.length > 0) {
      equipmentSection += ` [constraints: ${eq.constraints.join(', ')}]`;
    }
    
    sections.push(equipmentSection);
  }
  
  // Experience & Preferences
  if (profile.experienceLevel || profile.preferences?.workoutStyle) {
    let experienceSection = `Experience: ${profile.experienceLevel || 'Not specified'}`;
    
    if (profile.preferences?.workoutStyle) {
      experienceSection += `, prefers ${profile.preferences.workoutStyle}`;
    }
    if (profile.preferences?.enjoyedExercises && profile.preferences.enjoyedExercises.length > 0) {
      experienceSection += ` (likes: ${profile.preferences.enjoyedExercises.slice(0, 3).join(', ')})`;
    }
    
    sections.push(experienceSection);
  }
  
  // Active Constraints
  if (profile.constraints && profile.constraints.length > 0) {
    const activeConstraints = profile.constraints.filter(c => c.status === 'active');
    if (activeConstraints.length > 0) {
      const constraintLabels = activeConstraints.map(c => {
        let label = c.label;
        if (c.severity) label += ` (${c.severity})`;
        return label;
      });
      sections.push(`Constraints: ${constraintLabels.join(', ')}`);
    }
  }
  
  // Physical Metrics
  if (profile.metrics?.bodyweight || profile.metrics?.heightCm) {
    const metricsParts = [];
    
    if (profile.metrics.bodyweight) {
      metricsParts.push(`${profile.metrics.bodyweight.value}${profile.metrics.bodyweight.unit}`);
    }
    if (profile.metrics.heightCm) {
      metricsParts.push(`${profile.metrics.heightCm}cm`);
    }
    
    sections.push(`Physical: ${metricsParts.join(', ')}`);
  }
  
  return sections.length > 0 ? sections.join('\n- ') : 'No profile information yet.';
}

/**
 * Build onboarding-focused system prompt with comprehensive context awareness.
 * - Uses rich profile context instead of limited 4-field summary
 * - Context-aware profile building guidelines
 * - Focus on efficient profile completion, not recommendations
 */
export function buildOnboardingChatSystemPrompt(
  profile: FitnessProfile | null,
  pendingRequiredFields: Array<'name' | 'email' | 'phone' | 'primaryGoal'>
): string {
  const essentials = pendingRequiredFields.length > 0
    ? `Essentials missing: ${pendingRequiredFields.join(', ')}.`
    : 'Essentials complete.';

  // Use comprehensive profile context instead of limited 4-field summary
  const profileSummary = buildRichProfileSummary(profile);

  // Identify contextual gaps to help guide next questions
  const contextualGaps = profile ? computeContextualGaps(profile) : [];
  const gapsContext = contextualGaps.length > 0 
    ? `\nProfile Gaps to Address: ${contextualGaps.join(', ')}`
    : '';

  // Add contextual guidelines when essentials are complete
  const contextualGuidelines = pendingRequiredFields.length === 0 ? `

CONTEXT AWARENESS FOR PROFILE BUILDING:
- Acknowledge specific objectives when mentioned (e.g., "Great! For your Grand Canyon rim-to-rim hike...")
- Reference captured equipment/constraints context when determining what else to ask
- Build on stated preferences to ask relevant profile completion questions
- Use current training context to inform what information gaps remain
- Focus ONLY on gathering complete profile information - DO NOT make training recommendations

ACTIVITY-SPECIFIC QUESTIONING STRATEGY:
- When activityData exists, ask questions based on missing fields in that specific activity profile
- For HIKING activity: Ask about longest hikes, elevation comfort, backpacking experience, pack weight comfort
- For RUNNING activity: Ask about weekly mileage, longest runs, race experience, current pace
- For STRENGTH activity: Ask about current lifts, training frequency, gym experience, form confidence
- For CYCLING activity: Ask about training volume, longest rides, terrain comfort, bike type
- For SKIING activity: Ask about days per season, terrain comfort, equipment ownership
- For OTHER activities: Ask about experience level, activity-specific metrics, equipment needs
- Use activity-specific experience to INFER general fitness level and frame questions in activity context
- Frame follow-up questions in the context of their specific activity (e.g., "For your Grand Canyon hike prep..." rather than "For fitness...")
- If no activityData exists, use specificObjective to determine relevant activity-specific questions` : '';

  return `You are GymText's onboarding coach. Be warm, clear, and efficient.

PRIMARY GOAL: Build a complete fitness profile through intelligent conversation.

Goals:
- Gather essentials first: name, email, phone, primary goal.
- Ask for 2–3 missing essentials together when natural. Keep it brief.
- Once essentials are complete, transition naturally to building out their fitness profile.
- Then deepen with experience, schedule, equipment, constraints, preferences. Batch logically.

Context:
${essentials}
Current Profile:
${profileSummary}${gapsContext}${contextualGuidelines}

Style:
- Conversational and human. Avoid robotic phrasing and redundant confirmations.
- Keep replies under ~120 words. Use one question or a small batch per turn.

Behavior:
- If the user provides multiple details, accept them and continue without confirmation.
- NEVER ask about information already captured in the profile above.
- Acknowledge captured information briefly (e.g., "Great! For your [specific objective]...")
- Use profile context to ask relevant follow-up questions.
- ONLY provide a comprehensive summary when essentials are complete AND you're ready to move to the next phase of onboarding.
- Do NOT summarize all captured information after every user response - this feels unnatural.
- Focus on profile building, not workout recommendations or exercise suggestions.
- Ask follow-up questions based on gaps, but don't recite everything you know about them.
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
