import { UserWithProfile } from "@/server/models/userModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Experience level: ${user.parsedProfile?.experienceLevel || 'Not specified'}
- Training days: ${user.parsedProfile?.availability?.daysPerWeek || 'Not specified'} per week
- Fitness goals: ${user.parsedProfile?.primaryGoal || 'Not specified'}
- Equipment access: ${user.parsedProfile?.equipment?.access || 'Not specified'}
`
