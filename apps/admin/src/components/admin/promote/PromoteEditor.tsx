'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Check, ChevronDown, ChevronRight, ArrowUpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DiffStatus = 'changed' | 'new' | 'same' | 'production_only';

interface DiffItem {
  key: string;
  table: 'agentDefinitions' | 'contextTemplates' | 'agentExtensions';
  status: DiffStatus;
  sandbox: Record<string, unknown> | null;
  production: Record<string, unknown> | null;
  changedFields?: string[];
}

interface DiffData {
  sandboxConfigured: boolean;
  agentDefinitions: DiffItem[];
  contextTemplates: DiffItem[];
  agentExtensions: DiffItem[];
  summary: {
    changed: number;
    new: number;
    same: number;
    productionOnly: number;
  };
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: DiffStatus }) {
  const config: Record<DiffStatus, { label: string; className: string }> = {
    changed: { label: 'Changed', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    new: { label: 'New', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    same: { label: 'Same', className: 'bg-slate-100 text-slate-500 border-slate-200' },
    production_only: { label: 'Production Only', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  };
  const { label, className } = config[status];
  return <Badge className={className}>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// Field Diff View
// ---------------------------------------------------------------------------

function FieldDiff({
  fieldName,
  sandboxValue,
  productionValue,
}: {
  fieldName: string;
  sandboxValue: unknown;
  productionValue: unknown;
}) {
  const format = (v: unknown): string => {
    if (v === null || v === undefined) return '(empty)';
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  };

  return (
    <div className="grid grid-cols-[160px_1fr_1fr] gap-2 text-xs border-b border-slate-100 py-2 last:border-b-0">
      <div className="font-medium text-slate-600 truncate" title={fieldName}>
        {fieldName}
      </div>
      <div className="bg-green-50 rounded p-1.5 max-h-32 overflow-auto">
        <pre className="whitespace-pre-wrap break-all text-green-800">{format(sandboxValue)}</pre>
      </div>
      <div className="bg-red-50 rounded p-1.5 max-h-32 overflow-auto">
        <pre className="whitespace-pre-wrap break-all text-red-800">{format(productionValue)}</pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diff Row
// ---------------------------------------------------------------------------

function DiffRow({
  item,
  isSelected,
  onToggleSelect,
  onPromote,
  isPromoting,
}: {
  item: DiffItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPromote: () => void;
  isPromoting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPromotable = item.status === 'changed' || item.status === 'new';

  return (
    <div className={cn(
      'border-b border-slate-100 last:border-b-0',
      item.status === 'same' && 'opacity-60',
    )}>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          disabled={!isPromotable}
          className="h-4 w-4 rounded border-slate-300 disabled:opacity-30"
        />

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-600"
          disabled={item.status === 'same' && !item.changedFields?.length}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Key */}
        <span className="font-mono text-sm font-medium flex-1 truncate" title={item.key}>
          {item.key}
        </span>

        {/* Status */}
        <StatusBadge status={item.status} />

        {/* Changed fields */}
        {item.changedFields && item.changedFields.length > 0 && (
          <span className="text-xs text-slate-500 max-w-[200px] truncate" title={item.changedFields.join(', ')}>
            {item.changedFields.join(', ')}
          </span>
        )}

        {/* Promote button */}
        {isPromotable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPromote}
            disabled={isPromoting}
            className="gap-1.5 text-xs"
          >
            {isPromoting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowUpCircle className="h-3 w-3" />
            )}
            Promote
          </Button>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && item.changedFields && item.changedFields.length > 0 && (
        <div className="px-4 pb-3 pl-14">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <div className="grid grid-cols-[160px_1fr_1fr] gap-2 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200 mb-2">
              <div>Field</div>
              <div>Sandbox</div>
              <div>Production</div>
            </div>
            {item.changedFields.map((field) => (
              <FieldDiff
                key={field}
                fieldName={field}
                sandboxValue={item.sandbox?.[field]}
                productionValue={item.production?.[field]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expanded detail for new items */}
      {expanded && item.status === 'new' && item.sandbox && (
        <div className="px-4 pb-3 pl-14">
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
            <div className="text-xs font-medium text-blue-700 mb-2">New in sandbox:</div>
            <pre className="text-xs whitespace-pre-wrap break-all max-h-64 overflow-auto">
              {JSON.stringify(item.sandbox, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diff Table
// ---------------------------------------------------------------------------

function DiffTable({
  items,
  selectedKeys,
  onToggleSelect,
  onPromoteItem,
  promotingKeys,
}: {
  items: DiffItem[];
  selectedKeys: Set<string>;
  onToggleSelect: (key: string) => void;
  onPromoteItem: (item: DiffItem) => void;
  promotingKeys: Set<string>;
}) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-slate-400">
        No items in this category
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <DiffRow
          key={item.key}
          item={item}
          isSelected={selectedKeys.has(`${item.table}:${item.key}`)}
          onToggleSelect={() => onToggleSelect(`${item.table}:${item.key}`)}
          onPromote={() => onPromoteItem(item)}
          isPromoting={promotingKeys.has(`${item.table}:${item.key}`)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PromoteEditor() {
  const [data, setData] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [promotingKeys, setPromotingKeys] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<DiffItem[] | null>(null);

  const fetchDiff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/promote');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch diff');
      setData(json.data);
      setSelectedKeys(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiff();
  }, [fetchDiff]);

  const toggleSelect = (compositeKey: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(compositeKey)) {
        next.delete(compositeKey);
      } else {
        next.add(compositeKey);
      }
      return next;
    });
  };

  const promoteItems = async (items: DiffItem[]) => {
    const payload = items.map((item) => ({ table: item.table, key: item.key }));
    const keys = items.map((item) => `${item.table}:${item.key}`);

    setPromotingKeys((prev) => new Set([...prev, ...keys]));

    try {
      const res = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const json = await res.json();
      if (!json.success && !json.data?.results) {
        throw new Error(json.message || 'Promotion failed');
      }
      // Re-fetch diff
      await fetchDiff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promotion failed');
    } finally {
      setPromotingKeys(new Set());
    }
  };

  const handlePromoteItem = (item: DiffItem) => {
    setPromoteTarget([item]);
    setConfirmOpen(true);
  };

  const handlePromoteSelected = () => {
    if (!data) return;
    const allItems = [
      ...data.agentDefinitions,
      ...data.contextTemplates,
      ...data.agentExtensions,
    ];
    const items = allItems.filter(
      (item) => selectedKeys.has(`${item.table}:${item.key}`)
    );
    if (items.length === 0) return;
    setPromoteTarget(items);
    setConfirmOpen(true);
  };

  const handlePromoteAll = () => {
    if (!data) return;
    const allItems = [
      ...data.agentDefinitions,
      ...data.contextTemplates,
      ...data.agentExtensions,
    ];
    const promotable = allItems.filter(
      (item) => item.status === 'changed' || item.status === 'new'
    );
    if (promotable.length === 0) return;
    setPromoteTarget(promotable);
    setConfirmOpen(true);
  };

  const confirmPromote = async () => {
    if (!promoteTarget) return;
    setConfirmOpen(false);
    await promoteItems(promoteTarget);
    setPromoteTarget(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-slate-500">Computing diff...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDiff} className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  // Sandbox not configured
  if (data && !data.sandboxConfigured) {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Sandbox Not Configured</h3>
            <p className="text-sm text-amber-700 mt-1">
              The <code className="px-1 py-0.5 bg-amber-100 rounded text-xs">SANDBOX_DATABASE_URL</code> environment
              variable is not set. Without a separate sandbox database, there is nothing to diff or promote.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const totalPromotable = summary.changed + summary.new;
  const selectedCount = selectedKeys.size;

  return (
    <>
      {/* Summary Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-800 font-medium">
            {summary.changed} changed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-blue-800 font-medium">
            {summary.new} new
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600 font-medium">
            {summary.same} unchanged
          </span>
          {summary.productionOnly > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-purple-800 font-medium">
              {summary.productionOnly} production only
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDiff}
            disabled={loading}
          >
            Refresh
          </Button>

          {selectedCount > 0 && (
            <Button
              size="sm"
              onClick={handlePromoteSelected}
              className="gap-1.5"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Promote Selected ({selectedCount})
            </Button>
          )}

          {totalPromotable > 0 && (
            <Button
              size="sm"
              variant="default"
              onClick={handlePromoteAll}
              className="gap-1.5"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Promote All Changes ({totalPromotable})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agentDefinitions" className="mt-4">
        <TabsList>
          <TabsTrigger value="agentDefinitions">
            Agent Definitions ({data.agentDefinitions.length})
          </TabsTrigger>
          <TabsTrigger value="contextTemplates">
            Context Templates ({data.contextTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="agentExtensions">
            Agent Extensions ({data.agentExtensions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agentDefinitions">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
            <DiffTable
              items={data.agentDefinitions}
              selectedKeys={selectedKeys}
              onToggleSelect={toggleSelect}
              onPromoteItem={handlePromoteItem}
              promotingKeys={promotingKeys}
            />
          </div>
        </TabsContent>

        <TabsContent value="contextTemplates">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
            <DiffTable
              items={data.contextTemplates}
              selectedKeys={selectedKeys}
              onToggleSelect={toggleSelect}
              onPromoteItem={handlePromoteItem}
              promotingKeys={promotingKeys}
            />
          </div>
        </TabsContent>

        <TabsContent value="agentExtensions">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
            <DiffTable
              items={data.agentExtensions}
              selectedKeys={selectedKeys}
              onToggleSelect={toggleSelect}
              onPromoteItem={handlePromoteItem}
              promotingKeys={promotingKeys}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Promotion</DialogTitle>
            <DialogDescription>
              This will insert new versions of the following items into the production database.
              This is an append-only operation and will not delete or modify existing production data.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-auto space-y-1 py-2">
            {promoteTarget?.map((item) => (
              <div key={`${item.table}:${item.key}`} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="font-mono text-xs">{item.key}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPromote} className="gap-1.5">
              <ArrowUpCircle className="h-4 w-4" />
              Promote {promoteTarget?.length} item{promoteTarget?.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
