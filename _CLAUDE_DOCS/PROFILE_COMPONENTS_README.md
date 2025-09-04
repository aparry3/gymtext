# Profile Components Documentation

## Overview

The Enhanced Profile View is a comprehensive, intelligent fitness profile display system that dynamically shows user data as it's collected through conversations. It provides a responsive, accessible, and performant interface for displaying all aspects of a user's fitness journey.

## Architecture

### Core Components

#### ProfileView
**Main container component that orchestrates the entire profile display**

```tsx
interface ProfileViewProps {
  currentUser: Partial<User>;
  currentProfile: Partial<FitnessProfile>;
  canSave?: boolean;
  missingFields?: string[];
  onSaveProfile?: () => void;
  isStreaming?: boolean;
  className?: string;
}
```

**Features:**
- **Performance Optimized**: Uses custom hooks and lazy loading
- **Responsive Design**: Adapts to all screen sizes
- **Smart State Management**: Handles loading, empty, and error states
- **Accessibility**: Full screen reader and keyboard navigation support

#### CollapsibleSection  
**Reusable container for profile sections with expand/collapse functionality**

```tsx
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children: React.ReactNode;
  dataCount?: number;
  level?: 2 | 3 | 4 | 5 | 6;
  description?: string;
}
```

**Accessibility Features:**
- ARIA expanded/collapsed states
- Keyboard navigation (Enter/Space)
- Screen reader announcements
- Focus management
- Semantic heading structure

#### DataField
**Consistent key-value display component with smart formatting**

```tsx
interface DataFieldProps {
  label: string;
  value: DataFieldValue;
  type?: 'weight' | 'time' | 'date' | 'percentage' | 'list' | 'text';
  placeholder?: string;
  formatter?: (value: DataFieldValue) => string;
}
```

**Smart Formatting:**
- Weight units (lbs/kg conversion)
- Time duration (hours/minutes)
- Date localization
- Percentage display
- List formatting with separators

#### MetricDisplay
**Advanced metric cards with trends and comparisons**

```tsx
interface MetricDisplayProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  comparison?: { previousValue: string | number; unit?: string };
  type?: 'weight' | 'percentage' | 'time' | 'distance' | 'reps' | 'text';
  size?: 'sm' | 'md' | 'lg';
  color?: 'gray' | 'emerald' | 'blue' | 'amber' | 'red';
}
```

**Features:**
- Trend indicators with arrows
- Previous value comparisons  
- Multiple color themes
- Size variations
- Unit conversion support

### Section Components

#### PersonalInfoSection
Displays core user information: name, email, phone, timezone, preferred contact time, account creation date.

#### GoalsSection  
Shows fitness goals and objectives: primary goal, specific objectives, experience level, current activity, event dates, timelines.

#### TrainingStatusSection
Current training information: program name, weeks completed, training focus, notes, primary activity.

#### AvailabilitySection
Schedule and availability: days per week, session duration, preferred times, travel patterns, schedule notes.

#### EquipmentSection
Equipment and environment: access type (gym/home/outdoor), location, available equipment list, constraints.

#### PreferencesSection
Training preferences: workout style, enjoyed exercises (green tags), disliked exercises (red tags), coaching tone, music preferences.

#### MetricsSection
Physical metrics and performance: body composition (height, weight, body fat), personal records for lifts, performance tracking.

#### ConstraintsSection
Limitations and constraints: active constraints with severity indicators, affected body areas, modification requirements, type-specific icons.

#### ActivityDataSection
**Intelligent activity-specific displays that adapt to different sports:**

- **Running**: Weekly mileage, pace, race completion
- **Strength Training**: Training frequency, major lifts (bench/squat/deadlift/overhead)
- **Hiking**: Experience level, pack weight, elevation comfort
- **Cycling**: Weekly hours, terrain preferences, average speed  
- **Skiing**: Days per season, terrain comfort, experience
- **Generic Activities**: Flexible schema for any activity type

## Custom Hooks

### useProfileData
**Optimized data processing and state management**

```tsx
interface UseProfileDataReturn {
  processedUserData: ProcessedUserData;
  processedProfileData: ProcessedProfileData;
  completeness: number;
  totalFields: number;
  completedFields: number;
  isLoading: boolean;
  hasAnyData: boolean;
  isEmpty: boolean;
}
```

**Features:**
- Memoized data processing to prevent recalculations
- Comprehensive validation and edge case handling
- Profile completeness calculation
- Loading and empty state detection

### useProfileSections  
**Section visibility and state management**

```tsx
interface UseProfileSectionsReturn {
  sectionOrder: SectionInfo[];
  expandedSections: Set<SectionType>;
  visibleSections: SectionInfo[];
  toggleSection: (sectionId: SectionType) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isSectionExpanded: (sectionId: SectionType) => boolean;
  sectionsWithData: SectionInfo[];
  emptySections: SectionInfo[];
  prioritySections: SectionInfo[];
}
```

**Intelligence:**
- Dynamic section ordering based on data availability
- Priority-based section display
- Smart expand/collapse state management
- Section categorization (with data, empty, priority)

## Utility Functions

### Data Processing (`profileProcessors.ts`)
- `processUserData()` - Validates and formats user data
- `processProfileData()` - Validates and formats fitness profile data  
- `calculateProfileCompleteness()` - Calculates profile completion percentage
- `formatDisplayValue()` - Smart value formatting with type detection

### Section Management (`sectionVisibility.ts`)
- `determineSectionOrder()` - Prioritizes sections based on data richness
- `shouldShowSection()` - Determines section visibility
- `getEmptyStateMessage()` - Provides contextual empty state messages

### Data Formatting (`dataFormatters.ts`)
15+ specialized formatting functions:
- `formatWeight()` - Weight with unit conversion
- `formatTime()` - Hours and minutes formatting
- `formatDate()` - Localized date formatting
- `formatHeight()` - Feet/inches or centimeters
- `formatExerciseList()` - Exercise lists with overflow handling
- And many more...

## Performance Features

### Lazy Loading
- **Section Components**: Non-critical sections load only when needed
- **Code Splitting**: Automatic bundle splitting for better performance
- **Skeleton Loading**: Smooth loading states during component load

### Optimization
- **Memoization**: Expensive calculations cached with useMemo
- **Smart Re-rendering**: Components only update when data changes
- **Bundle Size**: Minimal impact on application bundle size

### Error Handling
- **Error Boundaries**: Graceful error handling with recovery options
- **Data Validation**: Comprehensive edge case handling
- **Fallback States**: Always provides meaningful fallback content

## Accessibility Features

### Screen Reader Support
- Semantic HTML structure with proper headings
- ARIA labels and descriptions
- Live region announcements for dynamic content
- Role attributes for interactive elements

### Keyboard Navigation
- Full keyboard accessibility with Tab navigation
- Enter and Space key support for toggles
- Focus management and visible focus indicators
- Logical tab order throughout components

### Visual Accessibility
- High contrast color schemes
- Consistent focus indicators
- Scalable text and UI elements
- Color-blind friendly design choices

## Responsive Design

### Breakpoints
- **Mobile** (320px-768px): Stacked layout, touch-optimized
- **Tablet** (768px-1024px): Optimized for touch and mouse
- **Desktop** (1024px+): Multi-column layouts with full features

### Adaptive Features
- Dynamic section organization based on screen size
- Touch-friendly interactive elements on mobile
- Contextual collapse/expand behavior
- Optimal content density for each screen size

## Usage Examples

### Basic Implementation
```tsx
import ProfileView from './profile/ProfileView';

<ProfileView
  currentUser={user}
  currentProfile={profile}
  canSave={isReadyToSave}
  missingFields={requiredFields}
  onSaveProfile={handleSave}
  isStreaming={isLoading}
/>
```

### Custom Section Implementation
```tsx
import CollapsibleSection from './components/CollapsibleSection';
import DataField from './components/DataField';

const CustomSection = ({ data, isExpanded, onToggle }) => (
  <CollapsibleSection
    id="custom"
    title="Custom Section"
    isExpanded={isExpanded}
    onToggle={onToggle}
    icon={<CustomIcon />}
  >
    <DataField label="Custom Field" value={data.customValue} />
  </CollapsibleSection>
);
```

### Using Custom Hooks
```tsx
import { useProfileData, useProfileSections } from './hooks';

const CustomProfileComponent = ({ user, profile }) => {
  const { processedUserData, completeness } = useProfileData({ 
    currentUser: user, 
    currentProfile: profile 
  });
  
  const { visibleSections, toggleSection } = useProfileSections({
    processedUserData,
    processedProfileData: processedProfile
  });

  return (
    <div>
      <div>Profile {completeness}% complete</div>
      {visibleSections.map(section => (
        <SectionComponent 
          key={section.id} 
          section={section}
          onToggle={toggleSection}
        />
      ))}
    </div>
  );
};
```

## Best Practices

### Data Handling
- Always validate data before processing
- Use the provided data processors for consistency
- Handle null/undefined values gracefully
- Provide meaningful fallbacks for missing data

### Performance
- Use the custom hooks for optimal performance
- Implement lazy loading for non-critical sections
- Memoize expensive calculations
- Avoid unnecessary re-renders

### Accessibility
- Always provide ARIA labels for interactive elements
- Use semantic HTML structure
- Test with keyboard navigation
- Verify screen reader compatibility

### Styling
- Use the provided Tailwind classes for consistency
- Follow the established color schemes
- Maintain consistent spacing and typography
- Ensure responsive behavior across breakpoints

## Future Enhancements

### Planned Features
- Profile export functionality
- Historical data tracking
- Smart profile completion suggestions
- Enhanced activity type support
- Real-time data synchronization

### Extensibility
The architecture is designed for easy extension:
- New section types can be added following the existing patterns
- Activity types can be extended in ActivityDataSection
- Custom formatters can be added to dataFormatters.ts
- New metrics can be integrated into MetricDisplay

This comprehensive profile system provides a solid foundation for displaying fitness data intelligently while maintaining excellent user experience and technical performance.