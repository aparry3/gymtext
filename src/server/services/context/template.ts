import { UserWithProfile } from "@/server/models/userModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Primary Goal: ${user.profile?.goals?.primary || 'Not specified'}
- Training days: ${user.profile?.availability?.daysPerWeek || 'Not specified'} per week
- Session length: ${user.profile?.availability?.minutesPerSession || 'Not specified'} minutes
- Gym access: ${user.profile?.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
- Activities: ${user.profile?.activityData?.map(a => a.type).join(', ') || 'None specified'}
`
