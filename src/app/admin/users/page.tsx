"use client";
import { useEffect, useState } from 'react';

interface UserRow {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  timezone: string;
  preferredSendHour: number;
  createdAt: string;
  profile?: unknown | null;
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [batchHour, setBatchHour] = useState<number>(new Date().getUTCHours());
  const [batchDate, setBatchDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [batchDryRun, setBatchDryRun] = useState<boolean>(true);
  const [batchForce, setBatchForce] = useState<boolean>(false);
  const [batchSubmitting, setBatchSubmitting] = useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      await fetchUsers();
    })();
    // We intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=1&pageSize=20`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  async function runBatchDailyMessages() {
    try {
      setBatchSubmitting(true);
      const params = new URLSearchParams();
      params.set('testMode', 'true');
      if (batchHour !== undefined && batchHour !== null) params.set('testHour', String(batchHour));
      if (batchDate) params.set('testDate', new Date(batchDate).toISOString());
      params.set('dryRun', String(batchDryRun));
      if (batchForce) params.set('forceGenerate', 'true');
      const res = await fetch(`/api/cron/daily-messages?${params.toString()}`, { method: 'GET' });
      if (!res.ok) {
        const text = await res.text();
        alert(`Batch failed: ${text}`);
        return;
      }
      const data = await res.json();
      alert(`Batch complete. processed=${data.processed} failed=${data.failed}`);
    } finally {
      setBatchSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Users</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Search name/email/phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button onClick={fetchUsers} disabled={loading} style={{ padding: 8, borderRadius: 6 }}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/users/new" style={{ marginLeft: 'auto', padding: 8, borderRadius: 6, background: '#0a7', color: 'white', textDecoration: 'none' }}>
          New User
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/users/simulate" style={{ padding: 8, borderRadius: 6, border: '1px solid #0a7', color: '#0a7', textDecoration: 'none' }}>
          Inbound Simulation
        </a>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
          <span style={{ fontWeight: 600 }}>Batch Daily (UTC)</span>
          <label>
            Hour:
            <input type="number" min={0} max={23} value={batchHour} onChange={(e) => setBatchHour(Number(e.target.value))} style={{ width: 64, marginLeft: 6, padding: 4, border: '1px solid #ddd', borderRadius: 4 }} />
          </label>
          <label>
            Date:
            <input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} style={{ marginLeft: 6, padding: 4, border: '1px solid #ddd', borderRadius: 4 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={batchDryRun} onChange={(e) => setBatchDryRun(e.target.checked)} /> Dry run
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={batchForce} onChange={(e) => setBatchForce(e.target.checked)} /> Force generate
          </label>
          <button onClick={runBatchDailyMessages} disabled={batchSubmitting} style={{ padding: 8, borderRadius: 6 }}>
            {batchSubmitting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Total: {total}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Phone</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Has Profile</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 8 }}>
                <a href={`/admin/users/${u.id}`} style={{ color: '#0a7' }}>{u.name || '—'}</a>
              </td>
              <td style={{ padding: 8 }}>{u.phoneNumber}</td>
              <td style={{ padding: 8 }}>{u.email || '—'}</td>
              <td style={{ padding: 8 }}>{u.profile ? 'Yes' : 'No'}</td>
              <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
