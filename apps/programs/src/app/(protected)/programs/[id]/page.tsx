'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Program, ProgramVersion, ProgramQuestion } from '@gymtext/shared/server';

interface ProgramDetailData {
  program: Program;
  versions: ProgramVersion[];
  enrollmentCount: number;
}

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'select', label: 'Single Choice' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'scale', label: 'Scale (1-10)' },
  { value: 'boolean', label: 'Yes/No' },
] as const;

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ProgramDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [editQuestions, setEditQuestions] = useState<ProgramQuestion[]>([]);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  const fetchProgram = useCallback(async () => {
    try {
      const response = await fetch(`/api/programs/${params.id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load program');
      }

      setData(result.data);
      setEditForm({
        name: result.data.program.name,
        description: result.data.program.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/programs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save changes');
      }

      await fetchProgram();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!data) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/programs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !data.program.isActive }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update program');
      }

      await fetchProgram();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!data) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/programs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !data.program.isPublic }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update program');
      }

      await fetchProgram();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditingQuestions = () => {
    const latestVer = data?.versions[0];
    const currentQuestions = (latestVer?.questions as ProgramQuestion[] | null) ?? [];
    setEditQuestions(JSON.parse(JSON.stringify(currentQuestions)));
    setIsEditingQuestions(true);
  };

  const handleCancelEditingQuestions = () => {
    setEditQuestions([]);
    setIsEditingQuestions(false);
  };

  const addQuestion = () => {
    const newQuestion: ProgramQuestion = {
      id: crypto.randomUUID(),
      questionType: 'text',
      questionText: '',
      isRequired: false,
      options: undefined,
      helpText: undefined,
      sortOrder: editQuestions.length,
    };
    setEditQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<ProgramQuestion>) => {
    setEditQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setEditQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveQuestions = async () => {
    const latestVer = data?.versions[0];
    if (!latestVer) return;

    setIsSavingQuestions(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/programs/${params.id}/versions/${latestVer.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: editQuestions }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save questions');
      }

      await fetchProgram();
      setIsEditingQuestions(false);
      setEditQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save questions');
    } finally {
      setIsSavingQuestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card className="p-6">
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <p className="text-destructive text-center">{error}</p>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => router.push('/programs')}>
              Back to Programs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { program, versions, enrollmentCount } = data;
  const publishedVersion = versions.find(v => v.id === program.publishedVersionId);
  const latestVersion = versions[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/programs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Program description..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="ml-2">Save</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                    <X className="h-4 w-4" />
                    <span className="ml-2">Cancel</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{program.name}</h1>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                {program.description && (
                  <p className="text-muted-foreground mt-1">{program.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {program.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                  {program.isPublic && <Badge variant="outline">Public</Badge>}
                  {!program.publishedVersionId && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      Unpublished
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{enrollmentCount}</p>
            <p className="text-sm text-muted-foreground">Enrollments</p>
          </Card>
          <Card className="p-4 text-center">
            <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{versions.length}</p>
            <p className="text-sm text-muted-foreground">Versions</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {(latestVersion?.questions as ProgramQuestion[] | null)?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">Questions</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={program.isActive ? "outline" : "default"}
            onClick={handleToggleActive}
            disabled={isSaving}
          >
            {program.isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTogglePublic}
            disabled={isSaving}
          >
            {program.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
          <a
            href={`https://gymtext.com/start?program=${program.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 h-10 px-4 py-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Signup Page
          </a>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="template">
          <TabsList>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Program Template</h3>
              {latestVersion?.templateMarkdown ? (
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {latestVersion.templateMarkdown}
                </pre>
              ) : (
                <p className="text-muted-foreground italic">
                  No template defined yet.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Enrollment Questions</h3>
                {!isEditingQuestions ? (
                  <Button variant="outline" size="sm" onClick={handleStartEditingQuestions}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Questions
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
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
                            size="icon"
                            onClick={() => removeQuestion(q.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select
                              value={q.questionType}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  questionType: e.target.value as ProgramQuestion['questionType'],
                                  options: ['select', 'multiselect'].includes(e.target.value)
                                    ? q.options ?? []
                                    : undefined,
                                })
                              }
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
                              onChange={(e) =>
                                updateQuestion(q.id, { isRequired: e.target.checked })
                              }
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
                            onChange={(e) =>
                              updateQuestion(q.id, { questionText: e.target.value })
                            }
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
                                  options: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Help Text (optional)
                          </label>
                          <Input
                            value={q.helpText ?? ''}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                helpText: e.target.value || undefined,
                              })
                            }
                            placeholder="Additional instructions for this question..."
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleSaveQuestions}
                      disabled={isSavingQuestions}
                    >
                      {isSavingQuestions ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-2">Save Questions</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEditingQuestions}
                      disabled={isSavingQuestions}
                    >
                      <X className="h-4 w-4" />
                      <span className="ml-2">Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : ((latestVersion?.questions as ProgramQuestion[] | null)?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(latestVersion?.questions as ProgramQuestion[]).map((q, i) => (
                    <div key={q.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Q{i + 1}</Badge>
                        <Badge variant="outline">{q.questionType}</Badge>
                        {q.isRequired && <Badge variant="destructive">Required</Badge>}
                      </div>
                      <p className="font-medium">{q.questionText}</p>
                      {q.helpText && (
                        <p className="text-sm text-muted-foreground">{q.helpText}</p>
                      )}
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
                <p className="text-muted-foreground italic">
                  No custom questions defined.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Program Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Scheduling Mode</span>
                  <span className="font-medium capitalize">
                    {program.schedulingMode.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Cadence</span>
                  <span className="font-medium capitalize">
                    {program.cadence.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {latestVersion?.defaultDurationWeeks
                      ? `${latestVersion.defaultDurationWeeks} weeks`
                      : 'Ongoing'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Billing Model</span>
                  <span className="font-medium capitalize">
                    {program.billingModel || 'Free'}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
