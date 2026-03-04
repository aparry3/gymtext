/**
 * Analytics Utilities
 *
 * Thin wrappers around PostHog for custom event tracking.
 * Import these instead of using posthog directly — makes it easy to
 * swap providers or add additional sinks later.
 */

import posthog from 'posthog-js';

// ─── Core tracking ───────────────────────────────────────────────────

/**
 * Track a custom event with optional properties.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return; // PostHog not initialized (missing key)
  posthog.capture(event, properties);
}

/**
 * Identify a user (links anonymous → known).
 * Call this when the user provides their phone number in the questionnaire.
 */
export function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.identify(distinctId, properties);
}

/**
 * Reset identity (e.g., on logout).
 */
export function resetAnalytics() {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.reset();
}

// ─── Landing page events ─────────────────────────────────────────────

export function trackCTAClicked(location: string, buttonText: string) {
  trackEvent('landing_cta_clicked', {
    section: location,
    button_text: buttonText,
  });
}

export function trackNavClicked(targetSection: string) {
  trackEvent('landing_nav_clicked', { target_section: targetSection });
}

export function trackSectionViewed(section: string) {
  trackEvent('landing_section_viewed', { section });
}

export function trackScrollDepth(depthPercent: number) {
  trackEvent('landing_scroll_depth', { depth_percent: depthPercent });
}

// ─── Questionnaire events ────────────────────────────────────────────

export function trackQuestionnaireStarted(props: {
  programId?: string;
  programName?: string;
  totalQuestions: number;
  wasRestored: boolean;
}) {
  trackEvent('questionnaire_started', props);
}

export function trackQuestionnaireStepViewed(props: {
  stepIndex: number;
  stepId: string;
  stepType: string;
  totalQuestions: number;
}) {
  trackEvent('questionnaire_step_viewed', {
    step_index: props.stepIndex,
    step_id: props.stepId,
    step_type: props.stepType,
    total_questions: props.totalQuestions,
  });
}

export function trackQuestionnaireStepCompleted(props: {
  stepIndex: number;
  stepId: string;
  stepType: string;
  timeOnStepSeconds: number;
}) {
  trackEvent('questionnaire_step_completed', {
    step_index: props.stepIndex,
    step_id: props.stepId,
    step_type: props.stepType,
    time_on_step_seconds: props.timeOnStepSeconds,
  });
}

export function trackQuestionnaireBackClicked(props: {
  fromStepIndex: number;
  toStepIndex: number;
}) {
  trackEvent('questionnaire_back_clicked', {
    from_step_index: props.fromStepIndex,
    to_step_index: props.toStepIndex,
  });
}

export function trackQuestionnaireAbandoned(props: {
  lastStepIndex: number;
  lastStepId: string;
  totalQuestions: number;
  completionPercentage: number;
}) {
  trackEvent('questionnaire_abandoned', {
    last_step_index: props.lastStepIndex,
    last_step_id: props.lastStepId,
    total_questions: props.totalQuestions,
    completion_percentage: props.completionPercentage,
  });
}

export function trackQuestionnaireCompleted(props: {
  programId?: string;
  totalQuestions: number;
  totalTimeSeconds: number;
}) {
  trackEvent('questionnaire_completed', {
    program_id: props.programId,
    total_questions: props.totalQuestions,
    total_time_seconds: props.totalTimeSeconds,
  });
}

export function trackQuestionnaireError(props: {
  stepId: string;
  errorMessage: string;
}) {
  trackEvent('questionnaire_error', {
    step_id: props.stepId,
    error_message: props.errorMessage,
  });
}

// ─── Conversion events ───────────────────────────────────────────────

export function trackSignupSubmitted(props: {
  hasProgram: boolean;
  messagingProvider: string;
}) {
  trackEvent('signup_submitted', {
    has_program: props.hasProgram,
    messaging_provider: props.messagingProvider,
  });
}

export function trackCheckoutRedirect() {
  trackEvent('checkout_redirect');
}
