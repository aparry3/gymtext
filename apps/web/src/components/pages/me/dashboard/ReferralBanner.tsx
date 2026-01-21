'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralBannerProps {
  userId: string;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  completedReferrals: number;
  creditsEarned: number;
  creditsRemaining: number;
}

export function ReferralBanner({ userId }: ReferralBannerProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/users/${userId}/referral`);
      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch referral stats');
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      setError('Failed to load referral info');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCopy = async () => {
    if (!stats) return;

    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!stats) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GymText',
          text: 'Get a free month of personalized fitness coaching!',
          url: stats.referralLink,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg animate-pulse">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="h-6 w-24 bg-white/20 rounded-full" />
            <div className="h-8 w-64 bg-white/20 rounded" />
            <div className="h-4 w-80 bg-white/20 rounded" />
          </div>
          <div className="h-12 w-48 bg-white/20 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-blue-300 opacity-20 blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/30 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-blue-400/50">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Free Month
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Give a month, get a month free!
          </h2>
          <p className="text-blue-100 max-w-lg">
            Invite your gym partner to GymText. When they sign up, you both get a premium month on us.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center bg-blue-900/40 rounded-lg p-1 ring-1 ring-blue-400/30 w-full md:w-auto">
            <div className="px-4 py-2 text-blue-100 font-mono text-sm select-all truncate max-w-[200px] md:max-w-xs">
              {stats.referralLink}
            </div>
            <Button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition-all active:scale-95 font-medium shadow-md whitespace-nowrap"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Button
            onClick={handleShare}
            variant="ghost"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg ring-1 ring-white/30 transition-colors"
          >
            <Share2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
