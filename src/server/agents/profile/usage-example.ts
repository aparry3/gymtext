/**
 * Example of the simplified sub-agent architecture
 */

import { extractGoalsData } from './goals/chain';
import { extractActivitiesData } from './activities/chain';
import { extractUserData } from './user/chain';
import { extractConstraintsData } from './constraints/chain';
import { extractEnvironmentData } from './environment/chain';
import { extractMetricsData } from './metrics/chain';
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
 * Example: Another agent calling ALL sub-agents
 */
export async function allSubAgentsExample() {
  // Mock comprehensive user message
  const user: UserWithProfile = {
    id: 'test-user-2',
    name: 'Jane Smith', 
    age: null,
    email: null,
    phoneNumber: '+1234567890',
    gender: null,
    profile: null,
    stripeCustomerId: null,
    preferredSendHour: 7,
    timezone: 'America/New_York',
    createdAt: new Date(),
    updatedAt: new Date(),
    parsedProfile: {},
    info: []
  } as UserWithProfile;

  const message = "Hi, I'm Sarah, 28 years old, female. I weigh 140 lbs and I'm 5'6\". I want to lose 15 pounds for my wedding in 6 months. I go to Planet Fitness 4 times a week for about 45 minutes each. I run marathons and also do strength training. I have a bad knee from an old injury so I avoid high-impact exercises. I prefer morning workouts around 6am EST.";
  
  console.log('🧪 Testing ALL sub-agents with comprehensive message\n');

  // Call all sub-agents in parallel
  const [
    goalsResult,
    activitiesResult, 
    userResult,
    constraintsResult,
    environmentResult,
    metricsResult
  ] = await Promise.all([
    extractGoalsData(message, user),
    extractActivitiesData(message, user),
    extractUserData(message, user),
    extractConstraintsData(message, user),
    extractEnvironmentData(message, user),
    extractMetricsData(message, user)
  ]);
  
  console.log('🎯 Goals:', goalsResult.hasData ? goalsResult.data : 'None');
  console.log('🏃 Activities:', activitiesResult.hasData ? activitiesResult.data : 'None');
  console.log('👤 User:', userResult.hasData ? userResult.data : 'None');  
  console.log('🚨 Constraints:', constraintsResult.hasData ? constraintsResult.data : 'None');
  console.log('🏋️ Environment:', environmentResult.hasData ? environmentResult.data : 'None');
  console.log('📏 Metrics:', metricsResult.hasData ? metricsResult.data : 'None');
  
  return {
    goals: goalsResult,
    activities: activitiesResult,
    user: userResult,
    constraints: constraintsResult,
    environment: environmentResult,
    metrics: metricsResult
  };
}

export { serviceExample, allSubAgentsExample };