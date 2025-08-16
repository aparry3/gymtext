import Link from 'next/link';
import { ToastProvider } from '../../_components/ToastProvider';
import { MessagingForm, QuickCreateProfileButton } from '../../_components/ClientActions';

async function getUser(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users/${userId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function Inner({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const data = await getUser(userId);
  const user = data?.user;
  const activityRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users/${userId}/activity`, { cache: 'no-store' });
  const activity = activityRes.ok ? await activityRes.json() : { logs: [] };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Link href="/admin/users" style={{ color: '#0a7' }}>← Back</Link>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>User Detail</h1>
      </div>

      {!user ? (
        <p>User not found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Overview</h2>
            <div>Name: {user.name ?? '—'}</div>
            <div>Phone: {user.phoneNumber}</div>
            <div>Email: {user.email ?? '—'}</div>
            <div>Timezone: {user.timezone}</div>
            <div>Preferred Hour: {user.preferredSendHour}:00</div>
            <div>Created: {new Date(user.createdAt).toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <form action={`/api/admin/users/${user.id}/plans`} method="post">
                <button type="submit" style={{ padding: 8, borderRadius: 6 }}>Generate Plan</button>
              </form>
              <form action={`/api/admin/users/${user.id}/send-daily-message`} method="post">
                <input type="hidden" name="dryRun" value="true" />
                <button type="submit" style={{ padding: 8, borderRadius: 6 }}>Send Daily (Dry Run)</button>
              </form>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Profile</h2>
            {user.profile ? (
              <div>
                <div>Goals: {user.profile.fitnessGoals}</div>
                <div>Level: {user.profile.skillLevel}</div>
                <div>Frequency: {user.profile.exerciseFrequency}</div>
                <div>Gender: {user.profile.gender}</div>
                <div>Age: {user.profile.age}</div>
              </div>
            ) : (
              <div>
                <div>No profile.</div>
                <QuickCreateProfileButton userId={user.id} />
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Messaging</h2>
            <MessagingForm userId={user.id} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Activity</h2>
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Time</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Action</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.logs?.map((log: { id: string; createdAt: string; action: string; result: string }) => (
                    <tr key={log.id}>
                      <td style={{ padding: 8 }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{log.action}</td>
                      <td style={{ padding: 8 }}>{log.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUserDetailPage(props: { params: Promise<{ userId: string }> }) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  );
}
