"use client";
import React, { useState, useRef, useEffect } from 'react';

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
  level?: 2 | 3 | 4 | 5 | 6; // Heading level for accessibility
  description?: string; // Optional description for screen readers
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
  level = 3, // eslint-disable-line @typescript-eslint/no-unused-vars
  description,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const headerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      // Announce to screen readers when content expands
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `${title} section expanded`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [isExpanded, title]);

  // Use h3 for all section headings for consistency
  const HeadingElement = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <h3 className={className}>{children}</h3>
  );

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showToggle ? (
        <button
          ref={headerRef}
          className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset transition-colors ${headerClassName}`}
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={`${id}-content`}
          aria-describedby={description ? `${id}-description` : undefined}
          type="button"
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 h-5 w-5 text-gray-600" aria-hidden="true">
                {icon}
              </div>
            )}
            <HeadingElement className="text-sm font-semibold text-gray-900">
              {title}
            </HeadingElement>
            {dataCount !== undefined && dataCount > 0 && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                aria-label={`${dataCount} data fields in this section`}
              >
                {dataCount} {dataCount === 1 ? 'field' : 'fields'}
              </span>
            )}
          </div>
          <div className="flex-shrink-0" aria-hidden="true">
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
        </button>
      ) : (
        <div className={`flex items-center justify-between p-4 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 h-5 w-5 text-gray-600" aria-hidden="true">
                {icon}
              </div>
            )}
            <HeadingElement className="text-sm font-semibold text-gray-900">
              {title}
            </HeadingElement>
            {dataCount !== undefined && dataCount > 0 && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                aria-label={`${dataCount} data fields in this section`}
              >
                {dataCount} {dataCount === 1 ? 'field' : 'fields'}
              </span>
            )}
          </div>
        </div>
      )}
      
      {description && (
        <div id={`${id}-description`} className="sr-only">
          {description}
        </div>
      )}
      
      {showToggle ? (
        <div
          id={`${id}-content`}
          ref={contentRef}
          className={`transition-all duration-200 overflow-hidden ${
            isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isExpanded}
        >
          <div className={`px-4 pb-4 ${contentClassName}`} role="region" aria-labelledby={`${id}-header`}>
            {children}
          </div>
        </div>
      ) : (
        <div className={`px-4 pb-4 ${contentClassName}`} role="region" aria-labelledby={`${id}-header`}>
          {children}
        </div>
      )}
    </section>
  );
}