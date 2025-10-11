/**
 * Inngest Client
 *
 * Centralized Inngest client for serverless function orchestration.
 * Used for async message processing, scheduled tasks, and event-driven workflows.
 */

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'gymtext',
  name: 'GymText - AI Fitness Coaching'
});
