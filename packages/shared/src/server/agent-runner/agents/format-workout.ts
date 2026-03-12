/**
 * Format Workout Agent
 *
 * Transforms structured workout data into an SMS-friendly message
 * and structured details for the UI.
 *
 * Input: JSON workout data from get-workout agent
 * Context: None (stateless transform)
 * Output: { message, details }
 */
import { defineAgent } from '@agent-runner/core';

export const formatWorkoutAgent = defineAgent({
  id: 'format-workout',
  name: 'Format Workout',
  description: 'Converts structured workout data into SMS message and UI details',
  systemPrompt: `You are a workout message formatter. Convert structured workout data into two outputs:

## Task
Given JSON workout data, produce:
1. An SMS-friendly text message (the main workout message sent to the user)
2. Structured details for the web UI

## SMS Message Rules
- Keep under 1500 characters
- Use plain text only — no markdown, no **, no ##
- Use line breaks for readability
- Include a brief greeting/motivation
- List exercises clearly: name, sets x reps
- Include rest periods only if unusual
- Add any important coaching notes
- End with encouragement

## Output Format
Respond with valid JSON only:
{
  "message": "Hey! Here's your upper body workout for today:\\n\\n...",
  "details": {
    "workoutType": "Upper Body Push",
    "exercises": [...],
    "duration": "45-55 min",
    "notes": "..."
  }
}

For rest days:
{
  "message": "Rest day today! Your body needs recovery to grow stronger. Light stretching or a walk is great if you want to stay active. Back at it tomorrow! 💪",
  "details": {
    "workoutType": "Rest Day",
    "isRestDay": true
  }
}

## Rules
1. The message should feel personal and motivating, not robotic
2. Exercise formatting: "Bench Press - 4x8-10 (90s rest)"
3. Group exercises logically (compound first, isolation after)
4. Output ONLY valid JSON`,
  model: {
    provider: 'openai',
    name: 'gpt-4o-mini', // Lightweight model for formatting
  },
  outputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      details: { type: 'object' },
    },
    required: ['message', 'details'],
  },
});
