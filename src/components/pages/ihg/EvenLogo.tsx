import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
}

export const EvenLogo: React.FC<LogoProps> = ({ className = "h-8", variant = 'color' }) => {
  const mainColor = variant === 'white' ? '#FFFFFF' : '#3B7D44';
  const subColor = variant === 'white' ? '#FFFFFF' : '#5C6670';

  return (
    <div className={`flex flex-col items-start leading-none ${className}`}>
      <div className="flex items-baseline">
        <span
          style={{ color: mainColor }}
          className="font-sans font-black italic text-2xl tracking-tighter"
        >
          EVEN
        </span>
        <span
          style={{ color: mainColor }}
          className="font-sans font-light text-sm ml-1 tracking-widest uppercase"
        >
          Hotels
        </span>
      </div>
      <div
        style={{ color: subColor, opacity: variant === 'white' ? 0.8 : 1 }}
        className="text-[8px] uppercase tracking-[0.2em] font-medium"
      >
        An IHG Hotel
      </div>
    </div>
  );
};
