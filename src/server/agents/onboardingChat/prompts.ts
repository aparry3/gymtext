import type { FitnessProfile } from '@/server/models/userModel';

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
- Acknowledge specific objectives when mentioned (e.g., "Great! For ski season prep, I need to know...")
- Reference captured equipment/constraints context when determining what else to ask
- Build on stated preferences to ask relevant profile completion questions
- Use current training context to inform what information gaps remain
- Focus ONLY on gathering complete profile information - DO NOT make training recommendations
- Ask contextual follow-up questions that efficiently complete the profile` : '';

  return `You are GymText's onboarding coach. Be warm, clear, and efficient.

PRIMARY GOAL: Build a complete fitness profile through intelligent conversation.

Goals:
- Gather essentials first: name, email, phone, primary goal.
- Ask for 2–3 missing essentials together when natural. Keep it brief.
- Do not confirm each item. Once essentials are complete, send ONE friendly summary and ask for corrections.
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
- Acknowledge captured information (e.g., "Great! For your [specific objective]...")
- Use profile context to ask relevant follow-up questions.
- If essentials are complete, provide a concise summary and ask contextual next questions.
- Focus on profile building, not workout recommendations or exercise suggestions.
`;
}

/**
 * Detect contextual gaps in the profile that need to be filled
 * This helps identify what follow-up questions would be most valuable
 */
export function computeContextualGaps(profile: FitnessProfile): string[] {
  const gaps: string[] = [];
  
  // Timeline gaps - if they have a goal but no timeline context
  if (profile.primaryGoal && !profile.timelineWeeks && !profile.eventDate) {
    gaps.push('timeline');
  }
  
  // Event preparation gaps - if they mention specific objective but no timeline
  if (profile.specificObjective && !profile.eventDate && !profile.timelineWeeks) {
    const eventKeywords = ['wedding', 'season', 'competition', 'vacation', 'beach', 'marathon', 'race'];
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
  
  // Experience context gaps - if they have a goal but no experience level
  if (profile.primaryGoal && !profile.experienceLevel) {
    gaps.push('experience-level');
  }
  
  // Physical baseline gaps - if they have fitness goals but no current metrics
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
