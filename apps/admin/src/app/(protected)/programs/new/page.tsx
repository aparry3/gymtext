'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { AdminProgramOwner, SchedulingMode } from '@/components/admin/types'

export default function CreateProgramPage() {
  const router = useRouter()
  const [owners, setOwners] = useState<AdminProgramOwner[]>([])
  const [isLoadingOwners, setIsLoadingOwners] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    ownerId: '',
    description: '',
    schedulingMode: 'rolling_start' as SchedulingMode,
    isActive: true,
    isPublic: false,
  })

  // Fetch owners for dropdown
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
      } finally {
        setIsLoadingOwners(false)
      }
    }
    fetchOwners()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.name.trim()) {
      setError('Program name is required')
      return
    }
    if (!form.ownerId) {
      setError('Please select a program owner')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          ownerId: form.ownerId,
          description: form.description.trim() || null,
          schedulingMode: form.schedulingMode,
          cadence: 'calendar_days', // Default to calendar_days
          isActive: form.isActive,
          isPublic: form.isPublic,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create program')
      }

      // Redirect to the new program's detail page
      router.push(`/programs/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create program')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/programs')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Program</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Card */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Program</h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Program Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Program Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., 12-Week Strength Program"
                disabled={isSubmitting}
              />
            </div>

            {/* Owner Selection */}
            <div className="space-y-2">
              <label htmlFor="ownerId" className="text-sm font-medium">
                Program Owner <span className="text-destructive">*</span>
              </label>
              <select
                id="ownerId"
                value={form.ownerId}
                onChange={(e) => setForm(prev => ({ ...prev, ownerId: e.target.value }))}
                disabled={isSubmitting || isLoadingOwners}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an owner...</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.displayName} ({owner.ownerType})
                  </option>
                ))}
              </select>
              {isLoadingOwners && (
                <p className="text-xs text-muted-foreground">Loading owners...</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the program..."
                rows={3}
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Scheduling Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Scheduling Mode <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedulingMode"
                    value="rolling_start"
                    checked={form.schedulingMode === 'rolling_start'}
                    onChange={() => setForm(prev => ({ ...prev, schedulingMode: 'rolling_start' }))}
                    disabled={isSubmitting}
                    className="rounded"
                  />
                  <span className="text-sm">Rolling Start</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedulingMode"
                    value="cohort"
                    checked={form.schedulingMode === 'cohort'}
                    onChange={() => setForm(prev => ({ ...prev, schedulingMode: 'cohort' }))}
                    disabled={isSubmitting}
                    className="rounded"
                  />
                  <span className="text-sm">Cohort</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {form.schedulingMode === 'rolling_start'
                  ? 'Users can start anytime and progress independently'
                  : 'Users start together on a fixed date and progress as a group'}
              </p>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={isSubmitting}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  disabled={isSubmitting}
                  className="rounded"
                />
                <span className="text-sm font-medium">Public</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Program'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
