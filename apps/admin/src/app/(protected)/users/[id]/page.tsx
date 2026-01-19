'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminUser, SignupData } from '@/components/admin/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgramTab } from '@/components/pages/admin/ProgramTab'
import { ChainToolsTab } from '@/components/pages/admin/ChainToolsTab'
import { formatRelative } from '@/shared/utils/date'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'


export default function AdminUserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [profile, setProfile] = useState<string | null>(null)
  const [signupData, setSignupData] = useState<SignupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSendingWorkout, setIsSendingWorkout] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [phoneConfirmation, setPhoneConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false)
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null)

  // API data fetcher
  const fetchUser = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user')
      }

      const { user: fetchedUser, profile: fetchedProfile, signupData: fetchedSignupData } = result.data

      setUser(fetchedUser)
      setProfile(fetchedProfile || null)
      setSignupData(fetchedSignupData || null)
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

  const handleTriggerDailyCron = useCallback(async () => {
    setIsSendingWorkout(true)
    try {
      const response = await fetch('/api/cron/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to trigger daily cron')
      }

      console.log('Daily cron triggered:', result)
    } catch (err) {
      console.error('Failed to trigger daily cron:', err)
    } finally {
      setIsSendingWorkout(false)
    }
  }, [])

  const handleDeleteUser = useCallback(async () => {
    if (!user) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete user')
      }

      // Redirect to users list on success
      router.push('/users')
    } catch (err) {
      console.error('Failed to delete user:', err)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }, [user, router])

  const handleOpenDeleteModal = useCallback(() => {
    setPhoneConfirmation('')
    setDeleteError(null)
    setIsDeleteModalOpen(true)
  }, [])

  const handleOpenUnsubscribeModal = useCallback(() => {
    setUnsubscribeError(null)
    setIsUnsubscribeModalOpen(true)
  }, [])

  const handleUnsubscribe = useCallback(async () => {
    if (!user) return

    setIsUnsubscribing(true)
    setUnsubscribeError(null)

    try {
      const response = await fetch(`/api/users/${user.id}/unsubscribe`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to unsubscribe user')
      }

      // Close modal and refresh user data
      setIsUnsubscribeModalOpen(false)
      fetchUser(user.id)
    } catch (err) {
      console.error('Failed to unsubscribe user:', err)
      setUnsubscribeError(err instanceof Error ? err.message : 'Failed to unsubscribe user')
    } finally {
      setIsUnsubscribing(false)
    }
  }, [user, fetchUser])

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
          <Button onClick={() => router.push('/users')} variant="outline">
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">Users</BreadcrumbLink>
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

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyContact} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Contact
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/users/${user.id}/chat`)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/users/${user.id}/me`)}
                className="gap-2"
              >
                <EyeIcon className="h-4 w-4" />
                View as User
              </Button>
              <Button
                size="sm"
                onClick={handleTriggerDailyCron}
                disabled={isSendingWorkout}
                className="gap-2"
              >
                <Send className={`h-4 w-4 ${isSendingWorkout ? 'animate-pulse' : ''}`} />
                {isSendingWorkout ? 'Triggering...' : 'Trigger Daily Cron'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenUnsubscribeModal}
                className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              >
                <UserX className="h-4 w-4" />
                Unsubscribe
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleOpenDeleteModal}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
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
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="program">Program</TabsTrigger>
            <TabsTrigger value="dev-tools">Dev Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Signup Data Section */}
            {signupData && <SignupDataSection signupData={signupData} />}

            {/* Profile Content */}
            {profile ? (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">AI Profile</h3>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{profile}</pre>
              </Card>
            ) : (
              <EmptyProfileState />
            )}
          </TabsContent>

          <TabsContent value="program">
            <ProgramTab userId={id as string} />
          </TabsContent>

          <TabsContent value="dev-tools">
            <ChainToolsTab userId={id as string} />
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all associated data including workouts, fitness plans, messages, and profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To confirm, type the user&apos;s phone number: <span className="font-mono font-semibold text-foreground">{user.phoneNumber}</span>
            </p>
            <Input
              value={phoneConfirmation}
              onChange={(e) => setPhoneConfirmation(e.target.value)}
              placeholder="Enter phone number to confirm"
              className="font-mono"
            />
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={phoneConfirmation !== user.phoneNumber || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsubscribe Confirmation Modal */}
      <Dialog open={isUnsubscribeModalOpen} onOpenChange={setIsUnsubscribeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-orange-600">Unsubscribe User</DialogTitle>
            <DialogDescription>
              This will immediately cancel the user&apos;s subscription and stop all automated messages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-orange-50 p-4 text-sm text-orange-800">
              <p className="font-medium mb-2">This action will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cancel the Stripe subscription immediately</li>
                <li>Issue a prorated refund for unused time</li>
                <li>Delete all pending queued messages</li>
                <li>Prevent future automated workout messages</li>
              </ul>
            </div>
            {unsubscribeError && (
              <p className="text-sm text-red-600">{unsubscribeError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnsubscribeModalOpen(false)}
              disabled={isUnsubscribing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function SignupDataSection({ signupData }: { signupData: SignupData }) {
  const formatGoals = (goals?: ('strength' | 'endurance' | 'weight_loss' | 'general_fitness')[]) => {
    if (!goals || goals.length === 0) return 'Not specified'
    return goals.map(g => {
      const labels: Record<string, string> = {
        strength: 'Strength',
        endurance: 'Endurance',
        weight_loss: 'Weight Loss',
        general_fitness: 'General Fitness'
      }
      return labels[g] || g
    }).join(', ')
  }

  const formatDays = (days?: string) => {
    if (!days) return 'Not specified'
    const labels: Record<string, string> = {
      '3_per_week': '3 days/week',
      '4_per_week': '4 days/week',
      '5_per_week': '5 days/week',
      '6_per_week': '6 days/week'
    }
    return labels[days] || days
  }

  const formatLocation = (loc?: string) => {
    if (!loc) return 'Not specified'
    const labels: Record<string, string> = {
      home: 'Home',
      commercial_gym: 'Commercial Gym',
      bodyweight: 'Bodyweight Only'
    }
    return labels[loc] || loc
  }

  const formatExperience = (level?: string) => {
    if (!level) return 'Not specified'
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  return (
    <Card className="p-6 mb-4">
      <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">Signup Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Primary Goals: </span>
          <span className="font-medium">{formatGoals(signupData.primaryGoals)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Experience: </span>
          <span className="font-medium">{formatExperience(signupData.experienceLevel)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Days/Week: </span>
          <span className="font-medium">{formatDays(signupData.desiredDaysPerWeek)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Location: </span>
          <span className="font-medium">{formatLocation(signupData.trainingLocation)}</span>
        </div>
        {signupData.equipment && signupData.equipment.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-muted-foreground">Equipment: </span>
            <span className="font-medium">{signupData.equipment.join(', ')}</span>
          </div>
        )}
        {signupData.goalsElaboration && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-muted-foreground">Goals Detail: </span>
            <span className="font-medium">{signupData.goalsElaboration}</span>
          </div>
        )}
        {signupData.availabilityElaboration && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-muted-foreground">Availability Detail: </span>
            <span className="font-medium">{signupData.availabilityElaboration}</span>
          </div>
        )}
        {signupData.injuries && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-muted-foreground">Injuries/Limitations: </span>
            <span className="font-medium">{signupData.injuries}</span>
          </div>
        )}
        {signupData.currentExercise && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-muted-foreground">Current Exercise: </span>
            <span className="font-medium">{signupData.currentExercise}</span>
          </div>
        )}
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

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
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

const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const Trash2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)

const UserX = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
  </svg>
)