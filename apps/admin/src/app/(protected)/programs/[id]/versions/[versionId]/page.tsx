'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminProgramVersion, AdminProgramQuestion, ProgramQuestionType } from '@/components/admin/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/shared/utils/date'
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor'
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

interface VersionDetailData {
  version: AdminProgramVersion
  program: {
    id: string
    name: string
    publishedVersionId: string | null
  }
}

const questionTypes: { value: ProgramQuestionType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'select', label: 'Single Choice' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'scale', label: 'Scale (1-10)' },
  { value: 'boolean', label: 'Yes/No' },
]

const versionStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
}

export default function VersionDetailPage() {
  const { id: programId, versionId } = useParams()
  const router = useRouter()
  const [data, setData] = useState<VersionDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Template editing
  const [editContent, setEditContent] = useState('')
  const [isSavingContent, setIsSavingContent] = useState(false)
  const [contentDirty, setContentDirty] = useState(false)

  // Generation config editing
  const [editGenConfig, setEditGenConfig] = useState('')
  const [isSavingGenConfig, setIsSavingGenConfig] = useState(false)
  const [genConfigDirty, setGenConfigDirty] = useState(false)
  const [genConfigError, setGenConfigError] = useState<string | null>(null)

  // Questions editing
  const [editQuestions, setEditQuestions] = useState<AdminProgramQuestion[]>([])
  const [isEditingQuestions, setIsEditingQuestions] = useState(false)
  const [isSavingQuestions, setIsSavingQuestions] = useState(false)

  // Metadata editing
  const [editDuration, setEditDuration] = useState<string>('')
  const [editDifficultyJson, setEditDifficultyJson] = useState('')
  const [isSavingMetadata, setIsSavingMetadata] = useState(false)
  const [metadataDirty, setMetadataDirty] = useState(false)
  const [difficultyJsonError, setDifficultyJsonError] = useState<string | null>(null)

  // Action states
  const [isPublishing, setIsPublishing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'publish' | 'archive' | 'delete' | null>(null)

  const fetchVersion = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch version')
      }

      setData(result.data)
      const v = result.data.version
      setEditContent(v.content || '')
      setEditGenConfig(v.generationConfig ? JSON.stringify(v.generationConfig, null, 2) : '{}')
      setEditDuration(v.defaultDurationWeeks?.toString() || '')
      setEditDifficultyJson(v.difficultyMetadata ? JSON.stringify(v.difficultyMetadata, null, 2) : '{}')
      setContentDirty(false)
      setGenConfigDirty(false)
      setMetadataDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version')
    } finally {
      setIsLoading(false)
    }
  }, [programId, versionId])

  useEffect(() => {
    if (programId && versionId) {
      fetchVersion()
    }
  }, [programId, versionId, fetchVersion])

  const isDraft = data?.version.status === 'draft'
  const isPublished = data?.version.status === 'published'

  // Save handlers
  const handleSaveContent = async () => {
    setIsSavingContent(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save')
      await fetchVersion()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleSaveGenConfig = async () => {
    setGenConfigError(null)
    try {
      JSON.parse(editGenConfig)
    } catch {
      setGenConfigError('Invalid JSON')
      return
    }

    setIsSavingGenConfig(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationConfig: JSON.parse(editGenConfig) }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save')
      await fetchVersion()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save generation config')
    } finally {
      setIsSavingGenConfig(false)
    }
  }

  const handleSaveMetadata = async () => {
    setDifficultyJsonError(null)
    let parsedDifficulty = null
    if (editDifficultyJson.trim() && editDifficultyJson.trim() !== '{}') {
      try {
        parsedDifficulty = JSON.parse(editDifficultyJson)
      } catch {
        setDifficultyJsonError('Invalid JSON')
        return
      }
    }

    setIsSavingMetadata(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultDurationWeeks: editDuration ? parseInt(editDuration, 10) : null,
          difficultyMetadata: parsedDifficulty,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save')
      await fetchVersion()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata')
    } finally {
      setIsSavingMetadata(false)
    }
  }

  // Questions handlers
  const handleStartEditingQuestions = () => {
    const current = data?.version.questions ?? []
    setEditQuestions(JSON.parse(JSON.stringify(current)))
    setIsEditingQuestions(true)
  }

  const addQuestion = () => {
    const newQ: AdminProgramQuestion = {
      id: crypto.randomUUID(),
      questionType: 'text',
      questionText: '',
      isRequired: false,
      sortOrder: editQuestions.length,
    }
    setEditQuestions(prev => [...prev, newQ])
  }

  const updateQuestion = (qId: string, updates: Partial<AdminProgramQuestion>) => {
    setEditQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q))
  }

  const removeQuestion = (qId: string) => {
    setEditQuestions(prev => prev.filter(q => q.id !== qId))
  }

  const handleSaveQuestions = async () => {
    setIsSavingQuestions(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: editQuestions }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save')
      await fetchVersion()
      setIsEditingQuestions(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save questions')
    } finally {
      setIsSavingQuestions(false)
    }
  }

  // Lifecycle actions
  const handlePublish = async () => {
    setIsPublishing(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to publish')
      setShowConfirm(null)
      await fetchVersion()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish version')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleArchive = async () => {
    setIsArchiving(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to archive')
      setShowConfirm(null)
      await fetchVersion()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive version')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/versions/${versionId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to delete')
      router.push(`/programs/${programId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete version')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push(`/programs/${programId}`)}>
              Back to Program
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { version, program } = data
  const questions = version.questions ?? []

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/programs/${program.id}`}>{program.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Version {version.versionNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Version Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Version {version.versionNumber}</h1>
              <Badge className={`${versionStatusColors[version.status]} border-0`}>
                {version.status}
              </Badge>
              {version.id === program.publishedVersionId && (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  Current
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {isDraft && (
                <>
                  <Button
                    variant="default"
                    onClick={() => setShowConfirm('publish')}
                  >
                    Publish
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowConfirm('delete')}
                  >
                    Delete Draft
                  </Button>
                </>
              )}
              {isPublished && (
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm('archive')}
                >
                  Archive
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <span>Created {formatRelative(version.createdAt)}</span>
            {version.publishedAt && <span>Published {formatRelative(version.publishedAt)}</span>}
            {version.archivedAt && <span>Archived {formatRelative(version.archivedAt)}</span>}
          </div>
        </Card>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <Card className="border-amber-200 bg-amber-50 p-4">
            <div className="space-y-3">
              <p className="font-medium">
                {showConfirm === 'publish' && 'Publish this version? The current published version will be archived.'}
                {showConfirm === 'archive' && 'Archive this version? It will no longer be the active version.'}
                {showConfirm === 'delete' && 'Delete this draft? This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={showConfirm === 'delete' ? 'destructive' : 'default'}
                  onClick={
                    showConfirm === 'publish' ? handlePublish :
                    showConfirm === 'archive' ? handleArchive :
                    handleDelete
                  }
                  disabled={isPublishing || isArchiving || isDeleting}
                >
                  {(isPublishing || isArchiving || isDeleting) ? 'Processing...' : 'Confirm'}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Not draft notice */}
        {!isDraft && (
          <Card className="bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              This version is {version.status}. Content is read-only.
            </p>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="template">
          <TabsList>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="genconfig">Generation Config</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          {/* Template Tab */}
          <TabsContent value="template" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Program Template</h3>
                {isDraft && contentDirty && (
                  <Button onClick={handleSaveContent} disabled={isSavingContent}>
                    {isSavingContent ? 'Saving...' : 'Save Template'}
                  </Button>
                )}
              </div>
              <CodeMirrorEditor
                value={editContent}
                onChange={(val) => {
                  setEditContent(val)
                  setContentDirty(true)
                }}
                language="markdown"
                readOnly={!isDraft}
                placeholder="Enter program template content (markdown)..."
              />
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Enrollment Questions</h3>
                {isDraft && !isEditingQuestions && (
                  <Button variant="outline" size="sm" onClick={handleStartEditingQuestions}>
                    Edit Questions
                  </Button>
                )}
                {isDraft && isEditingQuestions && (
                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    Add Question
                  </Button>
                )}
              </div>

              {isEditingQuestions ? (
                <div className="space-y-4">
                  {editQuestions.length === 0 ? (
                    <p className="text-muted-foreground italic text-center py-8">
                      No questions yet. Click &quot;Add Question&quot; to create one.
                    </p>
                  ) : (
                    editQuestions.map((q, i) => (
                      <div key={q.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Q{i + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(q.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select
                              value={q.questionType}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  questionType: e.target.value as ProgramQuestionType,
                                  options: ['select', 'multiselect'].includes(e.target.value)
                                    ? q.options ?? []
                                    : undefined,
                                })
                              }
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {questionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <input
                              type="checkbox"
                              id={`required-${q.id}`}
                              checked={q.isRequired}
                              onChange={(e) => updateQuestion(q.id, { isRequired: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor={`required-${q.id}`} className="text-sm font-medium">
                              Required
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Question Text</label>
                          <Input
                            value={q.questionText}
                            onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                            placeholder="Enter your question..."
                          />
                        </div>

                        {['select', 'multiselect'].includes(q.questionType) && (
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Options (comma-separated)
                            </label>
                            <Input
                              value={(q.options ?? []).join(', ')}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-1 block">Help Text (optional)</label>
                          <Input
                            value={q.helpText ?? ''}
                            onChange={(e) => updateQuestion(q.id, { helpText: e.target.value || undefined })}
                            placeholder="Additional instructions..."
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSaveQuestions} disabled={isSavingQuestions}>
                      {isSavingQuestions ? 'Saving...' : 'Save Questions'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingQuestions(false)}
                      disabled={isSavingQuestions}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Q{i + 1}</Badge>
                        <Badge variant="outline">{q.questionType}</Badge>
                        {q.isRequired && <Badge variant="destructive">Required</Badge>}
                      </div>
                      <p className="font-medium">{q.questionText}</p>
                      {q.helpText && <p className="text-sm text-muted-foreground">{q.helpText}</p>}
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {q.options.map((opt, j) => (
                            <Badge key={j} variant="outline">{opt}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No custom questions defined.</p>
              )}
            </Card>
          </TabsContent>

          {/* Generation Config Tab */}
          <TabsContent value="genconfig" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Generation Config</h3>
                {isDraft && genConfigDirty && (
                  <Button onClick={handleSaveGenConfig} disabled={isSavingGenConfig}>
                    {isSavingGenConfig ? 'Saving...' : 'Save Config'}
                  </Button>
                )}
              </div>
              {genConfigError && (
                <p className="text-sm text-destructive mb-2">{genConfigError}</p>
              )}
              <CodeMirrorEditor
                value={editGenConfig}
                onChange={(val) => {
                  setEditGenConfig(val)
                  setGenConfigDirty(true)
                  setGenConfigError(null)
                }}
                language="json"
                readOnly={!isDraft}
                placeholder='{"promptIds": [], "context": {}, "resources": {}}'
              />
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Version Metadata</h3>
                {isDraft && metadataDirty && (
                  <Button onClick={handleSaveMetadata} disabled={isSavingMetadata}>
                    {isSavingMetadata ? 'Saving...' : 'Save Metadata'}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Default Duration (weeks)
                  </label>
                  <Input
                    type="number"
                    value={editDuration}
                    onChange={(e) => {
                      setEditDuration(e.target.value)
                      setMetadataDirty(true)
                    }}
                    disabled={!isDraft}
                    placeholder="e.g., 12"
                    min={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Difficulty Metadata (JSON)
                  </label>
                  {difficultyJsonError && (
                    <p className="text-sm text-destructive mb-2">{difficultyJsonError}</p>
                  )}
                  <CodeMirrorEditor
                    value={editDifficultyJson}
                    onChange={(val) => {
                      setEditDifficultyJson(val)
                      setMetadataDirty(true)
                      setDifficultyJsonError(null)
                    }}
                    language="json"
                    readOnly={!isDraft}
                    placeholder='{"minExperienceLevel": "beginner", "intensityScore": 5}'
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
