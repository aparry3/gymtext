import type { User, FitnessProfile } from '@/server/models/user';

export interface ProcessedUserData {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  timezone: string | null;
  preferredSendHour: number | null;
  createdAt: Date | null;
  stripeCustomerId: string | null;
}

export interface ProcessedProfileData {
  // Goals
  primaryGoal: string | null;
  specificObjective: string | null;
  eventDate: string | null;
  timelineWeeks: number | null;
  
  // Experience
  experienceLevel: string | null;
  currentActivity: string | null;
  
  // Current Training
  currentTraining: {
    programName?: string;
    weeksCompleted?: number;
    focus?: string;
    notes?: string;
  } | null;
  
  // Availability
  availability: {
    daysPerWeek?: number;
    minutesPerSession?: number;
    preferredTimes?: string;
    travelPattern?: string;
    notes?: string;
  } | null;
  
  // Equipment
  equipment: {
    access?: string;
    location?: string;
    items?: string[];
    constraints?: string[];
  } | null;
  
  // Preferences
  preferences: {
    workoutStyle?: string;
    enjoyedExercises?: string[];
    dislikedExercises?: string[];
    coachingTone?: string;
    musicOrVibe?: string;
  } | null;
  
  // Metrics
  metrics: {
    heightCm?: number;
    bodyweight?: {
      value: number;
      unit: 'lbs' | 'kg';
    };
    bodyFatPercent?: number;
    prLifts?: Record<string, {
      weight: number;
      unit: 'lbs' | 'kg';
      reps?: number;
      date?: string;
    }>;
  } | null;
  
  // Constraints
  constraints: Array<{
    id: string;
    type: string;
    label: string;
    severity?: string;
    affectedAreas?: string[];
    modifications?: string;
    status: string;
  }> | null;
  
  // Activity Data
  activityData: Record<string, unknown> | null;
}

export function processUserData(user: Partial<User>): ProcessedUserData {
  return {
    name: user.name || null,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    timezone: user.timezone || null,
    preferredSendHour: user.preferredSendHour || null,
    createdAt: user.createdAt || null,
    stripeCustomerId: user.stripeCustomerId || null,
  };
}

export function processProfileData(profile: Partial<FitnessProfile>): ProcessedProfileData {
  return {
    // Goals
    primaryGoal: profile.primaryGoal || null,
    specificObjective: profile.specificObjective || null,
    eventDate: profile.eventDate || null,
    timelineWeeks: profile.timelineWeeks || null,
    
    // Experience
    experienceLevel: profile.experienceLevel || null,
    currentActivity: profile.currentActivity || null,
    
    // Current Training
    currentTraining: profile.currentTraining || null,
    
    // Availability
    availability: profile.availability || null,
    
    // Equipment
    equipment: profile.equipment || null,
    
    // Preferences
    preferences: profile.preferences || null,
    
    // Metrics
    metrics: profile.metrics || null,
    
    // Constraints
    constraints: profile.constraints || null,
    
    // Activity Data
    activityData: profile.activityData || null,
  };
}

export function calculateProfileCompleteness(
  userData: ProcessedUserData,
  profileData: ProcessedProfileData
): number {
  const fields = [
    // Core user fields (weight: 2)
    userData.name ? 2 : 0,
    userData.email ? 2 : 0,
    userData.phoneNumber ? 2 : 0,
    
    // Basic profile fields (weight: 3)
    profileData.primaryGoal ? 3 : 0,
    profileData.experienceLevel ? 3 : 0,
    
    // Availability (weight: 2)
    profileData.availability?.daysPerWeek ? 2 : 0,
    profileData.availability?.minutesPerSession ? 2 : 0,
    
    // Optional fields (weight: 1)
    userData.timezone ? 1 : 0,
    userData.preferredSendHour !== null ? 1 : 0,
    profileData.specificObjective ? 1 : 0,
    profileData.currentActivity ? 1 : 0,
    profileData.equipment?.access ? 1 : 0,
    profileData.preferences?.workoutStyle ? 1 : 0,
    profileData.metrics?.bodyweight ? 1 : 0,
  ];
  
  const total = fields.reduce((sum, value) => sum + value, 0);
  const maxPossible = 2 * 3 + 3 * 2 + 2 * 2 + 1 * 8; // 26 total
  
  return Math.round((total / maxPossible) * 100);
}

type DisplayValue = string | number | Date | Array<string | number> | { value: number; unit: string } | null | undefined;

export function formatDisplayValue(value: DisplayValue, type?: 'weight' | 'time' | 'date' | 'percentage' | 'list'): string {
  if (value === null || value === undefined) {
    return 'Not provided yet';
  }
  
  switch (type) {
    case 'weight':
      if (typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
        const weightObj = value as { value: number; unit: string };
        return `${weightObj.value} ${weightObj.unit}`;
      }
      return String(value);
      
    case 'time':
      if (typeof value === 'number') {
        if (value >= 60) {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
        return `${value}m`;
      }
      return String(value);
      
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === 'string') {
        return new Date(value).toLocaleDateString();
      }
      return String(value);
      
    case 'percentage':
      if (typeof value === 'number') {
        return `${value}%`;
      }
      return String(value);
      
    case 'list':
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'None specified';
      }
      return String(value);
      
    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
  }
}