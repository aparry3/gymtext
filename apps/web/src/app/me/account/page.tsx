import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptUserId } from '@/server/utils/sessionCrypto';
import { getServices } from '@/lib/context';
import { AccountSettingsView, type AccountSettingsData } from '@/components/pages/me/account/AccountSettingsView';

function normalizePreferredMessagingProvider(value: string | null | undefined): 'twilio' | 'whatsapp' | null {
  if (value === 'twilio' || value === 'whatsapp') {
    return value;
  }

  return null;
}

export default async function AccountPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('gt_user_session');

  if (!sessionCookie) {
    redirect('/me/login');
  }

  const userId = decryptUserId(sessionCookie.value);

  if (!userId) {
    redirect('/me/login');
  }

  const services = getServices();
  const [user, signupData] = await Promise.all([
    services.user.getUserById(userId),
    services.onboardingData.getSignupData(userId),
  ]);

  if (!user) {
    redirect('/api/auth/logout?redirect=/start');
  }

  const initialData: AccountSettingsData = {
    id: user.id,
    name: user.name || '',
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    timezone: user.timezone || 'America/New_York',
    preferredSendHour: user.preferredSendHour ?? 9,
    preferredMessagingProvider: normalizePreferredMessagingProvider(user.preferredMessagingProvider),
    smsConsent: signupData?.smsConsent ?? false,
    smsConsentedAt: signupData?.smsConsentedAt ?? null,
  };

  return <AccountSettingsView userId={userId} initialData={initialData} />;
}
