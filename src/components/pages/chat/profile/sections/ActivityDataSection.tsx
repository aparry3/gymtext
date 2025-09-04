import CollapsibleSection from '../components/CollapsibleSection';
import MetricDisplay from '../components/MetricDisplay';
import DataField from '../components/DataField';
import EmptyState from '../components/EmptyState';
import { getEmptyStateMessage } from '@/utils/profile/sectionVisibility';
import type { ProcessedProfileData } from '@/utils/profile/profileProcessors';

interface ActivityDataSectionProps {
  profileData: ProcessedProfileData;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  dataCount?: number;
}

const ActivityDataIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'running':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'strength':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v8.5M7 4V3a1 1 0 00-1 1v8.5m8 4.5V21a1 1 0 01-1 1H8a1 1 0 01-1-1v-4.5M7 16h10" />
        </svg>
      );
    case 'hiking':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'cycling':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a9 9 0 1118 0 9 9 0 01-18 0zm6 0a3 3 0 106 0 3 3 0 00-6 0z" />
        </svg>
      );
    case 'skiing':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return <ActivityDataIcon />;
  }
};

interface RunningMetrics {
  weeklyMileage?: number;
  longestRun?: number;
  averagePace?: string;
  racesCompleted?: number;
}

const RunningData = ({ data }: { data: { keyMetrics?: RunningMetrics } }) => {
  if (!data || !data.keyMetrics) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {data.keyMetrics.weeklyMileage && (
          <MetricDisplay
            label="Weekly Miles"
            value={data.keyMetrics.weeklyMileage}
            type="distance"
            size="sm"
            color="blue"
          />
        )}
        {data.keyMetrics.longestRun && (
          <MetricDisplay
            label="Longest Run"
            value={data.keyMetrics.longestRun}
            type="distance"
            size="sm"
            color="emerald"
          />
        )}
        {data.keyMetrics.averagePace && (
          <MetricDisplay
            label="Average Pace"
            value={data.keyMetrics.averagePace}
            size="sm"
            color="amber"
          />
        )}
        {data.keyMetrics.racesCompleted && (
          <MetricDisplay
            label="Races"
            value={data.keyMetrics.racesCompleted}
            size="sm"
            color="red"
          />
        )}
      </div>
    </div>
  );
};

interface StrengthMetrics {
  trainingDays?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  overhead?: number;
}

const StrengthData = ({ data }: { data: { keyMetrics?: StrengthMetrics } }) => {
  if (!data || !data.keyMetrics) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {data.keyMetrics.trainingDays && (
          <MetricDisplay
            label="Training Days"
            value={data.keyMetrics.trainingDays}
            unit="per week"
            size="sm"
            color="red"
          />
        )}
        {data.keyMetrics.benchPress && (
          <MetricDisplay
            label="Bench Press"
            value={data.keyMetrics.benchPress}
            unit="lbs"
            type="weight"
            size="sm"
            color="blue"
          />
        )}
        {data.keyMetrics.squat && (
          <MetricDisplay
            label="Squat"
            value={data.keyMetrics.squat}
            unit="lbs"
            type="weight"
            size="sm"
            color="emerald"
          />
        )}
        {data.keyMetrics.deadlift && (
          <MetricDisplay
            label="Deadlift"
            value={data.keyMetrics.deadlift}
            unit="lbs"
            type="weight"
            size="sm"
            color="amber"
          />
        )}
      </div>
    </div>
  );
};

interface HikingMetrics {
  longestHike?: number;
  elevationComfort?: string;
  packWeight?: number;
  weeklyHikes?: number;
}

const HikingData = ({ data }: { data: { keyMetrics?: HikingMetrics } }) => {
  if (!data || !data.keyMetrics) return null;

  return (
    <div className="space-y-2">
      {data.keyMetrics.longestHike && (
        <DataField
          label="Longest Hike"
          value={`${data.keyMetrics.longestHike} miles`}
        />
      )}
      {data.keyMetrics.elevationComfort && (
        <DataField
          label="Elevation Comfort"
          value={data.keyMetrics.elevationComfort}
        />
      )}
      {data.keyMetrics.packWeight && (
        <DataField
          label="Pack Weight"
          value={`${data.keyMetrics.packWeight} lbs`}
        />
      )}
      {data.keyMetrics.weeklyHikes && (
        <DataField
          label="Weekly Hikes"
          value={data.keyMetrics.weeklyHikes}
        />
      )}
    </div>
  );
};

interface CyclingMetrics {
  weeklyHours?: number;
  longestRide?: number;
  averageSpeed?: number;
  terrainTypes?: string[];
}

const CyclingData = ({ data }: { data: { keyMetrics?: CyclingMetrics } }) => {
  if (!data || !data.keyMetrics) return null;

  return (
    <div className="space-y-2">
      {data.keyMetrics.weeklyHours && (
        <DataField
          label="Weekly Hours"
          value={data.keyMetrics.weeklyHours}
          type="time"
        />
      )}
      {data.keyMetrics.longestRide && (
        <DataField
          label="Longest Ride"
          value={`${data.keyMetrics.longestRide} miles`}
        />
      )}
      {data.keyMetrics.averageSpeed && (
        <DataField
          label="Average Speed"
          value={`${data.keyMetrics.averageSpeed} mph`}
        />
      )}
      {data.keyMetrics.terrainTypes && (
        <DataField
          label="Terrain Types"
          value={data.keyMetrics.terrainTypes}
          type="list"
        />
      )}
    </div>
  );
};

interface SkiingMetrics {
  daysPerSeason?: number;
  terrainComfort?: string[];
  yearsSkiing?: number;
  mountainTypes?: string[];
}

const SkiingData = ({ data }: { data: { keyMetrics?: SkiingMetrics } }) => {
  if (!data || !data.keyMetrics) return null;

  return (
    <div className="space-y-2">
      {data.keyMetrics.daysPerSeason && (
        <DataField
          label="Days per Season"
          value={data.keyMetrics.daysPerSeason}
        />
      )}
      {data.keyMetrics.terrainComfort && (
        <DataField
          label="Terrain Comfort"
          value={data.keyMetrics.terrainComfort}
          type="list"
        />
      )}
      {data.keyMetrics.yearsSkiing && (
        <DataField
          label="Years Skiing"
          value={data.keyMetrics.yearsSkiing}
        />
      )}
      {data.keyMetrics.mountainTypes && (
        <DataField
          label="Mountain Types"
          value={data.keyMetrics.mountainTypes}
          type="list"
        />
      )}
    </div>
  );
};

interface GenericActivityData {
  activityName?: string;
  experienceLevel?: string;
  keyMetrics?: Record<string, string | number>;
}

const GenericActivityData = ({ data }: { data: GenericActivityData }) => {
  if (!data || typeof data !== 'object') return null;

  return (
    <div className="space-y-2">
      {data.activityName && (
        <DataField
          label="Activity"
          value={data.activityName}
        />
      )}
      {data.experienceLevel && (
        <DataField
          label="Experience Level"
          value={data.experienceLevel}
        />
      )}
      {data.keyMetrics && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Key Metrics</h5>
          <div className="space-y-1">
            {Object.entries(data.keyMetrics).map(([key, value]) => (
              <DataField
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={value}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ActivityDataSection({
  profileData,
  isExpanded,
  onToggle,
  dataCount,
}: ActivityDataSectionProps) {
  const hasData = !!(profileData.activityData && 
    typeof profileData.activityData === 'object' && 
    Object.keys(profileData.activityData).length > 0);

  if (!hasData) {
    return (
      <CollapsibleSection
        id="activity-data"
        title="Activity-Specific Data"
        icon={<ActivityDataIcon />}
        isExpanded={isExpanded}
        onToggle={onToggle}
        dataCount={dataCount}
      >
        <EmptyState 
          message={getEmptyStateMessage('activityData')}
          icon={<ActivityDataIcon />}
        />
      </CollapsibleSection>
    );
  }

  const activityData = profileData.activityData as Record<string, string | number | string[] | Record<string, string | number>>;
  const activityType = (typeof activityData.type === 'string' ? activityData.type : 'other');

  const renderActivitySpecificData = () => {
    switch (activityType) {
      case 'running':
        return <RunningData data={activityData} />;
      case 'strength':
        return <StrengthData data={activityData} />;
      case 'hiking':
        return <HikingData data={activityData} />;
      case 'cycling':
        return <CyclingData data={activityData} />;
      case 'skiing':
        return <SkiingData data={activityData} />;
      default:
        return <GenericActivityData data={activityData} />;
    }
  };

  const getActivityTitle = () => {
    switch (activityType) {
      case 'running':
        return 'Running Data';
      case 'strength':
        return 'Strength Training Data';
      case 'hiking':
        return 'Hiking Data';
      case 'cycling':
        return 'Cycling Data';
      case 'skiing':
        return 'Skiing Data';
      default:
        const activityName = activityData.activityName;
        return (typeof activityName === 'string' && activityName) ? `${activityName} Data` : 'Activity-Specific Data';
    }
  };

  return (
    <CollapsibleSection
      id="activity-data"
      title={getActivityTitle()}
      icon={getActivityIcon(activityType)}
      isExpanded={isExpanded}
      onToggle={onToggle}
      dataCount={dataCount}
    >
      <div className="space-y-4">
        {activityData.experienceLevel && typeof activityData.experienceLevel === 'string' && (
          <DataField
            label="Experience Level"
            value={activityData.experienceLevel}
            formatter={(value) => {
              if (typeof value !== 'string') return String(value);
              return value.charAt(0).toUpperCase() + value.slice(1);
            }}
          />
        )}
        
        {renderActivitySpecificData()}

        {Array.isArray(activityData.goals) && activityData.goals.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Goals</h5>
            <div className="flex flex-wrap gap-1">
              {activityData.goals.map((goal, index: number) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {String(goal)}
                </span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(activityData.equipment) && activityData.equipment.length > 0 && (
          <DataField
            label="Equipment"
            value={activityData.equipment}
            type="list"
          />
        )}
      </div>
    </CollapsibleSection>
  );
}