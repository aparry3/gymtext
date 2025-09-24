import { UserWithProfile } from "@/server/models/userModel";

export const conversationSummaryPrompt = (user: UserWithProfile, messages: string): string => {
  return `
    Summarize the following conversation between a user and a fitness coach.
    Your summary should be as concise as possible—ideally a single sentence or less. Focus on capturing only the most important information about the client that emerges from the conversation.
    The conversation is as follows:
    ${messages}
  `;
};