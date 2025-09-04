import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface TrainingStatusSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const TrainingStatusIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function TrainingStatusSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: TrainingStatusSectionProps) {
  const hasData = !!(profileData.currentTraining && Object.keys(profileData.currentTraining).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="training-status"
        title="Current Training"
        icon={<TrainingStatusIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('trainingStatus')}
          icon={<TrainingStatusIcon />}
        />
      </CollapsibleSection>
    );
  }

  const training = profileData.currentTraining!;

  return (
    <CollapsibleSection
      id="training-status"
      title="Current Training"
      icon={<TrainingStatusIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        {training.programName && (
          <DataField
            label="Current Program"
            value={training.programName}
          />
        )}
        {training.weeksCompleted && (
          <DataField
            label="Weeks Completed"
            value={training.weeksCompleted}
            formatter={(weeks) => typeof weeks === 'number' ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'}` : String(weeks)}
          />
        )}
        {training.focus && (
          <DataField
            label="Training Focus"
            value={training.focus}
          />
        )}
        {training.notes && (
          <DataField
            label="Notes"
            value={training.notes}
          />
        )}
        {profileData.currentActivity && (
          <DataField
            label="Primary Activity"
            value={profileData.currentActivity}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}