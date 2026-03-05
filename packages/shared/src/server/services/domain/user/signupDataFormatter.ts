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
export function formatSignupDataForLLM(data: SignupData): string {
  const sections: string[] = [];

  // GOALS
  const goals = (data.primaryGoals || []).map(getGoalDescription);
  if (goals.length > 0) {
    const goalLines = goals.map(g => `- ${g}`).join('\n');
    const elaboration = data.goalsElaboration?.trim()
      ? `\nAdditional details: ${data.goalsElaboration.trim()}`
      : '';
    sections.push(`## GOALS\n${goalLines}${elaboration}`);
  }

  // TRAINING CONTEXT
  const trainingSubsections: string[] = [];

  // Schedule & Availability
  if (data.desiredDaysPerWeek || data.availabilityElaboration?.trim()) {
    const freq = data.desiredDaysPerWeek
      ? `- Desired training frequency: ${getDaysPerWeekDescription(data.desiredDaysPerWeek)}`
      : '';
    const elaboration = data.availabilityElaboration?.trim()
      ? `${freq ? '\n' : ''}- Additional details: ${data.availabilityElaboration.trim()}`
      : '';
    trainingSubsections.push(`### Schedule & Availability\n${freq}${elaboration}`);
  }

  // Experience
  if (data.experienceLevel || data.experienceElaboration?.trim()) {
    const level = data.experienceLevel
      ? `- Level: ${data.experienceLevel.charAt(0).toUpperCase() + data.experienceLevel.slice(1)}`
      : '';
    const details = data.experienceElaboration?.trim()
      ? `${level ? '\n' : ''}- Details: ${data.experienceElaboration.trim()}`
      : '';
    trainingSubsections.push(`### Experience\n${level}${details}`);
  }

  // Equipment & Environment
  const envParts: string[] = [];
  if (data.trainingLocation) {
    envParts.push(`- Training location: ${getLocationDescription(data.trainingLocation)}`);
  }
  if (data.locationElaboration?.trim()) {
    envParts.push(`- Setup details: ${data.locationElaboration.trim()}`);
  }
  if (data.equipment && data.equipment.length > 0) {
    envParts.push(`- Available equipment: ${data.equipment.map(getEquipmentDescription).join(', ')}`);
  }
  if (envParts.length > 0) {
    trainingSubsections.push(`### Equipment & Environment\n${envParts.join('\n')}`);
  }

  // Constraints
  if (data.injuries?.trim()) {
    trainingSubsections.push(`### Constraints\n- ${data.injuries.trim()}`);
  }

  if (trainingSubsections.length > 0) {
    sections.push(`## TRAINING CONTEXT\n\n${trainingSubsections.join('\n\n')}`);
  }

  return sections.join('\n\n');
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

function getDaysPerWeekDescription(daysPerWeek: string): string {
  const daysMap: Record<string, string> = {
    '3_per_week': '3 days per week',
    '4_per_week': '4 days per week',
    '5_per_week': '5 days per week',
    '6_per_week': '6 days per week',
  };
  return daysMap[daysPerWeek] || daysPerWeek;
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
    kettlebells: 'Kettlebells',
    cable_machine: 'Cable machine',
    cardio_equipment: 'Cardio equipment',
    full_gym: 'Full gym access',
  };
  return equipmentMap[equipment] || equipment;
}
