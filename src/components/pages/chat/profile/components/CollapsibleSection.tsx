"use client";
import { useState } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showToggle?: boolean;
  dataCount?: number;
}

export default function CollapsibleSection({
  id,
  title,
  icon,
  isExpanded: controlledExpanded,
  onToggle,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  showToggle = true,
  dataCount,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${headerClassName}`}
        onClick={showToggle ? handleToggle : undefined}
        role={showToggle ? "button" : undefined}
        tabIndex={showToggle ? 0 : undefined}
        onKeyDown={showToggle ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        } : undefined}
        aria-expanded={showToggle ? isExpanded : undefined}
        aria-controls={showToggle ? `${id}-content` : undefined}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 h-5 w-5 text-gray-600">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-900">
            {title}
          </h3>
          {dataCount !== undefined && dataCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {dataCount} {dataCount === 1 ? 'field' : 'fields'}
            </span>
          )}
        </div>
        {showToggle && (
          <div className="flex-shrink-0">
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>
      
      {showToggle ? (
        <div
          id={`${id}-content`}
          className={`transition-all duration-200 overflow-hidden ${
            isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`px-4 pb-4 ${contentClassName}`}>
            {children}
          </div>
        </div>
      ) : (
        <div className={`px-4 pb-4 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}