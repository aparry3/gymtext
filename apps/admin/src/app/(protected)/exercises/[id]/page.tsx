'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import { AdminExerciseWithAliases, AliasSource } from '@/components/admin/types'
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
  type: string
  mechanics: string
  movementSlug: string
  trainingGroups: string[]
  movementPatterns: string[]
  equipment: string[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  modality: string
  intensity: string
  shortDescription: string
  instructions: string
  cues: string[]
  isActive: boolean
}

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
  const [exercise, setExercise] = useState<AdminExerciseWithAliases | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [isAddingAlias, setIsAddingAlias] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [movements, setMovements] = useState<{ slug: string; name: string }[]>([])
  const [defaultAliasTarget, setDefaultAliasTarget] = useState<{ id: string; alias: string } | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({
    name: '',
    type: '',
    mechanics: '',
    movementSlug: '',
    trainingGroups: [],
    movementPatterns: [],
    equipment: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    modality: '',
    intensity: '',
    shortDescription: '',
    instructions: '',
    cues: [],
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
      if (result.data.movements) {
        setMovements(result.data.movements)
      }
      setEditForm({
        name: data.name,
        type: data.type,
        mechanics: data.mechanics || '',
        movementSlug: data.movementSlug || '',
        trainingGroups: data.trainingGroups || [],
        movementPatterns: data.movementPatterns || [],
        equipment: data.equipment || [],
        primaryMuscles: data.primaryMuscles || [],
        secondaryMuscles: data.secondaryMuscles || [],
        modality: data.modality || '',
        intensity: data.intensity || '',
        shortDescription: data.shortDescription || '',
        instructions: data.instructions || '',
        cues: data.cues || [],
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
  }, [id, fetchExercise, mode])

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
          type: editForm.type,
          mechanics: editForm.mechanics || null,
          movementSlug: editForm.movementSlug || null,
          trainingGroups: editForm.trainingGroups.length > 0 ? editForm.trainingGroups : [],
          movementPatterns: editForm.movementPatterns.length > 0 ? editForm.movementPatterns : [],
          equipment: editForm.equipment.length > 0 ? editForm.equipment : [],
          primaryMuscles: editForm.primaryMuscles.length > 0 ? editForm.primaryMuscles : [],
          secondaryMuscles: editForm.secondaryMuscles.length > 0 ? editForm.secondaryMuscles : [],
          modality: editForm.modality || null,
          intensity: editForm.intensity || null,
          shortDescription: editForm.shortDescription || '',
          instructions: editForm.instructions || '',
          cues: editForm.cues.length > 0 ? editForm.cues : [],
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
        type: exercise.type,
        mechanics: exercise.mechanics || '',
        movementSlug: exercise.movementSlug || '',
        trainingGroups: exercise.trainingGroups || [],
        movementPatterns: exercise.movementPatterns || [],
        equipment: exercise.equipment || [],
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        modality: exercise.modality || '',
        intensity: exercise.intensity || '',
        shortDescription: exercise.shortDescription || '',
        instructions: exercise.instructions || '',
        cues: exercise.cues || [],
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

  const handleSetDefaultAlias = async (aliasId: string) => {
    if (!exercise) return

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setDefaultAlias: aliasId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to set default alias')
      }

      setDefaultAliasTarget(null)
      await fetchExercise(exercise.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default alias')
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

  const typeColors: Record<string, string> = {
    strength: 'bg-blue-100 text-blue-800',
    stretching: 'bg-green-100 text-green-800',
    cardio: 'bg-red-100 text-red-800',
    plyometrics: 'bg-purple-100 text-purple-800',
    strongman: 'bg-orange-100 text-orange-800',
    powerlifting: 'bg-indigo-100 text-indigo-800',
    'olympic weightlifting': 'bg-yellow-100 text-yellow-800',
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
                movements={movements}
              />
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{exercise.name}</h1>
                  <Badge className={`${typeColors[exercise.type] || 'bg-gray-100 text-gray-800'} border-0`}>
                    {formatLabel(exercise.type)}
                  </Badge>
                  {exercise.mechanics && (
                    <Badge variant="outline">
                      {formatLabel(exercise.mechanics)}
                    </Badge>
                  )}
                  {exercise.movementName && (
                    <Badge className="bg-teal-100 text-teal-800 border-0">
                      {formatLabel(exercise.movementName)}
                    </Badge>
                  )}
                  <Badge variant={exercise.isActive ? 'default' : 'secondary'}>
                    {exercise.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {exercise.shortDescription && (
                  <p className="text-muted-foreground">{exercise.shortDescription}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Movement:</span>
                    <div className="font-medium">{exercise.movementName ? formatLabel(exercise.movementName) : '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Equipment:</span>
                    <div className="font-medium">
                      {exercise.equipment && exercise.equipment.length > 0
                        ? exercise.equipment.map(formatLabel).join(', ')
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aliases:</span>
                    <div className="font-medium">{exercise.aliases.length}</div>
                  </div>
                </div>

                {/* Training Groups */}
                {exercise.trainingGroups && exercise.trainingGroups.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Training Groups: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.trainingGroups.map((group) => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {formatLabel(group)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
            <TabsTrigger value="cues">Cues</TabsTrigger>
            <TabsTrigger value="aliases">Aliases ({exercise.aliases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-4">
            <Card className="p-6">
              {exercise.instructions ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{exercise.instructions}</p>
              ) : (
                <p className="text-muted-foreground text-sm">No instructions available.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="cues" className="mt-4">
            <Card className="p-6">
              {exercise.cues && exercise.cues.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {exercise.cues.map((cue, index) => (
                    <li key={index} className="text-sm leading-relaxed">
                      {cue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No cues available.</p>
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
                          <td className="p-2 text-sm">
                            <span className="flex items-center gap-2">
                              {alias.alias}
                              {alias.isDefault && (
                                <Badge className="bg-teal-100 text-teal-800 border-0 text-xs">
                                  Default
                                </Badge>
                              )}
                            </span>
                          </td>
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
                          <td className="p-2 text-right space-x-1">
                            {!alias.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDefaultAliasTarget({ id: alias.id, alias: alias.alias })}
                              >
                                Set Default
                              </Button>
                            )}
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

          {/* Set Default Alias Confirmation Dialog */}
          <Dialog open={!!defaultAliasTarget} onOpenChange={(open) => !open && setDefaultAliasTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Default Alias?</DialogTitle>
                <DialogDescription>
                  This will rename the exercise to &quot;{defaultAliasTarget?.alias}&quot;. The exercise name and slug will be updated. Continue?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDefaultAliasTarget(null)}>
                  Cancel
                </Button>
                <Button onClick={() => defaultAliasTarget && handleSetDefaultAlias(defaultAliasTarget.id)}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  )
}

interface EditFormProps {
  editForm: EditFormState
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>
  movements?: { slug: string; name: string }[]
}

function EditForm({ editForm, setEditForm, movements = [] }: EditFormProps) {
  const types = ['strength', 'stretching', 'cardio', 'plyometrics', 'strongman', 'powerlifting', 'olympic weightlifting']
  const mechanicsOptions = ['compound', 'isolation']

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
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            value={editForm.type}
            onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Mechanics</label>
          <select
            value={editForm.mechanics}
            onChange={(e) => setEditForm(prev => ({ ...prev, mechanics: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {mechanicsOptions.map((mech) => (
              <option key={mech} value={mech}>
                {mech.charAt(0).toUpperCase() + mech.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Movement</label>
          <select
            value={editForm.movementSlug}
            onChange={(e) => setEditForm(prev => ({ ...prev, movementSlug: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {movements.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name.charAt(0).toUpperCase() + m.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Equipment (comma-separated)</label>
          <Input
            value={editForm.equipment.join(', ')}
            onChange={(e) => setEditForm(prev => ({
              ...prev,
              equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            className="mt-1"
            placeholder="e.g., barbell, bench"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Short Description</label>
        <textarea
          value={editForm.shortDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, shortDescription: e.target.value }))}
          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Training Groups (comma-separated)</label>
        <Input
          value={editForm.trainingGroups.join(', ')}
          onChange={(e) => setEditForm(prev => ({
            ...prev,
            trainingGroups: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          className="mt-1"
          placeholder="e.g., push, chest"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Movement Patterns (comma-separated)</label>
        <Input
          value={editForm.movementPatterns.join(', ')}
          onChange={(e) => setEditForm(prev => ({
            ...prev,
            movementPatterns: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          className="mt-1"
          placeholder="e.g., horizontal press, push"
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
