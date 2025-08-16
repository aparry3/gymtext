import { NextResponse } from 'next/server';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

interface TestParams {
  testMode?: boolean;
  testHour?: number;      // 0-23 (UTC)
  testDate?: string;      // ISO date string
  testUserIds?: string[]; // Specific users to test
  dryRun?: boolean;       // Simulate without sending messages
}

/**
 * Vercel Cron endpoint for sending daily workout messages
 * This runs hourly and processes all users whose local time matches their preferred hour
 * 
 * Test mode parameters (development only):
 * - testMode: Enable test mode
 * - testHour: Override current UTC hour (0-23)
 * - testDate: Override current date (ISO string)
 * - testUserIds: Test specific users (comma-separated)
 * - dryRun: Process without sending actual messages
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Parse test parameters (only in non-production)
    const isProduction = process.env.NODE_ENV === 'production';
    let testParams: TestParams = {};
    
    if (!isProduction) {
      testParams = {
        testMode: searchParams.get('testMode') === 'true',
        testHour: searchParams.has('testHour') 
          ? parseInt(searchParams.get('testHour')!, 10) 
          : undefined,
        testDate: searchParams.get('testDate') || undefined,
        testUserIds: searchParams.get('testUserIds')
          ? searchParams.get('testUserIds')!.split(',')
          : undefined,
        dryRun: searchParams.get('dryRun') === 'true'
      };
      
      // Validate test hour if provided
      if (testParams.testHour !== undefined && 
          (testParams.testHour < 0 || testParams.testHour > 23)) {
        return NextResponse.json(
          { error: 'testHour must be between 0 and 23' },
          { status: 400 }
        );
      }
      
      // Validate test date if provided
      if (testParams.testDate && isNaN(Date.parse(testParams.testDate))) {
        return NextResponse.json(
          { error: 'testDate must be a valid ISO date string' },
          { status: 400 }
        );
      }
    }
    
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    
    // Check if running in production or test mode
    if (isProduction || (!testParams.testMode && process.env.NODE_ENV !== 'test')) {
      const cronSecret = process.env.CRON_SECRET;
      
      if (!cronSecret && isProduction) {
        console.error('CRON_SECRET is not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    // Log the cron execution
    const executionTime = testParams.testDate 
      ? new Date(testParams.testDate) 
      : new Date();
    
    console.log(`[CRON] Daily messages cron triggered`, {
      timestamp: executionTime.toISOString(),
      testMode: testParams.testMode || false,
      testHour: testParams.testHour,
      testDate: testParams.testDate,
      dryRun: testParams.dryRun || false,
      testUserIds: testParams.testUserIds
    });
    
    // Create service instance with dependencies
    const userRepository = new UserRepository();
    const workoutRepository = new WorkoutInstanceRepository();
    const messageService = new MessageService();
    const fitnessPlanRepository = new FitnessPlanRepository();
    const microcycleRepository = new MicrocycleRepository(postgresDb);
    const dailyMessageService = new DailyMessageService(
      userRepository,
      workoutRepository,
      messageService,
      fitnessPlanRepository,
      microcycleRepository
    );
    
    // Process the hourly batch with test parameters
    const result = await dailyMessageService.processHourlyBatch({
      currentUtcHour: testParams.testHour,
      currentDate: testParams.testDate ? new Date(testParams.testDate) : undefined,
      userFilter: testParams.testUserIds,
      dryRun: testParams.dryRun || false,
      testMode: testParams.testMode || false
    });
    
    // Log results
    console.log(`[CRON] Daily messages completed:`, {
      processed: result.processed,
      failed: result.failed,
      duration: `${result.duration}ms`,
      timestamp: executionTime.toISOString(),
      testMode: testParams.testMode || false
    });
    
    // Log any errors for monitoring
    if (result.errors.length > 0) {
      console.error('[CRON] Daily message errors:', result.errors);
    }
    
    // Return success response with metrics
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      duration: result.duration,
      timestamp: executionTime.toISOString(),
      // Include test parameters in response for debugging
      ...(testParams.testMode && { 
        testParams: {
          testMode: testParams.testMode,
          testHour: testParams.testHour,
          testDate: testParams.testDate,
          dryRun: testParams.dryRun,
          testUserIds: testParams.testUserIds
        }
      }),
      // Only include errors in non-production for security
      ...(process.env.NODE_ENV !== 'production' && { errors: result.errors })
    });
    
  } catch (error) {
    console.error('[CRON] Fatal error in daily messages cron:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Export config to set maximum duration for the function
export const maxDuration = 300; // 5 minutes (max for Vercel Hobby plan)