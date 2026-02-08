'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEnvironment } from '@/context/EnvironmentContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Pagination } from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AGENT_DOMAINS } from '@/components/admin/agents/types';

interface AgentLogEntry {
  id: string;
  agentId: string;
  model: string | null;
  input: string | null;
  messages: unknown;
  response: unknown;
  durationMs: number | null;
  metadata: unknown;
  createdAt: string;
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncate(text: string | null, max: number): string {
  if (!text) return '-';
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

interface MessageBlock {
  role: string;
  content: string;
}

function parseMessages(messages: unknown): MessageBlock[] {
  if (!messages) return [];
  if (Array.isArray(messages)) {
    return messages.map((m) => ({
      role: typeof m === 'object' && m !== null && 'role' in m ? String((m as Record<string, unknown>).role) : 'unknown',
      content:
        typeof m === 'object' && m !== null && 'content' in m
          ? typeof (m as Record<string, unknown>).content === 'string'
            ? (m as Record<string, unknown>).content as string
            : JSON.stringify((m as Record<string, unknown>).content, null, 2)
          : JSON.stringify(m, null, 2),
    }));
  }
  return [{ role: 'raw', content: formatJson(messages) }];
}

const roleColors: Record<string, string> = {
  system: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  assistant: 'bg-green-100 text-green-800',
  human: 'bg-blue-100 text-blue-800',
  ai: 'bg-green-100 text-green-800',
  tool: 'bg-orange-100 text-orange-800',
  function: 'bg-orange-100 text-orange-800',
};

function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AgentLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const messages = parseMessages(log.messages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant="outline">{log.agentId}</Badge>
            {log.model && (
              <Badge variant="secondary">{log.model}</Badge>
            )}
            {log.durationMs !== null && (
              <span className="text-sm font-normal text-muted-foreground">
                {formatDuration(log.durationMs)}
              </span>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatTimestamp(log.createdAt)}
          </p>
        </DialogHeader>

        <Tabs defaultValue="messages" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            {log.metadata != null ? <TabsTrigger value="metadata">Metadata</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="input" className="flex-1 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
              {log.input || '(no input)'}
            </pre>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 overflow-auto">
            <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">(no messages)</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div
                      className={`px-3 py-1.5 text-xs font-medium ${
                        roleColors[msg.role] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.role}
                    </div>
                    <pre className="text-sm whitespace-pre-wrap p-3 bg-muted/50 overflow-auto max-h-80">
                      {msg.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="response" className="flex-1 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
              {formatJson(log.response)}
            </pre>
          </TabsContent>

          {log.metadata != null ? (
            <TabsContent value="metadata" className="flex-1 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
                {formatJson(log.metadata)}
              </pre>
            </TabsContent>
          ) : null}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function AgentLogsPage() {
  const { mode } = useEnvironment();
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [agentIdFilter, setAgentIdFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AgentLogEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLogs = useCallback(
    async (agentId: string, page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (agentId && agentId !== 'all') params.set('agentId', agentId);
        params.set('page', String(page));
        params.set('pageSize', '50');

        const response = await fetch(`/api/agent-logs?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch agent logs');
        }

        setLogs(result.data.logs);
        setTotal(result.data.pagination.total);
        setTotalPages(result.data.pagination.totalPages);
      } catch (err) {
        setError('Failed to load agent logs');
        console.error('Error fetching agent logs:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLogs(agentIdFilter, currentPage);
  }, [fetchLogs, agentIdFilter, currentPage, mode]);

  const handleAgentIdChange = useCallback((value: string) => {
    setAgentIdFilter(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchLogs(agentIdFilter, currentPage);
  }, [fetchLogs, agentIdFilter, currentPage]);

  const handleRowClick = useCallback((log: AgentLogEntry) => {
    setSelectedLog(log);
    setDialogOpen(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <AdminHeader
          title="Agent Logs"
          subtitle={`${total} total invocations`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-destructive hover:underline"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={agentIdFilter} onValueChange={handleAgentIdChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {AGENT_DOMAINS.map((domain) => (
                <SelectGroup key={domain.id}>
                  <SelectLabel>{domain.label}</SelectLabel>
                  {domain.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.id}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Input
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No agent logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => handleRowClick(log)}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.agentId}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.model || '-'}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-muted-foreground truncate block">
                          {truncate(log.input, 60)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap tabular-nums">
                        {formatDuration(log.durationMs)}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-muted-foreground truncate block">
                          {truncate(
                            typeof log.response === 'string'
                              ? log.response
                              : JSON.stringify(log.response),
                            60
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={50}
          />
        )}

        {/* Detail Dialog */}
        <LogDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  );
}
