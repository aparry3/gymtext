export function formatWeight(value: number | { value: number; unit: string }, targetUnit?: 'lbs' | 'kg'): string {
  if (typeof value === 'number') {
    return `${value} lbs`; // Default to lbs for plain numbers
  }

  const { value: weightValue, unit } = value;
  
  if (targetUnit && unit !== targetUnit) {
    if (unit === 'lbs' && targetUnit === 'kg') {
      return `${(weightValue / 2.205).toFixed(1)} kg`;
    } else if (unit === 'kg' && targetUnit === 'lbs') {
      return `${(weightValue * 2.205).toFixed(1)} lbs`;
    }
  }
  
  return `${weightValue} ${unit}`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatList(items: string[] | number[], connector: string = ', ', maxItems?: number): string {
  if (items.length === 0) {
    return 'None specified';
  }
  
  const itemsToShow = maxItems ? items.slice(0, maxItems) : items;
  const formatted = itemsToShow.join(connector);
  
  if (maxItems && items.length > maxItems) {
    const remaining = items.length - maxItems;
    return `${formatted} (+${remaining} more)`;
  }
  
  return formatted;
}

export function formatDistance(value: number, unit: 'miles' | 'km' = 'miles'): string {
  return `${value} ${unit}`;
}

export function formatPace(paceString: string): string {
  // Handle various pace formats like "8:30", "8min 30sec", "8.5 min/mile"
  if (paceString.includes(':')) {
    return `${paceString}/mi`;
  }
  return paceString;
}

export function formatHeight(heightCm: number, targetUnit: 'ft' | 'cm' = 'ft'): string {
  if (targetUnit === 'cm') {
    return `${heightCm} cm`;
  }
  
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  return `${feet}'${inches}"`;
}

export function formatExerciseList(exercises: string[], maxVisible: number = 3): {
  visible: string[];
  hidden: number;
} {
  return {
    visible: exercises.slice(0, maxVisible),
    hidden: Math.max(0, exercises.length - maxVisible)
  };
}

export function formatExperienceLevel(level: string): string {
  const levelMap: Record<string, string> = {
    'beginner': 'Beginner',
    'novice': 'Novice',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert',
    'elite': 'Elite'
  };
  
  return levelMap[level.toLowerCase()] || level.charAt(0).toUpperCase() + level.slice(1);
}

export function formatCoachingTone(tone: string): string {
  return tone.replace(/-/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function formatActivityType(activity: string): string {
  const activityMap: Record<string, string> = {
    'strength': 'Strength Training',
    'running': 'Running',
    'cycling': 'Cycling',
    'hiking': 'Hiking',
    'skiing': 'Skiing',
    'swimming': 'Swimming',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'crossfit': 'CrossFit'
  };
  
  return activityMap[activity.toLowerCase()] || activity.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function formatConstraintSeverity(severity: string): {
  text: string;
  color: 'red' | 'amber' | 'yellow' | 'gray';
} {
  switch (severity.toLowerCase()) {
    case 'severe':
      return { text: 'Severe', color: 'red' };
    case 'moderate':
      return { text: 'Moderate', color: 'amber' };
    case 'mild':
      return { text: 'Mild', color: 'yellow' };
    default:
      return { text: 'Unknown', color: 'gray' };
  }
}

export function formatFieldName(fieldName: string): string {
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}