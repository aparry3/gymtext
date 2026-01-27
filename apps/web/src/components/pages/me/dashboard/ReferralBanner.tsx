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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-white/20 rounded" />
            <div className="h-3 w-32 bg-white/20 rounded" />
          </div>
          <div className="h-9 w-24 bg-white/20 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <h2 className="text-base font-bold text-white">
              Get a free month!
            </h2>
          </div>
          <p className="text-blue-100 text-sm">
            Share your link — when a friend signs up, you both get a free month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <Share2 size={16} />
            Share Link
          </Button>
          <Button
            onClick={handleCopy}
            variant="ghost"
            className="flex items-center justify-center p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg ring-1 ring-white/20 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
