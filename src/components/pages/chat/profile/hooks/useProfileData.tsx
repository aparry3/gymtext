"use client";
import { useMemo } from 'react';
import type { User, FitnessProfile } from '@/server/models/user';
import { 
  processUserData, 
  processProfileData, 
  calculateProfileCompleteness,
  type ProcessedUserData,
  type ProcessedProfileData 
} from '@/utils/profile/profileProcessors';

interface UseProfileDataProps {
  currentUser: Partial<User>;
  currentProfile: Partial<FitnessProfile>;
}

interface UseProfileDataReturn {
  processedUserData: ProcessedUserData;
  processedProfileData: ProcessedProfileData;
  completeness: number;
  totalFields: number;
  completedFields: number;
  isLoading: boolean;
  hasAnyData: boolean;
  isEmpty: boolean;
}

export function useProfileData({ 
  currentUser, 
  currentProfile 
}: UseProfileDataProps): UseProfileDataReturn {
  // Memoize processed data to prevent unnecessary recalculations
  const processedUserData = useMemo(() => 
    processUserData(currentUser), 
    [currentUser]
  );
  
  const processedProfileData = useMemo(() => 
    processProfileData(currentProfile), 
    [currentProfile]
  );
  
  // Calculate profile completeness with memoization
  const completeness = useMemo(() => 
    calculateProfileCompleteness(processedUserData, processedProfileData),
    [processedUserData, processedProfileData]
  );

  // Calculate field statistics
  const { totalFields, completedFields } = useMemo(() => {
    const userFields = [
      processedUserData.name,
      processedUserData.email,
      processedUserData.phoneNumber,
      processedUserData.timezone,
      processedUserData.preferredSendHour,
    ].filter(field => field !== null && field !== undefined);

    const profileFields = [
      processedProfileData.primaryGoal,
      processedProfileData.experienceLevel,
      processedProfileData.currentActivity,
      processedProfileData.availability?.daysPerWeek,
      processedProfileData.availability?.minutesPerSession,
      processedProfileData.equipment?.access,
      processedProfileData.preferences?.workoutStyle,
    ].filter(field => field !== null && field !== undefined);

    return {
      totalFields: 12, // Total possible key fields
      completedFields: userFields.length + profileFields.length
    };
  }, [processedUserData, processedProfileData]);

  // Determine data states
  const hasAnyData = useMemo(() => {
    const hasUserData = Object.values(processedUserData).some(value => 
      value !== null && value !== undefined
    );
    
    const hasProfileData = Object.values(processedProfileData).some(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
    
    return hasUserData || hasProfileData;
  }, [processedUserData, processedProfileData]);

  const isEmpty = useMemo(() => !hasAnyData, [hasAnyData]);
  
  // Simple loading state (could be enhanced with actual loading logic)
  const isLoading = useMemo(() => {
    // For now, consider loading if we have partial data that seems incomplete
    return completeness > 0 && completeness < 20 && 
           Object.keys(currentUser).length > 0 && 
           !processedUserData.name;
  }, [completeness, currentUser, processedUserData.name]);

  return {
    processedUserData,
    processedProfileData,
    completeness,
    totalFields,
    completedFields,
    isLoading,
    hasAnyData,
    isEmpty,
  };
}