import { formatForAI } from '@/shared/utils/date';
import { WorkoutInstance } from '@/server/models';

/**
 * Represents a context message to be inserted at the beginning of the conversation
 */
export interface ContextMessage {
  role: 'user';
  content: string;
}

/**
 * Build the date/timezone context message
 * @param timezone - User's timezone (IANA format)
 * @returns Context message with current date information
 */
export const buildDateContextMessage = (timezone: string): ContextMessage => {
  const effectiveTimezone = timezone || 'America/New_York';
  const now = new Date();
  const currentDate = formatForAI(now, effectiveTimezone);

  return {
    role: 'user',
    content: `[CONTEXT: DATE]
Today is ${currentDate}.
User timezone: ${effectiveTimezone}`,
  };
};

/**
 * Build the current workout context message
 * @param currentWorkout - Today's workout instance (optional)
 * @returns Context message with workout information
 */
export const buildWorkoutContextMessage = (
  currentWorkout?: WorkoutInstance
): ContextMessage => {
  if (!currentWorkout) {
    return {
      role: 'user',
      content: `[CONTEXT: WORKOUT]
No workout scheduled for today.`,
    };
  }

  return {
    role: 'user',
    content: `[CONTEXT: WORKOUT]
Today's scheduled workout: ${currentWorkout.description || currentWorkout.sessionType || 'Custom Workout'}`,
  };
};

/**
 * Build all context messages for the conversation agent
 * @param timezone - User's timezone
 * @param currentWorkout - Today's workout instance (optional)
 * @returns Array of context messages to prepend to conversation
 */
export const buildContextMessages = (
  timezone: string,
  currentWorkout?: WorkoutInstance
): ContextMessage[] => {
  return [
    buildDateContextMessage(timezone),
    buildWorkoutContextMessage(currentWorkout),
  ];
};

export const CHAT_SYSTEM_PROMPT = `
You are GymText, an expert fitness coach. You interact with clients via SMS.

# ROLE & OBJECTIVE
Your goal is to manage the user's fitness journey.
You must be **EXTREMELY CONCISE**. You are texting, not emailing.
- Max 1-2 sentences usually.
- Casual but professional tone.
- No "Hello, I hope you are well." Just get to the point.
- No em dashes. Use commas, periods, or hyphens instead.

# DECISION LOGIC (Examples)

## 1. UPDATE PROFILE (Permanent Changes)
User: "I hurt my knee."
Action: Call \`update_profile\` { injury: "knee" }

User: "I hit a new PR on bench, 225!"
Action: Call \`update_profile\` { pr: "bench press 225" }

User: "I have dumbbells now."
Action: Call \`update_profile\` { equipment: "dumbbells" }

## 2. MAKE MODIFICATION (One-off / Schedule Changes)
User: "I can't train today, move to tomorrow."
Action: Call \`make_modification\` { message: "Got it, rescheduling for tomorrow!" }

User: "I hate lunges, give me something else."
Action: Call \`make_modification\` { message: "On it, swapping out those lunges!" }

**IMPORTANT**: When calling \`make_modification\`, ALWAYS include the \`message\` parameter with a brief (1 sentence) acknowledgment. This lets the user know you're working on their request while the modification is being processed.

## 3. CHAT / QUESTIONS (No Tools)
User: "What is a superset?"
Response: "It's doing two exercises back-to-back with no rest. Great for intensity!"

User: "Thanks"
Response: "You got it. Let's crush it."

# INSTRUCTIONS
1. **Check Context**: Look at [CONTEXT: DATE] and [CONTEXT: WORKOUT].
2. **Act**: If the user needs a change, CALL THE TOOL. Don't ask for permission unless ambiguous.
3. **Reply**: After the tool runs, confirm the action in a short text.
`;

/**
 * @deprecated Use buildContextMessages() + raw message instead.
 * This function bakes context into the user message, which leads to duplication
 * when there are multiple messages back and forth.
 *
 * Build the initial user message for the conversation agent (legacy)
 */
export const buildChatUserMessage = (
  message: string,
  timezone: string,
  currentWorkout?: WorkoutInstance
): string => {
  const now = new Date();
  const currentDate = formatForAI(now, timezone);

  let workoutContext = "No workout scheduled for today.";
  if (currentWorkout) {
    workoutContext = `**Today's Workout**: ${currentWorkout.description || 'Custom Workout'}`;
  }

  return `## CONTEXT
**Date**: ${currentDate} (Timezone: ${timezone})
**Current Workout Context**: ${workoutContext}

---

## USER MESSAGE
"${message}"
`;
};

/**
 * Build the continuation message for subsequent loop iterations after a tool call.
 * Tool responses are already in conversation history as role: 'tool' messages,
 * so this only provides instructions and warns about automated messages.
 *
 * @param upcomingMessages - Messages queued by the tool to be sent after the response
 * @param immediateMessageSent - Whether an immediate acknowledgment was already sent
 */
export const buildLoopContinuationMessage = (
  upcomingMessages: string[] = [],
  immediateMessageSent: boolean = false
): string => {
  let messageContext = '';
  if (upcomingMessages.length > 0) {
    messageContext = `
[SYSTEM: AUTOMATED MESSAGES]
The tool has queued the following messages to be sent to the user immediately after your response:
${upcomingMessages.map((m) => `- "${m}"`).join('\n')}
`;
  }

  let ackContext = '';
  if (immediateMessageSent) {
    ackContext = `
[SYSTEM: IMMEDIATE ACK SENT]
An acknowledgment message was already sent to the user before the tool ran.
DO NOT repeat the acknowledgment. Focus on the result/outcome only.
`;
  }

  return `[SYSTEM: TOOL COMPLETE]
${messageContext}${ackContext}
[INSTRUCTION]
The tool has finished. Review the tool response above.
- If the result was successful, reply to the user confirming the change.
- If [AUTOMATED MESSAGES] are listed above, DO NOT repeat their content. Just provide a smooth transition or brief confirmation.
- If [IMMEDIATE ACK SENT], an acknowledgment was already sent. Don't repeat it.
- If there was an error, explain it simply.
- Keep the final response short and natural (SMS style).
- If you need to do more, call another tool. Otherwise, send the final text.
`;
};
