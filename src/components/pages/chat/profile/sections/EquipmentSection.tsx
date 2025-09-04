import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface EquipmentSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const EquipmentIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v8.5M7 4V3a1 1 0 00-1 1v8.5m8 4.5V21a1 1 0 01-1 1H8a1 1 0 01-1-1v-4.5M7 16h10" />
  </svg>
);

export default function EquipmentSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: EquipmentSectionProps) {
  const hasData = !!(profileData.equipment && Object.keys(profileData.equipment).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="equipment"
        title="Equipment & Environment"
        icon={<EquipmentIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('equipment')}
          icon={<EquipmentIcon />}
        />
      </CollapsibleSection>
    );
  }

  const equipment = profileData.equipment!;

  return (
    <CollapsibleSection
      id="equipment"
      title="Equipment & Environment"
      icon={<EquipmentIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        {equipment.access && (
          <DataField
            label="Access Type"
            value={equipment.access}
            formatter={(access) => {
              if (typeof access !== 'string') return String(access);
              // Capitalize first letter of each word
              return access.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ');
            }}
          />
        )}
        {equipment.location && (
          <DataField
            label="Location"
            value={equipment.location}
          />
        )}
        {equipment.items && equipment.items.length > 0 && (
          <DataField
            label="Available Equipment"
            value={equipment.items}
            type="list"
          />
        )}
        {equipment.constraints && equipment.constraints.length > 0 && (
          <DataField
            label="Equipment Limitations"
            value={equipment.constraints}
            type="list"
          />
        )}
      </div>
    </CollapsibleSection>
  );
}