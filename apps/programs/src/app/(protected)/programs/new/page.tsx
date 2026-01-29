'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  FileText,
  MessageSquare,
  Settings,
  Eye,
  Upload,
} from 'lucide-react';
import type { ProgramQuestion } from '@gymtext/shared/server';

type WizardStep = 'info' | 'questions' | 'template' | 'settings';

interface ProgramForm {
  name: string;
  description: string;
  coverImageId: string | null;
  questions: ProgramQuestion[];
  templateMarkdown: string;
  defaultDurationWeeks: number | null;
  schedulingMode: 'rolling_start' | 'cohort';
}

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'select', label: 'Single Choice' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'scale', label: 'Scale (1-10)' },
  { value: 'boolean', label: 'Yes/No' },
] as const;

export default function CreateProgramPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [form, setForm] = useState<ProgramForm>({
    name: '',
    description: '',
    coverImageId: null,
    questions: [],
    templateMarkdown: '',
    defaultDurationWeeks: null,
    schedulingMode: 'rolling_start',
  });

  const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Basic Info', icon: <FileText className="h-4 w-4" /> },
    { id: 'questions', label: 'Questions', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'template', label: 'Template', icon: <Eye className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].id);
    }
  };

  const addQuestion = () => {
    const newQuestion: ProgramQuestion = {
      id: crypto.randomUUID(),
      questionText: '',
      questionType: 'text',
      isRequired: false,
      sortOrder: form.questions.length,
    };
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (id: string, updates: Partial<ProgramQuestion>) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  };

  const removeQuestion = (id: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  };

  const handleGenerateTemplate = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/programs/generate-template', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setForm(prev => ({ ...prev, templateMarkdown: result.data.templateMarkdown }));
        setUploadedFile(null);
      } else {
        setGenerateError(result.message);
      }
    } catch {
      setGenerateError('Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!form.name.trim()) {
      setError('Program name is required');
      setStep('info');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create program
      const programResponse = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          schedulingMode: form.schedulingMode,
          coverImageId: form.coverImageId,
        }),
      });

      const programResult = await programResponse.json();

      if (!programResult.success) {
        throw new Error(programResult.message || 'Failed to create program');
      }

      const programId = programResult.data.id;

      // Create version with questions and template
      const versionResponse = await fetch(`/api/programs/${programId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateMarkdown: form.templateMarkdown || null,
          defaultDurationWeeks: form.defaultDurationWeeks,
          questions: form.questions.length > 0 ? form.questions : null,
        }),
      });

      const versionResult = await versionResponse.json();

      if (!versionResult.success) {
        throw new Error(versionResult.message || 'Failed to create program version');
      }

      // If not a draft, publish the version
      if (!asDraft) {
        await fetch(`/api/programs/${programId}/versions/${versionResult.data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        });

        await fetch(`/api/programs/${programId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        });
      }

      router.push(`/programs/${programId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Program</h1>
            <p className="text-muted-foreground">
              Set up your fitness program in a few steps
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  s.id === step
                    ? 'bg-blue-100 text-blue-700'
                    : i < currentStepIndex
                    ? 'text-blue-600'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
                  i < currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : s.id === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="hidden md:inline font-medium">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-2 ${
                  i < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Step Content */}
        <Card className="p-6">
          {step === 'info' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Program Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., 12-Week Running Program"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what participants will achieve..."
                      rows={4}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Custom Questions</h2>
                  <p className="text-sm text-muted-foreground">
                    Add questions to collect information from participants
                  </p>
                </div>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {form.questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No questions yet. Add questions to personalize the program for each participant.
                  </p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-2 cursor-grab text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Q{index + 1}</Badge>
                            <select
                              value={question.questionType}
                              onChange={(e) => updateQuestion(question.id, {
                                questionType: e.target.value as ProgramQuestion['questionType']
                              })}
                              className="text-sm border rounded px-2 py-1"
                            >
                              {questionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-1 text-sm ml-auto">
                              <input
                                type="checkbox"
                                checked={question.isRequired}
                                onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                              />
                              Required
                            </label>
                          </div>
                          <Input
                            value={question.questionText}
                            onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                            placeholder="Enter your question..."
                          />
                          {(question.questionType === 'select' || question.questionType === 'multiselect') && (
                            <div>
                              <label className="text-sm text-muted-foreground">
                                Options (comma-separated)
                              </label>
                              <Input
                                value={question.options?.join(', ') || ''}
                                onChange={(e) => updateQuestion(question.id, {
                                  options: e.target.value.split(',').map(s => s.trimStart())
                                })}
                                onBlur={(e) => updateQuestion(question.id, {
                                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                          <Input
                            value={question.helpText || ''}
                            onChange={(e) => updateQuestion(question.id, { helpText: e.target.value })}
                            placeholder="Help text (optional)"
                            className="text-sm"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'template' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Program Template</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Describe the workout plan in markdown format. This will be used to generate personalized plans.
                </p>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a workout program file to auto-generate a template
                </p>
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls,.txt"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="template-file"
                />
                <label
                  htmlFor="template-file"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 h-10 px-4 py-2 cursor-pointer"
                >
                  Select File
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, CSV, Excel, or Text files
                </p>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">{uploadedFile.name}</span>
                  </div>
                  <Button onClick={handleGenerateTemplate} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Template'
                    )}
                  </Button>
                </div>
              )}

              {generateError && (
                <p className="text-sm text-destructive">{generateError}</p>
              )}

              <Tabs defaultValue="edit">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <textarea
                    value={form.templateMarkdown}
                    onChange={(e) => setForm(prev => ({ ...prev, templateMarkdown: e.target.value }))}
                    placeholder={`# Week 1-4: Foundation Phase

## Monday: Easy Run
- 30 minutes at conversational pace
- Focus on form and breathing

## Wednesday: Interval Training
- Warm up: 10 min easy jog
- 6x400m at 5K pace with 90s rest
- Cool down: 10 min easy jog

## Friday: Tempo Run
- 15 min warm up
- 20 min at tempo pace
- 10 min cool down

...continue for all weeks`}
                    rows={20}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-gray-50 min-h-[400px]">
                    {form.templateMarkdown ? (
                      <pre className="whitespace-pre-wrap">{form.templateMarkdown}</pre>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No template content yet. Start typing in the Edit tab.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {step === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Program Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (weeks)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={form.defaultDurationWeeks || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        defaultDurationWeeks: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      placeholder="e.g., 12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for ongoing programs
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Scheduling Mode
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="schedulingMode"
                          value="rolling_start"
                          checked={form.schedulingMode === 'rolling_start'}
                          onChange={() => setForm(prev => ({ ...prev, schedulingMode: 'rolling_start' }))}
                        />
                        <div>
                          <p className="font-medium">Rolling Start</p>
                          <p className="text-sm text-muted-foreground">
                            Participants start from Week 1 whenever they join
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="schedulingMode"
                          value="cohort"
                          checked={form.schedulingMode === 'cohort'}
                          onChange={() => setForm(prev => ({ ...prev, schedulingMode: 'cohort' }))}
                        />
                        <div>
                          <p className="font-medium">Cohort</p>
                          <p className="text-sm text-muted-foreground">
                            All participants progress through the program together
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step === 'settings' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create & Publish
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
