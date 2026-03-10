'use client';

import { useMemo, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, MessageSquare, RefreshCw, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { COMMON_TIMEZONES, formatTimezoneForDisplay } from '@/shared/utils/timezone';
import { formatUSPhoneForDisplay } from '@/shared/utils/phoneUtils';

export interface AccountSettingsData {
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

type SubscriptionStatus = 'active' | 'cancel_pending' | 'canceled' | 'none';

interface AccountSettingsViewProps {
  userId: string;
  initialData: AccountSettingsData;
  subscriptionStatus: SubscriptionStatus;
}

interface AccountFormState {
  name: string;
  phoneNumber: string;
  gender: string;
  timezone: string;
  preferredSendHour: number;
  preferredMessagingProvider: '' | 'twilio' | 'whatsapp';
  smsConsent: boolean;
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const localDigits = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits;

  if (localDigits.length <= 3) {
    return localDigits;
  }

  if (localDigits.length <= 6) {
    return `(${localDigits.slice(0, 3)}) ${localDigits.slice(3)}`;
  }

  return `(${localDigits.slice(0, 3)}) ${localDigits.slice(3, 6)}-${localDigits.slice(6, 10)}`;
}

function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatSendHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

function buildFormState(data: AccountSettingsData): AccountFormState {
  return {
    name: data.name || '',
    phoneNumber: formatUSPhoneForDisplay(data.phoneNumber),
    gender: data.gender || '',
    timezone: data.timezone,
    preferredSendHour: data.preferredSendHour,
    preferredMessagingProvider: data.preferredMessagingProvider || '',
    smsConsent: data.smsConsent,
  };
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-stone-100 p-3 text-stone-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-stone-700">
      {children}
    </label>
  );
}

export function AccountSettingsView({ userId, initialData, subscriptionStatus }: AccountSettingsViewProps) {
  const [form, setForm] = useState<AccountFormState>(() => buildFormState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState('');
  const [unsubscribedPeriodEnd, setUnsubscribedPeriodEnd] = useState<string | null>(null);
  const [isResubscribing, setIsResubscribing] = useState(false);
  const [resubscribeError, setResubscribeError] = useState('');
  const [resubscribed, setResubscribed] = useState(false);

  const primaryTimezoneLabel = useMemo(() => {
    const options = new Set([form.timezone, ...COMMON_TIMEZONES]);
    return Array.from(options);
  }, [form.timezone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          phoneNumber: getPhoneDigits(form.phoneNumber),
          gender: form.gender.trim() || null,
          timezone: form.timezone,
          preferredSendHour: form.preferredSendHour,
          preferredMessagingProvider: form.preferredMessagingProvider || null,
          smsConsent: form.smsConsent,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to update your account.');
      }

      setForm(buildFormState(payload.data as AccountSettingsData));
      setSuccessMessage('Account settings updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update your account.');
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = form.name.trim().length >= 2
    && getPhoneDigits(form.phoneNumber).length >= 10
    && form.timezone.trim().length > 0;

  const handleUnsubscribe = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will stop receiving workout messages.'
    );
    if (!confirmed) return;

    setUnsubscribeError('');
    setIsUnsubscribing(true);

    try {
      const response = await fetch(`/api/users/${userId}/unsubscribe`, {
        method: 'POST',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to cancel subscription.');
      }

      setUnsubscribedPeriodEnd(payload.periodEndDate || null);
    } catch (err) {
      setUnsubscribeError(err instanceof Error ? err.message : 'Unable to cancel subscription.');
    } finally {
      setIsUnsubscribing(false);
    }
  }, [userId]);

  const handleResubscribe = useCallback(async () => {
    setResubscribeError('');
    setIsResubscribing(true);

    try {
      const response = await fetch(`/api/users/${userId}/resubscribe`, {
        method: 'POST',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to resubscribe.');
      }

      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }

      setResubscribed(true);
    } catch (err) {
      setResubscribeError(err instanceof Error ? err.message : 'Unable to resubscribe.');
    } finally {
      setIsResubscribing(false);
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-stone-500">Account</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">Your settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Update the basics we use for login, message delivery, and profile personalization.
              Consent and delivery rules can get stricter later without changing this UI.
            </p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Delivery snapshot</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-700">
              <span>{formatTimezoneForDisplay(form.timezone)}</span>
              <span className="text-stone-300">/</span>
              <span>{formatSendHour(form.preferredSendHour)}</span>
              <span className="text-stone-300">/</span>
              <span>{form.preferredMessagingProvider === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="space-y-6">
            <SectionCard
              title="Personal details"
              description="These fields power your login identity and the basics shown across your plan."
              icon={User}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="account-name">Name</FieldLabel>
                  <Input
                    id="account-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className="border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="account-phone">Phone number</FieldLabel>
                  <Input
                    id="account-phone"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      phoneNumber: formatPhoneInput(event.target.value),
                    }))}
                    placeholder="(555) 555-5555"
                    className="border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400"
                  />
                  <p className="mt-2 text-xs text-stone-500">
                    Verification codes and message delivery go to this number.
                  </p>
                </div>

                <div>
                  <FieldLabel htmlFor="account-gender">Gender</FieldLabel>
                  <Input
                    id="account-gender"
                    value={form.gender}
                    onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                    placeholder="Optional"
                    className="border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="account-timezone">Timezone</FieldLabel>
                  <select
                    id="account-timezone"
                    value={form.timezone}
                    onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {primaryTimezoneLabel.map((timezone) => (
                      <option key={timezone} value={timezone}>
                        {formatTimezoneForDisplay(timezone)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Messaging preferences"
              description="Choose when you want messages to land and which channel you want to prioritize."
              icon={MessageSquare}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="account-send-hour">Text message time</FieldLabel>
                  <TimeSelector
                    value={form.preferredSendHour}
                    onChange={(preferredSendHour) => setForm((current) => ({ ...current, preferredSendHour }))}
                  />
                  <p className="mt-2 text-xs text-stone-500">
                    Messages are scheduled using your selected timezone.
                  </p>
                </div>

                <div>
                  <FieldLabel htmlFor="account-provider">Message provider</FieldLabel>
                  <select
                    id="account-provider"
                    value={form.preferredMessagingProvider}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      preferredMessagingProvider: event.target.value as AccountFormState['preferredMessagingProvider'],
                    }))}
                    className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    <option value="">Default SMS</option>
                    <option value="twilio">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <p className="mt-2 text-xs text-stone-500">
                    Provider routing is saved now. More detailed behavior can be layered in later.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Consent"
              description="Store the user’s current consent state so downstream message logic has a single place to read from."
              icon={Shield}
            >
              <label className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input
                  type="checkbox"
                  checked={form.smsConsent}
                  onChange={(event) => setForm((current) => ({ ...current, smsConsent: event.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-300"
                />
                <span className="text-sm leading-6 text-stone-700">
                  I consent to receive recurring workout and accountability messages from GymText.
                  Message frequency may vary, and reply STOP behavior can be enforced more strictly when the messaging layer is expanded.
                </span>
              </label>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Save changes</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                This page persists user-level fields now. Scheduling and consent enforcement can be tightened later without reworking the form.
              </p>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{successMessage}</span>
                </div>
              )}

              <Button type="submit" disabled={!canSave || isSaving} className="mt-5 w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  'Save account settings'
                )}
              </Button>
            </section>
          </div>
        </form>

        {resubscribed ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your subscription has been reactivated. Welcome back!</span>
            </div>
          </div>
        ) : unsubscribedPeriodEnd ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Your subscription has been cancelled. You&apos;ll have access until {unsubscribedPeriodEnd}.
                A confirmation has been sent to your phone.
              </span>
            </div>
          </div>
        ) : subscriptionStatus === 'active' ? (
          <div className="mt-6">
            <section className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Cancel Subscription</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    This will stop all workout messages. Your subscription will remain active until
                    the end of your current billing period. You can resubscribe anytime by replying START.
                  </p>
                </div>
              </div>

              {unsubscribeError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {unsubscribeError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                className="w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isUnsubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Unsubscribe'
                )}
              </Button>
            </section>
          </div>
        ) : subscriptionStatus === 'cancel_pending' ? (
          <div className="mt-6">
            <section className="rounded-[28px] border border-amber-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Cancellation Pending</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Your subscription is set to cancel at the end of your current billing period.
                    You can resubscribe to keep receiving workout messages.
                  </p>
                </div>
              </div>

              {resubscribeError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {resubscribeError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="w-full"
              >
                {isResubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resubscribing...
                  </>
                ) : (
                  'Resubscribe'
                )}
              </Button>
            </section>
          </div>
        ) : (
          <div className="mt-6">
            <section className="rounded-[28px] border border-blue-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    {subscriptionStatus === 'canceled' ? 'Resubscribe' : 'Subscribe'}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Get personalized workout plans delivered daily via text message.
                  </p>
                </div>
              </div>

              {resubscribeError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {resubscribeError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleResubscribe}
                disabled={isResubscribing}
              >
                {isResubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  subscriptionStatus === 'canceled' ? 'Resubscribe' : 'Get Started'
                )}
              </Button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
