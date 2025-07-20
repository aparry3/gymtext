import { UserWithProfile } from "@/server/models/_types";

export const dailyMotivationPrompt = (
  user: UserWithProfile,
  weeklyStats: { totalWorkouts: number; completedWorkouts: number; streak: number }
) => `
Create a motivational daily message for ${user.name}.

<User Profile>
- Name: ${user.name}
- Fitness Level: ${user.profile?.skillLevel || 'Not specified'}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
- Workout Frequency: ${user.profile?.exerciseFrequency || 'Not specified'} per week
</User Profile>

<Weekly Progress>
- Scheduled Workouts: ${weeklyStats.totalWorkouts}
- Completed Workouts: ${weeklyStats.completedWorkouts}
- Current Streak: ${weeklyStats.streak} days
- Completion Rate: ${weeklyStats.totalWorkouts > 0 ? Math.round((weeklyStats.completedWorkouts / weeklyStats.totalWorkouts) * 100) : 0}%
</Weekly Progress>

<Instructions>
1. Create an uplifting, personalized motivation message
2. Reference their progress and achievements when positive
3. Encourage consistency if they're behind on goals
4. Include a fitness tip or mindset reminder
5. Keep it conversational and under 160 characters for SMS
6. Use 1-2 appropriate emojis (💪, 🔥, 🌟, ⚡)
7. End with encouragement for the day ahead

Generate a daily motivation message that inspires action.
`;

export const workoutReminderPrompt = (
  user: UserWithProfile,
  todaysWorkout: any
) => `
Create a workout reminder message for ${user.name}.

<Today's Workout>
- Name: ${todaysWorkout.name}
- Focus: ${todaysWorkout.focus}
- Duration: ${todaysWorkout.estimatedDuration || 'Not specified'}
- Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
</Today's Workout>

<User Info>
- Name: ${user.name}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
</User Info>

<Instructions>
1. Create a friendly reminder about today's scheduled workout
2. Include specific workout details
3. Add motivational element to encourage completion
4. Keep under 160 characters for SMS
5. Use appropriate workout emojis (💪, 🏋️, ⏰)
6. Make it sound exciting and achievable

Generate an engaging workout reminder.
`;

export const progressCheckPrompt = (
  user: UserWithProfile,
  weeklyStats: { totalWorkouts: number; completedWorkouts: number; streak: number }
) => `
Create a progress check-in message for ${user.name}.

<Weekly Progress Summary>
- Scheduled Workouts: ${weeklyStats.totalWorkouts}
- Completed: ${weeklyStats.completedWorkouts}
- Success Rate: ${weeklyStats.totalWorkouts > 0 ? Math.round((weeklyStats.completedWorkouts / weeklyStats.totalWorkouts) * 100) : 0}%
- Current Streak: ${weeklyStats.streak} days
</Weekly Progress Summary>

<User Goals>
- Primary Goals: ${user.profile?.fitnessGoals || 'General fitness'}
- Target Frequency: ${user.profile?.exerciseFrequency || 'Not specified'} per week
</User Goals>

<Instructions>
1. Acknowledge their progress (positive or areas for improvement)
2. Celebrate successes or gently encourage consistency
3. Reference their specific fitness goals
4. Ask a engaging question to promote reflection
5. Keep under 200 characters for SMS
6. Use progress emojis (📈, 🎯, 💪, 🌟)
7. End with encouragement for continued progress

Create a supportive progress check-in message.
`;

export const celebrationPrompt = (
  user: UserWithProfile,
  achievement: string,
  milestone?: number
) => `
Create a celebration message for ${user.name}'s achievement.

<Achievement>
${achievement}
${milestone ? `Milestone: ${milestone}` : ''}
</Achievement>

<User Info>
- Name: ${user.name}
- Goals: ${user.profile?.fitnessGoals || 'General fitness'}
</User Info>

<Instructions>
1. Celebrate their specific achievement enthusiastically
2. Acknowledge the effort and dedication it took
3. Connect it to their broader fitness goals
4. Keep it energetic and under 150 characters
5. Use celebration emojis (🎉, 🏆, 🔥, 💪)
6. End with encouragement to keep going

Generate an exciting celebration message.
`;