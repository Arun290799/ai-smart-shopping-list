# React Testing with Jest and React Testing Library

This guide will help you understand how React testing works in this shopping list application. The test suite demonstrates various testing patterns and best practices.

## 🚀 Getting Started

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

## 📁 Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── ItemCard.test.tsx
│   ├── ItemList.test.tsx
│   └── TextInput.test.tsx
├── features/           # Redux/feature tests
│   └── items/
│       └── itemsSlice.test.ts
├── app/               # Page/integration tests
│   └── page.test.tsx
├── mocks/             # Mock utilities
│   └── index.ts
└── test-utils.tsx     # Custom render utilities
```

## 🧪 Test Types Explained

### 1. Unit Tests
Test individual components or functions in isolation.

**Example: ItemCard Component**
```typescript
test('renders item details correctly', () => {
  render(<ItemCard item={mockItem} />)
  
  expect(screen.getByText('Milk')).toBeInTheDocument()
  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByText('litre')).toBeInTheDocument()
})
```

### 2. Integration Tests
Test how multiple components work together.

**Example: Full Page Integration**
```typescript
test('loads existing items when share ID exists', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ items: mockItems }),
  })

  render(<Home />)

  await waitFor(() => {
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Bread')).toBeInTheDocument()
  })
})
```

### 3. Redux/State Management Tests
Test Redux actions and reducers.

**Example: Redux Slice**
```typescript
test('should add items to empty state', () => {
  const initialState = { items: [] }
  const action = addItems([mockItem])
  const state = itemsSlice.reducer(initialState, action)

  expect(state.items).toHaveLength(1)
  expect(state.items[0]).toEqual(mockItem)
})
```

## 🔧 Key Testing Concepts

### 1. Rendering Components
```typescript
import { render, screen } from '../test-utils'

// Basic render
render(<ItemCard item={mockItem} />)

// Render with custom Redux state
render(<ItemList />, {
  initialState: {
    items: { items: mockItems }
  }
})
```

### 2. User Interactions
```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

// Click events
await user.click(button)

// Type events
await user.type(input, 'hello world')

// Keyboard events
await user.keyboard('{Enter}')
```

### 3. Finding Elements
```typescript
// By text
screen.getByText('Milk')

// By role
screen.getByRole('button', { name: 'Add Items' })

// By placeholder
screen.getByPlaceholderText(/Enter items like/)

// By test ID (if needed)
screen.getByTestId('submit-button')
```

### 4. Assertions
```typescript
// Element exists
expect(element).toBeInTheDocument()

// Element has text
expect(element).toHaveTextContent('Milk')

// Element is checked
expect(checkbox).toBeChecked()

// Element has class
expect(element).toHaveClass('active')

// Element is disabled
expect(button).toBeDisabled()
```

### 5. Async Testing
```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Items loaded')).toBeInTheDocument()
})

// Wait for element to appear
expect(await screen.findByText('Loading complete')).toBeInTheDocument()
```

## 🎭 Mocking

### 1. API Calls
```typescript
const mockFetch = global.fetch as jest.Mock

mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ items: mockItems }),
})
```

### 2. Redux Hooks
```typescript
const mockDispatch = jest.fn()
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))
```

### 3. Browser APIs
```typescript
// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
})

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})
```

## 📊 Testing Patterns

### 1. Test Structure (AAA Pattern)
```typescript
test('should add item when form is submitted', async () => {
  // Arrange
  const user = userEvent.setup()
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ items: [mockItem] }) })
  
  render(<TextInput />)
  const input = screen.getByPlaceholderText(/Enter items like/)
  const button = screen.getByRole('button', { name: 'Add Items' })
  
  // Act
  await user.type(input, '2 litres milk')
  await user.click(button)
  
  // Assert
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '2 litres milk' }),
    })
  })
})
```

### 2. Testing Different States
```typescript
describe('Component States', () => {
  test('shows loading state', () => {
    // Test loading state
  })
  
  test('shows success state', () => {
    // Test success state
  })
  
  test('shows error state', () => {
    // Test error state
  })
})
```

### 3. Testing User Workflows
```typescript
test('complete user workflow: add item -> edit -> delete', async () => {
  const user = userEvent.setup()
  
  // Add item
  await user.type(input, 'milk')
  await user.click(addButton)
  
  // Edit item
  await user.click(item)
  await user.click(quantityInput)
  await user.clear(quantityInput)
  await user.type(quantityInput, '3')
  await user.keyboard('{Enter}')
  
  // Delete item
  await user.click(deleteButton)
  
  // Verify result
  expect(screen.queryByText('milk')).not.toBeInTheDocument()
})
```

## 🛡️ Best Practices

### 1. Test What Users See
```typescript
// ✅ Good - Test from user's perspective
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ❌ Avoid - Test implementation details
expect(component.state().isLoading).toBe(true)
```

### 2. Use Accessible Queries
```typescript
// ✅ Good - Use accessible queries
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email address')

// ❌ Avoid - Use test IDs as last resort
screen.getByTestId('submit-button')
```

### 3. Keep Tests Independent
```typescript
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()
})
```

### 4. Test Edge Cases
```typescript
test('handles empty input', async () => {
  // Test empty input
})

test('handles very long input', async () => {
  // Test edge case
})

test('handles network errors', async () => {
  // Test error handling
})
```

## 🎯 What We've Covered

### Component Testing
- **ItemCard**: Rendering, interactions, state changes, accessibility
- **ItemList**: Empty state, populated state, item count
- **TextInput**: Form submission, validation, voice recording

### State Management Testing
- **Redux Slice**: Actions, reducers, state updates, immutability

### Integration Testing
- **Main Page**: Full user workflows, API integration, error handling

### Advanced Testing
- **Mocking**: APIs, browser APIs, Redux hooks
- **Async Testing**: Promises, waitFor, findBy
- **Accessibility**: ARIA labels, keyboard navigation

## 🚀 Running the Tests

Try running the tests to see everything in action:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

Each test file demonstrates different testing patterns and concepts. Start with the component tests to understand the basics, then move to integration tests to see how everything works together.
