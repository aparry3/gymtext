# Fitness Plan Dashboard Implementation

## Overview
This document outlines the implementation plan for adapting the workout plan viewer UI to the GymText architecture. The dashboard will allow administrators to search for users by phone number and view their complete fitness plans, including mesocycles, microcycles, and individual workouts.

## Architecture Integration

### 1. Page Structure
- **Location**: `src/app/admin/fitness-plans/page.tsx`
- **Route**: `/admin/fitness-plans`
- **Layout**: Will use the existing root layout with admin-specific styling
- **Component Location**: `src/components/admin/WorkoutPlanViewer.tsx`
- **Page Implementation**: Simple page that imports and renders the WorkoutPlanViewer component

### 2. API Endpoints

#### 2.1 Search Endpoint
- **Path**: `src/app/api/admin/fitness-plans/search/route.ts`
- **Method**: `GET`
- **Query Params**: `phoneNumber`
- **Returns**: User fitness plan data including profile, plans, mesocycles, microcycles, and workouts

#### 2.2 Plan Details Endpoint (if needed for pagination)
- **Path**: `src/app/api/admin/fitness-plans/[planId]/route.ts`
- **Method**: `GET`
- **Returns**: Detailed plan information with all nested data

### 3. Data Layer Integration

#### 3.1 New Repository Methods

**FitnessPlanRepository** extensions:
```typescript
// src/server/data/repositories/FitnessPlanRepository.ts
- getFitnessPlanWithFullHierarchy(planId: string): Promise<FitnessPlanWithDetails>
- getFitnessPlansByPhoneNumber(phoneNumber: string): Promise<FitnessPlan[]>
```

**UserRepository** extensions:
```typescript
// src/server/data/repositories/UserRepository.ts
- getUserByPhoneNumber(phoneNumber: string): Promise<User | null>
```

#### 3.2 New Service Layer

**AdminFitnessPlanService**:
```typescript
// src/server/services/adminFitnessPlanService.ts
- searchUserFitnessPlans(phoneNumber: string): Promise<UserFitnessPlanData>
- getFitnessPlanDetails(planId: string): Promise<FitnessPlanDetails>
```

### 4. Type Definitions

#### 4.1 Request/Response Types
```typescript
// src/shared/types/admin.ts
interface UserFitnessPlanSearchResponse {
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };
  fitnessProfile: FitnessProfile;
  fitnessPlans: FitnessPlanWithHierarchy[];
}

interface FitnessPlanWithHierarchy extends FitnessPlan {
  mesocycles: MesocycleWithMicrocycles[];
}

interface MesocycleWithMicrocycles extends Mesocycle {
  microcycles: MicrocycleWithWorkouts[];
}

interface MicrocycleWithWorkouts extends Microcycle {
  workouts: WorkoutWithDetails[];
}

interface WorkoutWithDetails extends Workout {
  details: {
    exercises: Exercise[];
    duration: string;
    notes?: string;
  };
}
```

#### 4.2 Validation Schemas
```typescript
// src/shared/schemas/admin.ts
const phoneNumberSearchSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/)
});
```

### 5. Component Structure & Styling

#### 5.1 Main Components
- `WorkoutPlanViewer` - Main container component (`src/components/admin/WorkoutPlanViewer.tsx`)
- `ClientSearchCard` - Search functionality
- `ClientInfoCard` - Display user information
- `FitnessPlanOverviewCard` - Plan summary
- `MesocycleCard` - Display mesocycle information
- `MicrocycleCard` - Display microcycle information
- `WorkoutCard` - Display individual workout details

#### 5.2 UI Components Integration
- Use existing Tailwind CSS v4 configuration
- Leverage shadcn/ui components already in the project (Card, Input, Button, Badge)
- Maintain consistent styling with existing admin interfaces
- Icons from lucide-react: Search, Calendar, Target, Timer, Activity

#### 5.3 Styling Details

**Page Layout**:
```tsx
// Main container
<div className="min-h-screen bg-background">
  // Admin header with dark blue background
  <div className="bg-admin-header text-white p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Workout Plan Admin Portal</h1>
      <p className="text-blue-100 mt-2">View and manage client workout plans</p>
    </div>
  </div>
  
  // Content area
  <div className="max-w-7xl mx-auto p-6">
    // Components here
  </div>
</div>
```

**Color Scheme** (from CSS variables):
- Background: `hsl(210 40% 98%)` - Light gray background
- Admin Header: `hsl(222 47% 11%)` - Dark blue header
- Cards: White background with subtle borders
- Badges: Secondary variant for labels
- Muted backgrounds: `bg-muted/30` for nested cards

**Component Styling**:

1. **Search Card**:
   - Standard Card component with gap-4 flex layout
   - Input with flex-1 for full width
   - Button with loading state

2. **Client Info Card**:
   - Grid layout: `grid-cols-2 md:grid-cols-4 gap-4`
   - Small muted labels with medium weight values

3. **Fitness Plan Overview**:
   - Badge for program type
   - Icon integration with Target icon
   - Calendar icon for start date

4. **Mesocycle Cards**:
   - Header with Timer icon and week count badge
   - Nested structure for microcycles

5. **Microcycle Cards**:
   - Light background: `bg-muted/30`
   - Volume/Intensity badges: `variant="secondary" className="text-xs"`
   - Date range display

6. **Workout Cards**:
   - Activity icon in header
   - Two-column grid for exercises and details
   - Exercise items with `bg-muted/50` background
   - Small text sizes for compact display

**Typography**:
- Headers: `text-3xl`, `text-2xl`, `text-lg`, `text-base`, `text-sm`
- Body text: Default size with `text-muted-foreground` for secondary info
- Small details: `text-xs` for exercise details and notes

**Spacing**:
- Consistent use of `space-y-6`, `space-y-4`, `space-y-3`
- Padding: `p-6` for main sections, `p-2` for small items
- Card padding handled by shadcn/ui defaults

**Empty State**:
- Large Search icon (h-12 w-12)
- Centered content with p-12
- Clear call-to-action messaging

### 6. State Management

#### 6.1 Client-Side State
- Use React hooks for local state management
- Implement loading, error, and empty states
- Cache search results to minimize API calls

#### 6.2 Data Fetching
- Use native fetch with proper error handling
- Implement proper loading states
- Add retry logic for failed requests

### 7. Security Considerations

#### 7.1 Authentication
- Protect admin routes with authentication middleware
- Verify admin role before allowing access
- Implement session-based authentication check

#### 7.2 Data Access
- Validate phone number format before database queries
- Implement rate limiting on search endpoint
- Log all admin access for audit purposes

### 8. Database Query Optimization

#### 8.1 Query Strategy
- Use Kysely's query builder for efficient joins
- Implement pagination for large workout lists
- Consider adding database indexes on:
  - `users.phone_number`
  - `fitness_plans.user_id`
  - `mesocycles.fitness_plan_id`
  - `microcycles.mesocycle_id`
  - `workouts.microcycle_id`

#### 8.2 Data Loading
- Implement eager loading for nested relationships
- Use database views for complex queries if needed
- Cache frequently accessed data in Redis

### 9. Error Handling

#### 9.1 User-Facing Errors
- Phone number not found
- No fitness plans for user
- Invalid phone number format
- Network/server errors

#### 9.2 System Errors
- Database connection failures
- Malformed data responses
- Authentication failures

### 10. Testing Strategy

#### 10.1 Unit Tests
- Repository method tests
- Service layer tests
- Component render tests

#### 10.2 Integration Tests
- API endpoint tests
- Full user search flow
- Error scenario handling

### 11. Implementation Steps

1. **Database Layer**
   - Extend repositories with new methods
   - Add necessary database indexes
   - Test query performance

2. **Service Layer**
   - Create AdminFitnessPlanService
   - Implement data aggregation logic
   - Add caching where appropriate

3. **API Routes**
   - Create search endpoint
   - Add authentication middleware
   - Implement proper error responses

4. **Type Definitions**
   - Define all interfaces and types
   - Create Zod validation schemas
   - Ensure type safety throughout

5. **React Components**
   - Build individual card components
   - Implement main viewer component
   - Add proper loading/error states

6. **Integration**
   - Connect components to API
   - Test full search flow
   - Optimize performance

7. **Security & Polish**
   - Add authentication checks
   - Implement rate limiting
   - Add logging and monitoring

### 12. Performance Considerations

- Implement virtual scrolling for long workout lists
- Use React.memo for expensive components
- Debounce search input
- Lazy load workout details on expansion
- Consider server-side pagination for very active users

### 13. Future Enhancements

- Export functionality (PDF/CSV)
- Workout plan comparison
- Progress tracking visualization
- Direct edit capabilities
- Bulk user search
- Analytics dashboard integration

### 14. Migration from Mock Data

The provided UI currently uses mock data. The implementation will:
1. Replace mock data with real API calls
2. Adapt the data structure to match our database schema
3. Handle async data loading
4. Add proper error boundaries
5. Implement real-time updates if needed

### 15. Monitoring & Logging

- Log all admin searches with timestamps
- Track search response times
- Monitor API endpoint performance
- Set up alerts for failed searches
- Implement audit trail for data access

### 16. Key Implementation Notes

#### 16.1 Tailwind Configuration
The project already has the necessary Tailwind configuration with:
- Admin-specific colors defined (`admin-header`, `admin-sidebar`)
- All required color variables in HSL format
- Responsive breakpoints configured
- Animation utilities available

#### 16.2 Component File Structure
```
src/
├── app/
│   └── admin/
│       └── fitness-plans/
│           └── page.tsx              # Simple page wrapper
├── components/
│   └── admin/
│       └── WorkoutPlanViewer.tsx    # Main component with all logic
└── server/
    └── services/
        └── adminFitnessPlanService.ts  # Business logic for admin operations
```

#### 16.3 Date Formatting
Use the provided `formatDate` function pattern:
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

#### 16.4 Loading States
Implement consistent loading behavior:
- Disable search button during loading
- Show "Searching..." text
- Maintain form state during search
- Clear previous results on new search

#### 16.5 Responsive Design
- Mobile: Stack cards vertically, 2-column grids
- Tablet: 4-column grids for client info
- Desktop: Full layout with side-by-side exercise details