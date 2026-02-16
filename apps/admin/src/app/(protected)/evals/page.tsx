'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnvironment } from '@/context/EnvironmentContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AgentScore {
  agentId: string;
  avgScore: number;
  count: number;
}

interface DistBucket {
  bucket: string;
  count: number;
}

interface LowScoreEntry {
  id: string;
  agentId: string;
  evalScore: number;
  input: string | null;
  createdAt: string;
}

interface EvalData {
  overall: { totalEvaluated: number; avgScore: number | null };
  agentScores: AgentScore[];
  distribution: DistBucket[];
  lowScores: LowScoreEntry[];
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-amber-600';
  return 'text-red-600';
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 8) return 'default';
  if (score >= 6) return 'secondary';
  return 'destructive';
}

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-semibold tabular-nums ${scoreColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const BUCKETS_ORDERED = ['9-10', '7-8', '5-6', '3-4', '1-2'];
const BUCKET_COLORS: Record<string, string> = {
  '9-10': 'bg-green-500',
  '7-8': 'bg-green-300',
  '5-6': 'bg-amber-400',
  '3-4': 'bg-orange-400',
  '1-2': 'bg-red-500',
};

export default function EvalsPage() {
  const router = useRouter();
  const { mode } = useEnvironment();
  const [data, setData] = useState<EvalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async (from?: string, to?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('startDate', new Date(from).toISOString());
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        params.set('endDate', end.toISOString());
      }
      const res = await fetch(`/api/evals?${params}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Failed to fetch eval data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(startDate || undefined, endDate || undefined);
  }, [fetchData, startDate, endDate, mode]);

  const totalDistribution = data?.distribution.reduce((sum, b) => sum + b.count, 0) ?? 0;
  const distMap = Object.fromEntries((data?.distribution ?? []).map(b => [b.bucket, b.count]));

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <AdminHeader
          title="Agent Evals"
          subtitle={data ? `${data.overall.totalEvaluated} evaluated invocations` : 'Loading...'}
          onRefresh={() => fetchData(startDate || undefined, endDate || undefined)}
          isLoading={isLoading}
        />

        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 h-9" />
          </div>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }} className="h-9">
              Clear
            </Button>
          )}
          <div className="flex gap-1">
            {[{ label: '7d', days: 7 }, { label: '30d', days: 30 }].map(({ label, days }) => (
              <Button key={label} variant="outline" size="sm" className="h-9" onClick={() => {
                const now = new Date();
                const from = new Date(); from.setDate(now.getDate() - days);
                setStartDate(from.toISOString().slice(0, 10));
                setEndDate(now.toISOString().slice(0, 10));
              }}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                {isLoading ? <Skeleton className="h-7 w-12" /> : (
                  <p className={`text-2xl font-bold ${data?.overall.avgScore ? scoreColor(data.overall.avgScore) : ''}`}>
                    {data?.overall.avgScore?.toFixed(1) ?? '—'}
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evaluated</p>
                {isLoading ? <Skeleton className="h-7 w-16" /> : (
                  <p className="text-2xl font-bold">{data?.overall.totalEvaluated ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Scores (&lt;5)</p>
                {isLoading ? <Skeleton className="h-7 w-8" /> : (
                  <p className="text-2xl font-bold text-red-600">{data?.lowScores.length ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Agent Scores + Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Agent Scores */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Score by Agent
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 flex-1" />
                  </div>
                ))}
              </div>
            ) : !data?.agentScores.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No eval data yet</p>
            ) : (
              <div className="space-y-3">
                {data.agentScores
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .map((agent) => (
                    <div key={agent.agentId} className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs w-40 justify-center shrink-0">
                        {agent.agentId}
                      </Badge>
                      <ScoreBar score={agent.avgScore} />
                      <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                        n={agent.count}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* Score Distribution */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Score Distribution
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : totalDistribution === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No eval data yet</p>
            ) : (
              <div className="space-y-2">
                {BUCKETS_ORDERED.map((bucket) => {
                  const count = distMap[bucket] ?? 0;
                  const pct = totalDistribution > 0 ? (count / totalDistribution) * 100 : 0;
                  return (
                    <div key={bucket} className="flex items-center gap-3">
                      <span className="text-sm w-10 text-right font-medium">{bucket}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${BUCKET_COLORS[bucket]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Low Score Alerts */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" /> Low-Scoring Invocations (Score &lt; 5)
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.lowScores.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No low-scoring invocations — looking good! 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {data.lowScores.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => router.push(`/agent-logs?agentId=${entry.agentId}`)}
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <Badge variant="destructive" className="shrink-0">
                    {entry.evalScore.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {entry.agentId}
                  </Badge>
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    {entry.input || '(no input)'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTime(entry.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
