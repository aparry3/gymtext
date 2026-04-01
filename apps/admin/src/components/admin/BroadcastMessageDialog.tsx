'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/components/admin/types';

interface BroadcastMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface BroadcastResult {
  sent: number;
  failed: number;
  total: number;
  failures: { userId: string; error: string }[];
}

type Step = 'compose' | 'confirm' | 'sending' | 'result';

export function BroadcastMessageDialog({ open, onOpenChange, onSuccess }: BroadcastMessageDialogProps) {
  const [step, setStep] = useState<Step>('compose');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch users when dialog opens
  useEffect(() => {
    if (!open) return;
    setIsLoadingUsers(true);
    fetch('/api/users?pageSize=1000&hasSubscription=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success !== false) {
          const userData = data.data?.users ?? data.users ?? [];
          setUsers(userData);
        }
      })
      .catch(() => setUsers([]))
      .finally(() => setIsLoadingUsers(false));
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('compose');
      setMessage('');
      setSelectedIds(new Set());
      setSearch('');
      setResult(null);
      setError(null);
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleUser = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
  }, [filteredUsers]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const canReview = message.trim().length > 0 && message.length <= 1600 && selectedIds.size > 0;

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds]
  );

  const handleSend = async () => {
    setStep('sending');
    setError(null);
    try {
      const res = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send broadcast');
      }
      setResult(data.data);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast');
      setStep('confirm');
    }
  };

  const handleClose = () => {
    if (result) onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={step === 'sending' ? undefined : handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Broadcast Message</DialogTitle>
          <DialogDescription>
            {step === 'compose' && 'Compose a message and select recipients.'}
            {step === 'confirm' && 'Review and confirm your broadcast.'}
            {step === 'sending' && 'Sending messages...'}
            {step === 'result' && 'Broadcast complete.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Compose */}
        {step === 'compose' && (
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Type your broadcast message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1600}
              />
              <p className={`text-xs mt-1 text-right ${message.length > 1600 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {message.length}/1600
              </p>
            </div>

            {/* User Selection */}
            <div className="flex flex-col overflow-hidden flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Recipients <Badge variant="secondary">{selectedIds.size} selected</Badge>
                </label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">
                    Select All
                  </button>
                  <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline">
                    Deselect All
                  </button>
                </div>
              </div>

              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="border rounded-md overflow-y-auto flex-1 min-h-0" style={{ maxHeight: '250px' }}>
                {isLoadingUsers ? (
                  <p className="p-4 text-sm text-gray-500 text-center">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 block truncate">
                          {user.name || 'Unnamed'}
                        </span>
                        <span className="text-xs text-gray-500 block truncate">
                          {user.phoneNumber}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Message Preview</p>
              <div className="rounded-md bg-gray-50 border p-3 text-sm whitespace-pre-wrap">
                {message}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Recipients ({selectedIds.size})
              </p>
              <div className="text-sm text-gray-600">
                {selectedUsers.slice(0, 5).map((u) => u.name || u.phoneNumber).join(', ')}
                {selectedIds.size > 5 && ` and ${selectedIds.size - 5} more`}
              </div>
            </div>

          </div>
        )}

        {/* Sending */}
        {step === 'sending' && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">Sending to {selectedIds.size} recipients...</p>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div className="space-y-3">
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-800">
                Successfully queued {result.sent} of {result.total} messages
              </p>
            </div>
            {result.failed > 0 && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm font-medium text-red-800 mb-1">
                  {result.failed} failed:
                </p>
                <ul className="text-xs text-red-700 space-y-1">
                  {result.failures.map((f, i) => (
                    <li key={i}>{f.userId}: {f.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          {step === 'compose' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep('confirm')} disabled={!canReview}>
                Review &amp; Send
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('compose')}>Back</Button>
              <Button variant="destructive" onClick={handleSend}>
                Send Broadcast
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
