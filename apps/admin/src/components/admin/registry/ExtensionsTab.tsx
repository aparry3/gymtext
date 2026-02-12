'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';
import { TemplateVersionHistory } from './TemplateVersionHistory';

interface ExtensionRef {
  agentId: string;
  extensionType: string;
  extensionKey: string;
}

interface ExtensionData {
  content: string;
  evalRubric: string | null;
}

// Group extensions into a tree: agentId -> extensionType -> extensionKey[]
type ExtensionTree = Record<string, Record<string, string[]>>;

function buildTree(extensions: ExtensionRef[]): ExtensionTree {
  const tree: ExtensionTree = {};
  for (const ext of extensions) {
    if (!tree[ext.agentId]) tree[ext.agentId] = {};
    if (!tree[ext.agentId][ext.extensionType]) tree[ext.agentId][ext.extensionType] = [];
    tree[ext.agentId][ext.extensionType].push(ext.extensionKey);
  }
  return tree;
}

function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
          <div className="ml-3 space-y-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400">Loading editor...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.163-.3c.186 1.613.67 3.134 1.395 4.5M15.75 6.087v0A.64.64 0 0016.407 5.53c1.412.162 2.813.402 4.163.3C20.383 4.217 19.9 2.696 19.714 1.083m-3.964 5.004v4.788a48.345 48.345 0 01-6.5.001V6.087m6.5 0c-1.082.037-2.167.058-3.25.058s-2.168-.02-3.25-.058"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No extension selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select an extension from the sidebar to edit it.
        </p>
      </div>
    </div>
  );
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

function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={`${className} transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

interface ExtensionEditorPaneProps {
  agentId: string;
  extensionType: string;
  extensionKey: string;
  onDirtyChange: (isDirty: boolean) => void;
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
}

function ExtensionEditorPane({
  agentId,
  extensionType,
  extensionKey,
  onDirtyChange,
  onHistoryToggle,
  isHistoryOpen,
}: ExtensionEditorPaneProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [evalRubric, setEvalRubric] = useState('');
  const [originalEvalRubric, setOriginalEvalRubric] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRubric, setShowRubric] = useState(false);

  const apiPath = `/api/registry/extensions/${encodeURIComponent(agentId)}/${encodeURIComponent(extensionType)}/${encodeURIComponent(extensionKey)}`;

  useEffect(() => {
    async function fetchExtension() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(apiPath);
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data as ExtensionData;
          setContent(data.content);
          setOriginalContent(data.content);
          setEvalRubric(data.evalRubric || '');
          setOriginalEvalRubric(data.evalRubric || '');
        } else {
          setContent('');
          setOriginalContent('');
          setEvalRubric('');
          setOriginalEvalRubric('');
          setLastSaved(null);
        }
      } catch (err) {
        setError('Failed to load extension');
        console.error('Failed to fetch extension:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExtension();
  }, [apiPath]);

  const isDirty = content !== originalContent || evalRubric !== originalEvalRubric;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          evalRubric: evalRubric || null,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      setOriginalContent(content);
      setOriginalEvalRubric(evalRubric);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [apiPath, content, evalRubric, isDirty]);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{agentId}</Badge>
          <Badge variant="secondary">{extensionType}</Badge>
          <Badge variant="secondary">{extensionKey}</Badge>
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

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-100">
          {error}
        </div>
      )}

      {/* Content Editor */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        <div className="px-4 py-1.5 bg-gray-50/30 border-b">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content</span>
        </div>
        <div className={`overflow-hidden ${showRubric ? 'flex-1 basis-1/2' : 'flex-1'}`}>
          {isLoading ? (
            <EditorSkeleton />
          ) : (
            <CodeMirrorEditor
              value={content}
              onChange={setContent}
              placeholder="Enter extension content..."
              onSave={handleSave}
            />
          )}
        </div>

        {/* Eval Rubric (collapsible) */}
        <div className="border-t">
          <button
            className="w-full flex items-center justify-between px-4 py-1.5 bg-gray-50/30 hover:bg-gray-100/50 transition-colors"
            onClick={() => setShowRubric(!showRubric)}
          >
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Eval Rubric
            </span>
            <ChevronIcon expanded={showRubric} className="h-3 w-3 text-gray-400" />
          </button>
          {showRubric && (
            <div className="flex-1 basis-1/2 overflow-hidden" style={{ height: '200px' }}>
              {isLoading ? (
                <EditorSkeleton />
              ) : (
                <CodeMirrorEditor
                  value={evalRubric}
                  onChange={setEvalRubric}
                  placeholder="Enter eval rubric (optional)..."
                  onSave={handleSave}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ExtensionsTab() {
  const [extensions, setExtensions] = useState<ExtensionRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ExtensionRef | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [revertTrigger, setRevertTrigger] = useState(0);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const response = await fetch('/api/registry/extensions');
        const result = await response.json();
        if (result.success) {
          setExtensions(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch extensions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExtensions();
  }, []);

  const tree = buildTree(extensions);

  const handleSelect = useCallback(
    (ext: ExtensionRef) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;
      setSelected(ext);
      setIsDirty(false);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  const toggleType = (key: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleRevert = useCallback(
    (version: { content: string; evalRubric?: string | null }) => {
      if (!selected) return;
      const apiPath = `/api/registry/extensions/${encodeURIComponent(selected.agentId)}/${encodeURIComponent(selected.extensionType)}/${encodeURIComponent(selected.extensionKey)}`;
      fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: version.content,
          evalRubric: version.evalRubric ?? null,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setRevertTrigger((prev) => prev + 1);
          }
        })
        .catch((err) => {
          console.error('Failed to revert:', err);
          alert('Failed to revert to previous version');
        });
    },
    [selected]
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const selectedKey = selected
    ? `${selected.agentId}/${selected.extensionType}/${selected.extensionKey}`
    : null;

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Tree */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto border rounded-lg bg-white shadow-sm">
        <div className="p-3 border-b bg-gray-50/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Extensions
          </h3>
        </div>
        {isLoading ? (
          <SidebarSkeleton />
        ) : Object.keys(tree).length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No extensions defined</p>
        ) : (
          <div className="p-2">
            {Object.entries(tree)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([agentId, types]) => (
                <div key={agentId} className="mb-1">
                  <button
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => toggleAgent(agentId)}
                  >
                    <ChevronIcon expanded={expandedAgents.has(agentId)} className="h-3 w-3 text-gray-400" />
                    <span className="font-mono text-xs truncate">{agentId}</span>
                  </button>
                  {expandedAgents.has(agentId) && (
                    <div className="ml-3">
                      {Object.entries(types)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([type, keys]) => {
                          const typeKey = `${agentId}/${type}`;
                          return (
                            <div key={typeKey} className="mb-0.5">
                              <button
                                className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded-md"
                                onClick={() => toggleType(typeKey)}
                              >
                                <ChevronIcon expanded={expandedTypes.has(typeKey)} className="h-2.5 w-2.5 text-gray-400" />
                                <span>{type}</span>
                              </button>
                              {expandedTypes.has(typeKey) && (
                                <div className="ml-4">
                                  {keys.sort().map((extKey) => {
                                    const itemKey = `${agentId}/${type}/${extKey}`;
                                    return (
                                      <button
                                        key={itemKey}
                                        className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors ${
                                          selectedKey === itemKey
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                          handleSelect({
                                            agentId,
                                            extensionType: type,
                                            extensionKey: extKey,
                                          })
                                        }
                                      >
                                        {extKey}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </aside>

      {/* Main Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <ExtensionEditorPane
            key={`${selected.agentId}-${selected.extensionType}-${selected.extensionKey}-${revertTrigger}`}
            agentId={selected.agentId}
            extensionType={selected.extensionType}
            extensionKey={selected.extensionKey}
            onDirtyChange={setIsDirty}
            onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
            isHistoryOpen={isHistoryOpen}
          />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Right Sidebar - Version History */}
      {isHistoryOpen && selected && (
        <aside className="w-80 flex-shrink-0">
          <TemplateVersionHistory
            key={`history-${selected.agentId}-${selected.extensionType}-${selected.extensionKey}-${revertTrigger}`}
            fetchUrl={`/api/registry/extensions/${encodeURIComponent(selected.agentId)}/${encodeURIComponent(selected.extensionType)}/${encodeURIComponent(selected.extensionKey)}/history?limit=20`}
            contentKey="content"
            onRevert={handleRevert}
            onClose={() => setIsHistoryOpen(false)}
          />
        </aside>
      )}
    </div>
  );
}
