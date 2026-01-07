'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type LoginStep = 'phone' | 'code';

export default function MeLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanedPhone = phoneNumber.replace(/\D/g, '');

      if (cleanedPhone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: `+1${cleanedPhone}` }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to send verification code');
        setIsLoading(false);
        return;
      }

      setStep('code');
    } catch (err) {
      console.error('Error requesting code:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (code.length !== 6) {
        setError('Please enter a 6-digit verification code');
        setIsLoading(false);
        return;
      }

      const cleanedPhone = phoneNumber.replace(/\D/g, '');

      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: `+1${cleanedPhone}`, code }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/me');
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/Wordmark.png"
              alt="GymText"
              width={162}
              height={36}
              className="h-9 w-auto"
            />
          </div>
          <p className="text-muted-foreground">
            {step === 'phone' ? 'Sign in to your account' : 'Enter your verification code'}
          </p>
        </div>

        {/* Card */}
        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestCode}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isLoading}
                    autoComplete="tel"
                    maxLength={14}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    We&apos;ll send you a 6-digit verification code
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send verification code'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Don&apos;t have an account? Sign up
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Check your phone for a 6-digit code
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and sign in'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change phone number
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
