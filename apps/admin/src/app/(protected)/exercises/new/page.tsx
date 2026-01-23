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

const levels = ['beginner', 'intermediate', 'expert']
const categories = ['strength', 'stretching', 'cardio', 'plyometrics', 'strongman', 'powerlifting', 'olympic weightlifting']
const forces = ['push', 'pull', 'static']
const mechanics = ['compound', 'isolation']

export default function CreateExercisePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    category: 'strength',
    level: 'intermediate',
    equipment: '',
    primaryMuscles: '',
    secondaryMuscles: '',
    force: '',
    mechanic: '',
    description: '',
    instructions: '',
    tips: '',
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
    if (!form.category) {
      setError('Category is required')
      return
    }
    if (!form.level) {
      setError('Level is required')
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

      // Parse instructions and tips (one per line)
      const instructions = form.instructions
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)

      const tips = form.tips
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          level: form.level,
          equipment: form.equipment.trim() || undefined,
          primaryMuscles: primaryMuscles.length > 0 ? primaryMuscles : undefined,
          secondaryMuscles: secondaryMuscles.length > 0 ? secondaryMuscles : undefined,
          force: form.force || undefined,
          mechanic: form.mechanic || undefined,
          description: form.description.trim() || undefined,
          instructions: instructions.length > 0 ? instructions : undefined,
          tips: tips.length > 0 ? tips : undefined,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label htmlFor="level" className="text-sm font-medium">
                  Level <span className="text-destructive">*</span>
                </label>
                <select
                  id="level"
                  value={form.level}
                  onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {formatLabel(level)}
                    </option>
                  ))}
                </select>
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
                  placeholder="e.g., barbell, dumbbell, machine"
                  disabled={isSubmitting}
                />
              </div>

              {/* Force */}
              <div className="space-y-2">
                <label htmlFor="force" className="text-sm font-medium">
                  Force
                </label>
                <select
                  id="force"
                  value={form.force}
                  onChange={(e) => setForm(prev => ({ ...prev, force: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">None</option>
                  {forces.map((force) => (
                    <option key={force} value={force}>
                      {formatLabel(force)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mechanic */}
              <div className="space-y-2">
                <label htmlFor="mechanic" className="text-sm font-medium">
                  Mechanic
                </label>
                <select
                  id="mechanic"
                  value={form.mechanic}
                  onChange={(e) => setForm(prev => ({ ...prev, mechanic: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">None</option>
                  {mechanics.map((mech) => (
                    <option key={mech} value={mech}>
                      {formatLabel(mech)}
                    </option>
                  ))}
                </select>
              </div>
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
              <p className="text-xs text-muted-foreground">
                Separate multiple muscles with commas
              </p>
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

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the exercise..."
                rows={3}
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                placeholder="One instruction per line..."
                rows={5}
                disabled={isSubmitting}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Enter each step on a new line
              </p>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <label htmlFor="tips" className="text-sm font-medium">
                Tips
              </label>
              <textarea
                id="tips"
                value={form.tips}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, tips: e.target.value }))}
                placeholder="One tip per line..."
                rows={3}
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
