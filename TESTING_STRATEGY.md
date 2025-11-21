# SmartShift Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the SmartShift application, covering unit tests, integration tests, and end-to-end testing approaches.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **Supertest**: API endpoint testing
- **jest-mock-extended**: Advanced mocking for Prisma
- **@testing-library/user-event**: User interaction simulation

## Test Structure

```
smartshift/
├── __tests__/
│   ├── utils/
│   │   ├── test-utils.tsx       # Custom render with providers
│   │   └── mock-data.ts         # Shared mock data
│   ├── components/              # Component tests
│   ├── hooks/                   # Hook tests
│   └── shared/                  # Utility function tests
├── backend/
│   └── __tests__/
│       ├── services/            # Service layer tests
│       └── routes/              # API endpoint tests
├── jest.config.js               # Jest configuration
└── jest.setup.js                # Test setup and global mocks
```

## Running Tests

### All Tests
```bash
npm test                 # Watch mode
npm run test:ci          # CI mode with coverage
npm run test:coverage    # Generate coverage report
```

### Specific Test Suites
```bash
npm run test:backend     # Backend tests only
npm run test:frontend    # Frontend tests only
```

### Single Test File
```bash
npm test -- ShiftCard.test.tsx
```

## Testing Layers

### 1. Unit Tests

#### Backend Services (`backend/__tests__/services/`)
Test business logic in isolation:
- **scheduleService.test.ts**: Shift CRUD operations
- **notificationService.test.ts**: Notification creation and delivery
- **userService.test.ts**: User management

**Example:**
```typescript
describe('createShift', () => {
  it('should create a new shift with DRAFT status', async () => {
    const result = await scheduleService.createShift(shiftData)
    expect(result.status).toBe('DRAFT')
  })
})
```

#### Frontend Components (`__tests__/components/`)
Test component rendering and behavior:
- **ShiftCard.test.tsx**: Shift display component
- **WeeklyCalendar.test.tsx**: Calendar functionality
- **CreateShiftModal.test.tsx**: Form validation

**Example:**
```typescript
it('renders shift information correctly', () => {
  render(<ShiftCard shift={mockShift} />)
  expect(screen.getByText(mockShift.user.name)).toBeInTheDocument()
})
```

#### Utility Functions (`__tests__/shared/`)
Test pure functions:
- **utils.test.ts**: Date formatting, calculations
- **validators.test.ts**: Input validation

### 2. Integration Tests

#### API Routes (`backend/__tests__/routes/`)
Test HTTP endpoints with Supertest:
- **shifts.test.ts**: Shift management endpoints
- **availability-changes.test.ts**: Availability request endpoints
- **time-off.test.ts**: Time-off request endpoints

**Example:**
```typescript
describe('POST /shifts', () => {
  it('creates a new shift', async () => {
    const response = await request(app)
      .post('/shifts')
      .send(shiftData)
    expect(response.status).toBe(201)
  })
})
```

#### Custom Hooks (`__tests__/hooks/`)
Test hooks with React Query:
- **useAuth.test.tsx**: Authentication state
- **useShifts.test.tsx**: Shift data fetching
- **useNotifications.test.tsx**: Notification management

### 3. Coverage Requirements

Minimum coverage thresholds (configured in `jest.config.js`):
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### 4. Critical Test Scenarios

#### Authentication & Authorization
- ✅ User role detection (OPERATOR vs EMPLOYEE)
- ✅ Protected route access
- ✅ Permission-based UI rendering

#### Shift Management
- ✅ Create, update, delete shifts
- ✅ Publish shifts to employees
- ✅ Weekly hours calculation
- ✅ Overwork warnings (>40 hours)
- ✅ Employee notifications on changes

#### Availability Management
- ✅ First-time availability setup
- ✅ Change request submission
- ✅ Manager approval/denial
- ✅ Notification to employee

#### Time-Off Requests
- ✅ Request submission
- ✅ Manager review
- ✅ Status updates

#### Calendar & Scheduling
- ✅ Weekly view rendering
- ✅ Mobile responsiveness
- ✅ Coverage indicators
- ✅ Date navigation

## Mocking Strategy

### Prisma Client
```typescript
jest.mock('../../db/connection', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))
```

### Clerk Authentication
```typescript
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ userId: 'test-user-id' }),
  useUser: () => ({ user: mockUser, isLoaded: true }),
}))
```

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), ... }),
}))
```

### API Calls
```typescript
jest.mock('@/lib/api', () => ({
  useApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
  }),
}))
```

## Test Data Management

All mock data is centralized in `__tests__/utils/mock-data.ts`:
- `mockUser`: Standard employee
- `mockOperator`: Manager user
- `mockShift`: Sample shift
- `mockAvailabilityChangeRequest`: Availability change
- `mockTimeOffRequest`: Time-off request
- `mockNotification`: Notification

## Best Practices

### 1. Test Naming
```typescript
describe('ComponentName', () => {
  describe('specificFeature', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('creates a shift', () => {
  // Arrange
  const shiftData = { ... }
  
  // Act
  const result = createShift(shiftData)
  
  // Assert
  expect(result.status).toBe('DRAFT')
})
```

### 3. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset mocks
- Don't rely on test execution order

### 4. Meaningful Assertions
```typescript
// ❌ Weak
expect(result).toBeTruthy()

// ✅ Strong
expect(result.status).toBe('DRAFT')
expect(result.userId).toBe(mockUser.id)
```

### 5. Test User Behavior, Not Implementation
```typescript
// ❌ Implementation detail
expect(component.state.isOpen).toBe(true)

// ✅ User behavior
expect(screen.getByRole('dialog')).toBeVisible()
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

## Future Enhancements

### E2E Testing (Recommended)
- **Playwright** or **Cypress** for full user flows
- Test critical paths:
  - Manager creates and publishes schedule
  - Employee views shifts and requests time off
  - Manager approves availability change

### Performance Testing
- Load testing for API endpoints
- Component render performance

### Visual Regression Testing
- Screenshot comparison for UI components
- Detect unintended visual changes

## Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="creates a shift"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### View Coverage Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Maintenance

- **Weekly**: Review failing tests
- **Monthly**: Update test coverage goals
- **Per Release**: Run full test suite with coverage
- **Per Feature**: Add tests for new functionality

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
