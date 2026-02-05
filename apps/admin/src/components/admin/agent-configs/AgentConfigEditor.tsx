'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';
import { ModelConfigPanel } from './ModelConfigPanel';
import { AgentConfigHistoryPanel } from './AgentConfigHistoryPanel';
import type { AgentConfig, AgentConfigUpdate, ModelId } from './types';

interface AgentConfigEditorProps {
  agentId: string;
  onDirtyChange: (isDirty: boolean) => void;
  refreshKey?: number;
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400">Loading editor...</span>
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

export function AgentConfigEditor({
  agentId,
  onDirtyChange,
  refreshKey = 0,
}: AgentConfigEditorProps) {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'user' | 'model'>('system');

  // Fetch config
  useEffect(() => {
    async function fetchConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/agent-configs/${encodeURIComponent(agentId)}`);
        const result = await response.json();

        if (result.success && result.data) {
          const fetchedConfig = {
            ...result.data,
            createdAt: new Date(result.data.createdAt),
          };
          setConfig(fetchedConfig);
          setOriginalConfig(fetchedConfig);
          setLastSaved(fetchedConfig.createdAt);
        } else if (response.status === 404) {
          // No config exists - create empty state
          const emptyConfig: AgentConfig = {
            id: agentId,
            systemPrompt: '',
            userPrompt: null,
            model: null,
            temperature: null,
            maxTokens: null,
            maxIterations: null,
            createdAt: new Date(),
          };
          setConfig(emptyConfig);
          setOriginalConfig(emptyConfig);
          setLastSaved(null);
        } else {
          setError(result.message || 'Failed to load config');
        }
      } catch (err) {
        setError('Failed to load agent config');
        console.error('Failed to fetch agent config:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, [agentId, refreshKey]);

  // Track dirty state
  useEffect(() => {
    if (!config || !originalConfig) {
      onDirtyChange(false);
      return;
    }

    const isDirty =
      config.systemPrompt !== originalConfig.systemPrompt ||
      config.userPrompt !== originalConfig.userPrompt ||
      config.model !== originalConfig.model ||
      config.temperature !== originalConfig.temperature ||
      config.maxTokens !== originalConfig.maxTokens ||
      config.maxIterations !== originalConfig.maxIterations;

    onDirtyChange(isDirty);
  }, [config, originalConfig, onDirtyChange]);

  // Update handlers
  const handleSystemPromptChange = useCallback((value: string) => {
    setConfig((prev) => (prev ? { ...prev, systemPrompt: value } : null));
  }, []);

  const handleUserPromptChange = useCallback((value: string) => {
    setConfig((prev) => (prev ? { ...prev, userPrompt: value || null } : null));
  }, []);

  const handleModelConfigChange = useCallback((field: string, value: ModelId | number | null) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);

    try {
      const update: AgentConfigUpdate = {
        systemPrompt: config.systemPrompt,
        userPrompt: config.userPrompt,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxIterations: config.maxIterations,
      };

      const response = await fetch(`/api/agent-configs/${encodeURIComponent(agentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const savedConfig = {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
      };
      setConfig(savedConfig);
      setOriginalConfig(savedConfig);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [agentId, config]);

  // Revert to history version
  const handleRevert = useCallback(
    async (version: AgentConfig) => {
      setIsSaving(true);
      setError(null);

      try {
        const update: AgentConfigUpdate = {
          systemPrompt: version.systemPrompt,
          userPrompt: version.userPrompt,
          model: version.model,
          temperature: version.temperature,
          maxTokens: version.maxTokens,
          maxIterations: version.maxIterations,
        };

        const response = await fetch(`/api/agent-configs/${encodeURIComponent(agentId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        const savedConfig = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
        };
        setConfig(savedConfig);
        setOriginalConfig(savedConfig);
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to revert');
      } finally {
        setIsSaving(false);
      }
    },
    [agentId]
  );

  const isDirty =
    config &&
    originalConfig &&
    (config.systemPrompt !== originalConfig.systemPrompt ||
      config.userPrompt !== originalConfig.userPrompt ||
      config.model !== originalConfig.model ||
      config.temperature !== originalConfig.temperature ||
      config.maxTokens !== originalConfig.maxTokens ||
      config.maxIterations !== originalConfig.maxIterations);

  if (isLoading) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <EditorSkeleton />
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Failed to load config</div>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex gap-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{agentId}</Badge>
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
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="system">System Prompt</TabsTrigger>
            <TabsTrigger value="user">User Prompt</TabsTrigger>
            <TabsTrigger value="model">Model Config</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="flex-1 overflow-hidden m-0 p-0">
            <CodeMirrorEditor
              value={config.systemPrompt}
              onChange={handleSystemPromptChange}
              placeholder="Enter system prompt..."
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="user" className="flex-1 overflow-hidden m-0 p-0">
            <CodeMirrorEditor
              value={config.userPrompt || ''}
              onChange={handleUserPromptChange}
              placeholder="Enter user prompt (optional)..."
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="model" className="flex-1 overflow-auto p-4">
            <ModelConfigPanel
              model={config.model}
              temperature={config.temperature}
              maxTokens={config.maxTokens}
              maxIterations={config.maxIterations}
              onChange={handleModelConfigChange}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* History Panel */}
      {isHistoryOpen && (
        <AgentConfigHistoryPanel
          agentId={agentId}
          onRevert={handleRevert}
          onClose={() => setIsHistoryOpen(false)}
          refreshKey={refreshKey}
        />
      )}
    </div>
  );
}
