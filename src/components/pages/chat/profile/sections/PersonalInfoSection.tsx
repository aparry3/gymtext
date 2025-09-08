import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedUserData, ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface PersonalInfoSectionProps {
  userData: ProcessedUserData;
  profileData?: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const PersonalInfoIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function PersonalInfoSection({
  userData,
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: PersonalInfoSectionProps) {
  const hasData = !!(userData.name || userData.email || userData.phoneNumber || profileData?.gender || profileData?.age);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="personal-info"
        title="Personal Information"
        icon={<PersonalInfoIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('personalInfo')}
          icon={<PersonalInfoIcon />}
        />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      id="personal-info"
      title="Personal Information"
      icon={<PersonalInfoIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-1">
        <DataField
          label="Name"
          value={userData.name}
        />
        <DataField
          label="Email"
          value={userData.email}
        />
        <DataField
          label="Phone"
          value={userData.phoneNumber}
        />
        {profileData?.gender && (
          <DataField
            label="Gender"
            value={profileData.gender}
            formatter={(gender) => {
              if (typeof gender !== 'string') return 'Not specified';
              // Capitalize and format the gender values
              const genderMap: Record<string, string> = {
                'male': 'Male',
                'female': 'Female',
                'non-binary': 'Non-binary',
                'prefer-not-to-say': 'Prefer not to say'
              };
              return genderMap[gender] || gender.charAt(0).toUpperCase() + gender.slice(1);
            }}
          />
        )}
        {profileData?.age && (
          <DataField
            label="Age"
            value={profileData.age}
            formatter={(age) => typeof age === 'number' ? `${age} years old` : 'Not specified'}
          />
        )}
        {userData.timezone && (
          <DataField
            label="Timezone"
            value={userData.timezone}
          />
        )}
        {userData.preferredSendHour !== null && (
          <DataField
            label="Preferred Contact Time"
            value={userData.preferredSendHour}
            formatter={(hour) => {
              if (hour === null || hour === undefined || typeof hour !== 'number') return 'Not set';
              const period = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              return `${displayHour}:00 ${period}`;
            }}
          />
        )}
        {userData.createdAt && (
          <DataField
            label="Member Since"
            value={userData.createdAt}
            type="date"
          />
        )}
      </div>
    </CollapsibleSection>
  );
}