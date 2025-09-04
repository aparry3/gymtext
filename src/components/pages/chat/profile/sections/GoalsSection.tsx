import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface GoalsSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const GoalsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function GoalsSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: GoalsSectionProps) {
  const hasData = !!(
    profileData.primaryGoal || 
    profileData.specificObjective || 
    profileData.experienceLevel ||
    profileData.currentActivity
  );

  if (!hasData) {
    return (
      <CollapsibleSection
        id="goals"
        title="Goals & Objectives"
        icon={<GoalsIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('goals')}
          icon={<GoalsIcon />}
        />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      id="goals"
      title="Goals & Objectives"
      icon={<GoalsIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        <DataField
          label="Primary Goal"
          value={profileData.primaryGoal}
          formatter={(value) => {
            if (!value || typeof value !== 'string') return 'Not specified yet';
            return value.charAt(0).toUpperCase() + value.slice(1);
          }}
        />
        {profileData.specificObjective && (
          <DataField
            label="Specific Objective"
            value={profileData.specificObjective}
          />
        )}
        <DataField
          label="Experience Level"
          value={profileData.experienceLevel}
          formatter={(value) => {
            if (!value || typeof value !== 'string') return 'Not specified yet';
            return value.charAt(0).toUpperCase() + value.slice(1);
          }}
        />
        {profileData.currentActivity && (
          <DataField
            label="Current Activity"
            value={profileData.currentActivity}
          />
        )}
        {profileData.eventDate && (
          <DataField
            label="Target Event Date"
            value={profileData.eventDate}
            type="date"
          />
        )}
        {profileData.timelineWeeks && (
          <DataField
            label="Timeline"
            value={profileData.timelineWeeks}
            formatter={(weeks) => `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}