"use client";
import { useState } from 'react';

export default function InboundSimulationPage() {
  const [form, setForm] = useState({
    phone: '',
    message: '',
    showContext: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResponse(null);
    try {
      const twilioNumber = process.env.NEXT_PUBLIC_TWILIO_NUMBER || '+15555555555';
      const data = new FormData();
      data.set('Body', form.message);
      data.set('From', form.phone);
      data.set('To', twilioNumber);
      data.set('MessageSid', `SM${Date.now()}`);
      data.set('AccountSid', 'ACtest123456789');
      data.set('NumMedia', '0');

      const res = await fetch('/api/sms', { method: 'POST', body: data });
      const text = await res.text();
      setResponse(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Inbound SMS Simulation</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <div>
          <label>Phone (From)</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+15551234567" required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div>
          <label>Message</label>
          <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <button type="submit" disabled={submitting} style={{ padding: 10, borderRadius: 6 }}>
          {submitting ? 'Simulating...' : 'Simulate Inbound'}
        </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      {response && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Raw TwiML Response</h2>
          <pre style={{ background: '#f9f9f9', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{response}</pre>
        </div>
      )}
    </div>
  );
}
