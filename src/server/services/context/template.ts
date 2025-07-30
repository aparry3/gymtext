import { UserWithProfile } from "@/server/models/userModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Experience level: ${user.profile?.skillLevel || 'Not specified'}
- Workout frequency: ${user.profile?.exerciseFrequency || 'Not specified'} times per week
- Age: ${user.profile?.age || 'Not specified'}
- Gender: ${user.profile?.gender || 'Not specified'}
- Fitness goals: ${user.profile?.fitnessGoals || 'Not specified'}
`
