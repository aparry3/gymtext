import CollapsibleSection from '../components/CollapsibleSection';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface ConstraintsSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const ConstraintsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export default function ConstraintsSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: ConstraintsSectionProps) {
  const hasData = !!(profileData.constraints && profileData.constraints.length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="constraints"
        title="Limitations & Constraints"
        icon={<ConstraintsIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('constraints')}
          icon={<ConstraintsIcon />}
        />
      </CollapsibleSection>
    );
  }

  const constraints = profileData.constraints!;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'moderate':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'mild':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injury':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'equipment':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'schedule':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'mobility':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <CollapsibleSection
      id="constraints"
      title="Limitations & Constraints"
      icon={<ConstraintsIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-3">
        {constraints.map((constraint) => (
          <div
            key={constraint.id}
            className={`rounded-lg border p-4 ${getSeverityColor(constraint.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getTypeIcon(constraint.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold">
                    {constraint.label}
                  </h4>
                  <div className="flex items-center gap-2">
                    {constraint.severity && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                        {constraint.severity}
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      constraint.status === 'active' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {constraint.status}
                    </span>
                  </div>
                </div>
                
                {constraint.affectedAreas && constraint.affectedAreas.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium">Affected areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {constraint.affectedAreas.map((area, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-0.5 bg-white bg-opacity-50 rounded text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {constraint.modifications && (
                  <div className="mt-2">
                    <span className="text-xs font-medium">Modifications:</span>
                    <p className="text-xs mt-1 opacity-90">{constraint.modifications}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}