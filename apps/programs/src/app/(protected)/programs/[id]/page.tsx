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
} from 'lucide-react';
import type { Program, ProgramVersion, ProgramQuestion } from '@gymtext/shared/server';

interface ProgramDetailData {
  program: Program;
  versions: ProgramVersion[];
  enrollmentCount: number;
}

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
              <h3 className="font-semibold mb-4">Enrollment Questions</h3>
              {((latestVersion?.questions as ProgramQuestion[] | null)?.length ?? 0) > 0 ? (
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
