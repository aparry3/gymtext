'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgramTab } from '@/components/pages/admin/ProgramTab';
import { formatRelative } from '@/shared/utils/date';
import {
  Mail,
  Phone,
  Clock,
  Calendar,
  MapPin,
  UserIcon,
  LogOut,
} from 'lucide-react';
import { AdminUser } from '@/components/admin/types';

interface UserDashboardProps {
  userId: string;
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed' | null>(null);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  // Fetch user data - called immediately and independently of onboarding
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user data');
      }

      const { user: fetchedUser, profile: fetchedProfile } = result.data;

      setUser(fetchedUser);
      setProfile(fetchedProfile || null);
    } catch (err) {
      setError('Failed to load your profile');
      console.error('Error fetching user:', err);
    } finally {
      setIsLoadingUser(false);
    }
  }, [userId]);

  // Fetch onboarding status - used for polling and showing progress
  const fetchOnboardingStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}/onboarding-status`);
      const result = await response.json();

      if (response.ok) {
        setOnboardingStatus(result.onboardingStatus);
        setCurrentStep(result.currentStep || null);

        // Return true if onboarding completed (signals to stop polling)
        return result.onboardingStatus === 'completed' || result.onboardingStatus === 'failed';
      }
      return false;
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      return false;
    }
  }, [userId]);

  // Initial load: fetch user data immediately
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Separate effect: poll onboarding status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      const isComplete = await fetchOnboardingStatus();

      // Stop polling if completed or failed
      if (isComplete && pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    // Initial status check
    pollStatus();

    // Poll every 3 seconds
    pollInterval = setInterval(pollStatus, 3000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [fetchOnboardingStatus]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/me/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Show skeleton only while loading user data initially
  if (isLoadingUser) {
    return <UserDetailSkeleton />;
  }

  // Show error state if user data failed to load or onboarding failed
  if (error || onboardingStatus === 'failed') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'There was an error setting up your program. Please contact support.'}
          </p>
          <Button onClick={handleLogout} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">User not found</p>
          <Button onClick={handleLogout} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* User Header */}
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div>
                    <h1 className="text-2xl font-semibold">{user?.name || 'Unnamed User'}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {user?.age && (
                        <Badge variant="outline">{user.age} years old</Badge>
                      )}
                      {user?.gender && (
                        <Badge variant="outline">{user.gender}</Badge>
                      )}
                      {user?.timezone && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.timezone.split('/')[1]?.replace('_', ' ') || user.timezone}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Facts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickFactCard
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user?.email || 'No email'}
              muted={!user?.email}
            />
            <QuickFactCard
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={formatPhone(user?.phoneNumber || '')}
            />
            <QuickFactCard
              icon={<Clock className="h-4 w-4" />}
              label="Preferred Send Hour"
              value={`${user?.preferredSendHour || 0}:00`}
            />
            <QuickFactCard
              icon={<Calendar className="h-4 w-4" />}
              label="Member Since"
              value={formatRelative(user?.createdAt || new Date())}
            />
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="program" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="program">My Program</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="program">
              <ProgramTab
                userId={userId}
                basePath="/me"
                showAdminActions={false}
                onboardingStatus={onboardingStatus}
                currentStep={currentStep}
              />
            </TabsContent>

            <TabsContent value="profile">
              {/* Profile Content */}
              {profile ? (
                <Card className="p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{profile}</pre>
                </Card>
              ) : (
                <EmptyProfileState />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper components (reusing from admin page)
interface QuickFactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}

function QuickFactCard({ icon, label, value, muted = false }: QuickFactCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`font-medium ${muted ? 'text-muted-foreground' : ''}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function EmptyProfileState() {
  return (
    <Card className="p-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Profile Data</h3>
        <p className="text-muted-foreground">
          You haven&apos;t completed your fitness profile yet.
        </p>
      </div>
    </Card>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
