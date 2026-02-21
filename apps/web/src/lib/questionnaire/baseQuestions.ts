/**
 * Base Questions
 *
 * Static question definitions for the signup questionnaire.
 * - baseQuestions: Full list for non-program signup (goals, experience, days, location, equipment, name, phone)
 * - programBaseQuestions: Minimal list for program signup (name, age, gender, phone)
 */

import type { QuestionnaireQuestion } from './types';

/**
 * Full base questions for non-program signup.
 * Order: bio (name, gender) first, then fitness questions, phone at end.
 */
export const baseQuestions: QuestionnaireQuestion[] = [
  {
    id: 'name',
    questionText: "What's your name?",
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
    source: 'base',
  },
  {
    id: 'gender',
    questionText: "What's your gender?",
    type: 'select',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
    source: 'base',
  },
  {
    id: 'goals',
    questionText: 'What are your fitness goals?',
    type: 'multiselect',
    helpText: 'Select all that apply',
    required: true,
    options: [
      { value: 'strength', label: 'Get Stronger', description: 'Build muscle and increase strength' },
      { value: 'endurance', label: 'Build Endurance', description: 'Improve stamina and cardiovascular health' },
      { value: 'weight_loss', label: 'Lose Weight', description: 'Burn fat and get leaner' },
      { value: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' },
      { value: 'tell_me_more', label: 'Tell me more', description: 'I want to describe my goals in detail' },
    ],
    source: 'base',
  },
  {
    id: 'goals_detail',
    questionText: 'Tell us more about your fitness goals',
    type: 'text',
    required: false,
    placeholder: 'Describe your goals in detail...',
    source: 'base',
    showIfAnswerContains: 'tell_me_more',
  },
  {
    id: 'experience',
    questionText: "What's your experience level?",
    type: 'select',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
      { value: 'intermediate', label: 'Intermediate', description: '1-3 years of consistent training' },
      { value: 'advanced', label: 'Advanced', description: '3+ years of dedicated training' },
      { value: 'tell_me_more', label: 'Tell me more', description: 'I want to describe my experience' },
    ],
    source: 'base',
  },
  {
    id: 'experience_detail',
    questionText: 'Tell us more about your fitness experience',
    type: 'text',
    required: false,
    placeholder: 'Describe your fitness background...',
    source: 'base',
    showIfAnswerEquals: 'tell_me_more',
  },
  {
    id: 'days',
    questionText: 'How many days can you work out?',
    type: 'select',
    required: true,
    options: [
      { value: '3_per_week', label: '3 days', description: 'Perfect for beginners or busy schedules' },
      { value: '4_per_week', label: '4 days', description: 'Great balance of training and recovery' },
      { value: '5_per_week', label: '5 days', description: 'Ideal for intermediate trainees' },
      { value: '6_per_week', label: '6 days', description: 'For serious athletes' },
      { value: 'tell_me_more', label: 'Tell me more', description: 'My schedule varies' },
    ],
    source: 'base',
  },
  {
    id: 'availability_detail',
    questionText: 'Tell us more about your availability',
    type: 'text',
    required: false,
    placeholder: 'e.g., I currently go to pilates on Wed and Thurs. I like to run and lift, don\'t mind overlap, want to exercise 6 days a week',
    source: 'base',
    showIfAnswerEquals: 'tell_me_more',
  },
  {
    id: 'location',
    questionText: 'Where will you train?',
    type: 'select',
    required: true,
    options: [
      { value: 'commercial_gym', label: 'Commercial Gym', description: 'Full access to machines and equipment' },
      { value: 'home', label: 'Home Gym', description: 'Training with your own equipment' },
      { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' },
      { value: 'tell_me_more', label: 'Tell me more', description: 'I want to describe my setup in detail' },
    ],
    source: 'base',
  },
  {
    id: 'equipment_location_detail',
    questionText: 'Tell us more about your training location',
    type: 'text',
    required: false,
    placeholder: 'Describe your gym setup...',
    source: 'base',
    showIfAnswerEquals: 'tell_me_more',
  },
  {
    id: 'equipment',
    questionText: 'What equipment do you have access to?',
    type: 'multiselect',
    helpText: 'Select all that apply',
    required: true,
    options: [
      { value: 'dumbbells', label: 'Dumbbells' },
      { value: 'barbell', label: 'Barbell & Plates' },
      { value: 'resistance_bands', label: 'Resistance Bands' },
      { value: 'pull_up_bar', label: 'Pull-up Bar' },
      { value: 'kettlebells', label: 'Kettlebells' },
      { value: 'cable_machine', label: 'Cable Machine' },
      { value: 'full_gym', label: 'Full Gym Access' },
    ],
    source: 'base',
    // Only show this question if location is "home" (Home Gym)
    // Skip for: bodyweight, commercial_gym, tell_me_more
    hideIfAnswerEquals: ['bodyweight', 'commercial_gym', 'tell_me_more'],
  },
  {
    id: 'phone',
    questionText: "What's your phone number?",
    type: 'phone',
    required: true,
    helpText: "We'll text you your workouts",
    placeholder: '(555) 555-5555',
    source: 'base',
  },
];

/**
 * Minimal base questions for program signup.
 * Only essential user info - program-specific questions are inserted before phone.
 * Order: name, age, gender, [program questions], phone
 */
export const programBaseQuestions: QuestionnaireQuestion[] = [
  {
    id: 'name',
    questionText: "What's your name?",
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
    source: 'base',
  },
  {
    id: 'age',
    questionText: "What's your age?",
    type: 'text',
    required: true,
    placeholder: 'Enter your age',
    source: 'base',
  },
  {
    id: 'gender',
    questionText: "What's your gender?",
    type: 'select',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
    source: 'base',
  },
  {
    id: 'phone',
    questionText: "What's your phone number?",
    type: 'phone',
    required: true,
    helpText: "We'll text you your workouts",
    placeholder: '(555) 555-5555',
    source: 'base',
  },
];

/**
 * Get the index where program questions should be inserted.
 * After equipment, before name.
 */
export function getProgramQuestionsInsertIndex(): number {
  const equipmentIndex = baseQuestions.findIndex((q) => q.id === 'equipment');
  return equipmentIndex + 1;
}

/**
 * Get the index where program questions should be inserted in program base questions.
 * After gender, before phone.
 */
export function getProgramQuestionsInsertIndexForProgramBase(): number {
  const genderIndex = programBaseQuestions.findIndex((q) => q.id === 'gender');
  return genderIndex + 1;
}
