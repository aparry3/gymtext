import { FitnessProfile } from '../models/fitnessProfile';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface ProfileFacts {
  goal?: {
    primary?: string;
    objective?: string;
    eventDate?: string;
    timelineWeeks?: number;
  };
  training?: {
    currentActivity?: string;
    weeksCompleted?: number;
    programName?: string;
    focus?: string;
  };
  availability?: {
    daysPerWeek?: number;
    minutesPerSession?: number;
    gym?: string;
    preferredTimes?: string;
  };
  constraints?: Array<{
    type: string;
    label: string;
    severity?: string;
    modifications?: string;
  }>;
  preferences?: {
    style?: string;
    enjoys?: string[];
    dislikes?: string[];
    coachingTone?: string;
  };
  metrics?: {
    weightLbs?: number;
    weightKg?: number;
    heightCm?: number;
    bodyFatPercent?: number;
    prLifts?: Record<string, string>;
  };
  identity?: {
    age?: number;
    gender?: string;
    pronouns?: string;
  };
}

export interface AIContext {
  facts: ProfileFacts;
  prose: string;
}

export class AIContextService {
  private llm?: ChatGoogleGenerativeAI;

  constructor(llm?: ChatGoogleGenerativeAI) {
    this.llm = llm;
  }

  /**
   * Build structured facts from the profile
   */
  buildFacts(profile: FitnessProfile): ProfileFacts {
    const facts: ProfileFacts = {};

    // Goal facts
    if (profile.primaryGoal || profile.specificObjective || profile.eventDate) {
      facts.goal = {
        primary: profile.primaryGoal,
        objective: profile.specificObjective,
        eventDate: profile.eventDate,
        timelineWeeks: profile.timelineWeeks,
      };
    }

    // Training facts
    if (profile.currentActivity || profile.currentTraining) {
      facts.training = {
        currentActivity: profile.currentActivity,
        weeksCompleted: profile.currentTraining?.weeksCompleted,
        programName: profile.currentTraining?.programName,
        focus: profile.currentTraining?.focus,
      };
    }

    // Availability facts
    if (profile.availability || profile.equipment) {
      facts.availability = {
        daysPerWeek: profile.availability?.daysPerWeek,
        minutesPerSession: profile.availability?.minutesPerSession,
        gym: profile.equipment?.access,
        preferredTimes: profile.availability?.preferredTimes,
      };
    }

    // Active constraints
    if (profile.constraints) {
      facts.constraints = this.getActiveConstraints(profile);
    }

    // Preferences
    if (profile.preferences) {
      facts.preferences = {
        style: profile.preferences.workoutStyle,
        enjoys: profile.preferences.enjoyedExercises,
        dislikes: profile.preferences.dislikedExercises,
        coachingTone: profile.preferences.coachingTone,
      };
    }

    // Metrics
    if (profile.metrics) {
      facts.metrics = this.buildMetrics(profile);
    }

    // Identity
    if (profile.identity) {
      facts.identity = {
        age: profile.identity.age,
        gender: profile.identity.gender,
        pronouns: profile.identity.pronouns,
      };
    }

    return facts;
  }

  /**
   * Build deterministic AI context with facts and prose
   */
  buildAIContext(profile: FitnessProfile, opts: { asOf?: string } = {}): AIContext {
    const facts = this.buildFacts(profile);
    const prose = this.buildDeterministicProse(facts, opts.asOf);
    return { facts, prose };
  }

  /**
   * Build deterministic prose from facts
   */
  private buildDeterministicProse(facts: ProfileFacts, asOf?: string): string {
    const date = asOf || new Date().toISOString().slice(0, 10);
    const bullets: string[] = [];

    // Goal section
    if (facts.goal?.primary) {
      let goalStr = `GOAL: ${facts.goal.primary}`;
      if (facts.goal.objective) {
        goalStr += `; ${facts.goal.objective}`;
      }
      if (facts.goal.eventDate) {
        goalStr += `; target date ${facts.goal.eventDate}`;
      }
      if (facts.goal.timelineWeeks) {
        goalStr += ` (${facts.goal.timelineWeeks} weeks)`;
      }
      bullets.push(goalStr + '.');
    }

    // Training section
    if (facts.training?.currentActivity || facts.training?.programName) {
      let trainingStr = 'TRAINING: ';
      if (facts.training.currentActivity) {
        trainingStr += facts.training.currentActivity;
      }
      if (facts.training.programName) {
        trainingStr += `; program "${facts.training.programName}"`;
      }
      if (facts.training.weeksCompleted) {
        trainingStr += ` (week ${facts.training.weeksCompleted})`;
      }
      if (facts.training.focus) {
        trainingStr += `; focus: ${facts.training.focus}`;
      }
      bullets.push(trainingStr + '.');
    }

    // Availability section
    if (facts.availability?.daysPerWeek || facts.availability?.gym) {
      let availStr = 'AVAILABILITY: ';
      const parts: string[] = [];
      
      if (facts.availability.daysPerWeek) {
        parts.push(`${facts.availability.daysPerWeek}x/week`);
      }
      if (facts.availability.minutesPerSession) {
        parts.push(`${facts.availability.minutesPerSession} min/session`);
      }
      if (facts.availability.gym) {
        parts.push(`gym: ${facts.availability.gym}`);
      }
      if (facts.availability.preferredTimes) {
        parts.push(`prefers ${facts.availability.preferredTimes}`);
      }
      
      availStr += parts.join('; ');
      bullets.push(availStr + '.');
    }

    // Constraints section
    if (facts.constraints && facts.constraints.length > 0) {
      const activeConstraints = facts.constraints
        .map(c => {
          let str = c.label;
          if (c.severity) str += ` (${c.severity})`;
          if (c.modifications) str += ` - ${c.modifications}`;
          return str;
        })
        .join('; ');
      bullets.push(`CONSTRAINTS: ${activeConstraints}.`);
    }

    // Preferences section
    if (facts.preferences?.style || facts.preferences?.dislikes) {
      let prefStr = 'PREFERENCES: ';
      const parts: string[] = [];
      
      if (facts.preferences.style) {
        parts.push(`style: ${facts.preferences.style}`);
      }
      if (facts.preferences.enjoys && facts.preferences.enjoys.length > 0) {
        parts.push(`enjoys: ${facts.preferences.enjoys.join(', ')}`);
      }
      if (facts.preferences.dislikes && facts.preferences.dislikes.length > 0) {
        parts.push(`avoids: ${facts.preferences.dislikes.join(', ')}`);
      }
      if (facts.preferences.coachingTone) {
        parts.push(`tone: ${facts.preferences.coachingTone}`);
      }
      
      if (parts.length > 0) {
        prefStr += parts.join('; ');
        bullets.push(prefStr + '.');
      }
    }

    // Metrics section
    if (facts.metrics) {
      const parts: string[] = [];
      
      if (facts.metrics.weightLbs) {
        parts.push(`${facts.metrics.weightLbs} lbs`);
      } else if (facts.metrics.weightKg) {
        parts.push(`${facts.metrics.weightKg} kg`);
      }
      
      if (facts.metrics.heightCm) {
        parts.push(`${facts.metrics.heightCm} cm`);
      }
      
      if (facts.metrics.bodyFatPercent) {
        parts.push(`${facts.metrics.bodyFatPercent}% BF`);
      }
      
      if (facts.metrics.prLifts && Object.keys(facts.metrics.prLifts).length > 0) {
        const lifts = Object.entries(facts.metrics.prLifts)
          .map(([lift, value]) => `${lift}: ${value}`)
          .join(', ');
        parts.push(`PRs: ${lifts}`);
      }
      
      if (parts.length > 0) {
        bullets.push(`METRICS: ${parts.join('; ')}.`);
      }
    }

    // Identity section
    if (facts.identity?.age || facts.identity?.gender) {
      const parts: string[] = [];
      
      if (facts.identity.age) {
        parts.push(`age ${facts.identity.age}`);
      }
      if (facts.identity.gender) {
        parts.push(facts.identity.gender);
      }
      if (facts.identity.pronouns) {
        parts.push(`(${facts.identity.pronouns})`);
      }
      
      if (parts.length > 0) {
        bullets.push(`IDENTITY: ${parts.join(' ')}.`);
      }
    }

    // Build final prose
    const header = `USER PROFILE (as of ${date})`;
    if (bullets.length === 0) {
      return `${header}\n- No profile information available.`;
    }
    
    return `${header}\n${bullets.map(b => `- ${b}`).join('\n')}`;
  }

  /**
   * Get active constraints from profile
   */
  private getActiveConstraints(profile: FitnessProfile): Array<{
    type: string;
    label: string;
    severity?: string;
    modifications?: string;
  }> {
    if (!profile.constraints) return [];
    
    return profile.constraints
      .filter(c => c.status === 'active')
      .map(c => ({
        type: c.type,
        label: c.label,
        severity: c.severity,
        modifications: c.modifications,
      }));
  }

  /**
   * Build metrics object with proper units
   */
  private buildMetrics(profile: FitnessProfile): ProfileFacts['metrics'] {
    const metrics: ProfileFacts['metrics'] = {};
    
    if (profile.metrics?.bodyweight) {
      if (profile.metrics.bodyweight.unit === 'lbs') {
        metrics.weightLbs = profile.metrics.bodyweight.value;
      } else {
        metrics.weightKg = profile.metrics.bodyweight.value;
      }
    }
    
    if (profile.metrics?.heightCm) {
      metrics.heightCm = profile.metrics.heightCm;
    }
    
    if (profile.metrics?.bodyFatPercent) {
      metrics.bodyFatPercent = profile.metrics.bodyFatPercent;
    }
    
    if (profile.metrics?.prLifts) {
      metrics.prLifts = {};
      for (const [lift, data] of Object.entries(profile.metrics.prLifts)) {
        let str = `${data.weight}${data.unit}`;
        if (data.reps) str += ` x${data.reps}`;
        if (data.date) str += ` (${data.date})`;
        metrics.prLifts[lift] = str;
      }
    }
    
    return metrics;
  }

  /**
   * Optional: Polish context with LLM (with fallback to deterministic)
   */
  async polishContext(context: AIContext): Promise<AIContext> {
    if (!this.llm) {
      return context; // No LLM configured, return deterministic context
    }

    try {
      const prompt = `Given this user profile information, create a concise, well-formatted summary.
Keep all specific numbers, dates, and technical terms exactly as provided.
Format as bullet points under clear section headers.

Profile facts:
${JSON.stringify(context.facts, null, 2)}

Original prose:
${context.prose}

Create a polished version that maintains all factual accuracy:`;

      const response = await this.llm.invoke(prompt);
      const polishedProse = response.content as string;

      // Validate that key information is preserved
      if (this.validatePolishedContext(context.prose, polishedProse)) {
        return { ...context, prose: polishedProse };
      }
    } catch (error) {
      console.error('Failed to polish context with LLM:', error);
    }

    // Fallback to deterministic context
    return context;
  }

  /**
   * Validate that polished context preserves key information
   */
  private validatePolishedContext(original: string, polished: string): boolean {
    // Extract key values from original (numbers, dates, etc.)
    const numberPattern = /\d+/g;
    const originalNumbers = original.match(numberPattern) || [];
    // polishedNumbers not used in validation - we check numbers are included in polished directly

    // Check that most numbers are preserved
    const preserved = originalNumbers.filter(n => polished.includes(n));
    const preservationRate = preserved.length / originalNumbers.length;

    return preservationRate >= 0.8; // 80% of numbers should be preserved
  }
}