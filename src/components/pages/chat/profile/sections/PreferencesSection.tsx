import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface PreferencesSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const PreferencesIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function PreferencesSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: PreferencesSectionProps) {
  const hasData = !!(profileData.preferences && Object.keys(profileData.preferences).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="preferences"
        title="Training Preferences"
        icon={<PreferencesIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('preferences')}
          icon={<PreferencesIcon />}
        />
      </CollapsibleSection>
    );
  }

  const preferences = profileData.preferences!;

  return (
    <CollapsibleSection
      id="preferences"
      title="Training Preferences"
      icon={<PreferencesIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        {preferences.workoutStyle && (
          <DataField
            label="Workout Style"
            value={preferences.workoutStyle}
            formatter={(style) => {
              if (typeof style !== 'string') return String(style);
              return style.charAt(0).toUpperCase() + style.slice(1);
            }}
          />
        )}
        {preferences.enjoyedExercises && preferences.enjoyedExercises.length > 0 && (
          <div className="py-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Enjoys:</span>
              <div className="text-sm font-medium text-right ml-4 max-w-[60%]">
                <div className="flex flex-wrap gap-1 justify-end">
                  {preferences.enjoyedExercises.map((exercise, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {preferences.dislikedExercises && preferences.dislikedExercises.length > 0 && (
          <div className="py-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Dislikes:</span>
              <div className="text-sm font-medium text-right ml-4 max-w-[60%]">
                <div className="flex flex-wrap gap-1 justify-end">
                  {preferences.dislikedExercises.map((exercise, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {preferences.coachingTone && (
          <DataField
            label="Coaching Style"
            value={preferences.coachingTone}
            formatter={(tone) => {
              if (typeof tone !== 'string') return String(tone);
              const formattedTone = tone.replace(/-/g, ' ');
              return formattedTone.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
            }}
          />
        )}
        {preferences.musicOrVibe && (
          <DataField
            label="Music/Vibe"
            value={preferences.musicOrVibe}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}