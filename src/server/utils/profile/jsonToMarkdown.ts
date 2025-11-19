/**
 * JSON to Markdown Profile Converter
 *
 * Converts legacy JSON-based FitnessProfile objects to the new Markdown "Living Dossier" format.
 * This utility is used for:
 * 1. Migrating existing user profiles from JSON to Markdown
 * 2. Creating initial Markdown profiles from signup data
 */

import type { FitnessProfile, User } from '@/server/models/user/schemas';
import { formatForAI } from '@/shared/utils/date';

export interface JsonToMarkdownOptions {
  includeTimestamp?: boolean;
  timezone?: string;
}

/**
 * Convert a FitnessProfile JSON object to Markdown format
 *
 * @param profile - The JSON-based fitness profile to convert
 * @param user - Optional user data for IDENTITY section
 * @param options - Optional conversion settings
 * @returns Markdown-formatted profile document
 */
export function convertJsonProfileToMarkdown(
  profile: FitnessProfile | null,
  user?: Partial<User>,
  options: JsonToMarkdownOptions = {}
): string {
  const { includeTimestamp = false, timezone = 'America/New_York' } = options;
  const sections: string[] = [];

  // Header comment (optional)
  if (includeTimestamp) {
    const now = new Date();
    const timestamp = formatForAI(now, timezone);
    sections.push(`<!-- Profile Last Updated: ${timestamp} -->\n`);
  }

  // ============================================================
  // IDENTITY SECTION
  // ============================================================
  const identityLines: string[] = ['# IDENTITY'];

  if (user?.name) {
    identityLines.push(`**Name:** ${user.name}`);
  }
  if (user?.age) {
    identityLines.push(`**Age:** ${user.age}`);
  }
  if (user?.gender) {
    identityLines.push(`**Gender:** ${user.gender}`);
  }
  if (profile?.experienceLevel) {
    const expLevel = profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1);
    identityLines.push(`**Experience Level:** ${expLevel}`);
  }

  if (identityLines.length > 1) {
    sections.push(identityLines.join('\n'));
  }

  // ============================================================
  // GOALS SECTION
  // ============================================================
  if (profile?.goals) {
    const goalsLines: string[] = ['# GOALS'];

    if (profile.goals.primary) {
      const primaryFormatted = profile.goals.primary
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      goalsLines.push(`**Primary:** ${primaryFormatted}`);
    }

    if (profile.goals.timeline) {
      goalsLines.push(`**Timeline:** ${profile.goals.timeline} weeks`);
    }

    if (profile.goals.motivation) {
      goalsLines.push(`**Motivation:** ${profile.goals.motivation}`);
    }

    if (profile.goals.specific) {
      goalsLines.push(`**Specific Focus:** ${profile.goals.specific}`);
    }

    if (profile.goals.summary) {
      goalsLines.push(`\n${profile.goals.summary}`);
    }

    if (goalsLines.length > 1) {
      sections.push(goalsLines.join('\n'));
    }
  }

  // ============================================================
  // AVAILABILITY SECTION
  // ============================================================
  if (profile?.availability) {
    const availLines: string[] = ['# AVAILABILITY'];

    if (profile.availability.daysPerWeek) {
      availLines.push(`**Schedule:** ${profile.availability.daysPerWeek} days/week`);
    }

    if (profile.availability.minutesPerSession) {
      availLines.push(`**Session Length:** ${profile.availability.minutesPerSession} mins`);
    }

    if (profile.availability.preferredTimes && profile.availability.preferredTimes.length > 0) {
      const times = profile.availability.preferredTimes.join(', ');
      availLines.push(`**Preferred Times:** ${times}`);
    }

    if (profile.availability.schedule) {
      availLines.push(`**Schedule Notes:** ${profile.availability.schedule}`);
    }

    if (profile.availability.summary) {
      availLines.push(`\n${profile.availability.summary}`);
    }

    if (availLines.length > 1) {
      sections.push(availLines.join('\n'));
    }
  }

  // ============================================================
  // EQUIPMENT SECTION
  // ============================================================
  if (profile?.equipmentAccess) {
    const equipLines: string[] = ['# EQUIPMENT'];

    if (profile.equipmentAccess.gymAccess !== undefined) {
      equipLines.push(`**Gym Access:** ${profile.equipmentAccess.gymAccess ? 'Yes' : 'No'}`);
    }

    if (profile.equipmentAccess.gymType) {
      const gymType = profile.equipmentAccess.gymType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      equipLines.push(`**Gym Type:** ${gymType}`);
    }

    if (profile.equipmentAccess.homeEquipment && profile.equipmentAccess.homeEquipment.length > 0) {
      equipLines.push(`**Home Equipment:** ${profile.equipmentAccess.homeEquipment.join(', ')}`);
    }

    if (profile.equipmentAccess.limitations && profile.equipmentAccess.limitations.length > 0) {
      equipLines.push(`**Limitations:** ${profile.equipmentAccess.limitations.join(', ')}`);
    }

    if (profile.equipmentAccess.summary) {
      equipLines.push(`\n${profile.equipmentAccess.summary}`);
    }

    if (equipLines.length > 1) {
      sections.push(equipLines.join('\n'));
    }
  }

  // ============================================================
  // ACTIVITIES SECTION
  // ============================================================
  if (profile?.activities && profile.activities.length > 0) {
    const activitiesLines: string[] = ['# ACTIVITIES'];

    profile.activities.forEach((activity, index) => {
      if (index > 0) activitiesLines.push(''); // Blank line between activities

      const activityType = activity.type === 'strength' ? 'Strength Training' : 'Cardio';

      activitiesLines.push(`## ${activityType}`);

      if (activity.type === 'strength' && 'experience' in activity) {
        activitiesLines.push(`**Experience:** ${activity.experience.charAt(0).toUpperCase() + activity.experience.slice(1)}`);

        if (activity.currentProgram) {
          activitiesLines.push(`**Current Program:** ${activity.currentProgram}`);
        }

        if (activity.keyLifts && Object.keys(activity.keyLifts).length > 0) {
          const lifts = Object.entries(activity.keyLifts)
            .map(([lift, weight]) => `${lift}: ${weight}lbs`)
            .join(', ');
          activitiesLines.push(`**Key Lifts:** ${lifts}`);
        }

        if (activity.summary) {
          activitiesLines.push(`\n${activity.summary}`);
        }
      } else if (activity.type === 'cardio' && 'primaryActivities' in activity) {
        activitiesLines.push(`**Primary Activities:** ${activity.primaryActivities.join(', ')}`);
        activitiesLines.push(`**Experience:** ${activity.experience.charAt(0).toUpperCase() + activity.experience.slice(1)}`);

        if (activity.summary) {
          activitiesLines.push(`\n${activity.summary}`);
        }
      }
    });

    if (activitiesLines.length > 1) {
      sections.push(activitiesLines.join('\n'));
    }
  }

  // ============================================================
  // INJURIES & PERMANENT LIMITATIONS SECTION
  // ============================================================
  const permanentConstraints = profile?.constraints?.filter(c => !c.isTemporary && c.status === 'active');
  if (permanentConstraints && permanentConstraints.length > 0) {
    const injuryLines: string[] = ['# INJURIES & PERMANENT LIMITATIONS'];

    permanentConstraints.forEach((constraint) => {
      const severity = constraint.severity ? ` (${constraint.severity})` : '';
      injuryLines.push(`* **${constraint.type.toUpperCase()}${severity}:** ${constraint.description}`);

      if (constraint.affectedMovements && constraint.affectedMovements.length > 0) {
        injuryLines.push(`  - Affected Movements: ${constraint.affectedMovements.join(', ')}`);
      }
    });

    sections.push(injuryLines.join('\n'));
  }

  // ============================================================
  // TEMPORARY CONSTRAINTS & LOGISTICS SECTION
  // ============================================================
  const temporaryConstraints = profile?.constraints?.filter(c => c.isTemporary && c.status === 'active');
  const temporaryEnvChanges = profile?.equipmentAccess?.temporaryChanges;

  if ((temporaryConstraints && temporaryConstraints.length > 0) ||
      (temporaryEnvChanges && temporaryEnvChanges.length > 0)) {
    const tempLines: string[] = ['# TEMPORARY CONSTRAINTS & LOGISTICS'];

    // Environment changes
    if (temporaryEnvChanges && temporaryEnvChanges.length > 0) {
      temporaryEnvChanges.forEach((change) => {
        const dateRange = change.endDate
          ? `Effective: ${change.startDate} - ${change.endDate}`
          : `Effective: ${change.startDate} - Ongoing`;

        tempLines.push(`\n* **[ACTIVE] ${change.description} (${dateRange})**`);

        if (change.location) {
          tempLines.push(`  - Location: ${change.location}`);
        }

        if (change.equipmentAvailable && change.equipmentAvailable.length > 0) {
          tempLines.push(`  - Equipment Available: ${change.equipmentAvailable.join(', ')}`);
        }

        if (change.equipmentUnavailable && change.equipmentUnavailable.length > 0) {
          tempLines.push(`  - Equipment Unavailable: ${change.equipmentUnavailable.join(', ')}`);
        }
      });
    }

    // Temporary constraints (injuries, etc.)
    if (temporaryConstraints && temporaryConstraints.length > 0) {
      temporaryConstraints.forEach((constraint) => {
        const dateRange = constraint.endDate
          ? `Effective: ${constraint.startDate} - ${constraint.endDate}`
          : `Effective: ${constraint.startDate} - Ongoing`;

        tempLines.push(`\n* **[ACTIVE] ${constraint.description} (${dateRange})**`);

        if (constraint.severity) {
          tempLines.push(`  - Severity: ${constraint.severity}`);
        }

        if (constraint.affectedMovements && constraint.affectedMovements.length > 0) {
          tempLines.push(`  - Affected Movements: ${constraint.affectedMovements.join(', ')}`);
        }
      });
    }

    if (tempLines.length > 1) {
      sections.push(tempLines.join('\n'));
    }
  }

  // ============================================================
  // METRICS SECTION (Optional - can be added if needed)
  // ============================================================
  if (profile?.metrics) {
    const metricsLines: string[] = ['# METRICS'];

    if (profile.metrics.height) {
      metricsLines.push(`**Height:** ${profile.metrics.height} inches`);
    }

    if (profile.metrics.weight) {
      metricsLines.push(`**Weight:** ${profile.metrics.weight.value} ${profile.metrics.weight.unit}`);
    }

    if (profile.metrics.bodyComposition) {
      metricsLines.push(`**Body Fat %:** ${profile.metrics.bodyComposition}%`);
    }

    if (profile.metrics.fitnessLevel) {
      const level = profile.metrics.fitnessLevel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      metricsLines.push(`**Fitness Level:** ${level}`);
    }

    if (profile.metrics.summary) {
      metricsLines.push(`\n${profile.metrics.summary}`);
    }

    if (metricsLines.length > 1) {
      sections.push(metricsLines.join('\n'));
    }
  }

  // Join all sections with double newlines
  return sections.join('\n\n');
}

/**
 * Create a default/empty Markdown profile
 * Used when creating a new user with no profile data
 */
export function createEmptyMarkdownProfile(user?: Partial<User>): string {
  const sections: string[] = [];

  // Minimal IDENTITY section
  const identityLines: string[] = ['# IDENTITY'];
  if (user?.name) {
    identityLines.push(`**Name:** ${user.name}`);
  }
  if (user?.age) {
    identityLines.push(`**Age:** ${user.age}`);
  }
  sections.push(identityLines.join('\n'));

  // Empty placeholder sections
  sections.push('# GOALS\n_No goals set yet_');
  sections.push('# AVAILABILITY\n_No availability information yet_');
  sections.push('# EQUIPMENT\n_No equipment information yet_');

  return sections.join('\n\n');
}
