#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';
import { UserRepository } from '@/server/repositories/userRepository';
import { onboardUser } from '@/server/agents/fitnessOutlineAgent';
import { FitnessProgram } from '@/server/models/fitnessPlan';
import { MesocyclePlan } from '@/server/models/mesocycle';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MesocycleGenerationService } from '@/server/services/mesocycleService';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Store the last created program for convenience
let lastProgram: FitnessProgram | null = null;

// Function to create a new fitness program
async function createProgram(options: {
  phone: string;
  date?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  console.log(chalk.blue('🏋️ Creating fitness program...'));
  console.log(chalk.gray(`Phone: ${options.phone}`));
  
  if (options.date) {
    console.log(chalk.gray(`Start date: ${options.date}`));
  }

  try {
    // Look up user by phone number
    const userRepository = new UserRepository();
    const user = await userRepository.findByPhoneNumber(options.phone);

    if (!user) {
      console.log(chalk.red('❌ Error: User not found with phone number'), options.phone);
      console.log(chalk.yellow('Make sure the user is registered in the system first.'));
      process.exit(1);
    }

    if (options.verbose) {
      console.log(chalk.gray(`Found user: ${user.id}`));
      console.log(chalk.gray(`Name: ${user.name}`));
    }

    // Call the onboard function which creates the program
    console.log(chalk.yellow('Generating fitness program...'));
    const programResult = await onboardUser({ userId: user.id });
    
    // Parse the program from the result
    // The result might be a stringified object or have "Outline: " prefix
    let programStr = '';
    if (typeof programResult === 'string') {
      programStr = programResult;
      if (programStr.startsWith('Outline: ')) {
        programStr = programStr.replace('Outline: ', '');
      }
    } else if (programResult && typeof programResult === 'object' && 'message' in programResult) {
      programStr = (programResult as { message: string }).message;
    } else {
      console.log(chalk.red('❌ Error: Unexpected program result format'));
      process.exit(1);
    }
    
    try {
      const program = JSON.parse(programStr) as FitnessProgram;
      lastProgram = program;
    } catch (parseError) {
      console.log(chalk.red('❌ Error parsing program JSON:'), (parseError as Error).message);
      console.log(chalk.gray('Program string:', programStr.substring(0, 100) + '...'));
      process.exit(1);
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(chalk.green(`\n✅ Program created successfully (${duration}ms)`));
    console.log(chalk.white(`Program ID: ${lastProgram!.programId}`));
    console.log(chalk.white(`Program Type: ${lastProgram!.programType}`));
    console.log(chalk.white(`Macrocycles: ${lastProgram!.macrocycles.length}`));
    
    if (lastProgram!.macrocycles[0]) {
      console.log(chalk.white(`Mesocycles in first macrocycle: ${lastProgram!.macrocycles[0].mesocycles.length}`));
      lastProgram!.macrocycles[0].mesocycles.forEach((meso, index) => {
        console.log(chalk.gray(`  ${index}: ${meso.phase} (${meso.weeks} weeks)`));
      });
    }

    if (options.verbose) {
      console.log(chalk.gray('\nFull program:'));
      console.log(JSON.stringify(lastProgram, null, 2));
    }

    return lastProgram!;

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    process.exit(1);
  }
}

// Function to test database storage of mesocycles
async function testDatabaseStorage(options: {
  phone: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  console.log(chalk.blue('💾 Testing mesocycle database storage...'));
  console.log(chalk.gray(`Phone: ${options.phone}`));
  
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
    
    // Find user
    const user = await userRepository.findByPhoneNumber(options.phone);
    if (!user) {
      console.log(chalk.red('❌ Error: User not found with phone number'), options.phone);
      process.exit(1);
    }
    
    const userWithProfile = await userRepository.findWithProfile(user.id);
    if (!userWithProfile?.profile) {
      console.log(chalk.red('❌ Error: User does not have a fitness profile'));
      process.exit(1);
    }
    
    console.log(chalk.gray(`Found user: ${user.name} (${user.id})`));
    
    // Get the latest fitness plan
    const activePlan = await fitnessPlanRepository.findActiveByClientId(user.id);
    if (!activePlan) {
      console.log(chalk.red('❌ Error: No active fitness plan found'));
      console.log(chalk.yellow('Create a fitness plan first using --create'));
      process.exit(1);
    }
    
    console.log(chalk.gray(`Active fitness plan: ${activePlan.id}`));
    console.log(chalk.gray(`Program Type: ${activePlan.programType}`));
    
    // Check if mesocycles already exist
    const existingMesocycles = await mesocycleRepository.getMesocyclesByProgramId(activePlan.id);
    console.log(chalk.gray(`Existing mesocycles: ${existingMesocycles.length}`));
    
    if (existingMesocycles.length > 0) {
      console.log(chalk.yellow('⚠️  Mesocycles already exist for this plan'));
      
      // Show existing data
      for (const meso of existingMesocycles) {
        console.log(chalk.white(`\nMesocycle: ${meso.phase}`));
        console.log(chalk.gray(`  ID: ${meso.id}`));
        console.log(chalk.gray(`  Weeks: ${meso.lengthWeeks}`));
        
        const microcycles = await microcycleRepository.getMicrocyclesByMesocycleId(meso.id);
        console.log(chalk.gray(`  Microcycles: ${microcycles.length}`));
        
        let totalWorkouts = 0;
        for (const micro of microcycles) {
          const workouts = await workoutInstanceRepository.getWorkoutsByMicrocycleId(micro.id);
          totalWorkouts += workouts.length;
        }
        console.log(chalk.gray(`  Total Workouts: ${totalWorkouts}`));
      }
      
      return;
    }
    
    // Generate mesocycles from the fitness plan
    console.log(chalk.yellow('\nGenerating mesocycles from fitness plan...'));
    
    const mesocycleIds = await mesocycleService.generateAllMesocycles(
      userWithProfile,
      activePlan.id,
      (activePlan.macrocycles as unknown) as Array<{
        id: string;
        mesocycles: MesocyclePlan[];
        startDate?: string;
        lengthWeeks: number;
      }>,
      activePlan.startDate,
      activePlan.programType
    );
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.log(chalk.green(`\n✅ Generated ${mesocycleIds.length} mesocycles in ${duration}ms`));
    
    // Verify the data was stored correctly
    console.log(chalk.yellow('\nVerifying stored data...'));
    
    for (const mesocycleId of mesocycleIds) {
      const data = await mesocycleService.getCompleteMesocycle(mesocycleId);
      if (!data) {
        console.log(chalk.red(`❌ Failed to retrieve mesocycle ${mesocycleId}`));
        continue;
      }
      
      console.log(chalk.white(`\nMesocycle: ${data.mesocycle.phase}`));
      console.log(chalk.gray(`  ID: ${data.mesocycle.id}`));
      console.log(chalk.gray(`  Weeks: ${data.mesocycle.lengthWeeks}`));
      console.log(chalk.gray(`  Microcycles: ${data.microcycles.length}`));
      console.log(chalk.gray(`  Total Workouts: ${data.workouts.length}`));
      
      // Show first workout as example
      if (data.workouts.length > 0 && options.verbose) {
        const firstWorkout = data.workouts[0];
        console.log(chalk.gray(`\n  Example Workout:`));
        console.log(chalk.gray(`    ID: ${firstWorkout.id}`));
        console.log(chalk.gray(`    Date: ${firstWorkout.date}`));
        console.log(chalk.gray(`    Type: ${firstWorkout.sessionType}`));
      }
    }
    
    console.log(chalk.green('\n✅ Database storage test completed successfully!'));
    
  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Function to breakdown a mesocycle
async function breakdownMesocycle(options: {
  phone: string;
  program?: FitnessProgram;
  mesocycleIndex?: number;
  date?: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  const apiUrl = options.url || 'http://localhost:3000/api/agent';
  
  console.log(chalk.blue('📊 Breaking down mesocycle...'));
  console.log(chalk.gray(`Phone: ${options.phone}`));

  try {
    // Look up user by phone number
    const userRepository = new UserRepository();
    const user = await userRepository.findByPhoneNumber(options.phone);

    if (!user) {
      console.log(chalk.red('❌ Error: User not found with phone number'), options.phone);
      process.exit(1);
    }

    // Use provided program or last created program
    const program = options.program || lastProgram;
    if (!program) {
      console.log(chalk.red('❌ Error: No program provided. Create a program first using --create'));
      process.exit(1);
    }

    const startDate = options.date ? new Date(options.date) : new Date();
    const dayOfWeek = startDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    console.log(chalk.gray(`Start date: ${startDate.toISOString().split('T')[0]} (${dayName})`));
    
    if (dayOfWeek !== 1) {
      const daysUntilMonday = (8 - dayOfWeek) % 7;
      console.log(chalk.yellow(`⚠️  Starting on ${dayName} - will create ${daysUntilMonday}-day transition microcycle`));
    }

    // If specific mesocycle index is provided, create a modified program with just that mesocycle
    let modifiedProgram = program;
    if (options.mesocycleIndex !== undefined) {
      const mesocycle = program.macrocycles[0]?.mesocycles[options.mesocycleIndex];
      if (!mesocycle) {
        console.log(chalk.red(`❌ Error: Mesocycle index ${options.mesocycleIndex} not found`));
        process.exit(1);
      }
      console.log(chalk.gray(`Breaking down mesocycle ${options.mesocycleIndex}: ${mesocycle.phase}`));
      
      // Create a modified program with just the selected mesocycle
      modifiedProgram = {
        ...program,
        macrocycles: [{
          ...program.macrocycles[0],
          mesocycles: [mesocycle]
        }]
      };
    }

    if (options.verbose) {
      console.log(chalk.gray(`\nProgram to process:`));
      console.log(JSON.stringify(modifiedProgram, null, 2));
    }

    // Call the breakdown API
    console.log(chalk.yellow('Generating detailed workouts...'));
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'breakdown-mesocycles',
        userId: user.id,
        program: modifiedProgram,
        startDate: startDate.toISOString(),
      }),
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }

    const responseData = await response.json();
    const resultProgram = responseData.program as FitnessProgram;

    console.log(chalk.green(`\n✅ Mesocycles broken down successfully (${duration}ms)`));
    
    // Display summary of generated workouts
    resultProgram.macrocycles.forEach((macro) => {
      macro.mesocycles.forEach((meso: any) => {
        console.log(chalk.white(`\nMesocycle: ${meso.phase}`));
        console.log(chalk.white(`Microcycles: ${meso.microcycles.length}`));
        
        meso.microcycles.forEach((micro: any, index: number) => {
          const workoutCount = micro.workouts.length;
          const workoutTypes = micro.workouts.map((w: any) => w.sessionType).join(', ');
          console.log(chalk.gray(`  Week ${micro.weekNumber}: ${workoutCount} workouts (${workoutTypes})`));
          
          if (index === 0 && micro.weekNumber === 0) {
            console.log(chalk.yellow(`    → Transition microcycle with ${workoutCount} days`));
          }
        });
      });
    });

    if (options.verbose) {
      console.log(chalk.gray('\nFull breakdown:'));
      console.log(JSON.stringify(resultProgram, null, 2));
    }

    return resultProgram;

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('Is your local server running? Try: pnpm dev'));
    }
    
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test-mesocycle')
  .description('Test fitness program creation and mesocycle breakdown')
  .version('1.0.0')
  .requiredOption('-p, --phone <phone>', 'Phone number of the user')
  .option('-c, --create', 'Create a new fitness program')
  .option('-b, --breakdown', 'Breakdown mesocycles into detailed workouts')
  .option('-s, --storage', 'Test database storage of mesocycles')
  .option('-m, --mesocycle <index>', 'Specific mesocycle index to breakdown (0-based)', parseInt)
  .option('-d, --date <date>', 'Start date (YYYY-MM-DD format)')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/agent')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    // Validate phone number format
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      console.log(chalk.red('Error: Invalid phone number format'));
      process.exit(1);
    }

    // Validate date format if provided
    if (options.date && !options.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(chalk.red('Error: Invalid date format. Use YYYY-MM-DD'));
      process.exit(1);
    }

    // Execute requested actions
    if (options.create && options.breakdown) {
      // Both: create then breakdown
      console.log(chalk.cyan('🔄 Creating program and breaking down mesocycles...\n'));
      const program = await createProgram(options);
      console.log(chalk.cyan('\n---\n'));
      await breakdownMesocycle({ ...options, program });
    } else if (options.create && options.storage) {
      // Create then test storage
      console.log(chalk.cyan('🔄 Creating program and testing database storage...\n'));
      await createProgram(options);
      console.log(chalk.cyan('\n---\n'));
      await testDatabaseStorage(options);
    } else if (options.create) {
      // Just create
      await createProgram(options);
    } else if (options.breakdown) {
      // Just breakdown (uses last created or needs manual program input)
      await breakdownMesocycle(options);
    } else if (options.storage) {
      // Just test storage
      await testDatabaseStorage(options);
    } else {
      console.log(chalk.red('Error: Specify --create, --breakdown, and/or --storage'));
      process.exit(1);
    }
  });

// Add examples to help
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --create');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --breakdown');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --storage');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --create --breakdown');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --create --storage');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --breakdown --mesocycle 0 --date 2025-01-22');
  console.log('  $ pnpm test:mesocycle -p +1234567890 --create --breakdown --date 2025-01-24 -v');
});

// Parse command line arguments
program.parse();