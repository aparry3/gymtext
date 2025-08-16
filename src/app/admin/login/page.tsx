"use client";
import { useState } from 'react';

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get("next") || "/admin/users";
      window.location.href = next;
    } else {
      const data = await res.json().catch(() => ({ error: "Login failed" }));
      setError(data.error || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>Admin Secret</label>
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          type="password"
          placeholder="Enter ADMIN_SECRET"
          style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <button type="submit" style={{ marginTop: 12, width: "100%", padding: 10, borderRadius: 6 }}>
          Sign in
        </button>
        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      </form>
    </div>
  );
}
