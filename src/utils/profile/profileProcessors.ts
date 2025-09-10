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
  
  // Personal Information
  gender: string | null;
  age: number | null;
  
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
  
  // Activity Data (now an array)
  activityData: unknown[] | null;
}

export function processUserData(user: Partial<User> | null | undefined): ProcessedUserData {
  if (!user || typeof user !== 'object') {
    return {
      name: null,
      email: null,
      phoneNumber: null,
      timezone: null,
      preferredSendHour: null,
      createdAt: null,
      stripeCustomerId: null,
    };
  }

  return {
    name: typeof user.name === 'string' && user.name.trim() ? user.name.trim() : null,
    email: typeof user.email === 'string' && user.email.trim() ? user.email.trim() : null,
    phoneNumber: typeof user.phoneNumber === 'string' && user.phoneNumber.trim() ? user.phoneNumber.trim() : null,
    timezone: typeof user.timezone === 'string' && user.timezone.trim() ? user.timezone.trim() : null,
    preferredSendHour: typeof user.preferredSendHour === 'number' && user.preferredSendHour >= 0 && user.preferredSendHour <= 23 ? user.preferredSendHour : null,
    createdAt: user.createdAt instanceof Date ? user.createdAt : null,
    stripeCustomerId: typeof user.stripeCustomerId === 'string' && user.stripeCustomerId.trim() ? user.stripeCustomerId.trim() : null,
  };
}

export function processProfileData(profile: Partial<FitnessProfile> | null | undefined): ProcessedProfileData {
  if (!profile || typeof profile !== 'object') {
    return {
      primaryGoal: null,
      specificObjective: null,
      eventDate: null,
      timelineWeeks: null,
      gender: null,
      age: null,
      experienceLevel: null,
      currentActivity: null,
      currentTraining: null,
      availability: null,
      equipment: null,
      preferences: null,
      metrics: null,
      constraints: null,
      activityData: null,
    };
  }

  // Safe object validation helper
  const isValidObject = (obj: unknown): obj is Record<string, unknown> => 
    obj !== null && typeof obj === 'object' && !Array.isArray(obj);

  // Safe array validation helper  
  const isValidArray = (arr: unknown): arr is unknown[] =>
    Array.isArray(arr) && arr.length > 0;

  return {
    // Goals with validation
    primaryGoal: typeof profile.goals?.primary === 'string' && profile.goals.primary.trim() ? profile.goals.primary.trim() : null,
    specificObjective: typeof profile.goals?.specific === 'string' && profile.goals.specific.trim() ? profile.goals.specific.trim() : null,
    eventDate: null, // Not used in new schema
    timelineWeeks: typeof profile.goals?.timeline === 'number' && profile.goals.timeline > 0 ? profile.goals.timeline : null,
    
    // Personal Information with validation
    gender: typeof profile.gender === 'string' && profile.gender.trim() ? profile.gender.trim() : null,
    age: typeof profile.age === 'number' && profile.age >= 13 && profile.age <= 120 ? profile.age : null,
    
    // Experience with validation
    experienceLevel: typeof profile.experienceLevel === 'string' && profile.experienceLevel.trim() ? profile.experienceLevel.trim() : null,
    currentActivity: typeof profile.currentActivity === 'string' && profile.currentActivity.trim() ? profile.currentActivity.trim() : null,
    
    // Nested objects with validation
    currentTraining: isValidObject(profile.currentTraining) ? profile.currentTraining as ProcessedProfileData['currentTraining'] : null,
    availability: isValidObject(profile.availability) ? profile.availability as ProcessedProfileData['availability'] : null,
    equipment: isValidObject(profile.equipment) ? profile.equipment as ProcessedProfileData['equipment'] : null,
    preferences: isValidObject(profile.preferences) ? profile.preferences as ProcessedProfileData['preferences'] : null,
    metrics: isValidObject(profile.metrics) ? profile.metrics as ProcessedProfileData['metrics'] : null,
    
    // Arrays with validation
    constraints: isValidArray(profile.constraints) ? profile.constraints as ProcessedProfileData['constraints'] : null,
    
    // Activity data with validation (now handles array)
    activityData: isValidArray(profile.activityData) ? profile.activityData : null,
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
    
    // Personal information fields (weight: 2)
    profileData.gender ? 2 : 0,
    profileData.age ? 2 : 0,
    
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
  const maxPossible = 2 * 5 + 3 * 2 + 2 * 2 + 1 * 8; // 30 total (added 4 for gender and age)
  
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