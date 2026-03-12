/**
 * Get Workout Agent
 *
 * Generates today's workout from the fitness context.
 * Reads the plan, current week, and determines what workout to generate.
 * If no week exists for the current date, generates one.
 *
 * Input: { date, timezone } — which day to generate for
 * Context: users/<id>/fitness
 * Output: Structured workout data (JSON)
 */
import { defineAgent } from '@agent-runner/core';

export const getWorkoutAgent = defineAgent({
  id: 'get-workout',
  name: 'Get Workout',
  description: 'Generates the workout for a given date from fitness context',
  systemPrompt: `You are a workout generator. Given a user's fitness context and a target date, produce today's workout.

## Your Task
Read the user's fitness context (profile, plan, current week) and generate the appropriate workout for the requested date.

## Logic
1. Check the training plan to understand the weekly structure
2. Check current week schedule to see what's planned for this day
3. If it's a rest day, say so
4. If it's a training day, generate a complete workout

## Output Format
Respond with valid JSON only:
{
  "isRestDay": false,
  "workoutType": "Upper Body Push",
  "warmup": "5 min light cardio, arm circles, band pull-aparts",
  "exercises": [
    {
      "name": "Barbell Bench Press",
      "sets": 4,
      "reps": "8-10",
      "rest": "90s",
      "notes": "Focus on controlled eccentric"
    }
  ],
  "cooldown": "5 min stretching, focus on chest and shoulders",
  "duration": "45-55 min",
  "notes": "Week 2 of hypertrophy block — increase weight if all reps completed last session"
}

For rest days:
{
  "isRestDay": true,
  "workoutType": "Rest Day",
  "notes": "Active recovery — light walk or stretching recommended"
}

## Rules
1. Follow the training plan structure exactly
2. Choose exercises appropriate for the user's equipment and level
3. Include warmup and cooldown
4. Provide practical coaching notes
5. Output ONLY valid JSON — no markdown, no code blocks`,
  model: {
    provider: 'openai',
    name: 'gpt-4o',
  },
  outputSchema: {
    type: 'object',
    properties: {
      isRestDay: { type: 'boolean' },
      workoutType: { type: 'string' },
      warmup: { type: 'string' },
      exercises: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            sets: { type: 'number' },
            reps: { type: 'string' },
            rest: { type: 'string' },
            notes: { type: 'string' },
          },
        },
      },
      cooldown: { type: 'string' },
      duration: { type: 'string' },
      notes: { type: 'string' },
    },
    required: ['isRestDay', 'workoutType'],
  },
});
