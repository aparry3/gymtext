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
export function formatSignupDataForLLM(data) {
    // 1. Fitness Goals
    const goalsList = `My goals are: ${(data.primaryGoals || [])
        .map(getGoalDescription)
        .join(', ')}`;
    const fitnessGoals = data.goalsElaboration?.trim()
        ? `${goalsList}. Additional details: ${data.goalsElaboration.trim()}`
        : goalsList;
    // 2. Desired Availability & Experience
    const desiredFrequency = data.desiredDaysPerWeek
        ? getDaysPerWeekDescription(data.desiredDaysPerWeek)
        : '';
    const experienceLevel = data.experienceLevel
        ? `Experience level: ${data.experienceLevel.charAt(0).toUpperCase() + data.experienceLevel.slice(1)}`
        : '';
    // Frame as desired availability - what the user WANTS, not what they currently do
    const availabilityText = `***Desired Availability***:
  ${experienceLevel}. ${desiredFrequency}.
  Additional Details: ${data.availabilityElaboration?.trim() || 'None provided.'}`;
    const currentExercise = availabilityText;
    // 3. Environment
    const locationText = data.trainingLocation
        ? `Training location: ${getLocationDescription(data.trainingLocation)}`
        : '';
    const equipmentText = data.equipment && data.equipment.length > 0
        ? `Available equipment: ${data.equipment.map(e => getEquipmentDescription(e)).join(', ')}`
        : 'No specific equipment';
    const environment = `***Environment & Constraints***:
  ${locationText}. ${equipmentText}`;
    return {
        fitnessGoals,
        currentExercise,
        environment,
        injuries: data.injuries,
    };
}
// Helper functions for converting enum values to descriptions
function getGoalDescription(goal) {
    const goalMap = {
        strength: 'Build strength and muscle',
        endurance: 'Improve endurance and stamina',
        weight_loss: 'Lose weight and improve body composition',
        general_fitness: 'Improve overall fitness and health',
    };
    return goalMap[goal] || goal;
}
function getDaysPerWeekDescription(daysPerWeek) {
    const daysMap = {
        '3_per_week': 'Wants to train 3 days per week',
        '4_per_week': 'Wants to train 4 days per week',
        '5_per_week': 'Wants to train 5 days per week',
        '6_per_week': 'Wants to train 6 days per week',
    };
    return daysMap[daysPerWeek] || daysPerWeek;
}
function getLocationDescription(location) {
    const locationMap = {
        home: 'Home gym',
        commercial_gym: 'Commercial gym',
        bodyweight: 'Bodyweight/minimal equipment',
    };
    return locationMap[location] || location;
}
function getEquipmentDescription(equipment) {
    const equipmentMap = {
        dumbbells: 'Dumbbells',
        barbell: 'Barbell',
        resistance_bands: 'Resistance bands',
        pull_up_bar: 'Pull-up bar',
        cardio_equipment: 'Cardio equipment',
        full_gym: 'Full gym access',
    };
    return equipmentMap[equipment] || equipment;
}
