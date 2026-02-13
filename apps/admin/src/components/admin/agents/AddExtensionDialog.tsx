'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface AddExtensionDialogProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddExtensionDialog({
  agentId,
  open,
  onOpenChange,
  onCreated,
}: AddExtensionDialogProps) {
  const [extensionType, setExtensionType] = useState('');
  const [extensionKey, setExtensionKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!extensionType.trim() || !extensionKey.trim()) {
      setError('Both fields are required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/agent-definitions/${encodeURIComponent(agentId)}/extensions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extensionType: extensionType.trim(),
            extensionKey: extensionKey.trim(),
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create extension');
      }

      setExtensionType('');
      setExtensionKey('');
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create extension');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Extension</DialogTitle>
          <DialogDescription>
            Create a new extension for <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{agentId}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="extensionType">Extension Type</Label>
            <Input
              id="extensionType"
              value={extensionType}
              onChange={(e) => setExtensionType(e.target.value)}
              placeholder="e.g. prompt, context, config"
              className="border-slate-300 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extensionKey">Extension Key</Label>
            <Input
              id="extensionKey"
              value={extensionKey}
              onChange={(e) => setExtensionKey(e.target.value)}
              placeholder="e.g. beginner, advanced, default"
              className="border-slate-300 bg-white"
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !extensionType.trim() || !extensionKey.trim()}
            className="bg-sky-600 text-white hover:bg-sky-700"
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
