interface MetricDisplayProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  comparison?: {
    previousValue: string | number;
    unit?: string;
  };
  type?: 'weight' | 'percentage' | 'time' | 'distance' | 'reps' | 'text';
  size?: 'sm' | 'md' | 'lg';
  color?: 'gray' | 'emerald' | 'blue' | 'amber' | 'red';
  className?: string;
}

export default function MetricDisplay({
  label,
  value,
  unit,
  trend,
  comparison,
  type = 'text',
  size = 'md',
  color = 'gray',
  className = '',
}: MetricDisplayProps) {
  const formatValue = (val: string | number | null | undefined, valueType: string = type): string => {
    if (val === null || val === undefined || val === '') return '--';
    
    switch (valueType) {
      case 'weight':
        return typeof val === 'number' ? val.toFixed(1) : String(val);
      case 'percentage':
        return typeof val === 'number' ? `${val}%` : `${val}%`;
      case 'time':
        if (typeof val === 'number') {
          if (val >= 60) {
            const hours = Math.floor(val / 60);
            const minutes = val % 60;
            return minutes > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${hours}:00`;
          }
          return `${val}min`;
        }
        return String(val);
      case 'distance':
        return typeof val === 'number' ? `${val}mi` : String(val);
      case 'reps':
        return typeof val === 'number' ? `${val}x` : String(val);
      default:
        return String(val);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const colorClasses = {
    gray: 'text-gray-900',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  const bgColorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  };

  const formattedValue = formatValue(value);
  const hasValue = value !== null && value !== undefined && value !== '';

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
    
    return (
      <div className={`h-4 w-4 ${iconClass}`}>
        {trend === 'up' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        )}
        {trend === 'down' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        )}
        {trend === 'stable' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg border p-3 ${bgColorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        {getTrendIcon()}
      </div>
      
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-semibold ${sizeClasses[size]} ${colorClasses[color]}`}>
          {formattedValue}
        </span>
        {unit && hasValue && (
          <span className="text-sm text-gray-500">{unit}</span>
        )}
      </div>

      {comparison && (
        <div className="mt-1 text-xs text-gray-500">
          Previous: {formatValue(comparison.previousValue)}{comparison.unit && ` ${comparison.unit}`}
        </div>
      )}
    </div>
  );
}