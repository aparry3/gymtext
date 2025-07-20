import { UserWithProfile } from "@/shared/types/user";
import { welcomePrompt } from "./prompts";

export interface WelcomeMessageInput {
  user: UserWithProfile;
  fitnessPlanOverview: string;
}

export class WelcomeMessageAgent {
  async generateWelcomeMessage(input: WelcomeMessageInput): Promise<string> {
    const { user, fitnessPlanOverview } = input;
    
    // In a real implementation, this would call an LLM with the prompt
    // For now, we'll return the prompt as a placeholder
    const prompt = welcomePrompt(user, fitnessPlanOverview);
    
    // TODO: Implement LLM call here
    // const response = await llm.generate(prompt);
    // return response.text;
    
    return `Welcome message generation prompt created for ${user.name}`;
  }
}

export const welcomeMessageAgent = new WelcomeMessageAgent();