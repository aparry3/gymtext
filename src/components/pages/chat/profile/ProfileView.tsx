"use client";
import { useMemo } from 'react';
import type { User, FitnessProfile } from '@/server/models/user';
import { 
  processUserData, 
  processProfileData, 
  calculateProfileCompleteness 
} from '@/utils/profile/profileProcessors';
import { 
  determineSectionOrder, 
  shouldShowSection 
} from '@/utils/profile/sectionVisibility';
import PersonalInfoSection from './sections/PersonalInfoSection';
import GoalsSection from './sections/GoalsSection';

interface ProfileViewProps {
  currentUser: Partial<User>;
  currentProfile: Partial<FitnessProfile>;
  canSave?: boolean;
  missingFields?: string[];
  onSaveProfile?: () => void;
  isStreaming?: boolean;
  className?: string;
}

export default function ProfileView({
  currentUser,
  currentProfile,
  canSave = false,
  missingFields = [],
  onSaveProfile,
  isStreaming = false,
  className = '',
}: ProfileViewProps) {
  const processedUserData = useMemo(() => processUserData(currentUser), [currentUser]);
  const processedProfileData = useMemo(() => processProfileData(currentProfile), [currentProfile]);
  
  const completeness = useMemo(() => 
    calculateProfileCompleteness(processedUserData, processedProfileData),
    [processedUserData, processedProfileData]
  );
  
  const sectionOrder = useMemo(() => 
    determineSectionOrder(processedUserData, processedProfileData),
    [processedUserData, processedProfileData]
  );

  const hasAnyData = sectionOrder.some(section => section.hasData);

  return (
    <div className={`h-full flex flex-col min-h-0 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
            {completeness > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{completeness}%</span>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6">
          {!hasAnyData ? (
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
          ) : (
            <div className="space-y-4">
              {sectionOrder.map((section) => {
                if (!shouldShowSection(section.id, processedUserData, processedProfileData)) {
                  return null;
                }

                switch (section.id) {
                  case 'personalInfo':
                    return (
                      <PersonalInfoSection
                        key={section.id}
                        userData={processedUserData}
                        dataCount={section.dataCount}
                      />
                    );
                  case 'goals':
                    return (
                      <GoalsSection
                        key={section.id}
                        profileData={processedProfileData}
                        dataCount={section.dataCount}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}

          {/* Missing fields alert */}
          {missingFields.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Still need:</strong> {missingFields.map(field => {
                  const fieldNames: Record<string, string> = {
                    'name': 'your name',
                    'email': 'email address',
                    'phone': 'phone number',
                    'primaryGoal': 'fitness goal'
                  };
                  return fieldNames[field] || field;
                }).join(', ')}
              </p>
            </div>
          )}

          {/* Save button */}
          {canSave && onSaveProfile && (
            <div className="mt-6">
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