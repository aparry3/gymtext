'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';

interface ContextTemplateEditorProps {
  contextType: string;
  templateVariables?: string[];
  onDirtyChange: (isDirty: boolean) => void;
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400">Loading editor...</span>
    </div>
  );
}

export function ContextTemplateEditor({
  contextType,
  templateVariables,
  onDirtyChange,
  onHistoryToggle,
  isHistoryOpen,
}: ContextTemplateEditorProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch template content
  useEffect(() => {
    async function fetchTemplate() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/registry/context/${contextType}/default`);
        const result = await response.json();
        if (result.success && result.data) {
          setContent(result.data.template);
          setOriginalContent(result.data.template);
          if (result.data.createdAt) {
            setLastSaved(new Date(result.data.createdAt));
          }
        } else {
          setContent('');
          setOriginalContent('');
          setLastSaved(null);
        }
      } catch (err) {
        setError('Failed to load template');
        console.error('Failed to fetch template:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplate();
  }, [contextType]);

  // Track dirty state
  useEffect(() => {
    onDirtyChange(content !== originalContent);
  }, [content, originalContent, onDirtyChange]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (content === originalContent) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/registry/context/${contextType}/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: content }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      setOriginalContent(content);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [contextType, content, originalContent]);

  const isDirty = content !== originalContent;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{contextType}</Badge>
          {isDirty && (
            <Badge variant="destructive" className="animate-pulse">
              Unsaved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onHistoryToggle}>
            <HistoryIcon className="h-4 w-4 mr-1.5" />
            {isHistoryOpen ? 'Hide History' : 'History'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Template Variables */}
      {templateVariables && templateVariables.length > 0 && (
        <div className="px-4 py-2 border-b bg-blue-50/50 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Variables:</span>
          {templateVariables.map((v) => (
            <Badge key={v} variant="secondary" className="text-xs font-mono">
              {`{{${v}}}`}
            </Badge>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-100">
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <EditorSkeleton />
        ) : (
          <CodeMirrorEditor
            value={content}
            onChange={setContent}
            placeholder="Enter context template..."
            onSave={handleSave}
          />
        )}
      </div>
    </Card>
  );
}
