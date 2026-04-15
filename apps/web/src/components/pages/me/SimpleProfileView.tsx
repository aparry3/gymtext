'use client';

import { useMemo, useState, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { COMMON_TIMEZONES, formatTimezoneForDisplay } from '@/shared/utils/timezone';
import { formatUSPhoneForDisplay } from '@/shared/utils/phoneUtils';

export interface ProfileData {
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

interface SimpleProfileViewProps {
  userId: string;
  initialData: ProfileData;
}

interface FormState {
  name: string;
  phoneNumber: string;
  gender: string;
  timezone: string;
  preferredSendHour: number;
  preferredMessagingProvider: '' | 'twilio' | 'whatsapp';
  smsConsent: boolean;
}

function buildFormState(data: ProfileData): FormState {
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

export function SimpleProfileView({ userId, initialData }: SimpleProfileViewProps) {
  const [formState, setFormState] = useState<FormState>(() => buildFormState(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [copied, setCopied] = useState(false);

  const isDirty = useMemo(() => {
    const initial = buildFormState(initialData);
    return Object.keys(formState).some((key) => {
      const k = key as keyof FormState;
      return formState[k] !== initial[k];
    });
  }, [formState, initialData]);

  // Fetch referral code
  useMemo(() => {
    fetch(`/api/users/${userId}/referral`)
      .then(res => res.json())
      .then(data => {
        setReferralCode(data.data?.referralCode || null);
        setLoadingReferral(false);
      })
      .catch(() => setLoadingReferral(false));
  }, [userId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const payload = {
        name: formState.name.trim() || null,
        gender: formState.gender.trim() || null,
        timezone: formState.timezone,
        preferredSendHour: formState.preferredSendHour,
        preferredMessagingProvider: formState.preferredMessagingProvider || null,
      };

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setSubmitStatus('success');
      setSubmitMessage('Profile updated successfully');

      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, userId]);

  const handleCopyReferral = useCallback(() => {
    if (referralCode) {
      const url = `https://gymtext.com/start?ref=${referralCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralCode]);

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Refer Friends</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share your referral link and get 1 month free for each friend who subscribes.
          </p>
          {loadingReferral ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : referralCode ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-2 rounded text-sm font-mono text-gray-700">
                gymtext.com/start?ref={referralCode}
              </code>
              <Button
                onClick={handleCopyReferral}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No referral code available</p>
          )}
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={formState.name}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>

            {/* Phone (read-only) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="text"
                value={formState.phoneNumber}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={formState.gender}
                onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={formState.timezone}
                onChange={(e) => setFormState(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {formatTimezoneForDisplay(tz)}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Send Hour */}
            <div>
              <label htmlFor="sendHour" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Workout Send Time
              </label>
              <TimeSelector
                value={formState.preferredSendHour}
                onChange={(hour) => setFormState(prev => ({ ...prev, preferredSendHour: hour }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your daily workout will be sent at this time
              </p>
            </div>

            {/* Messaging Provider */}
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Messaging Provider
              </label>
              <select
                id="provider"
                value={formState.preferredMessagingProvider}
                onChange={(e) => setFormState(prev => ({ ...prev, preferredMessagingProvider: e.target.value as '' | 'twilio' | 'whatsapp' }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Auto (SMS)</option>
                <option value="twilio">SMS (Twilio)</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            {/* SMS Consent (read-only) */}
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex items-start gap-3">
                {formState.smsConsent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    SMS Consent: {formState.smsConsent ? 'Granted' : 'Not Granted'}
                  </p>
                  {initialData.smsConsentedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Since {new Date(initialData.smsConsentedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              {submitStatus !== 'idle' && (
                <div className={`flex items-center gap-2 text-sm ${submitStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {submitStatus === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span>{submitMessage}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
