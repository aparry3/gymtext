'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight, FileText, MessageSquare } from 'lucide-react';
import { useEnvironment } from '@/context/EnvironmentContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Pagination } from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { AGENT_DOMAINS } from '@/components/admin/types';

// ─── Types ───────────────────────────────────────────────────────────

interface AgentLogEntry {
  id: string;
  agentId: string;
  model: string | null;
  input: string | null;
  messages: unknown;
  response: unknown;
  durationMs: number | null;
  metadata: unknown;
  evalResult: unknown;
  evalScore: string | null;
  createdAt: string;
}

interface MessageBlock {
  role: string;
  content: string;
  section?: string;
}

interface LogMetadata {
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  toolCalls?: { name: string; durationMs: number }[];
  toolIterations?: number;
  retryAttempt?: number;
  isToolAgent?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

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

function tryParseJson(value: string): unknown | null {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
    return null;
  } catch {
    return null;
  }
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
      section: typeof m === 'object' && m !== null && 'section' in m ? String((m as Record<string, unknown>).section) : undefined,
    }));
  }
  return [{ role: 'raw', content: formatJson(messages) }];
}

function parseMetadata(metadata: unknown): LogMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  return metadata as LogMetadata;
}

// ─── Copy Button ─────────────────────────────────────────────────────

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all
        ${copied
          ? 'bg-green-100 text-green-700'
          : 'bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground'
        } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Code Block with Syntax Highlighting ──────────────────────────────

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/60 my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/40">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all
            ${copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneLight}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown Renderer ────────────────────────────────────────────────

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isInline = !className && typeof children === 'string' && !children.includes('\n');
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-muted text-[0.8125rem] font-mono text-foreground/90 border border-border/40" {...props}>
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pre({ children, ...props }) {
    // The code component handles everything; pre is just a passthrough
    return <>{children}</>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-3 border-primary/30 pl-4 my-3 text-muted-foreground italic">
        {children}
      </blockquote>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-border/60">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/60 border-b border-border/40">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-2.5 border-b border-border/30 text-sm">
        {children}
      </td>
    );
  },
  h1({ children }) {
    return <h1 className="text-xl font-bold mt-6 mb-3 pb-2 border-b border-border/40 text-foreground">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-semibold mt-5 mb-2.5 text-foreground">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>;
  },
  h4({ children }) {
    return <h4 className="text-sm font-semibold mt-3 mb-1.5 text-foreground">{children}</h4>;
  },
  p({ children }) {
    return <p className="my-2 leading-relaxed text-foreground/90">{children}</p>;
  },
  ul({ children }) {
    return <ul className="my-2 ml-1 space-y-1 list-disc list-outside pl-5 text-foreground/90">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2 ml-1 space-y-1 list-decimal list-outside pl-5 text-foreground/90">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed pl-1">{children}</li>;
  },
  hr() {
    return <hr className="my-4 border-border/50" />;
  },
  a({ href, children }) {
    return (
      <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-foreground/80">{children}</em>;
  },
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="px-5 py-4 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── JSON Tree View ──────────────────────────────────────────────────

function JsonValue({ value }: { value: unknown }) {
  if (value === null) return <span className="text-gray-400">null</span>;
  if (value === undefined) return <span className="text-gray-400">undefined</span>;
  if (typeof value === 'boolean') return <span className="text-purple-600">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-blue-600">{String(value)}</span>;
  if (typeof value === 'string') {
    if (value.length > 300) {
      return <span className="text-green-700">&quot;{value.slice(0, 300)}...&quot;</span>;
    }
    return <span className="text-green-700">&quot;{value}&quot;</span>;
  }
  return <span>{String(value)}</span>;
}

function JsonTreeNode({ label, value, defaultOpen }: { label: string; value: unknown; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  if (value === null || value === undefined || typeof value !== 'object') {
    return (
      <div className="flex gap-1 items-baseline py-0.5">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <span className="text-sm"><JsonValue value={value} /></span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  if (entries.length === 0) {
    return (
      <div className="flex gap-1 items-baseline py-0.5">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <span className="text-sm text-gray-400">{bracketOpen}{bracketClose}</span>
      </div>
    );
  }

  return (
    <div className="py-0.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 hover:bg-muted/50 rounded px-1 -ml-1 text-sm"
      >
        <span className="text-xs text-muted-foreground w-3">{open ? '▾' : '▸'}</span>
        <span className="font-medium text-muted-foreground">{label}:</span>
        {!open && <span className="text-gray-400">{bracketOpen} {entries.length} {isArray ? 'items' : 'keys'} {bracketClose}</span>}
      </button>
      {open && (
        <div className="ml-4 border-l border-muted pl-3">
          {entries.map(([key, val]) => (
            <JsonTreeNode key={key} label={key} value={val} defaultOpen={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function JsonTree({ data }: { data: unknown }) {
  if (data === null || data === undefined || typeof data !== 'object') {
    return <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">{String(data)}</pre>;
  }

  const isArray = Array.isArray(data);
  const entries = isArray
    ? (data as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(data as Record<string, unknown>);

  return (
    <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs border border-border/40">
      {entries.map(([key, val]) => (
        <JsonTreeNode key={key} label={key} value={val} defaultOpen={true} />
      ))}
    </div>
  );
}

// ─── Smart Content Viewer ─────────────────────────────────────────────

function SmartContent({ value }: { value: unknown }) {
  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed) return <JsonTree data={parsed} />;
    return <MarkdownContent content={value} />;
  }
  if (typeof value === 'object' && value !== null) {
    return <JsonTree data={value} />;
  }
  return <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">{formatJson(value)}</pre>;
}

// ─── Message Content ──────────────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  const parsed = tryParseJson(content);
  if (parsed) {
    return (
      <div className="p-3">
        <JsonTree data={parsed} />
      </div>
    );
  }
  return <MarkdownContent content={content} />;
}

// ─── Collapsible Message ─────────────────────────────────────────────

const roleConfig: Record<string, { bg: string; border: string; icon: string; label?: string }> = {
  system: { bg: 'bg-violet-50', border: 'border-violet-200', icon: '⚙️' },
  user: { bg: 'bg-sky-50', border: 'border-sky-200', icon: '👤' },
  human: { bg: 'bg-sky-50', border: 'border-sky-200', icon: '👤', label: 'user' },
  assistant: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🤖' },
  ai: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🤖', label: 'assistant' },
  tool: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔧' },
  function: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚡' },
};

const sectionBadgeColors: Record<string, string> = {
  system: 'bg-purple-100 text-purple-700 border-purple-200',
  context: 'bg-blue-100 text-blue-700 border-blue-200',
  example: 'bg-amber-100 text-amber-700 border-amber-200',
  previous: 'bg-gray-100 text-gray-700 border-gray-200',
  retry: 'bg-red-100 text-red-700 border-red-200',
  user: 'bg-green-100 text-green-700 border-green-200',
};

function CollapsibleMessage({ msg, index, defaultOpen }: { msg: MessageBlock; index: number; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = roleConfig[msg.role] || { bg: 'bg-gray-50', border: 'border-gray-200', icon: '📄' };
  const displayRole = config.label || msg.role;
  const isLong = msg.content.length > 500;
  const preview = isLong ? msg.content.slice(0, 120).replace(/\n/g, ' ') + '...' : '';

  return (
    <div className={`rounded-xl border ${config.border} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left ${config.bg} hover:brightness-[0.97] transition-all`}
      >
        <span className="text-sm">{config.icon}</span>
        <span className="text-sm font-semibold capitalize text-foreground/80">{displayRole}</span>
        {msg.section && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sectionBadgeColors[msg.section] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {msg.section}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground ml-1">#{index + 1}</span>

        {/* Preview when collapsed */}
        {!isOpen && preview && (
          <span className="text-xs text-muted-foreground truncate ml-2 flex-1">{preview}</span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {isOpen && <CopyButton text={msg.content} />}
          {isLong && (
            isOpen
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="bg-white border-t border-border/30">
          <MessageContent content={msg.content} />
        </div>
      )}
    </div>
  );
}

// ─── Metadata Panel ──────────────────────────────────────────────────

function MetadataPanel({ metadata }: { metadata: unknown }) {
  const parsed = parseMetadata(metadata);

  if (!parsed) {
    return <SmartContent value={metadata} />;
  }

  const hasUsage = parsed.usage && (parsed.usage.inputTokens || parsed.usage.outputTokens || parsed.usage.totalTokens);
  const hasToolCalls = parsed.toolCalls && parsed.toolCalls.length > 0;
  const hasFlags = parsed.isToolAgent || parsed.retryAttempt;

  if (!hasUsage && !hasToolCalls && !hasFlags) {
    return <SmartContent value={metadata} />;
  }

  return (
    <div className="space-y-4 pr-1">
      {hasFlags && (
        <div className="flex gap-2 flex-wrap">
          {parsed.isToolAgent && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Tool Agent</Badge>
          )}
          {parsed.retryAttempt && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Retry #{parsed.retryAttempt}</Badge>
          )}
        </div>
      )}

      {hasUsage && (
        <div className="border rounded-xl p-5">
          <h4 className="text-sm font-semibold mb-3">Token Usage</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Input</p>
              <p className="text-lg font-semibold tabular-nums">{parsed.usage!.inputTokens?.toLocaleString() ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Output</p>
              <p className="text-lg font-semibold tabular-nums">{parsed.usage!.outputTokens?.toLocaleString() ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold tabular-nums">{parsed.usage!.totalTokens?.toLocaleString() ?? '-'}</p>
            </div>
          </div>
        </div>
      )}

      {hasToolCalls && (
        <div className="border rounded-xl p-5">
          <h4 className="text-sm font-semibold mb-3">
            Tool Calls
            {parsed.toolIterations != null && (
              <span className="text-muted-foreground font-normal ml-2">({parsed.toolIterations} iteration{parsed.toolIterations !== 1 ? 's' : ''})</span>
            )}
          </h4>
          <div className="space-y-2">
            {parsed.toolCalls!.map((tc, i) => (
              <div key={i} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg">
                <span className="text-sm font-mono">{tc.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(tc.durationMs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Log Detail View ──────────────────────────────────────────────────

function LogDetailView({
  log,
  onBack,
}: {
  log: AgentLogEntry;
  onBack: () => void;
}) {
  const messages = useMemo(() => parseMessages(log.messages), [log.messages]);

  const getResponseText = (): string => {
    if (typeof log.response === 'string') return log.response;
    if (log.response != null) return JSON.stringify(log.response, null, 2);
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to logs
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm">{log.agentId}</Badge>
            {log.model && <Badge variant="secondary" className="text-sm">{log.model}</Badge>}
            {log.durationMs !== null && (
              <span className="text-sm text-muted-foreground">
                ⏱ {formatDuration(log.durationMs)}
              </span>
            )}
            {log.evalScore != null && (
              <Badge
                variant="outline"
                className={
                  parseFloat(log.evalScore) >= 7
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : parseFloat(log.evalScore) >= 4
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                }
              >
                Score: {parseFloat(log.evalScore).toFixed(1)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            {formatTimestamp(log.createdAt)}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="messages">
          <TabsList>
            <TabsTrigger value="input" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Input
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Messages ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="response" className="gap-1.5">
              Response
            </TabsTrigger>
            {log.metadata != null ? <TabsTrigger value="metadata">Metadata</TabsTrigger> : null}
            {log.evalResult != null ? <TabsTrigger value="eval">Eval</TabsTrigger> : null}
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                <span className="text-sm font-medium text-muted-foreground">Input</span>
                <CopyButton text={log.input || ''} />
              </div>
              <div>
                {log.input ? <SmartContent value={log.input} /> : (
                  <p className="text-sm text-muted-foreground p-5">(no input)</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground p-5">(no messages)</p>
              ) : (
                messages.map((msg, i) => (
                  <CollapsibleMessage
                    key={i}
                    msg={msg}
                    index={i}
                    defaultOpen={
                      // Auto-collapse system messages (usually long prompts), open everything else
                      msg.role !== 'system' || messages.length <= 3
                    }
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Response Tab */}
          <TabsContent value="response">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                <span className="text-sm font-medium text-muted-foreground">Response</span>
                <CopyButton text={getResponseText()} />
              </div>
              <div>
                <SmartContent value={log.response} />
              </div>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          {log.metadata != null ? (
            <TabsContent value="metadata">
              <MetadataPanel metadata={log.metadata} />
            </TabsContent>
          ) : null}

          {/* Eval Tab */}
          {log.evalResult != null ? (
            <TabsContent value="eval">
              <div className="space-y-3 pr-1">
                {log.evalScore != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Score:</span>
                    <Badge
                      variant="outline"
                      className={
                        parseFloat(log.evalScore) >= 7
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : parseFloat(log.evalScore) >= 4
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {parseFloat(log.evalScore).toFixed(1)}
                    </Badge>
                  </div>
                )}
                <SmartContent value={log.evalResult} />
              </div>
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

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
  }, []);

  const handleClearLogs = useCallback(async () => {
    if (!window.confirm(`Delete all ${total} agent logs? This cannot be undone.`)) return;

    try {
      const response = await fetch('/api/agent-logs', { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to clear logs');
      }
      setCurrentPage(1);
      fetchLogs(agentIdFilter, 1);
    } catch (err) {
      setError('Failed to clear logs');
      console.error('Error clearing agent logs:', err);
    }
  }, [total, fetchLogs, agentIdFilter]);

  if (selectedLog) {
    return <LogDetailView log={selectedLog} onBack={() => setSelectedLog(null)} />;
  }

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
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={total === 0 || isLoading}
              className="text-destructive hover:text-destructive"
            >
              Clear all logs
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Agent</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Model</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Input</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Response</th>
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
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {log.evalScore != null ? (
                          <Badge
                            variant="outline"
                            className={
                              parseFloat(log.evalScore) >= 7
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : parseFloat(log.evalScore) >= 4
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {parseFloat(log.evalScore).toFixed(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
      </div>
    </div>
  );
}
