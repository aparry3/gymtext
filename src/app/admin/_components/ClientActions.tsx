"use client";
import { useState } from 'react';
import { useToast } from './ToastProvider';

export function MessagingForm({ userId }: { userId: string }) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [dryRun, setDryRun] = useState(true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Message is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/messages/outbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, dryRun }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(`Send failed: ${data.error || res.statusText}`, 'error');
        return;
      }
      showToast(dryRun ? 'Dry run success' : 'Message sent', 'success');
      setMessage("");
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." style={{ width: '100%', minHeight: 80, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> Dry run
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 8, borderRadius: 6 }}>{submitting ? 'Sending...' : 'Send'}</button>
      </div>
    </form>
  );
}

export function QuickCreateProfileButton({ userId }: { userId: string }) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onClick() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillLevel: 'beginner', fitnessGoals: 'General fitness', exerciseFrequency: '3-4 times per week', gender: 'other', age: '30' })
      });
      if (res.ok) {
        showToast('Profile created', 'success');
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(`Failed: ${data.error || res.statusText}`, 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button onClick={onClick} disabled={submitting} style={{ marginTop: 8, padding: 8, borderRadius: 6 }}>
      {submitting ? 'Creating...' : 'Quick Create Profile'}
    </button>
  );
}
