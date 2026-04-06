/**
 * Stub replacement — structured microcycle display has been removed.
 * The admin app shows markdown content directly instead.
 */
export function StructuredMicrocycleRenderer({ structure }: { structure: unknown; showHeader?: boolean }) {
  if (!structure) {
    return <p className="text-sm text-muted-foreground italic">No structured data available</p>;
  }
  return (
    <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
      {JSON.stringify(structure, null, 2)}
    </pre>
  );
}

export function StructuredMicrocycleCompact({ structure }: { structure: unknown }) {
  if (!structure) return null;
  return <span className="text-xs text-muted-foreground">(structured data present)</span>;
}
