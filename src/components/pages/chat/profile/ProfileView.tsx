"use client";
import { lazy, Suspense } from 'react';
import type { User, FitnessProfile } from '@/server/models/user';
import { useProfileData } from './hooks/useProfileData';
import { useProfileSections } from './hooks/useProfileSections';
import PersonalInfoSection from './sections/PersonalInfoSection';
import GoalsSection from './sections/GoalsSection';
import ProgressBar from './components/ProgressBar';

// Lazy load less critical sections for better performance
const TrainingStatusSection = lazy(() => import('./sections/TrainingStatusSection'));
const AvailabilitySection = lazy(() => import('./sections/AvailabilitySection'));
const EquipmentSection = lazy(() => import('./sections/EquipmentSection'));
const PreferencesSection = lazy(() => import('./sections/PreferencesSection'));
const MetricsSection = lazy(() => import('./sections/MetricsSection'));
const ConstraintsSection = lazy(() => import('./sections/ConstraintsSection'));
const ActivityDataSection = lazy(() => import('./sections/ActivityDataSection'));

// Loading component for lazy sections
const SectionSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 bg-gray-300 rounded"></div>
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

interface ProfileViewProps {
  currentUser: Partial<User>;
  currentProfile: Partial<FitnessProfile>;
  canSave?: boolean;
  missingFields?: string[];
  onSaveProfile?: () => void;
  isStreaming?: boolean;
  className?: string;
  hideHeader?: boolean;
}

export default function ProfileView({
  currentUser,
  currentProfile,
  canSave = false,
  missingFields = [],
  onSaveProfile,
  isStreaming = false,
  className = '',
  hideHeader = false,
}: ProfileViewProps) {
  // Use custom hooks for better performance and state management
  const {
    processedUserData,
    processedProfileData,
    completeness,
    hasAnyData,
    isEmpty,
    isLoading
  } = useProfileData({ currentUser, currentProfile });

  const {
    visibleSections,
    isSectionExpanded,
    toggleSection,
    sectionsWithData
  } = useProfileSections({ 
    processedUserData, 
    processedProfileData,
    defaultExpandedSections: ['personalInfo', 'goals']
  });

  // Render section with proper lazy loading and error boundaries
  const renderSection = (section: { id: string; dataCount: number }) => {
    const isExpanded = isSectionExpanded(section.id as 'personalInfo' | 'goals' | 'trainingStatus' | 'availability' | 'equipment' | 'preferences' | 'metrics' | 'constraints' | 'activityData');
    const onToggle = () => toggleSection(section.id as 'personalInfo' | 'goals' | 'trainingStatus' | 'availability' | 'equipment' | 'preferences' | 'metrics' | 'constraints' | 'activityData');
    const commonProps = {
      isExpanded,
      onToggle,
      dataCount: section.dataCount
    };

    const sectionComponent = (() => {
      switch (section.id) {
        case 'personalInfo':
          return <PersonalInfoSection key={section.id} userData={processedUserData} profileData={processedProfileData} {...commonProps} />;
        case 'goals':
          return <GoalsSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'trainingStatus':
          return <TrainingStatusSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'availability':
          return <AvailabilitySection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'equipment':
          return <EquipmentSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'preferences':
          return <PreferencesSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'metrics':
          return <MetricsSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'constraints':
          return <ConstraintsSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        case 'activityData':
          return <ActivityDataSection key={section.id} profileData={processedProfileData} {...commonProps} />;
        default:
          return null;
      }
    })();

    // Wrap lazy components in Suspense
    if (['trainingStatus', 'availability', 'equipment', 'preferences', 'metrics', 'constraints', 'activityData'].includes(section.id)) {
      return (
        <Suspense key={section.id} fallback={<SectionSkeleton />}>
          {sectionComponent}
        </Suspense>
      );
    }

    return sectionComponent;
  };

  return (
    <div className={`h-full flex flex-col min-h-0 ${className}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
              {completeness > 0 && (
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={completeness}
                    size="sm"
                    color="emerald"
                    showLabel={true}
                    className="w-16"
                  />
                </div>
              )}
            </div>
            {canSave && (
              <div className="flex items-center text-sm text-emerald-600">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Ready to save
              </div>
            )}
            {!canSave && !hasAnyData && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Being built from conversation
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">Building your profile...</span>
              </div>
            </div>
          )}
          
          {isEmpty && !isLoading ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Let&apos;s build your profile
              </h4>
              <p className="text-gray-600 max-w-sm mx-auto">
                Share your fitness goals and preferences in the chat, and we&apos;ll build your personalized profile automatically.
              </p>
            </div>
          ) : hasAnyData && !isLoading ? (
            <div className="space-y-4">
              {visibleSections.map(renderSection)}
              
              {/* Show data quality summary if we have some sections */}
              {sectionsWithData.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Profile sections: {sectionsWithData.length} of {visibleSections.length} with data
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {completeness}% complete
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Missing fields alert */}
          {missingFields.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Just a few more details needed
                  </p>
                  <p className="text-sm text-amber-700">
                    <strong>Still need:</strong> {missingFields.map(field => {
                      const fieldNames: Record<string, string> = {
                        'name': 'your name',
                        'email': 'email address', 
                        'phone': 'phone number',
                        'timezone': 'timezone',
                        'preferredSendHour': 'preferred workout time',
                        'primaryGoal': 'fitness goal',
                        'gender': 'gender',
                        'age': 'age'
                      };
                      return fieldNames[field] || field;
                    }).join(', ')}
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    Keep chatting to complete your profile, then you can start your coaching journey!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save button with enhanced messaging */}
          {canSave && onSaveProfile && (
            <div className="mt-6 space-y-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium mb-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ready to Start
                </div>
                <p className="text-green-600 text-xs leading-relaxed">
                  You can save your profile anytime and start your fitness journey. Don&apos;t worry if you missed something - you can always text us later to update your information!
                </p>
              </div>
              <button
                onClick={onSaveProfile}
                disabled={!canSave || isStreaming}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? 'Creating Account...' : 'Continue to SMS Coaching'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}