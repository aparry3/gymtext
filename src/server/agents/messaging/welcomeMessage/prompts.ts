import { FitnessPlan } from '@/server/models/fitnessPlan';
import { UserWithProfile } from '@/server/models/userModel';

// Add a welcomePrompt template for generating a personalized welcome message
export const welcomePrompt = (user: UserWithProfile, fitnessPlan: FitnessPlan) => `
You are a friendly and motivating fitness coach. Your task is to write a welcome message for a new client, using their name and a summary of their fitness plan.

Heres the information you should use:

* Client Name: ${user.name}
* Fitness Plan Overview: ${fitnessPlan.overview}

Your message should:

* Be addressed to the client using their name.
* Start with an enthusiastic and welcoming tone.
* Briefly summarize the key components of their fitness plan, highlighting the variety of workouts (e.g., strength training, cardio, HIIT).
* Emphasize how the plan is designed to help them achieve their specific fitness goals (e.g., weight loss, muscle gain, improved endurance).
* Express your excitement about working with them and your confidence in their success.
* Maintain a professional but encouraging and supportive tone.
* Be no more than 900 characters in length.

Example:

Client Name: Aaron
Fitness Plan Overview: Hey Aaron, great to connect with you! Ive put together a preliminary overview of a workout plan designed to help you crush your goals of losing weight, building muscle, boosting your endurance, and achieving overall fantastic fitness. Given your advanced skill level and commitment to training four times a week, were going to create a dynamic and challenging program that will deliver excellent results. Our approach will be a well-structured combination of different training modalities to keep things engaging, maximize fat loss, stimulate muscle growth, and significantly improve your cardiovascular capacity. Here’s what you can expect as the primary components of your training plan: Comprehensive Strength Training: Well incorporate compound exercises targeting major muscle groups (think squats, deadlifts, presses, rows) along with isolation exercises to sculpt and define specific muscles. Given your advanced level, well focus on progressive overload, varied rep ranges, and potentially incorporate advanced techniques like supersets or drop sets to maximize muscle hypertrophy and strength gains. Strategic Cardiovascular Exercise: To torch calories, improve your endurance, and enhance cardiovascular health, well integrate a mix of steady-state cardio and potentially more intense interval training. This will ensure were effectively burning fat while building a strong aerobic base. High-Intensity Interval Training (HIIT): Knowing your advanced level, HIIT will be a powerful tool in our arsenal. These short bursts of intense exercise followed by brief recovery periods are incredibly effective for fat loss and boosting your metabolic rate. Well strategically incorporate HIIT sessions to complement our strength training. Dedicated Flexibility and Mobility Work: To ensure optimal recovery, prevent injury, and improve your overall movement quality, well include regular stretching and mobility exercises. This might involve dynamic stretching before workouts and static stretching afterward, as well as specific exercises to address any areas of tightness or limited range of motion. This overview provides a general framework. As we move forward, well develop detailed weekly schedules that will specify the exact exercises, sets, reps, and rest periods. Im really excited to work with you, Aaron, and Im confident that with your dedication, well achieve remarkable progress together! Lets get started!

Expected Output:

Hey Aaron, great to connect! Im thrilled to introduce you to your personalized fitness journey, designed to help you achieve your goals of losing weight, building muscle, boosting endurance, and achieving overall fantastic fitness. This plan, tailored to your advanced skill level and commitment to training four times a week, incorporates a dynamic combination of training approaches to maximize your results. You can expect a well-structured program that includes comprehensive strength training, strategic cardiovascular exercise, high-intensity interval training (HIIT), and dedicated flexibility and mobility work. Im really excited to work with you, and Im confident that with your dedication, well achieve remarkable progress together! Lets get started!
`; 

export const onboardingPrompt = (user: UserWithProfile) => `
Create an onboarding guidance message for ${user.name}.

<User Profile>
- Name: ${user.name}
- Goals: ${user.profile?.goals?.primary || 'General fitness'}
- Training Days: ${user.profile?.availability?.daysPerWeek || 'Not specified'} per week
- Session Length: ${user.profile?.availability?.minutesPerSession || 'Not specified'} minutes
- Gym Access: ${user.profile?.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
</User Profile>

<Instructions>
1. Acknowledge their commitment to fitness
2. Explain how their personalized program will work
3. Mention key features (workout plans, progress tracking, coaching)
4. Set realistic expectations for results
5. Encourage them to ask questions
6. Keep conversational and under 250 characters
7. End with excitement for their journey

Create an informative onboarding message.
`;

export const programReadyPrompt = (user: UserWithProfile, programOverview: string) => `
Create a message announcing that ${user.name}s fitness program is ready.

<User Info>
- Name: ${user.name}
- Goals: ${user.profile?.goals?.primary || 'General fitness'}
- Gym Access: ${user.profile?.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
</User Info>

<Program Overview>
${programOverview}
</Program Overview>

<Instructions>
1. Announce their program is ready with excitement
2. Include a brief summary of whats included
3. Mention the personalization for their goals
4. Encourage them to start their first workout
5. Keep under 300 characters for SMS
6. Create anticipation for results

Generate a program announcement message.
`;

export const firstWorkoutPrompt = (user: UserWithProfile, firstWorkout: { name?: string; focus?: string; estimatedDuration?: string }) => `
Create a message for ${user.name}s first workout.

<User Info>
- Name: ${user.name}
- Gym Access: ${user.profile?.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
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
4. Remind them its okay to start slow
5. Include tips for beginners if applicable
6. Keep under 200 characters for SMS
7. Make it feel achievable and exciting

Generate a first workout motivation message.
`;