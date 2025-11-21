# Testing Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
# Watch mode (recommended for development)
npm test

# Run once with coverage
npm run test:coverage

# CI mode (for automated testing)
npm run test:ci
```

## 📝 Writing Your First Test

### Component Test Example
```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '../utils/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    await userEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Service Test Example
```typescript
// backend/__tests__/services/myService.test.ts
import { mockDeep } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import * as myService from '../../services/myService'

jest.mock('../../db/connection', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '../../db/connection'

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a record', async () => {
    const mockData = { id: '1', name: 'Test' }
    prisma.myModel.create.mockResolvedValue(mockData)

    const result = await myService.create({ name: 'Test' })

    expect(result).toEqual(mockData)
    expect(prisma.myModel.create).toHaveBeenCalled()
  })
})
```

### API Route Test Example
```typescript
// backend/__tests__/routes/myRoute.test.ts
import request from 'supertest'
import express from 'express'
import myRouter from '../../routes/myRoute'

const app = express()
app.use(express.json())
app.use('/api', myRouter)

describe('My API', () => {
  it('GET /api/items returns items', async () => {
    const response = await request(app).get('/api/items')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it('POST /api/items creates item', async () => {
    const newItem = { name: 'Test Item' }
    
    const response = await request(app)
      .post('/api/items')
      .send(newItem)

    expect(response.status).toBe(201)
    expect(response.body.name).toBe(newItem.name)
  })
})
```

## 🎯 Common Testing Patterns

### Testing Async Operations
```typescript
it('fetches data', async () => {
  const { result } = renderHook(() => useMyHook())

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  expect(result.current.data).toBeDefined()
})
```

### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event'

it('submits form', async () => {
  const user = userEvent.setup()
  render(<MyForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(handleSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### Testing Error States
```typescript
it('displays error message', async () => {
  const error = new Error('Something went wrong')
  mockApi.get.mockRejectedValue(error)

  render(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
```

### Testing Loading States
```typescript
it('shows loading spinner', () => {
  mockApi.get.mockImplementation(() => new Promise(() => {})) // Never resolves

  render(<MyComponent />)

  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
})
```

## 🔍 Debugging Tips

### 1. Use `screen.debug()`
```typescript
it('debugs component', () => {
  render(<MyComponent />)
  screen.debug() // Prints DOM to console
})
```

### 2. Use `logRoles()`
```typescript
import { logRoles } from '@testing-library/react'

it('shows available roles', () => {
  const { container } = render(<MyComponent />)
  logRoles(container) // Shows all accessible roles
})
```

### 3. Query Priorities
```typescript
// ✅ Best: Accessible to everyone
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')

// ✅ Good: Semantic HTML
screen.getByText('Hello World')

// ⚠️ Use sparingly
screen.getByTestId('custom-element')
```

## 📊 Coverage Reports

### Generate Coverage
```bash
npm run test:coverage
```

### View HTML Report
```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🛠️ Useful Commands

```bash
# Run specific test file
npm test -- ShiftCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="creates a shift"

# Update snapshots
npm test -- -u

# Run tests in specific directory
npm test -- __tests__/components

# Watch only changed files
npm test -- --onlyChanged

# Run with verbose output
npm test -- --verbose
```

## 📚 Quick Reference

### Common Matchers
```typescript
expect(value).toBe(expected)              // Strict equality
expect(value).toEqual(expected)           // Deep equality
expect(value).toBeTruthy()                // Truthy check
expect(value).toBeNull()                  // Null check
expect(value).toBeUndefined()             // Undefined check
expect(array).toContain(item)             // Array contains
expect(string).toMatch(/pattern/)         // Regex match
expect(fn).toHaveBeenCalled()             // Function called
expect(fn).toHaveBeenCalledWith(arg)      // Called with args
expect(fn).toHaveBeenCalledTimes(n)       // Called n times
```

### React Testing Library Queries
```typescript
// Get (throws if not found)
screen.getByRole('button')
screen.getByText('Hello')
screen.getByLabelText('Email')

// Query (returns null if not found)
screen.queryByText('Not here')

// Find (async, waits for element)
await screen.findByText('Async content')

// Get all
screen.getAllByRole('listitem')
```

### Async Utilities
```typescript
// Wait for condition
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Wait for element to appear
const element = await screen.findByText('Async content')

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'))
```

## 🎓 Learning Resources

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Playground](https://testing-playground.com/)

## 💡 Pro Tips

1. **Test behavior, not implementation**
2. **Use data-testid sparingly** - prefer accessible queries
3. **Keep tests simple** - one concept per test
4. **Mock external dependencies** - focus on your code
5. **Write tests first** (TDD) when possible
6. **Run tests before committing** - catch issues early

## 🚨 Common Issues

### Issue: "Cannot find module"
**Solution**: Check import paths and aliases in `jest.config.js`

### Issue: "ReferenceError: fetch is not defined"
**Solution**: Add `whatwg-fetch` polyfill or use `jest-fetch-mock`

### Issue: "act() warning"
**Solution**: Wrap state updates in `await waitFor()` or use `renderHook`

### Issue: Tests timeout
**Solution**: Increase timeout with `jest.setTimeout(10000)` or fix async handling

---

**Need help?** Check `TESTING_STRATEGY.md` for comprehensive documentation.
