/**
 * WhatsApp Message Template Definitions
 *
 * All 6 production-ready templates for Meta Business Cloud API submission.
 * Templates are categorized as UTILITY for cost optimization (~$0.006/msg vs $0.03/msg marketing).
 *
 * Template submission endpoint:
 *   POST https://graph.facebook.com/{VERSION}/{WABA_ID}/message_templates
 *
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplateButton {
  type: 'URL' | 'QUICK_REPLY' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppTemplateDefinition {
  /** Template name (lowercase, underscores only) */
  name: string;
  /** Display label */
  label: string;
  /** UTILITY or MARKETING */
  category: 'UTILITY' | 'MARKETING';
  language: string;
  components: WhatsAppTemplateComponent[];
  /** Example values for Meta approval */
  example: {
    header_text?: string[];
    body_text?: string[][];
    buttons_url?: string[];
  };
}

// ---------------------------------------------------------------------------
// Variable mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map of template name → ordered variable descriptions.
 * Consumers pass an object keyed by description and we convert to positional params.
 */
export type TemplateVariableMap = Record<string, string[]>;

export const TEMPLATE_VARIABLES: TemplateVariableMap = {
  daily_workout_ready_v1: ['userName', 'workoutType', 'focus', 'date'],
  daily_workout_ready_evening_v1: ['userName', 'workoutType', 'focus', 'date'],
  workout_streak_milestone_v1: ['userName', 'streakCount', 'workoutType', 'date'],
  rest_day_notification_v1: ['userName', 'currentDate', 'nextWorkoutDate'],
  first_workout_welcome_v1: ['userName', 'workoutType', 'focus', 'date'],
  workout_reengagement_v1: ['userName', 'daysInactive', 'workoutType', 'date'],
};

// ---------------------------------------------------------------------------
// Template Definitions
// ---------------------------------------------------------------------------

const BASE_URL = 'https://gymtext.app';

/**
 * Template 1: Daily Workout Notification (Primary — morning)
 */
export const DAILY_WORKOUT_READY: WhatsAppTemplateDefinition = {
  name: 'daily_workout_ready_v1',
  label: 'Daily Workout Ready',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: '💪 Workout Ready',
    },
    {
      type: 'BODY',
      text: "Good morning {{1}}! Your {{2}} workout is ready.\n\nToday's Focus: {{3}}\n\nTap below to view your exercises, sets, reps, and rest times.\n\nQuestions? Just reply and I'll help!",
    },
    {
      type: 'FOOTER',
      text: 'Reply STOP to pause workouts',
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: 'View My Workout',
          url: `${BASE_URL}/me?date={{1}}&source=whatsapp`,
        },
      ],
    },
  ],
  example: {
    header_text: ['💪 Workout Ready'],
    body_text: [['Aaron', 'Upper Body Push', 'Chest & Shoulders']],
    buttons_url: [`${BASE_URL}/me?date=2026-03-13&source=whatsapp`],
  },
};

/**
 * Template 2: Evening Workout Notification
 */
export const DAILY_WORKOUT_EVENING: WhatsAppTemplateDefinition = {
  name: 'daily_workout_ready_evening_v1',
  label: 'Evening Workout Ready',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: "🏋️ Tonight's Workout",
    },
    {
      type: 'BODY',
      text: 'Hey {{1}}! Your {{2}} workout is queued up and ready.\n\nFocus: {{3}}\n\nTap below to see the full plan before you head to the gym.\n\nHit me up if you need any changes!',
    },
    {
      type: 'FOOTER',
      text: 'Reply STOP to pause • HELP for support',
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: 'See Full Plan',
          url: `${BASE_URL}/me?date={{1}}&source=whatsapp`,
        },
      ],
    },
  ],
  example: {
    header_text: ["🏋️ Tonight's Workout"],
    body_text: [['Aaron', 'Leg Day', 'Squats & Deadlifts']],
    buttons_url: [`${BASE_URL}/me?date=2026-03-13&source=whatsapp`],
  },
};

/**
 * Template 3: Streak Milestone Celebration
 */
export const STREAK_MILESTONE: WhatsAppTemplateDefinition = {
  name: 'workout_streak_milestone_v1',
  label: 'Streak Milestone',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: '🔥 Streak Alert!',
    },
    {
      type: 'BODY',
      text: "{{1}}, you're on a {{2}}-day streak! 🎉\n\nYour {{3}} workout is ready. Keep the momentum going!\n\nTap below to continue your streak.\n\nHow are you feeling today?",
    },
    {
      type: 'FOOTER',
      text: 'Your progress matters!',
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: "Let's Go 💪",
          url: `${BASE_URL}/me?date={{1}}&source=whatsapp&streak={{2}}`,
        },
      ],
    },
  ],
  example: {
    header_text: ['🔥 Streak Alert!'],
    body_text: [['Aaron', '7', 'Push Day']],
    buttons_url: [`${BASE_URL}/me?date=2026-03-13&source=whatsapp&streak=7`],
  },
};

/**
 * Template 4: Rest Day / Active Recovery
 */
export const REST_DAY: WhatsAppTemplateDefinition = {
  name: 'rest_day_notification_v1',
  label: 'Rest Day',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: '😌 Rest Day',
    },
    {
      type: 'BODY',
      text: '{{1}}, your body needs recovery today.\n\nRest is when the magic happens — muscles rebuild stronger.\n\nCheck your recovery tips and next workout below.\n\nFeeling ready for tomorrow?',
    },
    {
      type: 'FOOTER',
      text: 'Recovery is training too!',
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: 'View Recovery Tips',
          url: `${BASE_URL}/recovery?date={{1}}`,
        },
        {
          type: 'URL',
          text: 'See Next Workout',
          url: `${BASE_URL}/me?date={{1}}`,
        },
      ],
    },
  ],
  example: {
    body_text: [['Aaron']],
    buttons_url: [
      `${BASE_URL}/recovery?date=2026-03-13`,
      `${BASE_URL}/me?date=2026-03-14`,
    ],
  },
};

/**
 * Template 5: First Workout Welcome (Onboarding)
 */
export const FIRST_WORKOUT_WELCOME: WhatsAppTemplateDefinition = {
  name: 'first_workout_welcome_v1',
  label: 'First Workout Welcome',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: '👋 Welcome to gymtext!',
    },
    {
      type: 'BODY',
      text: "{{1}}, your first workout is ready!\n\nToday: {{2}}\nFocus: {{3}}\n\nYou'll get your workout here every day. Tap below to get started.\n\nBefore you go — what's your #1 fitness goal?",
    },
    {
      type: 'FOOTER',
      text: "Let's crush this together 💪",
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: 'Start My First Workout',
          url: `${BASE_URL}/onboarding?step=first-workout&date={{1}}&source=whatsapp`,
        },
      ],
    },
  ],
  example: {
    header_text: ['👋 Welcome to gymtext!'],
    body_text: [['Aaron', 'Full Body Strength', 'Foundation Building']],
    buttons_url: [`${BASE_URL}/onboarding?step=first-workout&date=2026-03-13&source=whatsapp`],
  },
};

/**
 * Template 6: Re-engagement (Lapsed User)
 */
export const REENGAGEMENT: WhatsAppTemplateDefinition = {
  name: 'workout_reengagement_v1',
  label: 'Re-engagement',
  category: 'UTILITY',
  language: 'en_US',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: '👀 We Miss You',
    },
    {
      type: 'BODY',
      text: "{{1}}, it's been {{2}} days since your last workout.\n\nYour {{3}} plan is ready whenever you are.\n\nLife gets busy — no judgment! Just want to help you get back on track.\n\nWhat's been keeping you away?",
    },
    {
      type: 'FOOTER',
      text: 'Reply RESUME to restart • STOP to pause',
    },
    {
      type: 'BUTTONS',
      buttons: [
        {
          type: 'URL',
          text: 'Jump Back In',
          url: `${BASE_URL}/me?source=reengagement&date={{1}}`,
        },
      ],
    },
  ],
  example: {
    header_text: ['👀 We Miss You'],
    body_text: [['Aaron', '7', 'Upper Body']],
    buttons_url: [`${BASE_URL}/me?source=reengagement&date=2026-03-13`],
  },
};

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

export const ALL_TEMPLATES: WhatsAppTemplateDefinition[] = [
  DAILY_WORKOUT_READY,
  DAILY_WORKOUT_EVENING,
  STREAK_MILESTONE,
  REST_DAY,
  FIRST_WORKOUT_WELCOME,
  REENGAGEMENT,
];

export const TEMPLATE_BY_NAME: Record<string, WhatsAppTemplateDefinition> = Object.fromEntries(
  ALL_TEMPLATES.map((t) => [t.name, t])
);

// ---------------------------------------------------------------------------
// Template API payload builders
// ---------------------------------------------------------------------------

/**
 * Build the JSON payload for submitting a template to Meta's API.
 *
 * POST https://graph.facebook.com/{VERSION}/{WABA_ID}/message_templates
 */
export function buildTemplateSubmissionPayload(template: WhatsAppTemplateDefinition) {
  return {
    name: template.name,
    language: template.language,
    category: template.category,
    components: template.components,
  };
}

/**
 * Build the JSON payload for *sending* a template message to a user.
 *
 * POST https://graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/messages
 */
export function buildTemplateSendPayload(
  to: string,
  templateName: string,
  bodyVariables: string[],
  buttonUrlSuffixes?: string[]
) {
  const components: Array<Record<string, unknown>> = [];

  // Body parameters
  if (bodyVariables.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyVariables.map((v) => ({ type: 'text', text: v })),
    });
  }

  // Button URL parameters (for dynamic URL suffixes in URL buttons)
  if (buttonUrlSuffixes && buttonUrlSuffixes.length > 0) {
    buttonUrlSuffixes.forEach((suffix, idx) => {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: idx.toString(),
        parameters: [{ type: 'text', text: suffix }],
      });
    });
  }

  return {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en_US' },
      components,
    },
  };
}
