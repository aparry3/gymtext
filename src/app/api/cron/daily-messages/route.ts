import { NextResponse } from 'next/server';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';

/**
 * Vercel Cron endpoint for sending daily workout messages
 * This runs hourly and processes all users whose local time matches their preferred hour
 */
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    
    // Check if running in production
    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;
      
      if (!cronSecret) {
        console.error('CRON_SECRET is not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    // Log the cron execution
    console.log(`[CRON] Daily messages cron triggered at ${new Date().toISOString()}`);
    
    // Create service instance with dependencies
    const userRepository = new UserRepository();
    const workoutRepository = new WorkoutInstanceRepository();
    const messageService = new MessageService();
    const dailyMessageService = new DailyMessageService(
      userRepository,
      workoutRepository,
      messageService
    );
    
    // Process the hourly batch
    const result = await dailyMessageService.processHourlyBatch();
    
    // Log results
    console.log(`[CRON] Daily messages completed:`, {
      processed: result.processed,
      failed: result.failed,
      duration: `${result.duration}ms`,
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString(),
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