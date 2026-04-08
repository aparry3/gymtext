'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  AdminProgram,
  AdminProgramOwner,
  AdminEnrollment,
  AdminProgramVersion,
  AdminProgramQuestion,
  ProgramQuestionType,
  OwnerType,
  EnrollmentSort,
  SchedulingMode,
  ProgramCadence,
  LateJoinerPolicy,
} from '@/components/admin/types'
import { EnrollmentsTable } from '@/components/admin/EnrollmentsTable'
import { SmsImageDialog } from '@/components/admin/programs/SmsImageDialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { formatRelative } from '@/shared/utils/date'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

// ─── Icons (inline SVGs to avoid extra deps) ────────────────────────────

function TrendingUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function DollarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function LinkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function CheckCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

function ExternalLinkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function SaveIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function GripVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────

interface ProgramDetail extends AdminProgram {
  owner: {
    id: string
    displayName: string
    ownerType: OwnerType
    avatarUrl: string | null
    wordmarkUrl: string | null
  }
}

interface VersionFormState {
  content: string
  questions: AdminProgramQuestion[]
}

const questionTypes: { value: ProgramQuestionType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'select', label: 'Single Choice' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'scale', label: 'Scale (1-10)' },
  { value: 'boolean', label: 'Yes/No' },
]

// ─── Main Component ──────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [versions, setVersions] = useState<AdminProgramVersion[]>([])
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [enrollmentSort, setEnrollmentSort] = useState<EnrollmentSort>({ field: 'enrolledAt', direction: 'desc' })
  const [activeTab, setActiveTab] = useState('overview')

  // Program form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    ownerId: '',
    isActive: true,
    isPublic: false,
  })

  // Program owners (for owner selector)
  const [owners, setOwners] = useState<AdminProgramOwner[]>([])

  const [settingsForm, setSettingsForm] = useState({
    schedulingMode: 'rolling_start' as SchedulingMode,
    cadence: 'calendar_days' as ProgramCadence,
    lateJoinerPolicy: '' as LateJoinerPolicy | '',
  })

  const [pricingForm, setPricingForm] = useState({
    priceAmountDollars: '',
    priceCurrency: 'usd',
  })

  const [schedulingForm, setSchedulingForm] = useState({
    schedulingEnabled: false,
    schedulingUrl: '',
    schedulingNotes: '',
  })

  // Version form state (curriculum + questions from published version)
  const [versionForm, setVersionForm] = useState<VersionFormState>({
    content: '',
    questions: [],
  })

  // SMS image state
  const [smsImageUrl, setSmsImageUrl] = useState<string | null>(null)
  const [smsImageDialogOpen, setSmsImageDialogOpen] = useState(false)

  // Dirty tracking refs (snapshots at load time)
  const originalProgramRef = useRef<string>('')
  const originalVersionRef = useRef<string>('')

  // Historical version viewing
  const [viewingVersion, setViewingVersion] = useState<AdminProgramVersion | null>(null)

  // Question editing state
  const [isEditingQuestions, setIsEditingQuestions] = useState(false)

  // ─── Dirty tracking ────────────────────────────────────────────────

  const getCurrentProgramSnapshot = useCallback(() => {
    return JSON.stringify({ editForm, settingsForm, pricingForm, schedulingForm, smsImageUrl })
  }, [editForm, settingsForm, pricingForm, schedulingForm, smsImageUrl])

  const getCurrentVersionSnapshot = useCallback(() => {
    return JSON.stringify(versionForm)
  }, [versionForm])

  const isProgramDirty = originalProgramRef.current !== '' && getCurrentProgramSnapshot() !== originalProgramRef.current
  const isVersionDirty = originalVersionRef.current !== '' && getCurrentVersionSnapshot() !== originalVersionRef.current
  const isAnyDirty = isProgramDirty || isVersionDirty

  const getSaveLabel = () => {
    if (isSaving) return 'Saving...'
    if (isProgramDirty && isVersionDirty) return 'Save All Changes'
    if (isVersionDirty) return 'Save & Create New Version'
    return 'Update Program'
  }

  // ─── Data fetching ──────────────────────────────────────────────

  const fetchProgram = useCallback(async (programId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${programId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch program')
      }

      const data = result.data
      setProgram({ ...data.program, owner: data.owner })
      setVersions(data.versions || [])
      setEnrollments(data.enrollments)

      const newEditForm = {
        name: data.program.name,
        description: data.program.description || '',
        ownerId: data.program.ownerId || '',
        isActive: data.program.isActive,
        isPublic: data.program.isPublic,
      }
      const newSettingsForm = {
        schedulingMode: data.program.schedulingMode,
        cadence: data.program.cadence,
        lateJoinerPolicy: data.program.lateJoinerPolicy || '',
      }
      const newPricingForm = {
        priceAmountDollars: data.program.priceAmountCents ? (data.program.priceAmountCents / 100).toFixed(2) : '',
        priceCurrency: data.program.priceCurrency || 'usd',
      }
      const newSchedulingForm = {
        schedulingEnabled: data.program.schedulingEnabled || false,
        schedulingUrl: data.program.schedulingUrl || '',
        schedulingNotes: data.program.schedulingNotes || '',
      }

      setEditForm(newEditForm)
      setSettingsForm(newSettingsForm)
      setPricingForm(newPricingForm)
      setSchedulingForm(newSchedulingForm)
      setSmsImageUrl(data.program.smsImageUrl || null)

      // Find published version and populate version form
      const publishedVersion = (data.versions || []).find(
        (v: AdminProgramVersion) => v.id === data.program.publishedVersionId
      )
      const newVersionForm: VersionFormState = {
        content: publishedVersion?.content || '',
        questions: publishedVersion?.questions ? JSON.parse(JSON.stringify(publishedVersion.questions)) : [],
      }
      setVersionForm(newVersionForm)

      // Store snapshots for dirty tracking
      originalProgramRef.current = JSON.stringify({
        editForm: newEditForm,
        settingsForm: newSettingsForm,
        pricingForm: newPricingForm,
        schedulingForm: newSchedulingForm,
        smsImageUrl: data.program.smsImageUrl || null,
      })
      originalVersionRef.current = JSON.stringify(newVersionForm)

      // Clear viewing version on re-fetch
      setViewingVersion(null)
      setIsEditingQuestions(false)
    } catch (err) {
      setError('Failed to load program')
      console.error('Error fetching program:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchProgram(id as string)
    }
  }, [id, fetchProgram])

  // Fetch owners list for the owner selector
  useEffect(() => {
    async function fetchOwners() {
      try {
        const response = await fetch('/api/program-owners?pageSize=100')
        const result = await response.json()
        if (result.success) {
          setOwners(result.data.owners)
        }
      } catch (err) {
        console.error('Error fetching owners:', err)
      }
    }
    fetchOwners()
  }, [])

  // Handle ?viewVersion= query param
  useEffect(() => {
    const viewVersionId = searchParams.get('viewVersion')
    if (viewVersionId && versions.length > 0) {
      const version = versions.find(v => v.id === viewVersionId)
      if (version) {
        setViewingVersion(version)
        setActiveTab('overview')
      }
    }
  }, [searchParams, versions])

  // ─── Save handlers ──────────────────────────────────────────────

  const handleSave = async () => {
    if (!program) return
    setIsSaving(true)
    setError(null)

    try {
      // 1. Update program if dirty
      if (isProgramDirty) {
        const amountCents = pricingForm.priceAmountDollars
          ? Math.round(parseFloat(pricingForm.priceAmountDollars) * 100)
          : null

        const response = await fetch(`/api/programs/${program.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            schedulingMode: settingsForm.schedulingMode,
            cadence: settingsForm.cadence,
            lateJoinerPolicy: settingsForm.lateJoinerPolicy || null,
            priceAmountCents: amountCents,
            priceCurrency: pricingForm.priceCurrency || 'usd',
            schedulingEnabled: schedulingForm.schedulingEnabled,
            schedulingUrl: schedulingForm.schedulingUrl || null,
            schedulingNotes: schedulingForm.schedulingNotes || null,
            smsImageUrl,
          }),
        })

        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to update program')
        }
      }

      // 2. Create new version if version fields dirty
      if (isVersionDirty) {
        // Create a new draft version with the current content
        const createResponse = await fetch(`/api/programs/${program.id}/versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: versionForm.content,
            questions: versionForm.questions.length > 0 ? versionForm.questions : null,
          }),
        })

        const createResult = await createResponse.json()
        if (!createResponse.ok || !createResult.success) {
          throw new Error(createResult.message || 'Failed to create version')
        }

        // Auto-publish the new version
        const newVersionId = createResult.data.id
        const publishResponse = await fetch(`/api/programs/${program.id}/versions/${newVersionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'publish' }),
        })

        const publishResult = await publishResponse.json()
        if (!publishResponse.ok || !publishResult.success) {
          throw new Error(publishResult.message || 'Failed to publish version')
        }
      }

      await fetchProgram(program.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEnrollmentAction = async (enrollmentId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} enrollment`)
      }

      if (program) {
        await fetchProgram(program.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} enrollment`)
    }
  }

  // ─── Version history handlers ──────────────────────────────────

  const handleViewVersion = (version: AdminProgramVersion) => {
    setViewingVersion(version)
    setActiveTab('overview')
  }

  const handleBackToCurrent = () => {
    setViewingVersion(null)
  }

  const handleRevertToVersion = (version: AdminProgramVersion) => {
    setVersionForm({
      content: version.content || '',
      questions: version.questions ? JSON.parse(JSON.stringify(version.questions)) : [],
    })
    setViewingVersion(null)
  }

  // ─── Question editing handlers ──────────────────────────────────

  const addQuestion = () => {
    const newQ: AdminProgramQuestion = {
      id: crypto.randomUUID(),
      questionType: 'text',
      questionText: '',
      isRequired: false,
      sortOrder: versionForm.questions.length,
    }
    setVersionForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }))
  }

  const updateQuestion = (qId: string, updates: Partial<AdminProgramQuestion>) => {
    setVersionForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, ...updates } : q),
    }))
  }

  const removeQuestion = (qId: string) => {
    setVersionForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId),
    }))
  }

  // ─── Labels ─────────────────────────────────────────────────────

  const modeLabels: Record<string, string> = {
    rolling_start: 'Rolling Start',
    cohort: 'Cohort',
  }

  const cadenceLabels: Record<string, string> = {
    calendar_days: 'Calendar Days',
    training_days_only: 'Training Days Only',
  }



  const versionStatusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }

  // ─── Render ─────────────────────────────────────────────────────

  if (isLoading) return <LoadingSkeleton />

  if (error && !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="border-destructive/20 bg-destructive/5 p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push('/programs')}>
              Back to Programs
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!program) return null

  const ownerInitials = program.owner.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const priceDisplay = program.priceAmountCents
    ? `$${(program.priceAmountCents / 100).toFixed(2)}`
    : 'Not set'

  const hasStripe = !!(program.stripeProductId && program.stripePriceId)

  // For display in the overview, determine what content/questions to show
  const displayContent = viewingVersion ? (viewingVersion.content || '') : versionForm.content
  const displayQuestions = viewingVersion ? (viewingVersion.questions || []) : versionForm.questions
  const handleRemoveSmsImage = () => {
    setSmsImageUrl(null)
  }

  const isReadOnly = !!viewingVersion

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-0">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isReadOnly ? (
              <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
            ) : (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="text-3xl font-bold text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none px-1 -ml-1 min-w-0 flex-1 max-w-2xl"
              />
            )}
            <Badge className="bg-green-100 text-green-700 border-0 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
              {program.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {program.isPublic && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
                Public
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://gymtext.co'}/start?program=${program?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 h-10 px-4 py-2 border-gray-300"
            >
              <ExternalLinkIcon className="mr-2" />
              Signup
            </a>
            {!isReadOnly && (
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleSave}
                disabled={isSaving || !isAnyDirty}
              >
                <SaveIcon className="mr-2" />
                {getSaveLabel()}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Manage program curriculum, logistics, and enrollments.
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Total Enrollments */}
          <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Enrollments
              </span>
              <TrendingUpIcon className="text-green-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900">{program.enrollmentCount}</div>
            <div className="text-xs text-green-500 mt-1">+12% from last month</div>
          </Card>

          {/* Active Members */}
          <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Members
              </span>
              <UsersIcon className="text-blue-400" />
            </div>
            <div className="text-4xl font-bold text-gray-900">{program.enrollmentCount}</div>
            <div className="text-xs text-gray-400 mt-1">
              {program.enrollmentCount > 0 ? '90% retention rate' : 'No enrollments yet'}
            </div>
          </Card>

          {/* Head Coach */}
          <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {program.owner.avatarUrl ? (
                  <AvatarImage src={program.owner.avatarUrl} alt={program.owner.displayName} />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-600 font-medium text-lg">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-500">
                  Head Coach
                </span>
                <div className="text-base font-semibold text-gray-900">{program.owner.displayName}</div>
                <button
                  onClick={() => router.push(`/program-owners/${program.owner.id}`)}
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-0.5"
                >
                  View Profile <ExternalLinkIcon />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ─────────────────────────────────────── */}
          <TabsContent value="overview">
            {/* Historical Version Banner */}
            {viewingVersion && (
              <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Viewing Version {viewingVersion.versionNumber}
                      </p>
                      <p className="text-xs text-amber-600">
                        {viewingVersion.publishedAt
                          ? `Published ${formatRelative(viewingVersion.publishedAt)}`
                          : `Created ${formatRelative(viewingVersion.createdAt)}`
                        } &mdash; This is read-only
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => handleRevertToVersion(viewingVersion)}
                    >
                      Revert to This Version
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={handleBackToCurrent}
                    >
                      Back to Current
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[340px_1fr] gap-6">
              {/* ── Left Column: Program Logistics ────────────────── */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Program Logistics</h2>

                {/* Program Details Card */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <SettingsIcon className="text-gray-500" />
                    <h3 className="text-[15px] font-semibold text-gray-900">Program Details</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                        Description
                      </div>
                      {isReadOnly ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {program.description || <span className="text-gray-400">No description</span>}
                        </div>
                      ) : (
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          placeholder="Describe this program..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y"
                        />
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                        Owner
                      </div>
                      {isReadOnly ? (
                        <div className="text-sm font-semibold text-gray-900">
                          {program.owner.displayName}
                        </div>
                      ) : (
                        <select
                          value={editForm.ownerId}
                          onChange={(e) => setEditForm(prev => ({ ...prev, ownerId: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
                        >
                          {owners.length === 0 && (
                            <option value={editForm.ownerId}>{program.owner.displayName}</option>
                          )}
                          {owners.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.displayName} ({o.ownerType})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          Active
                        </div>
                        <div className="text-xs text-gray-500">Program is available for new enrollments</div>
                      </div>
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          Public
                        </div>
                        <div className="text-xs text-gray-500">Listed in public program catalog</div>
                      </div>
                      <Switch
                        checked={editForm.isPublic}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPublic: checked }))}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </Card>

                {/* Operation Mode Card */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <SettingsIcon className="text-gray-500" />
                    <h3 className="text-[15px] font-semibold text-gray-900">Operation Mode</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                        Scheduling Mode
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {modeLabels[program.schedulingMode]}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                        Cadence
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {cadenceLabels[program.cadence]}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pricing & Stripe Card */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <DollarIcon className="text-gray-500" />
                    <h3 className="text-[15px] font-semibold text-gray-900">Pricing &amp; Stripe</h3>
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Monthly Cost
                  </div>
                  {isReadOnly ? (
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-3xl font-bold text-gray-900">{priceDisplay}</span>
                      <span className="text-sm text-gray-400 font-normal">/mo</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricingForm.priceAmountDollars}
                          onChange={(e) =>
                            setPricingForm(prev => ({ ...prev, priceAmountDollars: e.target.value }))
                          }
                          placeholder="0.00"
                          className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold text-gray-900 outline-none focus:border-blue-400"
                        />
                        <span className="text-sm text-gray-400 font-normal">/mo</span>
                      </div>
                      {!pricingForm.priceAmountDollars && (
                        <p className="text-xs text-gray-400">
                          No custom price set. Platform default will be used.
                        </p>
                      )}
                    </div>
                  )}
                  {hasStripe && (
                    <div className="flex items-center gap-1 text-emerald-600 mt-3">
                      <CheckCircleIcon className="text-blue-500" />
                      <span className="text-xs font-medium text-emerald-600">Stripe Connected</span>
                    </div>
                  )}
                </Card>

                {/* Coach Scheduling Card */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="text-gray-500" />
                      <h3 className="text-[15px] font-semibold text-gray-900">Coach Scheduling</h3>
                    </div>
                    <Switch
                      checked={schedulingForm.schedulingEnabled}
                      onCheckedChange={(checked) =>
                        setSchedulingForm(prev => ({ ...prev, schedulingEnabled: checked }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>

                  {schedulingForm.schedulingEnabled && (
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Calendar Link
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <LinkIcon className="text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={schedulingForm.schedulingUrl}
                          onChange={(e) =>
                            setSchedulingForm(prev => ({ ...prev, schedulingUrl: e.target.value }))
                          }
                          placeholder="calendly.com/coach/session"
                          className="bg-transparent text-sm text-gray-600 flex-1 outline-none min-w-0"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </Card>

                {/* SMS Image Card */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <h3 className="text-[15px] font-semibold text-gray-900">SMS Image</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Image sent with daily workout texts. Falls back to owner avatar, then default GymText image.
                  </p>

                  {smsImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={smsImageUrl}
                        alt="SMS image preview"
                        className="w-full rounded-lg border border-gray-200 object-contain max-h-40 bg-gray-50"
                      />
                      {!isReadOnly && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSmsImageDialogOpen(true)}
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={handleRemoveSmsImage}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    !isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSmsImageDialogOpen(true)}
                      >
                        Add Image
                      </Button>
                    )
                  )}

                  <SmsImageDialog
                    open={smsImageDialogOpen}
                    onOpenChange={setSmsImageDialogOpen}
                    programId={program.id}
                    ownerWordmarkUrl={program.owner.wordmarkUrl}
                    programLogoUrl={program.logoUrl}
                    onImageSet={setSmsImageUrl}
                  />
                </Card>

                {/* Sign-up Questions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-gray-900">Sign-up Questions</h3>
                    {!isReadOnly && (
                      <button
                        className="text-sm font-medium text-blue-500 hover:text-blue-600"
                        onClick={() => setIsEditingQuestions(!isEditingQuestions)}
                      >
                        {isEditingQuestions ? 'Done' : 'Manage'}
                      </button>
                    )}
                  </div>

                  {displayQuestions.length === 0 && !isEditingQuestions ? (
                    <p className="text-sm text-gray-400 italic">No custom sign-up questions.</p>
                  ) : (
                    <div className="space-y-2">
                      {displayQuestions.map((q) => (
                        <div key={q.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5">
                          <GripVerticalIcon className="text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {isEditingQuestions && !isReadOnly ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={q.questionText}
                                  onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                                  placeholder="Question text..."
                                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
                                />
                                <div className="flex items-center gap-2">
                                  <select
                                    value={q.questionType}
                                    onChange={(e) => updateQuestion(q.id, { questionType: e.target.value as ProgramQuestionType })}
                                    className="bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                                  >
                                    {questionTypes.map(t => (
                                      <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                  </select>
                                  <label className="flex items-center gap-1 text-xs text-gray-500">
                                    <input
                                      type="checkbox"
                                      checked={q.isRequired}
                                      onChange={(e) => updateQuestion(q.id, { isRequired: e.target.checked })}
                                    />
                                    Required
                                  </label>
                                  <button
                                    onClick={() => removeQuestion(q.id)}
                                    className="ml-auto text-red-400 hover:text-red-600"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                                {(q.questionType === 'select' || q.questionType === 'multiselect') && (
                                  <input
                                    type="text"
                                    value={(q.options || []).join(', ')}
                                    onChange={(e) => updateQuestion(q.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="Options (comma separated)"
                                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-600">{q.questionText || '(empty question)'}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEditingQuestions && !isReadOnly && (
                    <button
                      onClick={addQuestion}
                      className="mt-2 flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      <PlusIcon />
                      Add Question
                    </button>
                  )}
                </div>
              </div>

              {/* ── Right Column: Program Curriculum ───────────────── */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Program Curriculum</h2>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Editor Toolbar */}
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                    <div className="flex items-center gap-1">
                      <ToolbarButton><strong>B</strong></ToolbarButton>
                      <ToolbarButton><em>I</em></ToolbarButton>
                      <ToolbarButton>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                      </ToolbarButton>
                      <div className="w-px h-5 bg-gray-200 mx-1" />
                      <ToolbarButton>
                        <span className="font-semibold text-sm">T</span>
                      </ToolbarButton>
                      <ToolbarButton>
                        <LinkIcon className="text-gray-500" />
                      </ToolbarButton>
                      <ToolbarButton>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      </ToolbarButton>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Markdown Mode
                    </span>
                  </div>

                  {/* Editor Content Area */}
                  <div className="p-6 min-h-[500px]">
                    <textarea
                      value={displayContent}
                      onChange={(e) =>
                        setVersionForm(prev => ({ ...prev, content: e.target.value }))
                      }
                      placeholder="Write your program curriculum here..."
                      className="w-full min-h-[480px] text-[15px] leading-relaxed text-gray-700 bg-transparent outline-none resize-none"
                      readOnly={isReadOnly}
                    />
                  </div>

                  {/* Editor Footer */}
                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {isReadOnly ? 'Read-Only' : 'Editor Active'}
                    </span>
                    {isVersionDirty && !isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-yellow-600">
                          Unsaved changes
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Versions Tab ──────────────────────────────────────── */}
          <TabsContent value="versions">
            <div className="space-y-4">
              {versions.length === 0 ? (
                <Card className="p-8 text-center bg-white">
                  <p className="text-muted-foreground">No versions yet. Save curriculum content to create the first version.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => {
                    const isCurrent = version.id === program.publishedVersionId
                    const contentSnippet = version.content
                      ? version.content.slice(0, 120) + (version.content.length > 120 ? '...' : '')
                      : 'No content'

                    return (
                      <Card
                        key={version.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-white ${
                          viewingVersion?.id === version.id ? 'ring-2 ring-amber-400' : ''
                        }`}
                        onClick={() => handleViewVersion(version)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium">v{version.versionNumber}</span>
                              <Badge className={`${versionStatusColors[version.status]} border-0 text-xs`}>
                                {version.status}
                              </Badge>
                              {isCurrent && (
                                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{contentSnippet}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4 flex-shrink-0">
                            {version.publishedAt && (
                              <span>Published {formatRelative(version.publishedAt)}</span>
                            )}
                            <span>Created {formatRelative(version.createdAt)}</span>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Enrollments Tab ────────────────────────────────────── */}
          <TabsContent value="enrollments">
            <EnrollmentsTable
              enrollments={enrollments}
              sort={enrollmentSort}
              onSortChange={setEnrollmentSort}
              onAction={handleEnrollmentAction}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Small helper components ──────────────────────────────────────────

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
    >
      {children}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 bg-white border border-gray-200 rounded-xl">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-10 w-20 mb-1" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-[340px_1fr] gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-5 bg-white border border-gray-200 rounded-xl">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-44" />
            <Card className="bg-white border border-gray-200 rounded-xl">
              <Skeleton className="h-12 w-full" />
              <div className="p-6">
                <Skeleton className="h-64 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
