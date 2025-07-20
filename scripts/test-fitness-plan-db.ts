#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { onboardUser } from '@/server/agents/fitnessOutlineAgent';
import { UserRepository } from '@/server/repositories/userRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { Macrocycle } from '@/shared/types/cycles';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testFitnessPlanDatabase() {
  console.log('🏋️ Testing Fitness Plan Database Integration...\n');
  
  try {
    // Find Aaron user
    const userRepository = new UserRepository();
    const user = await userRepository.findByPhoneNumber('+13392223571');
    
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name} (${user.id})`);
    
    // Check if user has a fitness profile
    const userWithProfile = await userRepository.findWithProfile(user.id);
    if (!userWithProfile?.profile) {
      console.error('❌ User does not have a fitness profile');
      process.exit(1);
    }
    
    console.log('✅ User has fitness profile');
    console.log(`   - Goals: ${userWithProfile.profile.fitnessGoals}`);
    console.log(`   - Skill Level: ${userWithProfile.profile.skillLevel}`);
    console.log(`   - Exercise Frequency: ${userWithProfile.profile.exerciseFrequency}`);
    
    // Check existing fitness plans
    const fitnessPlanRepository = new FitnessPlanRepository();
    const existingPlans = await fitnessPlanRepository.findByClientId(user.id);
    console.log(`\n📊 Existing fitness plans: ${existingPlans.length}`);
    
    // Run onboarding
    console.log('\n🚀 Running onboarding process...');
    const startTime = Date.now();
    
    const result = await onboardUser({ userId: user.id });
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Onboarding completed in ${duration}ms`);
    
    // Check if plan was saved
    const newPlans = await fitnessPlanRepository.findByClientId(user.id);
    console.log(`\n📊 Fitness plans after onboarding: ${newPlans.length}`);
    
    if (newPlans.length > existingPlans.length) {
      const latestPlan = newPlans[0]; // Ordered by startDate desc
      console.log('\n✅ New fitness plan saved to database!');
      console.log(`   - ID: ${latestPlan.id}`);
      console.log(`   - Program Type: ${latestPlan.programType}`);
      console.log(`   - Start Date: ${latestPlan.startDate}`);
      console.log(`   - Overview: ${latestPlan.overview?.substring(0, 100)}...`);
      const macrocycles = latestPlan.macrocycles as Macrocycle[];
      console.log(`   - Macrocycles: ${macrocycles ? macrocycles.length : 0}`);
      
      // Show macrocycle details
      if (macrocycles) {
        macrocycles.forEach((macro, i) => {
        console.log(`\n   Macrocycle ${i + 1}:`);
        console.log(`   - ID: ${macro.id}`);
        console.log(`   - Length: ${macro.lengthWeeks} weeks`);
        console.log(`   - Mesocycles: ${macro.mesocycles.length}`);
        
        macro.mesocycles.forEach((meso, j) => {
          console.log(`     \n     Mesocycle ${j + 1}: ${meso.phase}`);
          console.log(`     - Duration: ${meso.weeks} weeks`);
          console.log(`     - Weekly Targets: ${meso.weeklyTargets.length}`);
        });
      });
      }
    } else {
      console.error('❌ No new fitness plan was created!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the test
testFitnessPlanDatabase();