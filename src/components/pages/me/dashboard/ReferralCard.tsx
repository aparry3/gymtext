'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Gift, Users } from 'lucide-react';

interface ReferralCardProps {
  userId: string;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  completedReferrals: number;
  creditsEarned: number;
  creditsRemaining: number;
}

const MAX_CREDITS = 12;

export function ReferralCard({ userId }: ReferralCardProps) {
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

  if (isLoading) {
    return (
      <Card className="p-4 bg-card animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-full bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-4 bg-card">
        <div className="text-center text-sm text-muted-foreground">
          {error || 'Unable to load referral info'}
        </div>
      </Card>
    );
  }

  const progressPercentage = (stats.creditsEarned / MAX_CREDITS) * 100;

  return (
    <Card className="p-4 bg-card">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-[hsl(var(--sidebar-accent))]" />
          <span className="text-sm font-medium text-foreground">
            Refer Friends
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground">
          Share your link and you both get a free month!
        </p>

        {/* Referral Link */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 text-xs font-mono text-foreground truncate">
            {stats.referralLink}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--sidebar-accent))] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.completedReferrals} referred
            </span>
            <span>
              {stats.creditsEarned}/{MAX_CREDITS} months earned
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
