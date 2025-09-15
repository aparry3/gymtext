/**
 * Example of the simplified sub-agent architecture
 */

import { extractGoalsData } from './goals/chain';
import { profilePatchTool } from '../tools/profilePatchTool';
import type { UserWithProfile } from '../../models/userModel';

/**
 * Example: Service calling sub-agent and applying the result
 */
export async function serviceExample() {
  // Mock user
  const user: UserWithProfile = {
    id: 'test-user',
    name: 'John Doe',
    age: 28,
    email: null,
    phoneNumber: '+1234567890',
    gender: null,
    profile: null,
    stripeCustomerId: null,
    preferredSendHour: 7,
    timezone: 'America/New_York',
    createdAt: new Date(),
    updatedAt: new Date(),
    parsedProfile: {
      goals: {
        primary: 'general-fitness',
        timeline: 12
      }
    } as any,  // eslint-disable-line @typescript-eslint/no-explicit-any
    info: []
  };

  const message = "I want to get in shape for ski season";

  // Step 1: Extract goals data from sub-agent (now type-safe!)
  const goalsResult = await extractGoalsData(message, user, { verbose: true });
  
  console.log('Goals extracted:', goalsResult);
  // goalsResult is now typed as GoalsExtractionResult with proper schema validation
  
  if (goalsResult.hasData && goalsResult.data) {
    console.log('Primary goal:', goalsResult.data.primary);  // Type-safe access!
    console.log('Specific objective:', goalsResult.data.specific);
    console.log('Timeline:', goalsResult.data.timeline);
  }

  // Step 2: Apply the extracted data via patch tool (if service wants to)
  if (goalsResult.hasData && goalsResult.confidence > 0.7) {
    const patchResult = await profilePatchTool.invoke({
      currentProfile: user.parsedProfile || {},
      updates: { goals: goalsResult.data },
      reason: goalsResult.reason,
      confidence: goalsResult.confidence
    });
    
    console.log('Patch applied:', patchResult);
    
    if (patchResult.applied) {
      // Update user's profile with the result
      console.log('Updated profile:', patchResult.updatedProfile);
    }
  }
}

/**
 * Example: Another agent calling multiple sub-agents
 */
export async function anotherAgentExample() {
  // Another agent could call multiple sub-agents and combine results
  const user = {} as UserWithProfile; // Mock user
  const message = "I want to lose 20 pounds and I go to Planet Fitness 3 times a week";
  
  // Call multiple sub-agents
  const goalsData = await extractGoalsData(message, user);
  // const activitiesData = await extractActivitiesData(message, user);  // When implemented
  // const environmentData = await extractEnvironmentData(message, user);  // When implemented
  
  // The calling agent/service decides how to combine and apply the results
  console.log('Multiple extractions:', {
    goals: goalsData,
    // activities: activitiesData,
    // environment: environmentData
  });
}

export { serviceExample, anotherAgentExample };