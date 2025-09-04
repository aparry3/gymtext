import CollapsibleSection from '../components/CollapsibleSection';
import DataField from '../components/DataField';
import MetricDisplay from '../components/MetricDisplay';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface MetricsSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const MetricsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default function MetricsSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: MetricsSectionProps) {
  const hasData = !!(profileData.metrics && Object.keys(profileData.metrics).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="metrics"
        title="Physical Metrics"
        icon={<MetricsIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('metrics')}
          icon={<MetricsIcon />}
        />
      </CollapsibleSection>
    );
  }

  const metrics = profileData.metrics!;

  return (
    <CollapsibleSection
      id="metrics"
      title="Physical Metrics"
      icon={<MetricsIcon />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-4">
        {/* Body Composition Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Body Composition</h4>
          <div className="grid grid-cols-2 gap-3">
            {metrics.heightCm && (
              <MetricDisplay
                label="Height"
                value={Math.round((metrics.heightCm / 2.54) * 10) / 10}
                unit="in"
                type="text"
                size="sm"
                color="blue"
              />
            )}
            {metrics.bodyweight && (
              <MetricDisplay
                label="Weight"
                value={metrics.bodyweight.value}
                unit={metrics.bodyweight.unit}
                type="weight"
                size="sm"
                color="emerald"
              />
            )}
            {metrics.bodyFatPercent && (
              <MetricDisplay
                label="Body Fat"
                value={metrics.bodyFatPercent}
                type="percentage"
                size="sm"
                color="amber"
              />
            )}
          </div>
        </div>

        {/* Performance Records */}
        {metrics.prLifts && Object.keys(metrics.prLifts).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Records</h4>
            <div className="space-y-1">
              {Object.entries(metrics.prLifts).map(([liftName, liftData]) => (
                <DataField
                  key={liftName}
                  label={liftName.split(/(?=[A-Z])/).map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                  value={`${liftData.weight} ${liftData.unit}${liftData.reps ? ` x ${liftData.reps}` : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Alternative simple display for PRs */}
        {metrics.prLifts && Object.keys(metrics.prLifts).length > 3 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Strength Records</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(metrics.prLifts).slice(0, 4).map(([liftName, liftData]) => (
                <MetricDisplay
                  key={liftName}
                  label={liftName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                  value={liftData.weight}
                  unit={liftData.unit}
                  type="weight"
                  size="sm"
                  color="red"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}