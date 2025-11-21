# SmartShift Onboarding System

## Overview

The onboarding system provides an interactive, role-specific guided tour for new users to learn how to use SmartShift effectively.

## Features

### ✅ **Role-Specific Tours**
- **Employee Tour**: Focuses on viewing shifts, clocking in/out, setting availability, and requesting time off
- **Manager Tour**: Covers schedule creation, team management, capacity planning, and approvals

### ✅ **Progress Tracking**
- Tracks which steps users have completed
- Allows users to skip and resume later
- Marks onboarding as complete when finished

### ✅ **User-Friendly Design**
- Step-by-step wizard interface
- Progress bar showing current position
- Back/Next navigation
- Skip option at any time

## Architecture

### Database Schema

```prisma
model OnboardingProgress {
  id                String    @id @default(uuid())
  userId            String    @unique
  completedSteps    Json      @default("[]")
  currentStep       String?
  isCompleted       Boolean   @default(false)
  skippedTour       Boolean   @default(false)
  lastActiveStep    String?
  completedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}
```

### Components

#### `OnboardingWizard.tsx`
Base wizard component with:
- Step navigation
- Progress bar
- Skip/Complete functionality
- Responsive design

#### `EmployeeOnboarding.tsx`
Employee-specific tour covering:
1. Welcome & Overview
2. Dashboard Features
3. My Shifts
4. Setting Availability
5. Requesting Time Off
6. Completion

#### `ManagerOnboarding.tsx`
Manager-specific tour covering:
1. Welcome & Overview
2. Manager Dashboard
3. Creating Schedules
4. Team & Capacity Management
5. Approvals & Requests
6. Weekly Hours Tracking
7. Completion

### Hook: `useOnboarding.ts`

```typescript
const {
  progress,              // Current progress object
  isLoading,            // Loading state
  shouldShowOnboarding, // Whether to show wizard
  completeOnboarding,   // Mark as complete
  skipOnboarding,       // Skip tour
  updateProgress,       // Update step progress
} = useOnboarding();
```

### API Endpoints

#### `GET /api/onboarding/progress`
Get user's onboarding progress. Creates progress record if it doesn't exist.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "completedSteps": ["welcome", "dashboard"],
  "currentStep": "my-shifts",
  "isCompleted": false,
  "skippedTour": false,
  "lastActiveStep": "dashboard",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/onboarding/complete`
Mark onboarding as complete.

#### `POST /api/onboarding/skip`
Skip the onboarding tour.

#### `PATCH /api/onboarding/progress`
Update progress with completed step.

**Request Body:**
```json
{
  "step": "dashboard"
}
```

#### `POST /api/onboarding/reset`
Reset onboarding progress (for testing or re-onboarding).

## Usage

### Automatic Display

The onboarding wizard automatically appears on the dashboard for new users who haven't completed or skipped it.

```typescript
// In dashboard/page.tsx
{shouldShowOnboarding && (
  isOperator ? (
    <ManagerOnboarding
      onComplete={completeOnboarding}
      onSkip={skipOnboarding}
    />
  ) : (
    <EmployeeOnboarding
      onComplete={completeOnboarding}
      onSkip={skipOnboarding}
    />
  )
)}
```

### Manual Trigger

To manually show onboarding (e.g., from a help menu):

```typescript
import { useOnboarding } from '@/hooks/useOnboarding';

function HelpMenu() {
  const { updateProgress } = useOnboarding();
  
  const restartTour = async () => {
    await fetch('/api/onboarding/reset', { method: 'POST' });
    window.location.reload();
  };
  
  return (
    <button onClick={restartTour}>
      Restart Tour
    </button>
  );
}
```

## Employee Tour Steps

### 1. Welcome
- Overview of what they'll learn
- Estimated time (2 minutes)
- Option to skip

### 2. Dashboard
- Next Shift card
- Weekly Schedule
- Notifications

### 3. My Shifts
- Viewing upcoming shifts
- Shift details
- Clock in/out functionality

### 4. Availability
- How to set availability
- First-time setup vs. change requests
- Manager approval process

### 5. Time Off
- How to request time off
- Approval workflow
- Notifications

### 6. Complete
- Success message
- Quick links to key features
- Help resources

## Manager Tour Steps

### 1. Welcome
- Overview of management features
- Estimated time (3 minutes)
- Option to skip

### 2. Manager Dashboard
- Weekly calendar overview
- Today's attendance
- Quick stats

### 3. Schedule Management
- Creating shifts
- Assigning employees
- Publishing schedules
- Weekly hours warnings

### 4. Team & Capacity
- Team management
- Capacity planning
- Coverage optimization

### 5. Approvals & Requests
- Time-off requests
- Availability change requests
- Approval workflow

### 6. Weekly Hours Tracking
- Why it matters
- Automatic warnings
- Weekly summary
- Best practices

### 7. Complete
- Success message
- Quick action links
- Help resources

## Customization

### Adding New Steps

To add a new step to the employee tour:

```typescript
// In EmployeeOnboarding.tsx
const steps = [
  // ... existing steps
  {
    id: 'new-feature',
    title: 'New Feature',
    description: 'Learn about this new feature',
    content: (
      <div>
        {/* Your content here */}
      </div>
    ),
  },
];
```

### Styling

The wizard uses Tailwind CSS classes. To customize:

```typescript
// In OnboardingWizard.tsx
<div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
  {/* Customize these classes */}
</div>
```

### Content Updates

Update step content in the respective onboarding component files:
- `components/onboarding/EmployeeOnboarding.tsx`
- `components/onboarding/ManagerOnboarding.tsx`

## Testing

### Test Onboarding Flow

1. **Create a new user account**
2. **Login** - Onboarding should appear automatically
3. **Navigate through steps** using Next/Back buttons
4. **Test skip functionality**
5. **Complete the tour**

### Reset Onboarding

For testing, reset onboarding progress:

```bash
# Via API
curl -X POST http://localhost:4000/api/onboarding/reset \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or via Prisma Studio
npx prisma studio
# Navigate to OnboardingProgress and delete the record
```

### Check Progress

```bash
curl http://localhost:4000/api/onboarding/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

### 1. Keep Steps Concise
- Each step should cover one main concept
- Use bullet points and visual hierarchy
- Avoid information overload

### 2. Use Visual Aids
- Icons for different features
- Color-coded sections
- Screenshots or illustrations (optional)

### 3. Provide Context
- Explain why features matter
- Give real-world examples
- Link to relevant pages

### 4. Make It Skippable
- Always allow users to skip
- Don't force completion
- Provide help resources for later

### 5. Track Engagement
- Monitor completion rates
- Identify where users drop off
- Iterate based on feedback

## Metrics to Track

- **Completion Rate**: % of users who complete onboarding
- **Skip Rate**: % of users who skip
- **Average Time**: Time spent on onboarding
- **Drop-off Points**: Which steps users abandon
- **Feature Adoption**: Usage of features after onboarding

## Future Enhancements

### Interactive Tooltips
Add contextual tooltips on actual pages:
```typescript
<Tooltip content="Click here to create a shift">
  <button>Add Shift</button>
</Tooltip>
```

### Video Tutorials
Embed short video clips for complex features.

### Progress Rewards
Gamify onboarding with badges or achievements.

### Personalized Tours
Customize based on user role or preferences.

### In-App Help
Add a help button that reopens specific tour steps.

## Troubleshooting

### Onboarding Not Showing
- Check if user has `isCompleted: true` or `skippedTour: true`
- Verify API endpoint is working
- Check browser console for errors

### Progress Not Saving
- Verify backend route is registered
- Check database connection
- Review Prisma schema

### Styling Issues
- Ensure Tailwind CSS is configured
- Check for conflicting styles
- Test responsive breakpoints

## Support

For questions or issues:
1. Check this documentation
2. Review component code
3. Test API endpoints
4. Check database records

---

**The onboarding system is now ready to welcome new users!** 🎉
