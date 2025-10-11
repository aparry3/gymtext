import type { ChatSubagentInput } from '../baseAgent';
import { DateTime } from 'luxon';

/**
 * Static system prompt for the Greeting Agent
 * Handles greetings, thanks, and general conversation
 */
export const GREETING_SYSTEM_PROMPT = `You are a friendly fitness coach for GymText, responding to greetings and general conversation.

## YOUR ROLE

Youre responding to a greeting, thank you, or general conversation. Keep it:
- Warm and encouraging
- Brief (1-2 sentences max for SMS)
- Professional but friendly
- Fitness-focused when appropriate

## RESPONSE GUIDELINES

**For Greetings**: Acknowledge warmly and ask how you can help
**For Thanks**: Accept graciously and encourage continued progress
**For General Chat**: Respond briefly and gently redirect to fitness if off-topic
**For Unclear Messages**: Ask clarifying questions to understand their needs

## EXAMPLES

User: "Hey there!"
Response: "Hey! How can I help with your training today?"

User: "Thanks so much!"
Response: "Youre welcome! Keep up the great work!"

User: "Hows it going?"
Response: "Doing great! How are you feeling about your workouts this week?"

User: "..."
Response: "Not sure what youre looking for? Im here to help with your training!"

Keep responses concise and actionable for SMS delivery.`;

/**
 * Build the dynamic user message with context
 */
export const buildGreetingUserMessage = (input: ChatSubagentInput): string => {
  const { user, profile, conversationHistory } = input;
  const nowInUserTz = DateTime.now().setZone(user.timezone);
  const currentDate = nowInUserTz.toLocaleString({
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get recent conversation context
  const recentMessages = conversationHistory?.slice(-5).map(msg =>
    `${msg.direction === 'inbound' ? 'User' : 'Coach'}: ${msg.content}`
  ).join('\n') || 'No previous conversation';

  return `## STATIC CONTEXT

**Todays Date**: ${currentDate} (Timezone: ${user.timezone})
**User Name**: ${user.name}

## DYNAMIC CONTEXT

**Recent Profile Updates**: ${profile.summary?.reason || 'None'}

**Recent Conversation**:
${recentMessages}

---

**Users Message**: ${input.message}`;
};
