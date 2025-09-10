import { UserWithProfile } from "@/server/models/userModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Primary Goal: ${user.parsedProfile?.goals?.primary || 'Not specified'}
- Training days: ${user.parsedProfile?.availability?.daysPerWeek || 'Not specified'} per week
- Session length: ${user.parsedProfile?.availability?.minutesPerSession || 'Not specified'} minutes
- Gym access: ${user.parsedProfile?.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
- Activities: ${user.parsedProfile?.activityData?.map(a => a.type).join(', ') || 'None specified'}
`
