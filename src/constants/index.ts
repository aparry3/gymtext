// Application-wide constants
export const APP_NAME = 'GymText';
export const APP_VERSION = '1.0.0';

// Workout-related constants
export const WORKOUT_TYPES = {
  LIFT: 'lift',
  RUN: 'run',
  METCON: 'metcon',
  MOBILITY: 'mobility',
  REST: 'rest',
  OTHER: 'other',
} as const;

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const WORKOUT_INTENSITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Message limits
export const MESSAGE_LIMITS = {
  SMS_MAX_LENGTH: 1600,
  WORKOUT_DESCRIPTION_MAX: 1200,
  WELCOME_MESSAGE_MAX: 900,
} as const;

// Time constants
export const TIME_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  WEEKS_IN_MESOCYCLE_MIN: 3,
  WEEKS_IN_MESOCYCLE_MAX: 6,
  DELOAD_WEEK_VOLUME_REDUCTION: 0.4, // 40% reduction
  DELOAD_WEEK_INTENSITY_REDUCTION: 0.15, // 15% reduction
} as const;

// API response codes
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Regex patterns
export const PATTERNS = {
  PHONE: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
} as const;