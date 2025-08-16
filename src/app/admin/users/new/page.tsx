"use client";
import { useState } from 'react';

export default function NewUserPage() {
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    timezone: 'America/New_York',
    preferredSendHour: 8,
    fitnessGoals: '',
    skillLevel: 'intermediate',
    exerciseFrequency: '3-4 times per week',
    gender: 'other',
    age: '30',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create user');
      }
      const data = await res.json();
      window.location.href = `/admin/users/${data.user.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>New User</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <div>
          <label>Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div>
          <label>Phone Number</label>
          <input value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} required placeholder="+15551234567" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div>
          <label>Email (optional)</label>
          <input value={form.email} onChange={(e) => update('email', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Timezone</label>
            <input value={form.timezone} onChange={(e) => update('timezone', e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
          <div style={{ width: 160 }}>
            <label>Preferred Hour</label>
            <input type="number" min={0} max={23} value={form.preferredSendHour} onChange={(e) => update('preferredSendHour', Number(e.target.value))} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
        </div>
        <fieldset style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
          <legend>Optional Fitness Profile</legend>
          <div>
            <label>Goals</label>
            <input value={form.fitnessGoals} onChange={(e) => update('fitnessGoals', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Skill Level</label>
              <select value={form.skillLevel} onChange={(e) => update('skillLevel', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Frequency</label>
              <select value={form.exerciseFrequency} onChange={(e) => update('exerciseFrequency', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
                <option>2-3 times per week</option>
                <option>3-4 times per week</option>
                <option>4-5 times per week</option>
                <option>5-6 times per week</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
                <option>male</option>
                <option>female</option>
                <option>other</option>
                <option>prefer not to say</option>
              </select>
            </div>
            <div style={{ width: 160 }}>
              <label>Age</label>
              <input value={form.age} onChange={(e) => update('age', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            </div>
          </div>
        </fieldset>
        <button type="submit" disabled={submitting} style={{ padding: 10, borderRadius: 6 }}>
          {submitting ? 'Creating...' : 'Create User'}
        </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}
