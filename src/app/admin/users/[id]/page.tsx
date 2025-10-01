'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminUser } from '@/types/admin'
import { FitnessProfile } from '@/server/models/user'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgramTab } from '@/components/pages/admin/ProgramTab'
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb'


export default function AdminUserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSendingWorkout, setIsSendingWorkout] = useState(false)

  // API data fetcher
  const fetchUser = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user')
      }

      const { user: fetchedUser, profile: fetchedProfile } = result.data

      setUser(fetchedUser)
      setProfile(fetchedProfile)
    } catch (err) {
      setError('Failed to load user')
      console.error('Error fetching user:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchUser(id as string)
    }
  }, [id, fetchUser])

  const handleCopyContact = useCallback(async () => {
    if (!user) return
    
    const contactInfo = `${user.name}\nEmail: ${user.email || 'None'}\nPhone: ${user.phoneNumber}\nTimezone: ${user.timezone}`
    
    try {
      await navigator.clipboard.writeText(contactInfo)
      // In a real app, you'd show a toast notification here
      console.log('Contact info copied to clipboard')
    } catch (err) {
      console.error('Failed to copy contact info:', err)
    }
  }, [user])

  const handleSendWorkout = useCallback(async () => {
    if (!user) return

    setIsSendingWorkout(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send daily message')
      }
      
      console.log('Daily message sent to user:', user.name)
    } catch (err) {
      console.error('Failed to send daily message:', err)
    } finally {
      setIsSendingWorkout(false)
    }
  }, [user])

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'User not found'}
          </p>
          <Button onClick={() => router.push('/admin/users')} variant="outline">
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??'

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1)
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
    }
    return phone
  }

  const formatMemberSince = (date: Date | string) => {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const diffTime = Math.abs(now.getTime() - dateObj.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    const months = Math.floor(diffDays / 30)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{user.name || 'Unnamed User'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
              <Button variant="outline" size="sm" onClick={handleCopyContact} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Contact
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/users/${user.id}/chat`)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button
                size="sm"
                onClick={handleSendWorkout}
                disabled={isSendingWorkout}
                className="gap-2"
              >
                <Send className={`h-4 w-4 ${isSendingWorkout ? 'animate-pulse' : ''}`} />
                {isSendingWorkout ? 'Sending...' : 'Send Daily Message'}
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
            value={formatMemberSince(user.createdAt)}
          />
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="program">Program</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Profile Content */}
            {profile ? (
              <div className="space-y-6">
                {/* Goals */}
                <ProfileSection
                  title="Goals"
                  icon={<Target className="h-5 w-5" />}
                >
                  <div className="space-y-2">
                    <div><strong>Primary Goal:</strong> {profile.goals.primary}</div>
                    <div><strong>Summary:</strong> {profile.goals.summary}</div>
                    <div><strong>Timeline:</strong> {profile.goals.timeline} weeks</div>
                  </div>
                </ProfileSection>

                {/* Availability & Equipment */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ProfileSection
                    title="Availability"
                    icon={<Calendar className="h-5 w-5" />}
                  >
                    <div className="space-y-2">
                      <div><strong>Frequency:</strong> {profile.availability?.daysPerWeek} days/week</div>
                      <div><strong>Session Length:</strong> {profile.availability?.minutesPerSession} minutes</div>
                      <div><strong>Preferred Times:</strong> {profile.availability?.preferredTimes?.join(', ') || 'Not specified'}</div>
                    </div>
                  </ProfileSection>

                  <ProfileSection
                    title="Equipment Access"
                    icon={<Dumbbell className="h-5 w-5" />}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>Gym Access:</strong>
                        {profile.equipmentAccess?.gymAccess ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={profile.equipmentAccess?.gymAccess ? "default" : "secondary"}>
                          {profile.equipmentAccess?.gymAccess ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div><strong>Gym Type:</strong> {profile.equipmentAccess?.gymType || 'Not specified'}</div>
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

                {/* Metrics & Activity Data */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ProfileSection
                    title="Metrics"
                    icon={<TrendingUp className="h-5 w-5" />}
                  >
                    <div className="space-y-2">
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
                        </div>
                      )}
                      {profile.metrics?.fitnessLevel && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Fitness Level:</strong> {profile.metrics.fitnessLevel.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </ProfileSection>

                  <ProfileSection
                    title="Activity Data"
                    icon={<Activity className="h-5 w-5" />}
                  >
                    <div className="space-y-3">
                      {profile.activities?.map((activity, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={activity.type === 'strength' ? 'default' : 'secondary'}>
                              {activity.type}
                            </Badge>
                            <Badge variant="outline">
                              {activity.experience}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Frequency:</strong> {activity.type === 'strength' ? activity.trainingFrequency : activity.frequency}x/week
                          </div>
                          {activity.type === 'strength' && activity.keyLifts && Object.keys(activity.keyLifts).length > 0 && (
                            <div className="text-sm">
                              <strong>Key lifts:</strong>{' '}
                              {Object.entries(activity.keyLifts)
                                .filter(([, weight]) => weight)
                                .map(([lift, weight]) => `${lift}: ${weight}lbs`)
                                .join(', ')}
                            </div>
                          )}
                          {activity.type === 'cardio' && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Activities:</strong> {activity.primaryActivities.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ProfileSection>
                </div>
              </div>
            ) : (
              <EmptyProfileState />
            )}
          </TabsContent>

          <TabsContent value="program">
            <ProgramTab userId={id as string} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}

interface QuickFactCardProps {
  icon: React.ReactNode
  label: string
  value: string
  muted?: boolean
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
  )
}

interface ProfileSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
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
  )
}

interface ConstraintCardProps {
  constraint: {
    id: string
    type: 'injury' | 'mobility' | 'medical' | 'preference'
    description: string
    severity?: 'mild' | 'moderate' | 'severe' | null
    affectedMovements?: string[] | null
    status: 'active' | 'resolved'
  }
}

function ConstraintCard({ constraint }: ConstraintCardProps) {
  const severityColors = {
    mild: 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-100',
    moderate: 'bg-orange-100 text-orange-800 border-orange-200 ring-orange-200',
    severe: 'bg-red-50 text-red-700 border-red-100 ring-red-100'
  }

  const statusColors = {
    active: 'bg-red-50 text-red-700',
    resolved: 'bg-green-50 text-green-700'
  }

  return (
    <div className={`rounded-xl border p-4 ring-1 ${constraint.severity ? severityColors[constraint.severity] : 'bg-gray-50 border-gray-100 ring-gray-100'}`}>
      <div className="mb-2 flex items-start justify-between">
        <h4 className="font-medium">{constraint.description}</h4>
        <Badge className={statusColors[constraint.status]} variant="secondary">
          {constraint.status}
        </Badge>
      </div>
      <div className="space-y-1 text-sm">
        <div><strong>Type:</strong> {constraint.type} • <strong>Severity:</strong> {constraint.severity || 'Not specified'}</div>
        {constraint.affectedMovements && constraint.affectedMovements.length > 0 && (
          <div><strong>Affected movements:</strong> {constraint.affectedMovements.join(', ')}</div>
        )}
      </div>
    </div>
  )
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
          This user hasn&apos;t completed their fitness profile yet.
        </p>
      </div>
    </Card>
  )
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
  )
}

// Simple icons (reused from main page)
const Copy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
)

const Send = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
)

const Mail = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
)

const Phone = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
)

const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const Calendar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const Target = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const Dumbbell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
)

const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
  </svg>
)

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
)

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
  </svg>
)

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)


const Weight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52 1.307.266 2.505 1.967 2.505 3.29 0 1.323-1.198 3.024-2.505 3.29a48.329 48.329 0 0 1-3-.52m-13.5 0c-1.01.143-2.01.317-3 .52-1.307.266-2.505 1.967-2.505 3.29 0 1.323 1.198 3.024 2.505 3.29a48.329 48.329 0 0 1 3-.52" />
  </svg>
)

const Ruler = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h18v4.5H3v-4.5ZM3 14.25h18v4.5H3v-4.5Z" />
  </svg>
)

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const MessageSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
)