'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminExerciseWithAliases, AdminExerciseAlias, AliasSource } from '@/components/admin/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

interface EditFormState {
  name: string
  category: string
  level: string
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  force: string
  mechanic: string
  description: string
  instructions: string[]
  tips: string[]
  isActive: boolean
}

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [exercise, setExercise] = useState<AdminExerciseWithAliases | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [isAddingAlias, setIsAddingAlias] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [editForm, setEditForm] = useState<EditFormState>({
    name: '',
    category: '',
    level: '',
    equipment: '',
    primaryMuscles: [],
    secondaryMuscles: [],
    force: '',
    mechanic: '',
    description: '',
    instructions: [],
    tips: [],
    isActive: true,
  })

  // Fetch exercise data
  const fetchExercise = useCallback(async (exerciseId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch exercise')
      }

      const data = result.data.exercise
      setExercise(data)
      setEditForm({
        name: data.name,
        category: data.category,
        level: data.level,
        equipment: data.equipment || '',
        primaryMuscles: data.primaryMuscles || [],
        secondaryMuscles: data.secondaryMuscles || [],
        force: data.force || '',
        mechanic: data.mechanic || '',
        description: data.description || '',
        instructions: data.instructions || [],
        tips: data.tips || [],
        isActive: data.isActive,
      })
    } catch (err) {
      setError('Failed to load exercise')
      console.error('Error fetching exercise:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchExercise(id as string)
    }
  }, [id, fetchExercise])

  const handleSave = async () => {
    if (!exercise) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          level: editForm.level,
          equipment: editForm.equipment || null,
          primaryMuscles: editForm.primaryMuscles.length > 0 ? editForm.primaryMuscles : null,
          secondaryMuscles: editForm.secondaryMuscles.length > 0 ? editForm.secondaryMuscles : null,
          force: editForm.force || null,
          mechanic: editForm.mechanic || null,
          description: editForm.description || null,
          instructions: editForm.instructions.length > 0 ? editForm.instructions : null,
          tips: editForm.tips.length > 0 ? editForm.tips : null,
          isActive: editForm.isActive,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update exercise')
      }

      // Refresh data
      await fetchExercise(exercise.id)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (exercise) {
      setEditForm({
        name: exercise.name,
        category: exercise.category,
        level: exercise.level,
        equipment: exercise.equipment || '',
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        force: exercise.force || '',
        mechanic: exercise.mechanic || '',
        description: exercise.description || '',
        instructions: exercise.instructions || [],
        tips: exercise.tips || [],
        isActive: exercise.isActive,
      })
    }
    setIsEditing(false)
  }

  const handleDeactivate = async () => {
    if (!exercise) return

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to deactivate exercise')
      }

      router.push('/exercises')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate exercise')
    }
  }

  const handleAddAlias = async () => {
    if (!exercise || !newAlias.trim()) return

    setIsAddingAlias(true)
    setError(null)

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAlias: {
            alias: newAlias.trim(),
            source: 'manual',
            confidenceScore: 1.0,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add alias')
      }

      setNewAlias('')
      await fetchExercise(exercise.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add alias')
    } finally {
      setIsAddingAlias(false)
    }
  }

  const handleDeleteAlias = async (aliasId: string) => {
    if (!exercise) return

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAliasId: aliasId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete alias')
      }

      await fetchExercise(exercise.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alias')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error && !exercise) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push('/exercises')}>
              Back to Exercises
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!exercise) return null

  const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
  }

  const categoryColors: Record<string, string> = {
    strength: 'bg-blue-100 text-blue-800',
    stretching: 'bg-green-100 text-green-800',
    cardio: 'bg-red-100 text-red-800',
    plyometrics: 'bg-purple-100 text-purple-800',
    strongman: 'bg-orange-100 text-orange-800',
    powerlifting: 'bg-indigo-100 text-indigo-800',
    'olympic weightlifting': 'bg-yellow-100 text-yellow-800',
  }

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    expert: 'bg-red-100 text-red-800',
  }

  const sourceColors: Record<AliasSource, string> = {
    seed: 'bg-gray-100 text-gray-800',
    manual: 'bg-blue-100 text-blue-800',
    llm: 'bg-purple-100 text-purple-800',
    user: 'bg-green-100 text-green-800',
    fuzzy: 'bg-yellow-100 text-yellow-800',
    vector: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/exercises">Exercises</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{exercise.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Exercise Header Card */}
        <Card className="p-6">
          <div className="space-y-4">
            {isEditing ? (
              <EditForm
                editForm={editForm}
                setEditForm={setEditForm}
              />
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{exercise.name}</h1>
                  <Badge className={`${categoryColors[exercise.category] || 'bg-gray-100 text-gray-800'} border-0`}>
                    {formatLabel(exercise.category)}
                  </Badge>
                  <Badge className={`${levelColors[exercise.level] || 'bg-gray-100 text-gray-800'} border-0`}>
                    {formatLabel(exercise.level)}
                  </Badge>
                  <Badge variant={exercise.isActive ? 'default' : 'secondary'}>
                    {exercise.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {exercise.description && (
                  <p className="text-muted-foreground">{exercise.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Equipment:</span>
                    <div className="font-medium">{exercise.equipment ? formatLabel(exercise.equipment) : '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Force:</span>
                    <div className="font-medium">{exercise.force ? formatLabel(exercise.force) : '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mechanic:</span>
                    <div className="font-medium">{exercise.mechanic ? formatLabel(exercise.mechanic) : '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aliases:</span>
                    <div className="font-medium">{exercise.aliases.length}</div>
                  </div>
                </div>

                {/* Muscles */}
                <div className="space-y-2">
                  {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Primary Muscles: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.primaryMuscles.map((muscle) => (
                          <Badge key={muscle} variant="outline">
                            {formatLabel(muscle)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Secondary Muscles: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.secondaryMuscles.map((muscle) => (
                          <Badge key={muscle} variant="secondary">
                            {formatLabel(muscle)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  Created {formatRelative(exercise.createdAt)}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  {exercise.isActive && (
                    <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">Deactivate</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Deactivate Exercise?</DialogTitle>
                          <DialogDescription>
                            This will mark the exercise as inactive. It will no longer appear in exercise searches.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button variant="destructive" onClick={handleDeactivate}>
                            Deactivate
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="instructions">
          <TabsList>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="aliases">Aliases ({exercise.aliases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-4">
            <Card className="p-6">
              {exercise.instructions && exercise.instructions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm leading-relaxed">
                      {instruction}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-sm">No instructions available.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-4">
            <Card className="p-6">
              {exercise.tips && exercise.tips.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {exercise.tips.map((tip, index) => (
                    <li key={index} className="text-sm leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No tips available.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="aliases" className="mt-4">
            <Card className="p-6 space-y-4">
              {/* Add new alias */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new alias..."
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAlias()
                    }
                  }}
                />
                <Button onClick={handleAddAlias} disabled={isAddingAlias || !newAlias.trim()}>
                  {isAddingAlias ? 'Adding...' : 'Add'}
                </Button>
              </div>

              {/* Alias list */}
              {exercise.aliases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium">Alias</th>
                        <th className="text-left p-2 text-sm font-medium">Normalized</th>
                        <th className="text-left p-2 text-sm font-medium">Source</th>
                        <th className="text-left p-2 text-sm font-medium">Confidence</th>
                        <th className="text-right p-2 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.aliases.map((alias) => (
                        <tr key={alias.id} className="border-b">
                          <td className="p-2 text-sm">{alias.alias}</td>
                          <td className="p-2 text-sm text-muted-foreground font-mono text-xs">
                            {alias.aliasNormalized}
                          </td>
                          <td className="p-2">
                            <Badge className={`${sourceColors[alias.source as AliasSource] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
                              {alias.source}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">
                            {alias.confidenceScore !== null ? (
                              <span className="font-mono">{(alias.confidenceScore * 100).toFixed(0)}%</span>
                            ) : '-'}
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAlias(alias.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No aliases.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface EditFormProps {
  editForm: EditFormState
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>
}

function EditForm({ editForm, setEditForm }: EditFormProps) {
  const levels = ['beginner', 'intermediate', 'expert']
  const categories = ['strength', 'stretching', 'cardio', 'plyometrics', 'strongman', 'powerlifting', 'olympic weightlifting']
  const forces = ['push', 'pull', 'static']
  const mechanics = ['compound', 'isolation']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={editForm.category}
            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Level</label>
          <select
            value={editForm.level}
            onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Equipment</label>
          <Input
            value={editForm.equipment}
            onChange={(e) => setEditForm(prev => ({ ...prev, equipment: e.target.value }))}
            className="mt-1"
            placeholder="e.g., barbell, dumbbell"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Force</label>
          <select
            value={editForm.force}
            onChange={(e) => setEditForm(prev => ({ ...prev, force: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {forces.map((force) => (
              <option key={force} value={force}>
                {force.charAt(0).toUpperCase() + force.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Mechanic</label>
          <select
            value={editForm.mechanic}
            onChange={(e) => setEditForm(prev => ({ ...prev, mechanic: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {mechanics.map((mech) => (
              <option key={mech} value={mech}>
                {mech.charAt(0).toUpperCase() + mech.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={editForm.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Primary Muscles (comma-separated)</label>
        <Input
          value={editForm.primaryMuscles.join(', ')}
          onChange={(e) => setEditForm(prev => ({
            ...prev,
            primaryMuscles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          className="mt-1"
          placeholder="e.g., chest, shoulders, triceps"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Secondary Muscles (comma-separated)</label>
        <Input
          value={editForm.secondaryMuscles.join(', ')}
          onChange={(e) => setEditForm(prev => ({
            ...prev,
            secondaryMuscles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          className="mt-1"
          placeholder="e.g., forearms, core"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={editForm.isActive}
          onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
    </div>
  )
}
