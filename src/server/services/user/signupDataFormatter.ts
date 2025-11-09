import type { SignupData } from '@/server/repositories/onboardingRepository';

/**
 * SignupDataFormatter
 *
 * Service for formatting raw signup form data into LLM-friendly text strings.
 * This logic was moved from the frontend to centralize data formatting on the backend.
 *
 * Responsibilities:
 * - Convert structured form data into natural language descriptions
 * - Provide consistent formatting for LLM consumption
 * - Make it easy to modify formatting without touching frontend
 */

/**
 * Format raw signup data into LLM-friendly text strings
 *
 * Takes structured form data and converts it into natural language
 * descriptions suitable for fitness profile extraction.
 */
export function formatSignupDataForLLM(data: SignupData): {
  fitnessGoals: string;
  currentExercise: string;
  environment: string;
  injuries?: string;
} {
  // Build fitness goals text
  const goalsList = `My goals are: ${(data.primaryGoals || [])
    .map(getGoalDescription)
    .join(', ')}`;
  const fitnessGoals = data.goalsElaboration?.trim()
    ? `${goalsList}. Additional details: ${data.goalsElaboration.trim()}`
    : goalsList;

  // Build current exercise text
  const activityLevel = data.currentActivity
    ? getActivityDescription(data.currentActivity)
    : '';
  const experienceLevel = data.experienceLevel
    ? `Experience level: ${data.experienceLevel.charAt(0).toUpperCase() + data.experienceLevel.slice(1)}`
    : '';
  const currentExercise = data.activityElaboration?.trim()
    ? `${experienceLevel}. ${activityLevel}. Additional details: ${data.activityElaboration.trim()}`
    : `${experienceLevel}. ${activityLevel}`;

  // Build environment text
  const locationText = data.trainingLocation
    ? `Training location: ${getLocationDescription(data.trainingLocation)}`
    : '';
  const equipmentText =
    data.equipment && data.equipment.length > 0
      ? `Available equipment: ${data.equipment.map(e => getEquipmentDescription(e)).join(', ')}`
      : 'No specific equipment';
  const environment = `${locationText}. ${equipmentText}`;

  return {
    fitnessGoals,
    currentExercise,
    environment,
    injuries: data.injuries,
  };
}

// Helper functions for converting enum values to descriptions

function getGoalDescription(goal: string): string {
  const goalMap: Record<string, string> = {
    strength: 'Build strength and muscle',
    endurance: 'Improve endurance and stamina',
    weight_loss: 'Lose weight and improve body composition',
    general_fitness: 'Improve overall fitness and health',
  };
  return goalMap[goal] || goal;
}

function getActivityDescription(activity: string): string {
  const activityMap: Record<string, string> = {
    not_active: 'Currently not active (less than 1x/week)',
    once_per_week: 'Active once per week',
    '2_3_per_week': 'Active 2-3 times per week',
    '4_plus_per_week': 'Active 4+ times per week',
  };
  return activityMap[activity] || activity;
}

function getLocationDescription(location: string): string {
  const locationMap: Record<string, string> = {
    home: 'Home gym',
    commercial_gym: 'Commercial gym',
    bodyweight: 'Bodyweight/minimal equipment',
  };
  return locationMap[location] || location;
}

function getEquipmentDescription(equipment: string): string {
  const equipmentMap: Record<string, string> = {
    dumbbells: 'Dumbbells',
    barbell: 'Barbell',
    resistance_bands: 'Resistance bands',
    pull_up_bar: 'Pull-up bar',
    cardio_equipment: 'Cardio equipment',
    full_gym: 'Full gym access',
  };
  return equipmentMap[equipment] || equipment;
}
