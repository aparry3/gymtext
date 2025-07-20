import { UserWithProfile } from "@/server/models/userModel";

export const welcomePrompt = (user: UserWithProfile) => `
Create a warm welcome message for ${user.name} who just signed up for GymText.

<User Information>
- Name: ${user.name}
- Fitness Level: ${user.profile?.skillLevel || 'Not specified'}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
- Experience: ${user.profile?.exerciseFrequency || 'Not specified'} workouts per week
</User Information>

<Instructions>
1. Create a friendly, enthusiastic welcome
2. Reference their specific fitness goals if provided
3. Briefly explain what GymText offers
4. Set expectations for personalized coaching
5. Include a call to action for next steps
6. Keep under 200 characters for SMS
7. Use welcoming emojis (👋, 🎯, 💪)
8. Make them feel excited about their fitness journey

Generate a welcoming onboarding message.
`;

export const onboardingPrompt = (user: UserWithProfile) => `
Create an onboarding guidance message for ${user.name}.

<User Profile>
- Name: ${user.name}
- Fitness Level: ${user.profile?.skillLevel || 'Not specified'}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
- Workout Frequency: ${user.profile?.exerciseFrequency || 'Not specified'} per week
- Age: ${user.profile?.age || 'Not specified'}
</User Profile>

<Instructions>
1. Acknowledge their commitment to fitness
2. Explain how their personalized program will work
3. Mention key features (workout plans, progress tracking, coaching)
4. Set realistic expectations for results
5. Encourage them to ask questions
6. Keep conversational and under 250 characters
7. Use motivational emojis (🎯, 💪, 🌟)
8. End with excitement for their journey

Create an informative onboarding message.
`;

export const programReadyPrompt = (user: UserWithProfile, programOverview: string) => `
Create a message announcing that ${user.name}'s fitness program is ready.

<User Info>
- Name: ${user.name}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
- Level: ${user.profile?.skillLevel || 'Beginner'}
</User Info>

<Program Overview>
${programOverview}
</Program Overview>

<Instructions>
1. Announce their program is ready with excitement
2. Include a brief summary of what's included
3. Mention the personalization for their goals
4. Encourage them to start their first workout
5. Keep under 300 characters for SMS
6. Use program-related emojis (📋, 🎯, 💪, 🚀)
7. Create anticipation for results

Generate a program announcement message.
`;

export const firstWorkoutPrompt = (user: UserWithProfile, firstWorkout: { name?: string; focus?: string; estimatedDuration?: string }) => `
Create a message for ${user.name}'s first workout.

<User Info>
- Name: ${user.name}
- Fitness Level: ${user.profile?.skillLevel || 'Beginner'}
</User Info>

<First Workout>
- Name: ${firstWorkout?.name || 'Your first workout'}
- Focus: ${firstWorkout?.focus || 'Getting started'}
- Duration: ${firstWorkout?.estimatedDuration || '30-45 minutes'}
</First Workout>

<Instructions>
1. Build excitement for their first workout
2. Include workout details and what to expect
3. Provide encouragement and support
4. Remind them it's okay to start slow
5. Include tips for beginners if applicable
6. Keep under 200 characters for SMS
7. Use encouraging emojis (💪, 🌟, 🔥)
8. Make it feel achievable and exciting

Generate a first workout motivation message.
`;