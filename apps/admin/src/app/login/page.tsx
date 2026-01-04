'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import Image from 'next/image';
import { Bebas_Neue } from 'next/font/google';

const bn = Bebas_Neue({ weight: '400', subsets: ['latin'] });

type LoginStep = 'phone' | 'code';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/users';

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

      // Redirect to admin dashboard or next URL
      router.push(nextUrl);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-400" />
            <Image
              src="/IconInverse.png"
              alt="GymText Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <h1 className={`text-4xl font-bold italic text-white ${bn.className}`}>
              GYMTEXT
            </h1>
          </div>
          <p className="text-gray-300 text-lg font-semibold mb-1">
            Admin Access
          </p>
          <p className="text-gray-400 text-sm">
            {step === 'phone' ? 'Enter your authorized phone number' : 'Enter your verification code'}
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 bg-gray-800/50 border-gray-700 backdrop-blur">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestCode}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-200">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    disabled={isLoading}
                    autoComplete="tel"
                    maxLength={14}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Only authorized admin phone numbers can access this system
                  </p>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send verification code'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2 text-gray-200">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-center text-2xl tracking-widest font-mono"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    Check your phone for a 6-digit code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || code.length !== 6}
                >
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
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
