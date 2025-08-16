import Link from 'next/link';

async function getUser(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users/${userId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const data = await getUser(userId);
  const user = data?.user;

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
              <button onClick={async () => {
                await fetch(`/api/admin/users/${user.id}/plans`, { method: 'POST' });
                alert('Plan generation requested');
              }} style={{ padding: 8, borderRadius: 6 }}>Generate Plan</button>
              <button onClick={async () => {
                await fetch(`/api/admin/users/${user.id}/send-daily-message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dryRun: true }) });
                alert('Daily message (dry run) requested');
              }} style={{ padding: 8, borderRadius: 6 }}>Send Daily (Dry Run)</button>
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
                <button onClick={async () => {
                  const res = await fetch(`/api/admin/users/${user.id}/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skillLevel: 'beginner', fitnessGoals: 'General fitness', exerciseFrequency: '3-4 times per week', gender: 'other', age: '30' }) });
                  if (res.ok) {
                    alert('Profile created');
                    location.reload();
                  } else {
                    alert('Failed to create profile');
                  }
                }} style={{ marginTop: 8, padding: 8, borderRadius: 6 }}>Quick Create Profile</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
