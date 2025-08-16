import Link from 'next/link';

async function getUser(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users/${userId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const data = await getUser(params.userId);
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
              <div>No profile.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
