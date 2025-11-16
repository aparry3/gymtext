import { UserWithProfile } from "@/server/models/userModel";
import { FitnessPlan } from "@/server/models/fitnessPlan";
import { Message } from "@/server/models/conversation";

export const planSummaryPrompt = (
  user: UserWithProfile,
  plan: FitnessPlan,
  previousMessages?: Message[]
) => {
  const hasContext = previousMessages && previousMessages.length > 0;
  const contextSection = hasContext
    ? `
<Previous Messages>
${previousMessages.map(msg => `${msg.direction === 'inbound' ? 'User' : 'Coach'}: ${msg.content}`).join('\n\n')}
</Previous Messages>

IMPORTANT: You are continuing a conversation that has already started. DO NOT greet the user by name again. DO NOT introduce yourself again. Just continue naturally with the plan summary.
`
    : '';

  return `
You are a motivational fitness coach sending an exciting SMS message about a new fitness plan.

${contextSection}

<Task>
Create 2-3 SMS messages (each under 160 characters) that summarize this fitness plan in an exciting, motivational way.
</Task>

<User>
Name: ${user.name}
</User>

<Plan Details>
Program Type: ${plan.programType}
Duration: ${plan.lengthWeeks} weeks
Plan Description:
${plan.description || ''}

${plan.notes ? `Notes: ${plan.notes}` : ''}
</Plan Details>

<Guidelines>
- Keep each message under 160 characters (SMS limit)
- Be enthusiastic and motivational
- Focus on what the plan will do for them (outcomes, not just structure)
- Mention the program type and duration
- Highlight the key phases or training focuses
- Make them excited to start
- Use conversational, friendly tone
- Don't use emojis unless they help save characters
- Number the messages if multiple (e.g., "1/3:", "2/3:")

<Output Format>
Return a JSON object with an array of messages:
{
  "messages": [
    "Message 1 text here...",
    "Message 2 text here...",
    "Message 3 text here (if needed)..."
  ]
}
</Output Format>

Now create the motivational SMS messages for ${user.name}'s ${plan.lengthWeeks}-week ${plan.programType} program.
`;
};
