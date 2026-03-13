/**
 * WhatsApp Templates Utility (Legacy Compatibility Layer)
 *
 * This module provides backward-compatible access to template configuration.
 * New code should import from '@/server/whatsapp' directly.
 *
 * @deprecated Use '@/server/whatsapp' module instead.
 */

import {
  DAILY_WORKOUT_READY,
  DAILY_WORKOUT_EVENING,
  REST_DAY,
  FIRST_WORKOUT_WELCOME,
  STREAK_MILESTONE,
  REENGAGEMENT,
} from '@/server/whatsapp/templates';

/**
 * Get WhatsApp template names (registered with Meta).
 * These are the template names to use when sending via the Cloud API.
 */
export function getWhatsAppTemplates() {
  return {
    dailyWorkout: process.env.WHATSAPP_TEMPLATE_DAILY_WORKOUT || DAILY_WORKOUT_READY.name,
    dailyWorkoutEvening: process.env.WHATSAPP_TEMPLATE_DAILY_WORKOUT_EVENING || DAILY_WORKOUT_EVENING.name,
    restDay: process.env.WHATSAPP_TEMPLATE_REST_DAY || REST_DAY.name,
    welcome: process.env.WHATSAPP_TEMPLATE_WELCOME || FIRST_WORKOUT_WELCOME.name,
    streakMilestone: process.env.WHATSAPP_TEMPLATE_STREAK_MILESTONE || STREAK_MILESTONE.name,
    reengagement: process.env.WHATSAPP_TEMPLATE_REENGAGEMENT || REENGAGEMENT.name,
    weeklyCheckin: process.env.WHATSAPP_TEMPLATE_WEEKLY_CHECKIN || '',
    subscriptionReminder: process.env.WHATSAPP_TEMPLATE_SUBSCRIPTION_REMINDER || '',
  };
}

/**
 * Check if WhatsApp is enabled
 */
export function isWhatsAppEnabled(): boolean {
  return process.env.WHATSAPP_ENABLED === 'true';
}

/**
 * Get WhatsApp phone number from environment
 */
export function getWhatsAppPhoneNumber(): string {
  return process.env.WHATSAPP_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER || '';
}

/**
 * Template variable builders for each template type.
 *
 * Returns objects keyed by the variable names in TEMPLATE_VARIABLES,
 * ready to pass to sendTemplate() or WhatsAppCloudClient.sendMessage().
 */
export const templateBuilders = {
  dailyWorkout: (userName: string, workoutType: string, focus: string, date: string) => ({
    userName,
    workoutType,
    focus,
    date,
  }),

  dailyWorkoutEvening: (userName: string, workoutType: string, focus: string, date: string) => ({
    userName,
    workoutType,
    focus,
    date,
  }),

  restDay: (userName: string, currentDate: string, nextWorkoutDate: string) => ({
    userName,
    currentDate,
    nextWorkoutDate,
  }),

  welcome: (userName: string, workoutType: string, focus: string, date: string) => ({
    userName,
    workoutType,
    focus,
    date,
  }),

  streakMilestone: (userName: string, streakCount: string, workoutType: string, date: string) => ({
    userName,
    streakCount,
    workoutType,
    date,
  }),

  reengagement: (userName: string, daysInactive: string, workoutType: string, date: string) => ({
    userName,
    daysInactive,
    workoutType,
    date,
  }),
};

/**
 * Helper to check if a template name is configured
 */
export function isTemplateConfigured(templateName: keyof ReturnType<typeof getWhatsAppTemplates>): boolean {
  const templates = getWhatsAppTemplates();
  return !!templates[templateName];
}

/**
 * Get template name by key, throws if not configured
 */
export function getTemplateName(templateName: keyof ReturnType<typeof getWhatsAppTemplates>): string {
  const templates = getWhatsAppTemplates();
  const name = templates[templateName];

  if (!name) {
    throw new Error(`WhatsApp template "${templateName}" is not configured.`);
  }

  return name;
}
