"use client";
import { useState, useCallback, useMemo } from 'react';
import { 
  determineSectionOrder, 
  shouldShowSection,
  type SectionType,
  type SectionInfo 
} from '@/utils/profile/sectionVisibility';
import type { ProcessedUserData, ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface UseProfileSectionsProps {
  processedUserData: ProcessedUserData;
  processedProfileData: ProcessedProfileData;
  defaultExpandedSections?: SectionType[];
}

interface UseProfileSectionsReturn {
  sectionOrder: SectionInfo[];
  expandedSections: Set<SectionType>;
  visibleSections: SectionInfo[];
  toggleSection: (sectionId: SectionType) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isSectionExpanded: (sectionId: SectionType) => boolean;
  sectionsWithData: SectionInfo[];
  emptySections: SectionInfo[];
  prioritySections: SectionInfo[];
}

export function useProfileSections({ 
  processedUserData, 
  processedProfileData,
  defaultExpandedSections = ['personalInfo', 'goals'] 
}: UseProfileSectionsProps): UseProfileSectionsReturn {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(defaultExpandedSections)
  );

  // Calculate section order and visibility
  const sectionOrder = useMemo(() => 
    determineSectionOrder(processedUserData, processedProfileData),
    [processedUserData, processedProfileData]
  );

  const visibleSections = useMemo(() => 
    sectionOrder.filter(section => 
      shouldShowSection(section.id, processedUserData, processedProfileData)
    ),
    [sectionOrder, processedUserData, processedProfileData]
  );

  // Categorize sections
  const sectionsWithData = useMemo(() => 
    sectionOrder.filter(section => section.hasData),
    [sectionOrder]
  );

  const emptySections = useMemo(() => 
    sectionOrder.filter(section => !section.hasData),
    [sectionOrder]
  );

  const prioritySections = useMemo(() => 
    sectionOrder.filter(section => section.priority <= 3 && section.hasData),
    [sectionOrder]
  );

  // Section management functions
  const toggleSection = useCallback((sectionId: SectionType) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allSections = new Set(visibleSections.map(section => section.id));
    setExpandedSections(allSections);
  }, [visibleSections]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  const isSectionExpanded = useCallback((sectionId: SectionType) => 
    expandedSections.has(sectionId),
    [expandedSections]
  );

  // Auto-expand sections with data on initial load (for future use)
  // const autoExpandDataSections = useCallback(() => {
  //   const sectionsToExpand = new Set(defaultExpandedSections);
    
  //   // Auto-expand sections that have data and are high priority
  //   sectionsWithData
  //     .filter(section => section.priority <= 4) // Top 4 priority sections
  //     .forEach(section => sectionsToExpand.add(section.id));
    
  //   setExpandedSections(sectionsToExpand);
  // }, [sectionsWithData, defaultExpandedSections]);

  return {
    sectionOrder,
    expandedSections,
    visibleSections,
    toggleSection,
    expandAll,
    collapseAll,
    isSectionExpanded,
    sectionsWithData,
    emptySections,
    prioritySections,
  };
}