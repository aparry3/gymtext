type NextLevelLogoProps = {
  className?: string;
};

const ORANGE = '#ea580c';
const FONT_FAMILY = 'var(--font-anton), Impact, "Arial Narrow", sans-serif';

export function NextLevelLogo({ className }: NextLevelLogoProps) {
  return (
    <svg
      viewBox="0 0 700 280"
      role="img"
      aria-label="Next Level Basketball"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="30" y="170" width="40" height="90" rx="2" fill="currentColor" fillOpacity={0.3} />
      <rect x="75" y="110" width="40" height="150" rx="2" fill="currentColor" fillOpacity={0.55} />
      <rect x="120" y="55" width="40" height="205" rx="2" fill="currentColor" />

      <circle cx="140" cy="30" r="22" fill="none" stroke={ORANGE} strokeWidth={2.5} />
      <line x1="118" y1="30" x2="162" y2="30" stroke={ORANGE} strokeWidth={2} />
      <path d="M140 8 C135 20, 135 40, 140 52" fill="none" stroke={ORANGE} strokeWidth={2} />
      <path d="M140 8 C145 20, 145 40, 140 52" fill="none" stroke={ORANGE} strokeWidth={2} />

      <text
        x="195"
        y="120"
        fontFamily={FONT_FAMILY}
        fontWeight={900}
        fontSize={62}
        letterSpacing={-1}
        fill="currentColor"
      >
        NEXT
      </text>
      <text
        x="195"
        y="185"
        fontFamily={FONT_FAMILY}
        fontWeight={900}
        fontSize={62}
        letterSpacing={-1}
        fill="currentColor"
      >
        LEVEL
      </text>

      <line x1="195" y1="200" x2="530" y2="200" stroke={ORANGE} strokeWidth={4} />

      <text
        x="197"
        y="232"
        fontFamily={FONT_FAMILY}
        fontWeight={700}
        fontSize={22}
        letterSpacing={6}
        fill="currentColor"
        fillOpacity={0.55}
      >
        BASKETBALL
      </text>
    </svg>
  );
}
