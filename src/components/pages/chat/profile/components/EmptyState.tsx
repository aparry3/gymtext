interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  message,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-6 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-3">
          <div className="h-8 w-8 text-gray-300">
            {icon}
          </div>
        </div>
      )}
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {message}
      </p>
    </div>
  );
}