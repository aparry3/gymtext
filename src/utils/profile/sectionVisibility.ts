import type { ProcessedUserData, ProcessedProfileData } from './profileProcessors';

export type SectionType = 
  | 'personalInfo'
  | 'goals'
  | 'trainingStatus'
  | 'availability'
  | 'equipment'
  | 'preferences'
  | 'metrics'
  | 'constraints'
  | 'activities';

export interface SectionInfo {
  id: SectionType;
  title: string;
  priority: number;
  hasData: boolean;
  dataCount: number;
}

export function determineSectionOrder(
  userData: ProcessedUserData,
  profileData: ProcessedProfileData
): SectionInfo[] {
  const sections: SectionInfo[] = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      priority: 1,
      hasData: hasPersonalInfoData(userData, profileData),
      dataCount: countPersonalInfoFields(userData, profileData),
    },
    {
      id: 'goals',
      title: 'Goals & Objectives',
      priority: 2,
      hasData: hasGoalsData(profileData),
      dataCount: countGoalsFields(profileData),
    },
    {
      id: 'availability',
      title: 'Schedule & Availability',
      priority: 3,
      hasData: hasAvailabilityData(profileData),
      dataCount: countAvailabilityFields(profileData),
    },
    {
      id: 'trainingStatus',
      title: 'Current Training',
      priority: 4,
      hasData: hasTrainingStatusData(profileData),
      dataCount: countTrainingStatusFields(profileData),
    },
    {
      id: 'equipment',
      title: 'Equipment & Environment',
      priority: 5,
      hasData: hasEquipmentData(profileData),
      dataCount: countEquipmentFields(profileData),
    },
    {
      id: 'preferences',
      title: 'Training Preferences',
      priority: 6,
      hasData: hasPreferencesData(profileData),
      dataCount: countPreferencesFields(profileData),
    },
    {
      id: 'metrics',
      title: 'Physical Metrics',
      priority: 7,
      hasData: hasMetricsData(profileData),
      dataCount: countMetricsFields(profileData),
    },
    {
      id: 'constraints',
      title: 'Limitations & Constraints',
      priority: 8,
      hasData: hasConstraintsData(profileData),
      dataCount: countConstraintsFields(profileData),
    },
    {
      id: 'activities',
      title: 'Activity-Specific Data',
      priority: 9,
      hasData: hasActivityData(profileData),
      dataCount: countActivityDataFields(profileData),
    },
  ];

  // Sort by: 1) has data (true first), 2) data count (desc), 3) priority (asc)
  return sections.sort((a, b) => {
    if (a.hasData !== b.hasData) {
      return a.hasData ? -1 : 1;
    }
    if (a.dataCount !== b.dataCount) {
      return b.dataCount - a.dataCount;
    }
    return a.priority - b.priority;
  });
}

export function shouldShowSection(sectionType: SectionType, userData: ProcessedUserData, profileData: ProcessedProfileData): boolean {
  switch (sectionType) {
    case 'personalInfo':
      return true; // Always show personal info section
    case 'goals':
      return true; // Always show goals section
    case 'trainingStatus':
      return hasTrainingStatusData(profileData);
    case 'availability':
      return hasAvailabilityData(profileData);
    case 'equipment':
      return hasEquipmentData(profileData);
    case 'preferences':
      return hasPreferencesData(profileData);
    case 'metrics':
      return hasMetricsData(profileData);
    case 'constraints':
      return hasConstraintsData(profileData);
    case 'activities':
      return hasActivityData(profileData);
    default:
      return false;
  }
}

export function getEmptyStateMessage(sectionType: SectionType): string {
  switch (sectionType) {
    case 'personalInfo':
      return 'Tell us your name, email, and contact preferences to get started.';
    case 'goals':
      return 'Share your fitness goals and what you want to achieve.';
    case 'trainingStatus':
      return 'Let us know about your current training routine and experience.';
    case 'availability':
      return 'Tell us about your schedule and how often you can train.';
    case 'equipment':
      return 'Share what equipment you have access to for your workouts.';
    case 'preferences':
      return 'Let us know your workout preferences and what you enjoy.';
    case 'metrics':
      return 'Share your physical metrics and performance records when ready.';
    case 'constraints':
      return 'Tell us about any injuries, limitations, or constraints we should know about.';
    case 'activities':
      return 'Share details about your specific activities and sports experience.';
    default:
      return 'No data available yet.';
  }
}

// Helper functions for data checking
function hasPersonalInfoData(userData: ProcessedUserData, profileData: ProcessedProfileData): boolean {
  return !!(userData.name || userData.email || userData.phoneNumber || profileData.gender || profileData.age);
}

function countPersonalInfoFields(userData: ProcessedUserData, profileData: ProcessedProfileData): number {
  let count = 0;
  if (userData.name) count++;
  if (userData.email) count++;
  if (userData.phoneNumber) count++;
  if (userData.timezone) count++;
  if (userData.preferredSendHour !== null) count++;
  if (profileData.gender) count++;
  if (profileData.age) count++;
  return count;
}

function hasGoalsData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.primaryGoal || profileData.specificObjective || profileData.experienceLevel);
}

function countGoalsFields(profileData: ProcessedProfileData): number {
  let count = 0;
  if (profileData.primaryGoal) count++;
  if (profileData.specificObjective) count++;
  if (profileData.eventDate) count++;
  if (profileData.timelineWeeks) count++;
  if (profileData.experienceLevel) count++;
  if (profileData.currentActivity) count++;
  return count;
}

function hasTrainingStatusData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.currentTraining && Object.keys(profileData.currentTraining).length > 0);
}

function countTrainingStatusFields(profileData: ProcessedProfileData): number {
  if (!profileData.currentTraining) return 0;
  let count = 0;
  if (profileData.currentTraining.programName) count++;
  if (profileData.currentTraining.weeksCompleted) count++;
  if (profileData.currentTraining.focus) count++;
  if (profileData.currentTraining.notes) count++;
  return count;
}

function hasAvailabilityData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.availability && Object.keys(profileData.availability).length > 0);
}

function countAvailabilityFields(profileData: ProcessedProfileData): number {
  if (!profileData.availability) return 0;
  let count = 0;
  if (profileData.availability.daysPerWeek) count++;
  if (profileData.availability.minutesPerSession) count++;
  if (profileData.availability.preferredTimes) count++;
  if (profileData.availability.travelPattern) count++;
  if (profileData.availability.notes) count++;
  return count;
}

function hasEquipmentData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.equipment && Object.keys(profileData.equipment).length > 0);
}

function countEquipmentFields(profileData: ProcessedProfileData): number {
  if (!profileData.equipment) return 0;
  let count = 0;
  if (profileData.equipment.access) count++;
  if (profileData.equipment.location) count++;
  if (profileData.equipment.items?.length) count++;
  if (profileData.equipment.constraints?.length) count++;
  return count;
}

function hasPreferencesData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.preferences && Object.keys(profileData.preferences).length > 0);
}

function countPreferencesFields(profileData: ProcessedProfileData): number {
  if (!profileData.preferences) return 0;
  let count = 0;
  if (profileData.preferences.workoutStyle) count++;
  if (profileData.preferences.enjoyedExercises?.length) count++;
  if (profileData.preferences.dislikedExercises?.length) count++;
  if (profileData.preferences.coachingTone) count++;
  if (profileData.preferences.musicOrVibe) count++;
  return count;
}

function hasMetricsData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.metrics && Object.keys(profileData.metrics).length > 0);
}

function countMetricsFields(profileData: ProcessedProfileData): number {
  if (!profileData.metrics) return 0;
  let count = 0;
  if (profileData.metrics.heightCm) count++;
  if (profileData.metrics.bodyweight) count++;
  if (profileData.metrics.bodyFatPercent) count++;
  if (profileData.metrics.prLifts && Object.keys(profileData.metrics.prLifts).length > 0) count++;
  return count;
}

function hasConstraintsData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.constraints && profileData.constraints.length > 0);
}

function countConstraintsFields(profileData: ProcessedProfileData): number {
  return profileData.constraints?.length || 0;
}

function hasActivityData(profileData: ProcessedProfileData): boolean {
  return !!(profileData.activities && Array.isArray(profileData.activities) && profileData.activities.length > 0);
}

function countActivityDataFields(profileData: ProcessedProfileData): number {
  if (!profileData.activities || !Array.isArray(profileData.activities)) return 0;
  // Count total meaningful fields across all activities
  return profileData.activities.reduce((total: number, activity: unknown) => {
    if (typeof activity === 'object' && activity !== null && !Array.isArray(activity)) {
      const activityObj = activity as Record<string, unknown>;
      let count = 0;
      
      // Count core activity fields
      if (activityObj.type) count++;
      if (activityObj.experienceLevel) count++;
      if (activityObj.activityName) count++;
      
      // Count key metrics
      if (activityObj.keyMetrics && typeof activityObj.keyMetrics === 'object') {
        count += Object.keys(activityObj.keyMetrics).length;
      }
      
      // Count arrays like goals and equipment
      if (Array.isArray(activityObj.goals) && activityObj.goals.length > 0) count++;
      if (Array.isArray(activityObj.equipment) && activityObj.equipment.length > 0) count++;
      
      return total + count;
    }
    return total;
  }, 0);
}