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

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Users</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
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
