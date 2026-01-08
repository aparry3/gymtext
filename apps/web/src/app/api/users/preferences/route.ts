import { NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { isValidIANATimezone, formatTimezoneForDisplay } from '@/server/utils/timezone';
import { now } from '@/shared/utils/date';

// Mock auth for now - replace with your actual auth implementation
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // TODO: Implement actual authentication
  // For now, we'll check for a user ID in the headers (for testing)
  const userId = request.headers.get('x-user-id');
  return userId;
}

/**
 * GET /api/user/preferences
 * Returns the user's message delivery preferences
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const services = getServices();
    const user = await services.user.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate the next message delivery time
    const nowDt = now(user.timezone);
    let nextDelivery = nowDt.set({
      hour: user.preferredSendHour,
      minute: 0,
      second: 0,
      millisecond: 0
    });

    // If the time has already passed today, set it for tomorrow
    if (nextDelivery <= nowDt) {
      nextDelivery = nextDelivery.plus({ days: 1 });
    }

    return NextResponse.json({
      preferredSendHour: user.preferredSendHour,
      timezone: user.timezone,
      timezoneDisplay: formatTimezoneForDisplay(user.timezone),
      localTime: `${user.preferredSendHour}:00`,
      localTime12h: now(user.timezone)
        .set({ hour: user.preferredSendHour })
        .toFormat('h:mm a'),
      nextDelivery: nextDelivery.toISO(),
      nextDeliveryLocal: nextDelivery.toFormat('EEE, MMM d \'at\' h:mm a')
    });
    
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Updates the user's message delivery preferences
 */
export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { preferredSendHour, timezone } = body;
    
    // Validate inputs
    const errors: string[] = [];
    
    if (preferredSendHour !== undefined) {
      if (typeof preferredSendHour !== 'number' || 
          preferredSendHour < 0 || 
          preferredSendHour > 23) {
        errors.push('preferredSendHour must be a number between 0 and 23');
      }
    }
    
    if (timezone !== undefined) {
      if (typeof timezone !== 'string' || !isValidIANATimezone(timezone)) {
        errors.push('timezone must be a valid IANA timezone identifier');
      }
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }
    
    // Update preferences
    const updateData: { preferredSendHour?: number; timezone?: string } = {};

    if (preferredSendHour !== undefined) {
      updateData.preferredSendHour = preferredSendHour;
    }

    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }

    const services = getServices();
    const updatedUser = await services.user.updatePreferences(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
    
    // Calculate the next message delivery time
    const nowDt = now(updatedUser.timezone);
    let nextDelivery = nowDt.set({
      hour: updatedUser.preferredSendHour,
      minute: 0,
      second: 0,
      millisecond: 0
    });

    // If the time has already passed today, set it for tomorrow
    if (nextDelivery <= nowDt) {
      nextDelivery = nextDelivery.plus({ days: 1 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        preferredSendHour: updatedUser.preferredSendHour,
        timezone: updatedUser.timezone,
        timezoneDisplay: formatTimezoneForDisplay(updatedUser.timezone),
        localTime: `${updatedUser.preferredSendHour}:00`,
        localTime12h: now(updatedUser.timezone)
          .set({ hour: updatedUser.preferredSendHour })
          .toFormat('h:mm a'),
        nextDelivery: nextDelivery.toISO(),
        nextDeliveryLocal: nextDelivery.toFormat('EEE, MMM d \'at\' h:mm a')
      }
    });
    
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}