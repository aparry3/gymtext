import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';
import { normalizeUSPhoneNumber, validateUSPhoneNumber } from '@/shared/utils/phoneUtils';
import { isValidTimezone } from '@/shared/utils/timezone';

interface AccountRouteData {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string | null;
  timezone: string;
  preferredSendHour: number;
  preferredMessagingProvider: 'twilio' | 'whatsapp' | null;
  smsConsent: boolean;
  smsConsentedAt: string | null;
}

function normalizePreferredMessagingProvider(value: string | null | undefined): 'twilio' | 'whatsapp' | null {
  if (value === 'twilio' || value === 'whatsapp') {
    return value;
  }

  return null;
}

function toAccountRouteData(
  user: {
    id: string;
    name: string | null;
    phoneNumber: string;
    gender: string | null;
    timezone: string;
    preferredSendHour: number;
    preferredMessagingProvider: string | null;
  },
  signupData: {
    smsConsent?: boolean;
    smsConsentedAt?: string;
  } | null
): AccountRouteData {
  return {
    id: user.id,
    name: user.name || '',
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    timezone: user.timezone,
    preferredSendHour: user.preferredSendHour,
    preferredMessagingProvider: normalizePreferredMessagingProvider(user.preferredMessagingProvider),
    smsConsent: signupData?.smsConsent ?? false,
    smsConsentedAt: signupData?.smsConsentedAt ?? null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const services = getServices();
    const [user, signupData] = await Promise.all([
      services.user.getUserById(userId),
      services.onboardingData.getSignupData(userId),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toAccountRouteData(user, signupData),
    });
  } catch (error) {
    console.error('Error fetching user account data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const services = getServices() as ReturnType<typeof getServices> & {
      onboardingData: {
        getSignupData: (userId: string) => Promise<{ smsConsent?: boolean; smsConsentedAt?: string } | null>;
        findByClientId: (userId: string) => Promise<{ signupData: { smsConsent?: boolean; smsConsentedAt?: string } | null } | null>;
        upsertSignupData: (
          userId: string,
          signupData: { smsConsent?: boolean; smsConsentedAt?: string }
        ) => Promise<{ signupData: { smsConsent?: boolean; smsConsentedAt?: string } | null }>;
      };
    };
    const existingUser = await services.user.getUserById(userId);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const userUpdates: {
      name?: string;
      phoneNumber?: string;
      gender?: string | null;
      timezone?: string;
      preferredSendHour?: number;
      preferredMessagingProvider?: 'twilio' | 'whatsapp' | null;
    } = {};
    const validationErrors: string[] = [];

    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2) {
        validationErrors.push('Name must be at least 2 characters long.');
      } else {
        userUpdates.name = body.name.trim();
      }
    }

    if ('phoneNumber' in body) {
      if (typeof body.phoneNumber !== 'string') {
        validationErrors.push('Phone number must be a string.');
      } else {
        const normalizedPhoneNumber = normalizeUSPhoneNumber(body.phoneNumber);
        if (!normalizedPhoneNumber || !validateUSPhoneNumber(normalizedPhoneNumber)) {
          validationErrors.push('Phone number must be a valid US phone number.');
        } else {
          userUpdates.phoneNumber = normalizedPhoneNumber;
        }
      }
    }

    if ('gender' in body) {
      if (body.gender !== null && typeof body.gender !== 'string') {
        validationErrors.push('Gender must be a string or null.');
      } else {
        userUpdates.gender = typeof body.gender === 'string' && body.gender.trim()
          ? body.gender.trim()
          : null;
      }
    }

    if ('timezone' in body) {
      if (typeof body.timezone !== 'string' || !isValidTimezone(body.timezone)) {
        validationErrors.push('Timezone must be a valid IANA timezone.');
      } else {
        userUpdates.timezone = body.timezone;
      }
    }

    if ('preferredSendHour' in body) {
      if (!Number.isInteger(body.preferredSendHour) || body.preferredSendHour < 0 || body.preferredSendHour > 23) {
        validationErrors.push('Preferred send hour must be an integer between 0 and 23.');
      } else {
        userUpdates.preferredSendHour = body.preferredSendHour;
      }
    }

    if ('preferredMessagingProvider' in body) {
      if (
        body.preferredMessagingProvider !== null
        && body.preferredMessagingProvider !== 'twilio'
        && body.preferredMessagingProvider !== 'whatsapp'
      ) {
        validationErrors.push('Preferred messaging provider must be twilio, whatsapp, or null.');
      } else {
        userUpdates.preferredMessagingProvider = normalizePreferredMessagingProvider(body.preferredMessagingProvider);
      }
    }

    if ('smsConsent' in body && typeof body.smsConsent !== 'boolean') {
      validationErrors.push('Message consent must be a boolean.');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: validationErrors[0], errors: validationErrors },
        { status: 400 }
      );
    }

    const userUpdatePromise = Object.keys(userUpdates).length > 0
      ? services.user.updateUser(userId, userUpdates)
      : Promise.resolve(existingUser);

    const signupDataPromise = typeof body.smsConsent === 'boolean'
      ? services.onboardingData.upsertSignupData(userId, {
          smsConsent: body.smsConsent,
          smsConsentedAt: body.smsConsent ? new Date().toISOString() : undefined,
        })
      : services.onboardingData.findByClientId(userId);

    const [updatedUser, onboardingRecord] = await Promise.all([userUpdatePromise, signupDataPromise]);
    const signupData = onboardingRecord?.signupData as { smsConsent?: boolean; smsConsentedAt?: string } | null;

    return NextResponse.json({
      success: true,
      data: toAccountRouteData(updatedUser, signupData),
    });
  } catch (error) {
    console.error('Error updating user account data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
