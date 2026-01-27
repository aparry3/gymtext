'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { DossierSection } from './DossierSection';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
  userId: string;
}

// StructuredProfile from the database (simplified version for display)
interface StructuredProfile {
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  preferences: string[];
  injuries: string[];
  constraints: Array<{
    value: string;
    start: string | null;
    end: string | null;
  }>;
  equipmentAccess: string[];
}

interface UserData {
  id: string;
  name: string;
  units: 'imperial' | 'metric';
  profile?: StructuredProfile | null;
}

// Map profile data to display sections
function getDisplaySections(profile: StructuredProfile | null | undefined): Record<string, string> {
  if (!profile) {
    return {
      trainingExperience: '',
      currentGoals: '',
      injuriesConstraints: '',
      preferencesStyle: '',
      equipmentAvailability: '',
    };
  }

  // Training Experience
  const trainingExperience = profile.experienceLevel
    ? `Experience Level: ${profile.experienceLevel}`
    : '';

  // Current Goals
  const currentGoals = profile.goals?.length > 0
    ? profile.goals.join('\n')
    : '';

  // Injuries & Constraints
  const injuriesList = profile.injuries?.length > 0
    ? profile.injuries.map((i) => `Injury: ${i}`)
    : [];
  const constraintsList = profile.constraints?.length > 0
    ? profile.constraints.map((c) => {
        let str = c.value;
        if (c.start || c.end) {
          const dates = [];
          if (c.start) dates.push(`from ${c.start}`);
          if (c.end) dates.push(`until ${c.end}`);
          str += ` (${dates.join(' ')})`;
        }
        return str;
      })
    : [];
  const injuriesConstraints = [...injuriesList, ...constraintsList].join('\n');

  // Preferences & Style
  const preferencesStyle = profile.preferences?.length > 0
    ? profile.preferences.join('\n')
    : '';

  // Equipment Availability
  const equipmentAvailability = profile.equipmentAccess?.length > 0
    ? profile.equipmentAccess.join('\n')
    : '';

  return {
    trainingExperience: trainingExperience.trim(),
    currentGoals: currentGoals.trim(),
    injuriesConstraints: injuriesConstraints.trim(),
    preferencesStyle: preferencesStyle.trim(),
    equipmentAvailability: equipmentAvailability.trim(),
  };
}

export function ProfileView({ userId }: ProfileViewProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/profile`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleUnitsChange = async (units: 'imperial' | 'metric') => {
    if (!userData || userData.units === units) return;

    // Optimistic update
    setUserData((prev) => (prev ? { ...prev, units } : null));

    try {
      await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units }),
      });
    } catch (error) {
      console.error('Error updating units:', error);
      // Revert on error
      setUserData((prev) => (prev ? { ...prev, units: prev.units } : null));
    }
  };

  const handleSectionSave = async (section: string, content: string) => {
    await fetch(`/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, content }),
    });

    // Refetch to get updated data
    const response = await fetch(`/api/users/${userId}/profile`);
    if (response.ok) {
      const data = await response.json();
      setUserData(data.data);
    }
  };

  const handleAiUpdate = () => {
    if (!aiMessage.trim()) return;
    alert(`AI Update feature coming soon!\n\nYour message: "${aiMessage}"`);
    setAiMessage('');
  };

  const displaySections = getDisplaySections(userData?.profile);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/me"
                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-white">Your Profile</h1>
            </div>

            {/* Units Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => handleUnitsChange('imperial')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  userData?.units === 'imperial'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                LBS
              </button>
              <button
                onClick={() => handleUnitsChange('metric')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  userData?.units === 'metric'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                KG
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* AI Update Bar */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <MessageSquare size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-slate-300">
                Tell me about any changes to your fitness situation and I&apos;ll update your profile.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiUpdate()}
                  placeholder="e.g., I hurt my shoulder last week..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAiUpdate}
                  disabled={!aiMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DossierSection
            title="Training Experience"
            content={displaySections.trainingExperience}
            onSave={(content) => handleSectionSave('trainingExperience', content)}
            isLoading={isLoading}
          />
          <DossierSection
            title="Current Goals"
            content={displaySections.currentGoals}
            onSave={(content) => handleSectionSave('currentGoals', content)}
            isLoading={isLoading}
          />
          <DossierSection
            title="Injuries & Constraints"
            content={displaySections.injuriesConstraints}
            onSave={(content) => handleSectionSave('injuriesConstraints', content)}
            isLoading={isLoading}
          />
          <DossierSection
            title="Preferences & Style"
            content={displaySections.preferencesStyle}
            onSave={(content) => handleSectionSave('preferencesStyle', content)}
            isLoading={isLoading}
          />
          <div className="md:col-span-2">
            <DossierSection
              title="Equipment Availability"
              content={displaySections.equipmentAvailability}
              onSave={(content) => handleSectionSave('equipmentAvailability', content)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
