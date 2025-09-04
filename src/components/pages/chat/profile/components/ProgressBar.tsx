interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'amber' | 'red';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'emerald',
  showLabel = true,
  label,
  className = '',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const colorClasses = {
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
  };
  
  const bgColorClasses = {
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${bgColorClasses[color]} rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );
}