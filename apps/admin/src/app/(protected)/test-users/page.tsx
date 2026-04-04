'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MessageSquare, RefreshCw, Radio } from 'lucide-react';

interface TestUser {
  id: string;
  name: string;
  phoneNumber: string;
  slug: string;
  programName: string | null;
  programId: string | null;
  enrollmentStatus: string | null;
  onboardingStatus: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function TestUsersPage() {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTestUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/test-users');
      const data = await res.json();
      if (data.success) {
        setTestUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch test users:', err);
    }
  }, []);

  useEffect(() => {
    fetchTestUsers().finally(() => setIsLoading(false));
  }, [fetchTestUsers]);

  const handleSetActive = async (userId: string | null) => {
    try {
      await fetch('/api/test-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchTestUsers();
    } catch (err) {
      console.error('Failed to set active test user:', err);
    }
  };

  const handleReOnboard = async (userId: string) => {
    try {
      const res = await fetch(`/api/test-users/${userId}/re-onboard`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await fetchTestUsers();
      }
    } catch (err) {
      console.error('Failed to re-onboard:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminHeader
        title="Test Users"
        subtitle="Sign up for any program using your admin phone number to create a test user. Re-signing up resets the test user."
      />

      {/* Active SMS Identity */}
      {testUsers.some((u) => u.isActive) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Active SMS Identity:</strong>{' '}
          {testUsers.find((u) => u.isActive)?.programName || testUsers.find((u) => u.isActive)?.slug}
          {' — '}
          Inbound texts from your phone will route to this identity.
          <button
            onClick={() => handleSetActive(null)}
            className="ml-2 text-blue-600 underline hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      )}

      {/* Test Users List */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : testUsers.length === 0 ? (
        <p className="text-sm text-gray-500">No test users yet. Sign up for a program using your admin phone to create one.</p>
      ) : (
        <div className="space-y-3">
          {testUsers.map((user) => (
            <Card key={user.id} className={`p-4 ${user.isActive ? 'ring-2 ring-blue-400' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{user.programName || user.slug}</span>
                    {user.isActive && (
                      <Badge variant="default" className="text-xs">
                        <Radio className="w-3 h-3 mr-1" />
                        Active SMS
                      </Badge>
                    )}
                    {user.enrollmentStatus && (
                      <Badge variant="secondary" className="text-xs">
                        {user.enrollmentStatus}
                      </Badge>
                    )}
                    {user.onboardingStatus && (
                      <Badge
                        variant={user.onboardingStatus === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        onboarding: {user.onboardingStatus}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {user.phoneNumber} &middot; {user.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!user.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(user.id)}
                      title="Set as active SMS identity"
                    >
                      <Radio className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReOnboard(user.id)}
                    title="Re-onboard (regenerate plan)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Link href={`/users/${user.id}/chat`}>
                    <Button variant="outline" size="sm" title="Chat">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
