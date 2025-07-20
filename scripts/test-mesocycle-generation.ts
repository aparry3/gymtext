#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { UserRepository } from '@/server/data/repositories/userRepository';
import { FitnessPlanRepository } from '@/server/data/repositories/fitnessPlanRepository';
import { MesocycleRepository } from '@/server/data/repositories/mesocycleRepository';
import { MicrocycleRepository } from '@/server/data/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/data/repositories/workoutInstanceRepository';
import { MesocycleGenerationService } from '@/server/services/fitness/mesocycleGenerationService';
import type { Macrocycle } from '@/shared/types/cycles';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testMesocycleGeneration() {
  console.log('🏋️ Testing Mesocycle Generation and Storage...\n');
  
  try {
    // Initialize repositories
    const userRepository = new UserRepository();
    const fitnessPlanRepository = new FitnessPlanRepository();
    const mesocycleRepository = new MesocycleRepository();
    const microcycleRepository = new MicrocycleRepository();
    const workoutInstanceRepository = new WorkoutInstanceRepository();
    
    // Initialize service
    const mesocycleService = new MesocycleGenerationService(
      mesocycleRepository,
      microcycleRepository,
      workoutInstanceRepository
    );
    
    // Find test user
    const user = await userRepository.findByPhoneNumber('+13392223571');
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    const userWithProfile = await userRepository.findWithProfile(user.id);
    if (!userWithProfile?.profile) {
      console.error('❌ User does not have a fitness profile');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name} (${user.id})`);
    
    // Get the latest fitness plan
    const activePlan = await fitnessPlanRepository.findActiveByClientId(user.id);
    if (!activePlan) {
      console.error('❌ No active fitness plan found');
      process.exit(1);
    }
    
    console.log(`✅ Found active fitness plan: ${activePlan.id}`);
    console.log(`   - Program Type: ${activePlan.programType}`);
    console.log(`   - Start Date: ${activePlan.startDate}`);
    
    // Check if mesocycles already exist
    const existingMesocycles = await mesocycleRepository.getMesocyclesByProgramId(activePlan.id);
    console.log(`\n📊 Existing mesocycles: ${existingMesocycles.length}`);
    
    if (existingMesocycles.length > 0) {
      console.log('⚠️  Mesocycles already exist for this plan. Skipping generation.');
      
      // Show existing data
      for (const meso of existingMesocycles) {
        console.log(`\n   Mesocycle: ${meso.phase}`);
        console.log(`   - ID: ${meso.id}`);
        console.log(`   - Weeks: ${meso.lengthWeeks}`);
        
        const microcycles = await microcycleRepository.getMicrocyclesByMesocycleId(meso.id);
        console.log(`   - Microcycles: ${microcycles.length}`);
        
        let totalWorkouts = 0;
        for (const micro of microcycles) {
          const workouts = await workoutInstanceRepository.getWorkoutsByMicrocycleId(micro.id);
          totalWorkouts += workouts.length;
        }
        console.log(`   - Total Workouts: ${totalWorkouts}`);
      }
      
      return;
    }
    
    // Generate mesocycles from the fitness plan
    console.log('\n🚀 Generating mesocycles from fitness plan...');
    const startTime = Date.now();
    
    const mesocycleIds = await mesocycleService.generateAllMesocycles(
      userWithProfile,
      activePlan.id,
      activePlan.macrocycles as Macrocycle[],
      activePlan.startDate,
      activePlan.programType
    );
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Generated ${mesocycleIds.length} mesocycles in ${duration}ms`);
    
    // Verify the data was stored correctly
    console.log('\n📊 Verifying stored data...');
    
    for (const mesocycleId of mesocycleIds) {
      const data = await mesocycleService.getCompleteMesocycle(mesocycleId);
      if (!data) {
        console.error(`❌ Failed to retrieve mesocycle ${mesocycleId}`);
        continue;
      }
      
      console.log(`\n✅ Mesocycle: ${data.mesocycle.phase}`);
      console.log(`   - ID: ${data.mesocycle.id}`);
      console.log(`   - Weeks: ${data.mesocycle.lengthWeeks}`);
      console.log(`   - Microcycles: ${data.microcycles.length}`);
      console.log(`   - Total Workouts: ${data.workouts.length}`);
      
      // Show first workout as example
      if (data.workouts.length > 0) {
        const firstWorkout = data.workouts[0];
        console.log(`\n   Example Workout:`);
        console.log(`   - ID: ${firstWorkout.id}`);
        console.log(`   - Date: ${firstWorkout.date}`);
        console.log(`   - Type: ${firstWorkout.sessionType}`);
      }
    }
    
    console.log('\n✅ Mesocycle generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the test
testMesocycleGeneration();