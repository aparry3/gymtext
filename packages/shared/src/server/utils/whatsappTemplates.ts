/**
 * WhatsApp Templates Utility
 *
 * Manages WhatsApp message templates and provides helper functions
 * for building template variables.
 *
 * Templates must be created and approved in Twilio Console before use.
 * Template SIDs are stored in environment variables.
 */

/**
 * Get WhatsApp template configuration from environment
 */
export function getWhatsAppTemplates() {
  return {
    dailyWorkout: process.env.WHATSAPP_TEMPLATE_DAILY_WORKOUT || '',
    weeklyCheckin: process.env.WHATSAPP_TEMPLATE_WEEKLY_CHECKIN || '',
    welcome: process.env.WHATSAPP_TEMPLATE_WELCOME || '',
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
 * Template variable builders
 */
export const templateBuilders = {
  /**
   * Build variables for daily workout template
   * Template: "Hi {{1}}! Your workout for {{2}} is ready. Reply when you're ready to start! 💪"
   */
  dailyWorkout: (userName: string, date: string) => ({
    '1': userName,
    '2': date,
  }),

  /**
   * Build variables for weekly check-in template
   * Template: "Hey {{1}}! How's your week going? Reply with any questions or feedback."
   */
  weeklyCheckin: (userName: string) => ({
    '1': userName,
  }),

  /**
   * Build variables for welcome template
   * Template: "Welcome to GymText, {{1}}! 🎉 Your personalized training starts now. Reply START when you're ready for your first workout."
   */
  welcome: (userName: string) => ({
    '1': userName,
  }),

  /**
   * Build variables for subscription reminder template
   * Template: "Hi {{1}}, your GymText subscription will renew on {{2}}. Reply STOP to cancel or CONTINUE to keep crushing your goals!"
   */
  subscriptionReminder: (userName: string, renewalDate: string) => ({
    '1': userName,
    '2': renewalDate,
  }),
};

/**
 * Helper to check if a template SID is configured
 */
export function isTemplateConfigured(templateName: keyof ReturnType<typeof getWhatsAppTemplates>): boolean {
  const templates = getWhatsAppTemplates();
  return !!templates[templateName];
}

/**
 * Get template SID by name, throws if not configured
 */
export function getTemplateSid(templateName: keyof ReturnType<typeof getWhatsAppTemplates>): string {
  const templates = getWhatsAppTemplates();
  const sid = templates[templateName];
  
  if (!sid) {
    throw new Error(`WhatsApp template "${templateName}" is not configured. Set WHATSAPP_TEMPLATE_${templateName.toUpperCase()} in environment.`);
  }
  
  return sid;
}
