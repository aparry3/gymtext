'use client'

import { useState } from 'react'
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

const types = ['strength', 'stretching', 'cardio', 'plyometrics', 'strongman', 'powerlifting', 'olympic weightlifting']
const mechanicsOptions = ['compound', 'isolation']

export default function CreateExercisePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'strength',
    mechanics: '',
    trainingGroups: '',
    movementPatterns: '',
    equipment: '',
    primaryMuscles: '',
    secondaryMuscles: '',
    modality: '',
    intensity: '',
    shortDescription: '',
    instructions: '',
    cues: '',
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.name.trim()) {
      setError('Exercise name is required')
      return
    }
    if (!form.type) {
      setError('Type is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Parse comma-separated values into arrays
      const primaryMuscles = form.primaryMuscles
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      const secondaryMuscles = form.secondaryMuscles
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      const equipment = form.equipment
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      const trainingGroups = form.trainingGroups
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      const movementPatterns = form.movementPatterns
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      // Parse cues (one per line)
      const cues = form.cues
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          type: form.type,
          mechanics: form.mechanics || undefined,
          trainingGroups: trainingGroups.length > 0 ? trainingGroups : undefined,
          movementPatterns: movementPatterns.length > 0 ? movementPatterns : undefined,
          equipment: equipment.length > 0 ? equipment : undefined,
          primaryMuscles: primaryMuscles.length > 0 ? primaryMuscles : undefined,
          secondaryMuscles: secondaryMuscles.length > 0 ? secondaryMuscles : undefined,
          modality: form.modality.trim() || undefined,
          intensity: form.intensity.trim() || undefined,
          shortDescription: form.shortDescription.trim() || undefined,
          instructions: form.instructions.trim() || undefined,
          cues: cues.length > 0 ? cues : undefined,
          isActive: form.isActive,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create exercise')
      }

      // Redirect to the new exercise's detail page
      router.push(`/exercises/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/exercises')
  }

  const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/exercises">Exercises</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Exercise</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Card */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Exercise</h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exercise Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Exercise Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Barbell Bench Press"
                disabled={isSubmitting}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Auto-generated from name if empty"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                URL-safe identifier. Leave empty to auto-generate from name.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-destructive">*</span>
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {formatLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mechanics */}
              <div className="space-y-2">
                <label htmlFor="mechanics" className="text-sm font-medium">
                  Mechanics
                </label>
                <select
                  id="mechanics"
                  value={form.mechanics}
                  onChange={(e) => setForm(prev => ({ ...prev, mechanics: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">None</option>
                  {mechanicsOptions.map((mech) => (
                    <option key={mech} value={mech}>
                      {formatLabel(mech)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <label htmlFor="equipment" className="text-sm font-medium">
                Equipment
              </label>
              <Input
                id="equipment"
                value={form.equipment}
                onChange={(e) => setForm(prev => ({ ...prev, equipment: e.target.value }))}
                placeholder="Comma-separated, e.g., barbell, bench"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple items with commas
              </p>
            </div>

            {/* Training Groups */}
            <div className="space-y-2">
              <label htmlFor="trainingGroups" className="text-sm font-medium">
                Training Groups
              </label>
              <Input
                id="trainingGroups"
                value={form.trainingGroups}
                onChange={(e) => setForm(prev => ({ ...prev, trainingGroups: e.target.value }))}
                placeholder="Comma-separated, e.g., push, chest"
                disabled={isSubmitting}
              />
            </div>

            {/* Movement Patterns */}
            <div className="space-y-2">
              <label htmlFor="movementPatterns" className="text-sm font-medium">
                Movement Patterns
              </label>
              <Input
                id="movementPatterns"
                value={form.movementPatterns}
                onChange={(e) => setForm(prev => ({ ...prev, movementPatterns: e.target.value }))}
                placeholder="Comma-separated, e.g., horizontal press, push"
                disabled={isSubmitting}
              />
            </div>

            {/* Primary Muscles */}
            <div className="space-y-2">
              <label htmlFor="primaryMuscles" className="text-sm font-medium">
                Primary Muscles
              </label>
              <Input
                id="primaryMuscles"
                value={form.primaryMuscles}
                onChange={(e) => setForm(prev => ({ ...prev, primaryMuscles: e.target.value }))}
                placeholder="Comma-separated, e.g., chest, shoulders, triceps"
                disabled={isSubmitting}
              />
            </div>

            {/* Secondary Muscles */}
            <div className="space-y-2">
              <label htmlFor="secondaryMuscles" className="text-sm font-medium">
                Secondary Muscles
              </label>
              <Input
                id="secondaryMuscles"
                value={form.secondaryMuscles}
                onChange={(e) => setForm(prev => ({ ...prev, secondaryMuscles: e.target.value }))}
                placeholder="Comma-separated, e.g., forearms, core"
                disabled={isSubmitting}
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label htmlFor="shortDescription" className="text-sm font-medium">
                Short Description
              </label>
              <textarea
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief description of the exercise..."
                rows={2}
                disabled={isSubmitting}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </label>
              <textarea
                id="instructions"
                value={form.instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Full instructions for performing the exercise..."
                rows={5}
                disabled={isSubmitting}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Cues */}
            <div className="space-y-2">
              <label htmlFor="cues" className="text-sm font-medium">
                Cues
              </label>
              <textarea
                id="cues"
                value={form.cues}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, cues: e.target.value }))}
                placeholder="One cue per line..."
                rows={3}
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Enter each cue on a new line
              </p>
            </div>

            {/* Active Checkbox */}
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
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Exercise'}
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
