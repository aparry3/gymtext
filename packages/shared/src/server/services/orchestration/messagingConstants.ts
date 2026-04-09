/**
 * Messaging constants for SMS content
 */

export const buildWelcomeMessage = (brand: string = 'GymText'): string =>
  `Welcome to ${brand}! Ready to transform your fitness? We'll be texting you daily workouts starting soon. Msg & data rates may apply. Reply HELP for support or STOP to opt out.`;

export const WELCOME_MESSAGE = buildWelcomeMessage();

// STOP/UNSUBSCRIBE responses
export const STOP_CONFIRMATION =
  "You've been unsubscribed from GymText messages. You'll have access until {periodEndDate}. Reply START anytime to resubscribe.";
export const STOP_ALREADY_INACTIVE =
  "You don't have an active subscription. Visit gymtext.co to sign up!";
export const STOP_ERROR =
  "Sorry, there was an issue processing your request. Please try again or contact support.";

// START/opt-in responses
export const START_REACTIVATED =
  "Welcome back to GymText! Your subscription has been reactivated. You'll receive your next workout soon.";
export const START_ALREADY_ACTIVE =
  "Your subscription is already active! Reply with any question to continue. Msg & data rates may apply.";
export const START_REQUIRES_NEW_SUB =
  "Welcome back! Resubscribe here to get started: {checkoutUrl}";
export const START_NO_ACCOUNT =
  "Welcome! Sign up at gymtext.co to get started.";
export const START_ERROR =
  "Sorry, there was an issue processing your request. Visit gymtext.co to subscribe.";

// HELP response (10DLC required)
export const HELP_MESSAGE =
  "GymText - Personalized workout messages. Email support@gymtext.co or visit gymtext.co/help. STOP to cancel. Msg & data rates may apply.";

// Unknown user
export const UNKNOWN_USER_MESSAGE = "Sign up now! https://www.gymtext.co/";

// Subscription gate messages (inbound chat from users without active subscription)
export const NO_SUBSCRIPTION_INCOMPLETE_CHECKOUT =
  "Hey! It looks like you haven't finished setting up your GymText subscription. Complete checkout at gymtext.co to start getting personalized workouts!";

export const NO_SUBSCRIPTION_CANCELED =
  "Your GymText subscription has ended. Resubscribe at gymtext.co to get back to your workouts!";

export const NO_SUBSCRIPTION_CANCEL_PENDING =
  "Your GymText subscription has been canceled. Resubscribe at gymtext.co or reply START to reactivate!";
