import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface AvailabilitySectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const AvailabilityIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AvailabilitySection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: AvailabilitySectionProps) {
  const hasData = !!(profileData.availability && Object.keys(profileData.availability).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="availability"
        title="Schedule & Availability"
        icon={<AvailabilityIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('availability')}
          icon={<AvailabilityIcon />}
        />
      </CollapsibleSection>
    );
  }

  const availability = profileData.availability!;

  return (
    <CollapsibleSection
      id="availability"
      title="Schedule & Availability"
      icon={<AvailabilityIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        {availability.daysPerWeek && (
          <DataField
            label="Days per Week"
            value={availability.daysPerWeek}
            formatter={(days) => {
              if (typeof days !== 'number') return String(days);
              return `${days} ${days === 1 ? 'day' : 'days'}`;
            }}
          />
        )}
        {availability.minutesPerSession && (
          <DataField
            label="Session Duration"
            value={availability.minutesPerSession}
            type="time"
          />
        )}
        {availability.preferredTimes && (
          <DataField
            label="Preferred Times"
            value={availability.preferredTimes}
          />
        )}
        {availability.travelPattern && (
          <DataField
            label="Travel Schedule"
            value={availability.travelPattern}
          />
        )}
        {availability.notes && (
          <DataField
            label="Schedule Notes"
            value={availability.notes}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}