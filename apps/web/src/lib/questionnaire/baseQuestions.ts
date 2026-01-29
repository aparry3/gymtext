/**
 * Base Questions
 *
 * Static question definitions for the signup questionnaire.
 * Order: fitness-focused first, bio (name, phone) at end.
 */

import type { QuestionnaireQuestion } from './types';

export const baseQuestions: QuestionnaireQuestion[] = [
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
    ],
    source: 'base',
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
    ],
    source: 'base',
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
    ],
    source: 'base',
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
    ],
    source: 'base',
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
  },
  {
    id: 'name',
    questionText: "What's your name?",
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
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
