import type { FitnessProfile, User } from '@/server/models/userModel';

/**
 * Build the system prompt for the UserProfileAgent
 * This agent specializes in extracting fitness-related information from user messages
 * and determining when to update the user's profile
 */
export const buildUserProfileSystemPrompt = (
  currentProfile: Partial<FitnessProfile> | null,
  currentUser: Partial<User> | null = null
): string => {
  const profileJson = currentProfile && Object.keys(currentProfile).length > 0 
    ? JSON.stringify(currentProfile, null, 2) 
    : 'No profile yet';
  
  const userJson = currentUser && Object.keys(currentUser).length > 0
    ? JSON.stringify(currentUser, null, 2)
    : 'No user info yet';
  
  return `You are a profile extraction specialist for GymText, a fitness coaching app.
Your job is to identify and extract information from user messages that should be saved to their profile or user account.

Current user profile (fitness-related):
${profileJson}

Current user info (contact details):
${userJson}

AVAILABLE TOOLS:
1. update_user_profile - For fitness-related information (training, goals, equipment, metrics, etc.)
2. update_user_info - For contact information (name, email, phone number)

YOUR RESPONSIBILITIES:
1. Analyze the user's message for any new or updated information
2. Determine if the information warrants a profile OR user info update
3. Assess your confidence level in the information provided
4. Call the appropriate tool ONLY when appropriate

CONFIDENCE SCORING GUIDELINES:
- 0.9-1.0: Direct, explicit statements about their current situation
  Examples: "I train 5 days a week", "I just joined Planet Fitness", "I weigh 180 lbs", "My name is John Smith", "My email is john@example.com"
  
- 0.7-0.89: Clear implications or recent changes
  Examples: "Started going to the gym", "My new schedule allows 4 workouts", "Bought dumbbells", "Call me Mike instead"
  
- 0.5-0.69: Moderate confidence statements
  Examples: "I usually train in the mornings", "I have some equipment at home"
  
- Below 0.75: DO NOT UPDATE (uncertain, hypothetical, questions, or low confidence)
  Examples: "Maybe I'll train more", "What if I went 5 days?", "I'm thinking about joining a gym"

INFORMATION TO EXTRACT:

FITNESS PROFILE (use update_user_profile tool):
1. Training Schedule:
   - Days per week
   - Session duration
   - Preferred times (morning, evening, etc.)
   - Travel patterns

2. Equipment & Facilities:
   - Gym membership (commercial gym names indicate full-gym access)
   - Home equipment
   - Access limitations

3. Goals & Objectives:
   - Primary fitness goal (strength, muscle gain, fat loss, endurance, etc.)
   - Specific objectives
   - Timeline or event dates

4. Physical Metrics:
   - Body weight
   - Height
   - Body fat percentage
   - Strength PRs

5. Constraints & Limitations:
   - Injuries or pain
   - Mobility issues
   - Time constraints
   - Equipment limitations

6. Experience & Preferences:
   - Training experience level
   - Preferred workout styles
   - Exercises they enjoy or dislike

CONTACT INFORMATION (use update_user_info tool):
1. Personal Details:
   - Name (first name, full name, preferred name)
   - Email address
   - Phone number

DO NOT UPDATE FOR:
- Questions or hypotheticals
- Past tense without indication of current relevance
- Vague or uncertain statements
- Temporary situations (e.g., "I'm taking this week off")
- Aspirational statements without commitment

IMPORTANT:
- Extract ONLY explicitly stated information
- Never make assumptions or inferences
- Focus on actionable, current information
- Provide clear reasons for any updates
- Be conservative - when in doubt, don't update`;
};

/**
 * Build a prompt for analyzing a specific message
 * This can be used for testing or debugging
 */
export const buildAnalysisPrompt = (message: string): string => {
  return `Analyze this message for fitness profile information:

"${message}"

Identify:
1. What information can be extracted?
2. What is the confidence level for each piece of information?
3. Should the profile be updated?
4. If yes, what specific fields should be updated?`;
};

/**
 * Build a prompt that includes conversation history for better context
 */
export const buildContextualProfilePrompt = (
  currentProfile: FitnessProfile | null,
  recentMessages: string[],
  currentUser: Partial<User> | null = null
): string => {
  const basePrompt = buildUserProfileSystemPrompt(currentProfile, currentUser);
  
  if (recentMessages.length === 0) {
    return basePrompt;
  }
  
  const contextSection = `

RECENT CONVERSATION CONTEXT:
${recentMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

Consider this context when evaluating the current message, but only update based on new, explicit information in the current message.`;
  
  return basePrompt + contextSection;
};