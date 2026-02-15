import { NextRequest, NextResponse } from 'next/server';
import { getProductionContext, getSandboxContext, isSandboxConfigured } from '@/lib/context';

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stable JSON stringify for deep comparison of JSON/array fields */
function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') {
    return JSON.stringify(value, Object.keys(value as object).sort());
  }
  return JSON.stringify(value);
}

/** Compare two values, treating arrays as sorted */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  // Array comparison (sorted)
  if (Array.isArray(a) && Array.isArray(b)) {
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }

  // JSON object comparison (sorted keys)
  if (typeof a === 'object' && typeof b === 'object') {
    return stableStringify(a) === stableStringify(b);
  }

  // Numeric comparison (handle string vs number for temperature etc.)
  if (typeof a === 'number' || typeof b === 'number') {
    return Number(a) === Number(b);
  }

  return String(a) === String(b);
}

// Fields to exclude from comparison (auto-generated)
const AGENT_DEF_EXCLUDE = new Set(['versionId', 'createdAt']);
const CONTEXT_TEMPLATE_EXCLUDE = new Set(['createdAt']);
const AGENT_EXT_EXCLUDE = new Set(['createdAt']);

function diffRecord(
  sandbox: Record<string, unknown> | null,
  production: Record<string, unknown> | null,
  excludeFields: Set<string>
): { status: DiffStatus; changedFields: string[] } {
  if (!sandbox && !production) return { status: 'same', changedFields: [] };
  if (!sandbox && production) return { status: 'production_only', changedFields: [] };
  if (sandbox && !production) return { status: 'new', changedFields: [] };

  const changedFields: string[] = [];
  const allKeys = new Set([
    ...Object.keys(sandbox!),
    ...Object.keys(production!),
  ]);

  for (const key of allKeys) {
    if (excludeFields.has(key)) continue;
    if (!valuesEqual(sandbox![key], production![key])) {
      changedFields.push(key);
    }
  }

  return {
    status: changedFields.length > 0 ? 'changed' : 'same',
    changedFields,
  };
}

// ---------------------------------------------------------------------------
// GET — Compute diff
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    if (!isSandboxConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          sandboxConfigured: false,
          agentDefinitions: [],
          contextTemplates: [],
          agentExtensions: [],
          summary: { changed: 0, new: 0, same: 0, productionOnly: 0 },
        },
      });
    }

    const [sandboxCtx, prodCtx] = await Promise.all([
      getSandboxContext(),
      getProductionContext(),
    ]);

    // Fetch all latest versions from both environments in parallel
    const [
      sbAgentDefs,
      prodAgentDefs,
      sbContextTemplates,
      prodContextTemplates,
      sbAgentExts,
      prodAgentExts,
    ] = await Promise.all([
      sandboxCtx.repos.agentDefinition.getAllActive(),
      prodCtx.repos.agentDefinition.getAllActive(),
      sandboxCtx.repos.contextTemplate.getAllLatest(),
      prodCtx.repos.contextTemplate.getAllLatest(),
      sandboxCtx.repos.agentExtension.getAllLatest(),
      prodCtx.repos.agentExtension.getAllLatest(),
    ]);

    // Build maps for lookup
    const prodAgentDefMap = new Map(prodAgentDefs.map((d) => [d.agentId, d]));
    const sbAgentDefMap = new Map(sbAgentDefs.map((d) => [d.agentId, d]));

    const ctKey = (ct: { contextType: string; variant: string }) =>
      `${ct.contextType}|${ct.variant}`;
    const prodCtMap = new Map(prodContextTemplates.map((ct) => [ctKey(ct), ct]));
    const sbCtMap = new Map(sbContextTemplates.map((ct) => [ctKey(ct), ct]));

    const extKey = (e: { agentId: string; extensionType: string; extensionKey: string }) =>
      `${e.agentId}|${e.extensionType}|${e.extensionKey}`;
    const prodExtMap = new Map(prodAgentExts.map((e) => [extKey(e), e]));
    const sbExtMap = new Map(sbAgentExts.map((e) => [extKey(e), e]));

    // Diff agent definitions
    const allAgentIds = new Set([
      ...sbAgentDefs.map((d) => d.agentId),
      ...prodAgentDefs.map((d) => d.agentId),
    ]);
    const agentDefinitionDiffs: DiffItem[] = [];
    for (const agentId of allAgentIds) {
      const sb = sbAgentDefMap.get(agentId) ?? null;
      const prod = prodAgentDefMap.get(agentId) ?? null;
      const { status, changedFields } = diffRecord(
        sb as unknown as Record<string, unknown>,
        prod as unknown as Record<string, unknown>,
        AGENT_DEF_EXCLUDE
      );
      agentDefinitionDiffs.push({
        key: agentId,
        table: 'agentDefinitions',
        status,
        sandbox: sb as unknown as Record<string, unknown>,
        production: prod as unknown as Record<string, unknown>,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
      });
    }

    // Diff context templates
    const allCtKeys = new Set([
      ...sbContextTemplates.map(ctKey),
      ...prodContextTemplates.map(ctKey),
    ]);
    const contextTemplateDiffs: DiffItem[] = [];
    for (const key of allCtKeys) {
      const sb = sbCtMap.get(key) ?? null;
      const prod = prodCtMap.get(key) ?? null;
      const { status, changedFields } = diffRecord(
        sb as unknown as Record<string, unknown>,
        prod as unknown as Record<string, unknown>,
        CONTEXT_TEMPLATE_EXCLUDE
      );
      contextTemplateDiffs.push({
        key,
        table: 'contextTemplates',
        status,
        sandbox: sb as unknown as Record<string, unknown>,
        production: prod as unknown as Record<string, unknown>,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
      });
    }

    // Diff agent extensions
    const allExtKeys = new Set([
      ...sbAgentExts.map(extKey),
      ...prodAgentExts.map(extKey),
    ]);
    const agentExtensionDiffs: DiffItem[] = [];
    for (const key of allExtKeys) {
      const sb = sbExtMap.get(key) ?? null;
      const prod = prodExtMap.get(key) ?? null;
      const { status, changedFields } = diffRecord(
        sb as unknown as Record<string, unknown>,
        prod as unknown as Record<string, unknown>,
        AGENT_EXT_EXCLUDE
      );
      agentExtensionDiffs.push({
        key,
        table: 'agentExtensions',
        status,
        sandbox: sb as unknown as Record<string, unknown>,
        production: prod as unknown as Record<string, unknown>,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
      });
    }

    // Sort each list: changed/new first, then same, then production_only
    const statusOrder: Record<DiffStatus, number> = {
      changed: 0,
      new: 1,
      same: 2,
      production_only: 3,
    };
    const sortDiffs = (a: DiffItem, b: DiffItem) =>
      statusOrder[a.status] - statusOrder[b.status] || a.key.localeCompare(b.key);

    agentDefinitionDiffs.sort(sortDiffs);
    contextTemplateDiffs.sort(sortDiffs);
    agentExtensionDiffs.sort(sortDiffs);

    // Summary
    const all = [...agentDefinitionDiffs, ...contextTemplateDiffs, ...agentExtensionDiffs];
    const summary = {
      changed: all.filter((d) => d.status === 'changed').length,
      new: all.filter((d) => d.status === 'new').length,
      same: all.filter((d) => d.status === 'same').length,
      productionOnly: all.filter((d) => d.status === 'production_only').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        sandboxConfigured: true,
        agentDefinitions: agentDefinitionDiffs,
        contextTemplates: contextTemplateDiffs,
        agentExtensions: agentExtensionDiffs,
        summary,
      },
    });
  } catch (error) {
    console.error('Error computing promote diff:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — Promote selected items
// ---------------------------------------------------------------------------

interface PromoteItem {
  table: 'agentDefinitions' | 'contextTemplates' | 'agentExtensions';
  key: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!isSandboxConfigured()) {
      return NextResponse.json(
        { success: false, message: 'Sandbox is not configured with a separate database' },
        { status: 400 }
      );
    }

    const { items } = (await request.json()) as { items: PromoteItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'items array is required' },
        { status: 400 }
      );
    }

    const [sandboxCtx, prodCtx] = await Promise.all([
      getSandboxContext(),
      getProductionContext(),
    ]);

    const results: Array<{ table: string; key: string; success: boolean; error?: string }> = [];

    for (const item of items) {
      try {
        if (item.table === 'agentDefinitions') {
          const sbDef = await sandboxCtx.repos.agentDefinition.getById(item.key);
          if (!sbDef) {
            results.push({ ...item, success: false, error: 'Not found in sandbox' });
            continue;
          }
          // Strip PK/timestamp, insert as new version in production
          const { versionId: _, createdAt: __, ...fields } = sbDef;
          await prodCtx.repos.agentDefinition.create(fields as Parameters<typeof prodCtx.repos.agentDefinition.create>[0]);
          results.push({ ...item, success: true });
        } else if (item.table === 'contextTemplates') {
          const [contextType, variant] = item.key.split('|');
          const sbTemplate = await sandboxCtx.repos.contextTemplate.getLatest(contextType, variant);
          if (!sbTemplate) {
            results.push({ ...item, success: false, error: 'Not found in sandbox' });
            continue;
          }
          const { createdAt: _, ...fields } = sbTemplate;
          await prodCtx.repos.contextTemplate.create(fields as Parameters<typeof prodCtx.repos.contextTemplate.create>[0]);
          results.push({ ...item, success: true });
        } else if (item.table === 'agentExtensions') {
          const [agentId, extensionType, extensionKey] = item.key.split('|');
          const sbExt = await sandboxCtx.repos.agentExtension.getLatest(agentId, extensionType, extensionKey);
          if (!sbExt) {
            results.push({ ...item, success: false, error: 'Not found in sandbox' });
            continue;
          }
          const { createdAt: _, ...fields } = sbExt;
          await prodCtx.repos.agentExtension.create(fields as Parameters<typeof prodCtx.repos.agentExtension.create>[0]);
          results.push({ ...item, success: true });
        } else {
          results.push({ ...item, success: false, error: `Unknown table: ${item.table}` });
        }
      } catch (err) {
        results.push({
          ...item,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const allSucceeded = results.every((r) => r.success);
    return NextResponse.json({
      success: allSucceeded,
      data: { results },
    });
  } catch (error) {
    console.error('Error promoting items:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
