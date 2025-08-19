import { UserWithProfile } from "@/server/models/userModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Experience level: ${user.parsedProfile?.skillLevel || 'Not specified'}
- Workout frequency: ${user.parsedProfile?.exerciseFrequency || 'Not specified'} times per week
- Age: ${user.parsedProfile?.age || 'Not specified'}
- Gender: ${user.parsedProfile?.gender || 'Not specified'}
- Fitness goals: ${user.parsedProfile?.fitnessGoals || 'Not specified'}
`
