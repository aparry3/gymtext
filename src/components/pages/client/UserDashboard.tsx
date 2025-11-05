'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types/admin';
import { FitnessProfile } from '@/server/models/user';
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
  Target,
  Dumbbell,
  Activity,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Ruler,
  Weight,
  CheckCircle,
  XCircle,
  UserIcon,
  LogOut,
} from 'lucide-react';

interface UserDashboardProps {
  userId: string;
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user data');
      }

      const { user: fetchedUser, profile: fetchedProfile } = result.data;

      setUser(fetchedUser);
      setProfile(fetchedProfile);
    } catch (err) {
      setError('Failed to load your profile');
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/me/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'User not found'}
          </p>
          <Button onClick={handleLogout} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const initials = user.name
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
                    <h1 className="text-2xl font-semibold">{user.name || 'Unnamed User'}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {user.age && (
                        <Badge variant="outline">{user.age} years old</Badge>
                      )}
                      {user.gender && (
                        <Badge variant="outline">{user.gender}</Badge>
                      )}
                      {user.timezone && (
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
              value={user.email || 'No email'}
              muted={!user.email}
            />
            <QuickFactCard
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={formatPhone(user.phoneNumber)}
            />
            <QuickFactCard
              icon={<Clock className="h-4 w-4" />}
              label="Preferred Send Hour"
              value={`${user.preferredSendHour}:00`}
            />
            <QuickFactCard
              icon={<Calendar className="h-4 w-4" />}
              label="Member Since"
              value={formatRelative(user.createdAt)}
            />
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="program" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="program">My Program</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="program">
              <ProgramTab userId={userId} basePath="/me" showAdminActions={false} />
            </TabsContent>

            <TabsContent value="profile">
              {/* Profile Content */}
              {profile ? (
                <div className="space-y-6">
                  {/* Goals */}
                  <ProfileSection
                    title="Goals"
                    icon={<Target className="h-5 w-5" />}
                  >
                    <div className="space-y-3">
                      {profile.goals.summary && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm italic">{profile.goals.summary}</p>
                        </div>
                      )}
                      <div><strong>Primary Goal:</strong> {profile.goals.primary}</div>
                      {profile.goals.timeline && (
                        <div><strong>Timeline:</strong> {profile.goals.timeline} weeks</div>
                      )}
                      {profile.goals.specific && (
                        <div><strong>Specific Goals:</strong> {profile.goals.specific}</div>
                      )}
                      {profile.goals.motivation && (
                        <div>
                          <strong>Motivation:</strong>
                          <p className="mt-1 text-muted-foreground">{profile.goals.motivation}</p>
                        </div>
                      )}
                    </div>
                  </ProfileSection>

                  {/* Availability & Equipment */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ProfileSection
                      title="Availability"
                      icon={<Calendar className="h-5 w-5" />}
                    >
                      <div className="space-y-2">
                        {profile.availability?.summary && (
                          <div className="p-2 bg-muted/30 rounded text-sm italic mb-2">
                            {profile.availability.summary}
                          </div>
                        )}
                        {profile.availability?.daysPerWeek && (
                          <div><strong>Frequency:</strong> {profile.availability.daysPerWeek} days/week</div>
                        )}
                        {profile.availability?.minutesPerSession && (
                          <div><strong>Session Length:</strong> {profile.availability.minutesPerSession} minutes</div>
                        )}
                        {profile.availability?.preferredTimes && profile.availability.preferredTimes.length > 0 && (
                          <div><strong>Preferred Times:</strong> {profile.availability.preferredTimes.join(', ')}</div>
                        )}
                      </div>
                    </ProfileSection>

                    <ProfileSection
                      title="Equipment Access"
                      icon={<Dumbbell className="h-5 w-5" />}
                    >
                      <div className="space-y-2">
                        {profile.equipmentAccess?.summary && (
                          <div className="p-2 bg-muted/30 rounded text-sm italic mb-2">
                            {profile.equipmentAccess.summary}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <strong>Gym Access:</strong>
                          {profile.equipmentAccess?.gymAccess ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant={profile.equipmentAccess?.gymAccess ? 'default' : 'secondary'}>
                            {profile.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        {profile.equipmentAccess?.gymType && (
                          <div><strong>Gym Type:</strong> {profile.equipmentAccess.gymType}</div>
                        )}
                        {profile.equipmentAccess?.homeEquipment && profile.equipmentAccess.homeEquipment.length > 0 && (
                          <div><strong>Home Equipment:</strong> {profile.equipmentAccess.homeEquipment.join(', ')}</div>
                        )}
                      </div>
                    </ProfileSection>
                  </div>

                  {/* Constraints */}
                  {profile.constraints && profile.constraints.length > 0 && (
                    <ProfileSection
                      title="Constraints"
                      icon={<AlertTriangle className="h-5 w-5" />}
                    >
                      <div className="space-y-3">
                        {profile.constraints.map((constraint) => (
                          <ConstraintCard key={constraint.id} constraint={constraint} />
                        ))}
                      </div>
                    </ProfileSection>
                  )}

                  {/* Metrics */}
                  <ProfileSection
                    title="Metrics"
                    icon={<TrendingUp className="h-5 w-5" />}
                  >
                    <div className="space-y-2">
                      {profile.metrics?.summary && (
                        <div className="p-2 bg-muted/30 rounded text-sm italic mb-2">
                          {profile.metrics.summary}
                        </div>
                      )}
                      {profile.metrics?.height && (
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Height:</strong> {profile.metrics.height} cm</span>
                        </div>
                      )}
                      {profile.metrics?.weight && (
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Weight:</strong> {profile.metrics.weight.value} {profile.metrics.weight.unit}</span>
                          {profile.metrics.weight.date && (
                            <span className="text-xs text-muted-foreground">
                              ({new Date(profile.metrics.weight.date).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}
                      {profile.metrics?.bodyComposition && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Body Fat:</strong> {profile.metrics.bodyComposition}%</span>
                        </div>
                      )}
                      {profile.metrics?.fitnessLevel && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">
                            {profile.metrics.fitnessLevel.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </ProfileSection>

                  {/* Activities */}
                  {profile.activities && profile.activities.length > 0 && (
                    <ProfileSection
                      title="Activities"
                      icon={<Activity className="h-5 w-5" />}
                    >
                      <div className="space-y-4">
                        {profile.activities.map((activity, index) => (
                          <ActivityCard key={index} activity={activity} />
                        ))}
                      </div>
                    </ProfileSection>
                  )}
                </div>
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

interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ProfileSection({ title, icon, children }: ProfileSectionProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

interface ConstraintCardProps {
  constraint: {
    id: string;
    type: 'injury' | 'mobility' | 'medical' | 'preference';
    description: string;
    severity?: 'mild' | 'moderate' | 'severe' | null;
    affectedMovements?: string[] | null;
    status: 'active' | 'resolved';
    startDate?: string | null;
    endDate?: string | null;
    isTemporary?: boolean;
  };
}

function ConstraintCard({ constraint }: ConstraintCardProps) {
  const severityColors = {
    mild: 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-100',
    moderate: 'bg-orange-100 text-orange-800 border-orange-200 ring-orange-200',
    severe: 'bg-red-50 text-red-700 border-red-100 ring-red-100',
  };

  const statusColors = {
    active: 'bg-red-50 text-red-700',
    resolved: 'bg-green-50 text-green-700',
  };

  return (
    <div
      className={`rounded-xl border p-4 ring-1 ${
        constraint.severity
          ? severityColors[constraint.severity]
          : 'bg-gray-50 border-gray-100 ring-gray-100'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="font-medium">{constraint.description}</h4>
        <div className="flex flex-col gap-1 items-end">
          <Badge className={statusColors[constraint.status]} variant="secondary">
            {constraint.status}
          </Badge>
          {constraint.isTemporary && (
            <Badge variant="outline" className="text-xs">
              Temporary
            </Badge>
          )}
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <div>
          <strong>Type:</strong> {constraint.type} • <strong>Severity:</strong>{' '}
          {constraint.severity || 'Not specified'}
        </div>
        {constraint.affectedMovements && constraint.affectedMovements.length > 0 && (
          <div>
            <strong>Affected movements:</strong> {constraint.affectedMovements.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityCardProps {
  activity: {
    type: 'strength' | 'cardio';
    summary?: string | null;
    experience: 'beginner' | 'intermediate' | 'advanced';
  } & (
    | {
        type: 'strength';
        trainingFrequency: number;
        currentProgram?: string | null;
        keyLifts?: Record<string, number> | null;
        preferences?: {
          workoutStyle?: string | null;
          likedExercises?: string[] | null;
          dislikedExercises?: string[] | null;
        } | null;
      }
    | {
        type: 'cardio';
        primaryActivities: string[];
        frequency?: number | null;
      }
  );
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={activity.type === 'strength' ? 'default' : 'secondary'}>
          {activity.type}
        </Badge>
        <Badge variant="outline">{activity.experience}</Badge>
      </div>

      {activity.summary && (
        <div className="p-2 bg-muted/30 rounded text-sm italic">{activity.summary}</div>
      )}

      {activity.type === 'strength' && (
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Training Frequency:</strong> {activity.trainingFrequency}x/week
          </div>
          {activity.currentProgram && (
            <div className="text-sm">
              <strong>Current Program:</strong> {activity.currentProgram}
            </div>
          )}
          {activity.keyLifts && Object.keys(activity.keyLifts).length > 0 && (
            <div className="text-sm">
              <strong>Key Lifts:</strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(activity.keyLifts).map(([lift, weight]) => (
                  <Badge key={lift} variant="outline" className="text-xs">
                    {lift}: {weight}lbs
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activity.type === 'cardio' && (
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Primary Activities:</strong> {activity.primaryActivities.join(', ')}
          </div>
          {activity.frequency && (
            <div className="text-sm">
              <strong>Frequency:</strong> {activity.frequency}x/week
            </div>
          )}
        </div>
      )}
    </div>
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
