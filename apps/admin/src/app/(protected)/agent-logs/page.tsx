'use client'

import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Brain,
  Braces,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  FileInput,
  FileOutput,
  Filter,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AGENT_DOMAINS } from '@/components/admin/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 50

interface AgentLogEntry {
  id: string
  agentId: string
  model: string | null
  input: string | null
  messages: unknown
  response: unknown
  durationMs: number | null
  metadata: unknown
  evalResult: unknown
  evalScore: string | null
  createdAt: string
}

interface MessageBlock {
  role: string
  content: string
  section?: string
}

interface ToolCallSummary {
  name: string
  durationMs: number
}

interface LogMetadata {
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  toolCalls?: ToolCallSummary[]
  toolIterations?: number
  retryAttempt?: number
  isToolAgent?: boolean
  invokeParams?: {
    input?: unknown
    context?: unknown
    params?: unknown
  }
  [key: string]: unknown
}

interface EvalDimension {
  name: string
  weight?: number
  score?: number
  notes?: string
}

interface EvalResultSummary {
  dimensions: EvalDimension[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatCompactTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRelativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const minutes = Math.round(diffMs / 60_000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')

  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')

  const months = Math.round(days / 30)
  return rtf.format(months, 'month')
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function tryParseStructuredJson(value: string): unknown | null {
  const parsed = tryParseJson(value)
  if (parsed !== null && typeof parsed === 'object') return parsed
  return null
}

function looksLikeMarkdown(value: string): boolean {
  return /(^\s{0,3}#{1,6}\s)|(```)|(\[[^\]]+\]\([^)]+\))|(^\s*[-*+]\s)|(^\s*\d+\.\s)|(\|.+\|)/m.test(value)
}

function parseScore(value: string | null): number | null {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'border-slate-200 bg-slate-50 text-slate-600'
  if (score >= 8) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (score >= 5) return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'Unscored'
  if (score >= 8) return 'Strong'
  if (score >= 5) return 'Mixed'
  return 'Needs work'
}

function getResponseText(value: unknown): string {
  return formatJson(value)
}

function extractPreview(value: unknown, max = 220): string {
  const formatted = formatJson(value).replace(/\s+/g, ' ').trim()
  if (!formatted) return '(empty)'
  return truncate(formatted, max)
}

function parseMessages(messages: unknown): MessageBlock[] {
  if (!messages) return []

  if (Array.isArray(messages)) {
    return messages.map((message) => {
      if (!isRecord(message)) {
        return {
          role: 'unknown',
          content: formatJson(message),
        }
      }

      const content = message.content

      return {
        role: typeof message.role === 'string' ? message.role : 'unknown',
        content:
          typeof content === 'string'
            ? content
            : formatJson(content),
        section: typeof message.section === 'string' ? message.section : undefined,
      }
    })
  }

  return [
    {
      role: 'raw',
      content: formatJson(messages),
    },
  ]
}

function parseMetadata(metadata: unknown): LogMetadata | null {
  if (!metadata) return null

  if (typeof metadata === 'string') {
    const parsed = tryParseStructuredJson(metadata)
    return isRecord(parsed) ? parsed as LogMetadata : null
  }

  return isRecord(metadata) ? metadata as LogMetadata : null
}

function parseEvalResult(evalResult: unknown): EvalResultSummary | null {
  const candidate =
    typeof evalResult === 'string'
      ? tryParseStructuredJson(evalResult)
      : evalResult

  if (!isRecord(candidate) || !Array.isArray(candidate.dimensions)) return null

  return {
    dimensions: candidate.dimensions.map((dimension) => {
      if (!isRecord(dimension)) {
        return {
          name: 'Unnamed dimension',
        }
      }

      return {
        name: typeof dimension.name === 'string' ? dimension.name : 'Unnamed dimension',
        weight: typeof dimension.weight === 'number' ? dimension.weight : undefined,
        score: typeof dimension.score === 'number' ? dimension.score : undefined,
        notes: typeof dimension.notes === 'string' ? dimension.notes : undefined,
      }
    }),
  }
}

function getAgentInfo(agentId: string): { domainLabel?: string; agentLabel?: string } {
  for (const domain of AGENT_DOMAINS) {
    for (const agent of domain.agents) {
      if (agent.id === agentId) {
        return {
          domainLabel: domain.label,
          agentLabel: agent.label,
        }
      }
    }
  }

  return {}
}

function getResponseType(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'No response'
  if (Array.isArray(value)) return 'JSON array'
  if (typeof value === 'object') return 'JSON object'
  if (typeof value === 'string') return 'Text'
  return typeof value
}

function matchesSearch(log: AgentLogEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const haystacks = [
    log.id,
    log.agentId,
    log.model ?? '',
    log.input ?? '',
    getResponseText(log.response),
  ]

  return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery))
}

function getAdditionalMetadata(metadata: LogMetadata | null): Record<string, unknown> | null {
  if (!metadata) return null

  const {
    usage,
    toolCalls,
    toolIterations,
    retryAttempt,
    isToolAgent,
    invokeParams,
    ...rest
  } = metadata

  return Object.keys(rest).length > 0 ? rest : null
}

function getMessageBadgeClass(role: string): string {
  switch (role) {
    case 'system':
      return 'border-violet-200 bg-violet-50 text-violet-700'
    case 'user':
    case 'human':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'assistant':
    case 'ai':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'tool':
    case 'function':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function getSectionBadgeClass(section: string): string {
  switch (section) {
    case 'system':
      return 'bg-violet-100 text-violet-700'
    case 'context':
      return 'bg-sky-100 text-sky-700'
    case 'example':
      return 'bg-amber-100 text-amber-700'
    case 'retry':
      return 'bg-rose-100 text-rose-700'
    case 'user':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function PlainTextContent({ content }: { content: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {content}
      </pre>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-code:text-slate-800 prose-pre:border prose-pre:border-slate-200 prose-pre:bg-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

function JsonValue({ value }: { value: unknown }) {
  if (value === null) return <span className="text-slate-400">null</span>
  if (value === undefined) return <span className="text-slate-400">undefined</span>
  if (typeof value === 'boolean') return <span className="text-violet-600">{String(value)}</span>
  if (typeof value === 'number') return <span className="text-sky-600">{String(value)}</span>
  if (typeof value === 'string') {
    const displayValue = value.length > 260 ? `${value.slice(0, 260)}...` : value
    return <span className="text-emerald-700">&quot;{displayValue}&quot;</span>
  }

  return <span className="text-slate-700">{String(value)}</span>
}

function JsonTreeNode({
  label,
  value,
  defaultOpen,
}: {
  label: string
  value: unknown
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (value === null || value === undefined || typeof value !== 'object') {
    return (
      <div className="flex items-baseline gap-2 py-0.5">
        <span className="text-sm font-medium text-slate-500">{label}:</span>
        <span className="text-sm break-words">
          <JsonValue value={value} />
        </span>
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const entries = isArray
    ? value.map((entry, index) => [String(index), entry] as const)
    : Object.entries(value as Record<string, unknown>)
  const openBracket = isArray ? '[' : '{'
  const closeBracket = isArray ? ']' : '}'

  if (entries.length === 0) {
    return (
      <div className="flex items-baseline gap-2 py-0.5">
        <span className="text-sm font-medium text-slate-500">{label}:</span>
        <span className="text-sm text-slate-400">
          {openBracket}
          {closeBracket}
        </span>
      </div>
    )
  }

  return (
    <div className="py-0.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm hover:bg-white/70"
      >
        <span className="w-3 text-xs text-slate-400">{open ? '▾' : '▸'}</span>
        <span className="font-medium text-slate-500">{label}:</span>
        {!open && (
          <span className="text-slate-400">
            {openBracket} {entries.length} {isArray ? 'items' : 'keys'} {closeBracket}
          </span>
        )}
      </button>
      {open && (
        <div className="ml-4 border-l border-slate-200 pl-3">
          {entries.map(([entryLabel, entryValue]) => (
            <JsonTreeNode
              key={entryLabel}
              label={entryLabel}
              value={entryValue}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function JsonTree({ data }: { data: unknown }) {
  if (data === null || data === undefined || typeof data !== 'object') {
    return <PlainTextContent content={String(data)} />
  }

  const entries = Array.isArray(data)
    ? data.map((entry, index) => [String(index), entry] as const)
    : Object.entries(data as Record<string, unknown>)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs leading-6 text-slate-800">
      {entries.map(([label, value]) => (
        <JsonTreeNode
          key={label}
          label={label}
          value={value}
          defaultOpen={true}
        />
      ))}
    </div>
  )
}

function SmartContent({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <PlainTextContent content='(empty)' />
  }

  if (typeof value === 'string') {
    const parsed = tryParseStructuredJson(value)
    if (parsed) return <JsonTree data={parsed} />

    if (looksLikeMarkdown(value)) {
      return <MarkdownContent content={value} />
    }

    return <PlainTextContent content={value} />
  }

  if (typeof value === 'object') {
    return <JsonTree data={value} />
  }

  return <PlainTextContent content={String(value)} />
}

function CopyButton({
  text,
  title = 'Copy to clipboard',
  className,
}: {
  text: string
  title?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900',
        className
      )}
      title={title}
      aria-label={title}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  )
}

function CopyTextButton({
  text,
  label,
  className,
}: {
  text: string
  label: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn('gap-2', className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

function ScoreBadge({
  score,
  className,
}: {
  score: number | null
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        getScoreBadgeClass(score),
        className
      )}
    >
      {score === null ? 'Unscored' : `${score.toFixed(1)} ${getScoreLabel(score)}`}
    </Badge>
  )
}

function OverviewStatCard({
  title,
  value,
  helper,
  icon,
  tone,
  isLoading = false,
}: {
  title: string
  value: string
  helper: string
  icon: ReactNode
  tone: 'blue' | 'emerald' | 'amber' | 'slate'
  isLoading?: boolean
}) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <Card className="p-5">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl ring-1', toneClasses[tone])}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {title}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">{helper}</p>
        </div>
      )}
    </Card>
  )
}

function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="text-right text-sm text-slate-900">{value}</div>
    </div>
  )
}

function RawDataSection({
  title,
  value,
}: {
  title: string
  value: unknown
}) {
  return (
    <details className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white">
        {title}
      </summary>
      <div className="border-t border-slate-200 p-4">
        <SmartContent value={value} />
      </div>
    </details>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card className="px-6 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Bot className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {action}
      </div>
    </Card>
  )
}

function LogPreviewPanel({
  icon,
  label,
  text,
}: {
  icon: ReactNode
  label: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </div>
  )
}

function AgentLogListItem({
  log,
  onOpen,
}: {
  log: AgentLogEntry
  onOpen: (log: AgentLogEntry) => void
}) {
  const metadata = parseMetadata(log.metadata)
  const messages = parseMessages(log.messages)
  const score = parseScore(log.evalScore)
  const agentInfo = getAgentInfo(log.agentId)
  const toolCallCount = metadata?.toolCalls?.length ?? 0
  const totalTokens = metadata?.usage?.totalTokens

  return (
    <button
      type="button"
      onClick={() => onOpen(log)}
      className="w-full text-left"
    >
      <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5">
        <div className="space-y-5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 font-mono text-[11px]">
                  {log.agentId}
                </Badge>
                {agentInfo.domainLabel ? (
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                    {agentInfo.domainLabel}
                  </Badge>
                ) : null}
                {log.model ? (
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                    {log.model}
                  </Badge>
                ) : null}
                <ScoreBadge score={score} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {formatCompactTimestamp(log.createdAt)}
                </span>
                <span>{formatRelativeTime(log.createdAt)}</span>
                <span>{formatDuration(log.durationMs)}</span>
                <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
                {totalTokens != null ? <span>{totalTokens.toLocaleString()} tokens</span> : null}
                {toolCallCount > 0 ? <span>{toolCallCount} tool call{toolCallCount === 1 ? '' : 's'}</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {metadata?.isToolAgent ? (
                <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-[11px] text-amber-700">
                  Tool agent
                </Badge>
              ) : null}
              {metadata?.retryAttempt ? (
                <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 px-3 py-1 text-[11px] text-rose-700">
                  Retry #{metadata.retryAttempt}
                </Badge>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition-colors group-hover:bg-slate-700">
                View full log
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <LogPreviewPanel
              icon={<FileInput className="h-4 w-4" />}
              label="Input"
              text={extractPreview(log.input, 220)}
            />
            <LogPreviewPanel
              icon={<FileOutput className="h-4 w-4" />}
              label="Response"
              text={extractPreview(log.response, 220)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="font-mono text-[11px]">ID {log.id.slice(0, 8)}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>{getResponseType(log.response)}</span>
            {agentInfo.agentLabel ? (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                <span>{agentInfo.agentLabel}</span>
              </>
            ) : null}
          </div>
        </div>
      </Card>
    </button>
  )
}

function DetailMetrics({
  createdAt,
  durationMs,
  messages,
  metadata,
  score,
}: {
  createdAt: string
  durationMs: number | null
  messages: MessageBlock[]
  metadata: LogMetadata | null
  score: number | null
}) {
  const cards: Array<{
    title: string
    value: string
    helper: string
    icon: ReactNode
    tone: 'blue' | 'emerald' | 'amber' | 'slate'
  }> = [
    {
      title: 'Started',
      value: formatRelativeTime(createdAt),
      helper: formatTimestamp(createdAt),
      icon: <Clock3 className="h-5 w-5" />,
      tone: 'blue' as const,
    },
    {
      title: 'Duration',
      value: formatDuration(durationMs),
      helper: 'End-to-end invocation time',
      icon: <Sparkles className="h-5 w-5" />,
      tone: 'amber' as const,
    },
    {
      title: 'Messages',
      value: messages.length.toLocaleString(),
      helper: 'Prompt chain sent to the model',
      icon: <MessageSquareText className="h-5 w-5" />,
      tone: 'slate' as const,
    },
    {
      title: 'Tokens',
      value: metadata?.usage?.totalTokens?.toLocaleString() ?? '-',
      helper: 'Total model tokens recorded',
      icon: <Braces className="h-5 w-5" />,
      tone: 'emerald' as const,
    },
    {
      title: 'Quality',
      value: score === null ? 'Unscored' : score.toFixed(1),
      helper: score === null ? 'No evaluation stored yet' : getScoreLabel(score),
      icon: <Brain className="h-5 w-5" />,
      tone: score !== null && score < 5 ? 'amber' : 'blue',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <OverviewStatCard
          key={card.title}
          title={card.title}
          value={card.value}
          helper={card.helper}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </div>
  )
}

function UsageSidebar({
  metadata,
}: {
  metadata: LogMetadata | null
}) {
  const usage = metadata?.usage
  const toolCalls = metadata?.toolCalls ?? []

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Usage and tools</h3>
          <p className="text-sm text-slate-500">Tokens, flags, and tool execution data</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <DetailRow
          label="Input tokens"
          value={usage?.inputTokens?.toLocaleString() ?? '-'}
        />
        <DetailRow
          label="Output tokens"
          value={usage?.outputTokens?.toLocaleString() ?? '-'}
        />
        <DetailRow
          label="Total tokens"
          value={usage?.totalTokens?.toLocaleString() ?? '-'}
        />
        <DetailRow
          label="Tool iterations"
          value={metadata?.toolIterations?.toLocaleString() ?? '-'}
        />
        <DetailRow
          label="Tool agent"
          value={metadata?.isToolAgent ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Retry"
          value={metadata?.retryAttempt ? `#${metadata.retryAttempt}` : '-'}
        />
      </div>

      {toolCalls.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tool calls
          </p>
          {toolCalls.map((toolCall, index) => (
            <div
              key={`${toolCall.name}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-700">{toolCall.name}</span>
              <span className="text-sm tabular-nums text-slate-500">
                {formatDuration(toolCall.durationMs)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}

function RunDetailsSidebar({
  log,
  messages,
}: {
  log: AgentLogEntry
  messages: MessageBlock[]
}) {
  const agentInfo = getAgentInfo(log.agentId)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Run details</h3>
          <p className="text-sm text-slate-500">Identity and capture metadata</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <DetailRow label="Agent" value={<span className="font-mono">{log.agentId}</span>} />
        <DetailRow label="Domain" value={agentInfo.domainLabel ?? '-'} />
        <DetailRow label="Model" value={log.model ?? '-'} />
        <DetailRow label="Messages" value={messages.length.toLocaleString()} />
        <DetailRow label="Response type" value={getResponseType(log.response)} />
        <DetailRow label="Log ID" value={<span className="font-mono text-xs">{log.id}</span>} />
      </div>
    </Card>
  )
}

function EvaluationSection({
  evalResult,
  score,
}: {
  evalResult: unknown
  score: number | null
}) {
  const parsed = parseEvalResult(evalResult)

  if (!evalResult) return null

  return (
    <SectionCard
      title="Evaluation"
      description="Stored scoring output for this run"
      action={<ScoreBadge score={score} />}
    >
      {parsed && parsed.dimensions.length > 0 ? (
        <div className="space-y-4">
          {parsed.dimensions.map((dimension, index) => (
            <div
              key={`${dimension.name}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">{dimension.name}</p>
                  {dimension.weight != null ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Weight {(dimension.weight * 100).toFixed(0)}%
                    </p>
                  ) : null}
                </div>
                <ScoreBadge score={dimension.score ?? null} />
              </div>
              {dimension.notes ? (
                <p className="mt-4 text-sm leading-6 text-slate-700">{dimension.notes}</p>
              ) : null}
            </div>
          ))}
          <RawDataSection title="View raw evaluation JSON" value={evalResult} />
        </div>
      ) : (
        <SmartContent value={evalResult} />
      )}
    </SectionCard>
  )
}

function InvocationParamsSection({
  metadata,
  input,
}: {
  metadata: LogMetadata | null
  input: string | null
}) {
  const invokeParams = metadata?.invokeParams

  if (!invokeParams) return null

  const hasContext = invokeParams.context !== undefined
  const hasParams = invokeParams.params !== undefined
  const hasDistinctInput =
    invokeParams.input !== undefined &&
    formatJson(invokeParams.input) !== (input ?? '')

  if (!hasContext && !hasParams && !hasDistinctInput) return null

  return (
    <SectionCard
      title="Invocation parameters"
      description="Additional context captured alongside the request"
    >
      <div className="space-y-5">
        {hasDistinctInput ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Resolved input</p>
              <CopyButton text={formatJson(invokeParams.input)} title="Copy resolved input" />
            </div>
            <SmartContent value={invokeParams.input} />
          </div>
        ) : null}

        {hasContext ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Context</p>
              <CopyButton text={formatJson(invokeParams.context)} title="Copy context" />
            </div>
            <SmartContent value={invokeParams.context} />
          </div>
        ) : null}

        {hasParams ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Params</p>
              <CopyButton text={formatJson(invokeParams.params)} title="Copy params" />
            </div>
            <SmartContent value={invokeParams.params} />
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}

function LogDetailView({
  log,
  onBack,
  onRefresh,
  isLoading,
}: {
  log: AgentLogEntry
  onBack: () => void
  onRefresh: () => void
  isLoading: boolean
}) {
  const metadata = parseMetadata(log.metadata)
  const messages = parseMessages(log.messages)
  const score = parseScore(log.evalScore)
  const agentInfo = getAgentInfo(log.agentId)
  const additionalMetadata = getAdditionalMetadata(metadata)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="space-y-6">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white ring-0 shadow-2xl shadow-slate-950/15">
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="-ml-2 gap-2 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to logs
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] text-white">
                    {log.agentId}
                  </Badge>
                  {agentInfo.domainLabel ? (
                    <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80">
                      {agentInfo.domainLabel}
                    </Badge>
                  ) : null}
                  {log.model ? (
                    <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80">
                      {log.model}
                    </Badge>
                  ) : null}
                  <ScoreBadge
                    score={score}
                    className="border-white/15 bg-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {agentInfo.agentLabel ?? 'Agent log'}
                  </h1>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">
                    Created {formatTimestamp(log.createdAt)}. Review the input, full prompt chain,
                    output, evaluation, and runtime metadata from one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="gap-2 border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading ? 'animate-spin' : '')} />
                  Refresh
                </Button>
                <CopyTextButton
                  text={getResponseText(log.response)}
                  label="Copy response"
                  className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatRelativeTime(log.createdAt)}
              </span>
              <span>{formatDuration(log.durationMs)}</span>
              <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
              {metadata?.usage?.totalTokens != null ? (
                <span>{metadata.usage.totalTokens.toLocaleString()} total tokens</span>
              ) : null}
              {metadata?.toolCalls?.length ? (
                <span>{metadata.toolCalls.length} tool call{metadata.toolCalls.length === 1 ? '' : 's'}</span>
              ) : null}
            </div>
          </div>
        </Card>

        <DetailMetrics
          createdAt={log.createdAt}
          durationMs={log.durationMs}
          messages={messages}
          metadata={metadata}
          score={score}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="space-y-6">
            <SectionCard
              title="Input"
              description="The original input captured for this run"
              action={log.input ? <CopyButton text={log.input} title="Copy input" /> : null}
            >
              {log.input ? (
                <SmartContent value={log.input} />
              ) : (
                <PlainTextContent content="(no input captured)" />
              )}
            </SectionCard>

            <SectionCard
              title={`Messages (${messages.length})`}
              description="The full prompt chain sent to the model"
            >
              {messages.length === 0 ? (
                <PlainTextContent content="(no messages captured)" />
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', getMessageBadgeClass(message.role))}
                        >
                          {message.role}
                        </Badge>
                        {message.section ? (
                          <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', getSectionBadgeClass(message.section))}>
                            {message.section}
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-400">
                          {message.content.length.toLocaleString()} chars
                        </span>
                        <div className="ml-auto">
                          <CopyButton text={message.content} title="Copy message" />
                        </div>
                      </div>
                      <div className="p-4">
                        <SmartContent value={message.content} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Response"
              description="The final output stored for this run"
              action={<CopyButton text={getResponseText(log.response)} title="Copy response" />}
            >
              <SmartContent value={log.response} />
            </SectionCard>

            <EvaluationSection evalResult={log.evalResult} score={score} />

            <InvocationParamsSection metadata={metadata} input={log.input} />

            {additionalMetadata ? (
              <SectionCard
                title="Additional metadata"
                description="Structured metadata not already summarized above"
              >
                <SmartContent value={additionalMetadata} />
              </SectionCard>
            ) : null}

            {log.metadata != null ? (
              <RawDataSection title="View raw metadata payload" value={log.metadata} />
            ) : null}
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <RunDetailsSidebar log={log} messages={messages} />
            <UsageSidebar metadata={metadata} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentLogsPage() {
  const [logs, setLogs] = useState<AgentLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [agentIdFilter, setAgentIdFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<AgentLogEntry | null>(null)

  const fetchLogs = useCallback(
    async (agentId: string, page: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (agentId !== 'all') params.set('agentId', agentId)
        params.set('page', String(page))
        params.set('pageSize', String(PAGE_SIZE))

        const response = await fetch(`/api/agent-logs?${params.toString()}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch agent logs')
        }

        const fetchedLogs = result.data.logs as AgentLogEntry[]

        setLogs(fetchedLogs)
        setTotal(result.data.pagination.total)
        setTotalPages(result.data.pagination.totalPages)
        setSelectedLog((current) => {
          if (!current) return null
          return fetchedLogs.find((log) => log.id === current.id) ?? null
        })
      } catch (fetchError) {
        setError('Failed to load agent logs')
        console.error('Error fetching agent logs:', fetchError)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchLogs(agentIdFilter, currentPage)
  }, [agentIdFilter, currentPage, fetchLogs])

  const handleRefresh = useCallback(() => {
    fetchLogs(agentIdFilter, currentPage)
  }, [agentIdFilter, currentPage, fetchLogs])

  const handleAgentIdChange = useCallback((value: string) => {
    setAgentIdFilter(value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleOpenLog = useCallback((log: AgentLogEntry) => {
    setSelectedLog(log)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedLog(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleResetFilters = useCallback(() => {
    setAgentIdFilter('all')
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  const handleClearLogs = useCallback(async () => {
    if (!window.confirm(`Delete all ${total} agent logs? This cannot be undone.`)) return

    try {
      const response = await fetch('/api/agent-logs', { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to clear logs')
      }

      setCurrentPage(1)
      setSearchQuery('')
      setSelectedLog(null)
      fetchLogs(agentIdFilter, 1)
    } catch (clearError) {
      setError('Failed to clear logs')
      console.error('Error clearing agent logs:', clearError)
    }
  }, [agentIdFilter, fetchLogs, total])

  const visibleLogs = logs.filter((log) => matchesSearch(log, searchQuery))
  const visibleDurations = visibleLogs.filter((log) => log.durationMs !== null)
  const averageDuration =
    visibleDurations.length > 0
      ? formatDuration(
          Math.round(
            visibleDurations.reduce((sum, log) => sum + (log.durationMs ?? 0), 0) /
              visibleDurations.length
          )
        )
      : '-'
  const evaluatedLogs = visibleLogs.filter((log) => parseScore(log.evalScore) !== null).length
  const toolRuns = visibleLogs.filter((log) => parseMetadata(log.metadata)?.isToolAgent).length
  const hasActiveFilters = agentIdFilter !== 'all' || searchQuery.trim().length > 0

  if (selectedLog) {
    return (
      <LogDetailView
        log={selectedLog}
        onBack={handleBackToList}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="space-y-6">
        <AdminHeader
          title="Agent Logs"
          subtitle={`${total.toLocaleString()} total invocations`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={total === 0 || isLoading}
              className="gap-2 border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear all logs
            </Button>
          }
        />

        {error ? (
          <Card className="border border-rose-200 bg-rose-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-700">Could not load agent logs</p>
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800"
              >
                Retry
              </Button>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewStatCard
            title="Total"
            value={total.toLocaleString()}
            helper="All stored invocations"
            icon={<Sparkles className="h-5 w-5" />}
            tone="blue"
            isLoading={isLoading}
          />
          <OverviewStatCard
            title="Visible"
            value={visibleLogs.length.toLocaleString()}
            helper={`Filtered from ${logs.length.toLocaleString()} logs on this page`}
            icon={<Filter className="h-5 w-5" />}
            tone="slate"
            isLoading={isLoading}
          />
          <OverviewStatCard
            title="Avg duration"
            value={averageDuration}
            helper="Based on visible logs with timing data"
            icon={<Clock3 className="h-5 w-5" />}
            tone="amber"
            isLoading={isLoading}
          />
          <OverviewStatCard
            title="Evaluated"
            value={evaluatedLogs.toLocaleString()}
            helper={`${toolRuns.toLocaleString()} tool-enabled runs on this page`}
            icon={<Brain className="h-5 w-5" />}
            tone="emerald"
            isLoading={isLoading}
          />
        </div>

        <Card className="p-5">
          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Agent filter
              </label>
              <Select value={agentIdFilter} onValueChange={handleAgentIdChange}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Search current page
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search input, response, model, or log ID"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="w-full xl:w-auto"
              >
                Reset filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </Badge>
            {agentIdFilter !== 'all' ? (
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                Filtered to {agentIdFilter}
              </Badge>
            ) : null}
            {searchQuery.trim() ? (
              <span>Showing matches from the {PAGE_SIZE} logs loaded for this page.</span>
            ) : (
              <span>Open any card to inspect the full prompt chain, response, and metadata.</span>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-5">
                <div className="space-y-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-7 w-32 rounded-full" />
                      <Skeleton className="h-7 w-20 rounded-full" />
                      <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </Card>
            ))
          ) : visibleLogs.length === 0 ? (
            <EmptyState
              title={total === 0 ? 'No agent logs yet' : 'No logs match these filters'}
              description={
                total === 0
                  ? 'Run an agent in the app and new logs will appear here for inspection.'
                  : searchQuery.trim()
                    ? 'Search only applies to the logs loaded for this page. Clear the search or move between pages to inspect more runs.'
                    : 'Adjust the agent filter or reset the current filters to see more runs.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            visibleLogs.map((log) => (
              <AgentLogListItem key={log.id} log={log} onOpen={handleOpenLog} />
            ))
          )}
        </div>

        {totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={PAGE_SIZE}
          />
        ) : null}
      </div>
    </div>
  )
}
