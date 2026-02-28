/**
 * ProfileDetails types
 *
 * Structured profile data extracted from the Markdown dossier by the
 * profile:details agent. Used for UI display (mobile app, web dashboard).
 *
 * Stored in `profiles.details` JSONB column.
 */

// ============================================================================
// Sub-types
// ============================================================================

export interface ProfileIdentity {
  name: string;
  age: number;
  gender: string;
  experience: string;
  experienceYears: number;
  memberSince: string; // ISO date
}

export interface ProfileGoal {
  id: string;
  type: 'primary' | 'secondary';
  label: string;
  description: string;
}

export interface ProfileSchedule {
  daysPerWeek: number;
  sessionDuration: string;
  dayPreferences?: string[];
}

export interface ProfileConstraint {
  id: string;
  status: 'active' | 'resolved' | 'monitoring';
  description: string;
  management?: string;
  since?: string; // ISO date
  resolved?: string; // ISO date
}

export interface ProfilePreferences {
  likes: string[];
  dislikes: string[];
  style: string[];
}

export interface ProfileMetric {
  label: string;
  value: string;
  date?: string; // ISO date
  trend?: 'up' | 'down' | 'stable';
  previous?: string;
}

export interface ProfileBodyMetric {
  label: string;
  value: string;
  startValue?: string;
  date?: string; // ISO date
}

export interface ProfileLogEntry {
  date: string; // ISO date
  title: string;
  notes: string[];
}

// ============================================================================
// Top-level
// ============================================================================

/**
 * Top-level profile details structure.
 * Stored in `profiles.details` JSONB column.
 */
export interface ProfileDetails {
  identity: ProfileIdentity;
  goals: ProfileGoal[];
  schedule: ProfileSchedule;
  environments: string[];
  constraints: ProfileConstraint[];
  preferences: ProfilePreferences;
  strengthMetrics: ProfileMetric[];
  bodyMetrics: ProfileBodyMetric[];
  recentLog: ProfileLogEntry[];
}
