'use client';

import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
}

export const GymTextIcon: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'color' }) => {
  const uniqueId = useId();
  const maskId = `gymtext-mask-${uniqueId.replace(/:/g, '')}`;

  const isWhite = variant === 'white';
  const bubbleColor = isWhite ? '#FFFFFF' : '#1d7bfd';

  const dumbbellContent = (
    <>
      <rect x="35" y="42" width="30" height="10" rx="2" />
      <rect x="25" y="32" width="6" height="30" rx="2" />
      <rect x="18" y="37" width="4" height="20" rx="1" />
      <rect x="69" y="32" width="6" height="30" rx="2" />
      <rect x="78" y="37" width="4" height="20" rx="1" />
    </>
  );

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {isWhite ? (
        <>
          <mask id={maskId}>
            <rect width="100" height="100" fill="white" />
            <g fill="black">
              {dumbbellContent}
            </g>
          </mask>
          <path
            d="M50 5C25.147 5 5 23.807 5 47c0 10.4 4.05 20.01 10.8 27.5L5 95l23.5-8.5c6.5 2.8 13.6 4.5 21.5 4.5 24.853 0 45-18.807 45-42S74.853 5 50 5z"
            fill={bubbleColor}
            mask={`url(#${maskId})`}
          />
        </>
      ) : (
        <>
          <path
            d="M50 5C25.147 5 5 23.807 5 47c0 10.4 4.05 20.01 10.8 27.5L5 95l23.5-8.5c6.5 2.8 13.6 4.5 21.5 4.5 24.853 0 45-18.807 45-42S74.853 5 50 5z"
            fill={bubbleColor}
          />
          <g fill="white">
            {dumbbellContent}
          </g>
        </>
      )}
    </svg>
  );
};

export const GymTextWordmark: React.FC<LogoProps> = ({ className = "h-8", variant = 'color' }) => {
  const textColor = variant === 'white' ? '#FFFFFF' : '#1d7bfd';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <GymTextIcon className="h-full w-auto aspect-square" variant={variant} />
      <svg viewBox="0 0 170 34" className="h-[70%] w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="28"
          fontFamily="'Inter', sans-serif"
          fontWeight="800"
          fontStyle="italic"
          fontSize="32"
          fill={textColor}
          letterSpacing="-1"
        >
          GYMTEXT
        </text>
      </svg>
    </div>
  );
};
