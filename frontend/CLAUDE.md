# 🎨 Family Finance Hub - Frontend Documentation

This document contains architecture decisions, component patterns, and development guidelines for the Family Finance Hub frontend application.

---

## 📐 Architecture Overview

**Tech Stack:**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **State Management:** React Context + TanStack Query (React Query)
- **Styling:** Tailwind CSS 3 + @tailwindcss/forms
- **UI Components:** Headless UI + Heroicons + Lucide React
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Date Utilities:** date-fns
- **Class Utilities:** clsx + tailwind-merge

**Architecture Pattern:**
- Component-based architecture with clear separation of concerns
- Page-level components for routing
- Reusable UI components (atomic design inspired)
- Feature components for domain-specific UI
- Service layer for API communication
- Custom hooks for data fetching and business logic
- Context API for global state (authentication)
- React Query for server state management

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Badge.tsx
│   │   └── features/       # Domain-specific components
│   │       ├── ExpenseCard.tsx
│   │       ├── BudgetBar.tsx
│   │       ├── CategoryBadge.tsx
│   │       ├── QuickAddExpense.tsx
│   │       ├── MonthSelector.tsx
│   │       └── StatCard.tsx
│   ├── pages/               # Route-level components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Expenses.tsx
│   │   ├── Categories.tsx
│   │   ├── PaymentMethods.tsx
│   │   ├── FixedBills.tsx
│   │   ├── Income.tsx
│   │   ├── FamilySharing.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useExpenses.ts
│   │   ├── useCategories.ts
│   │   ├── usePaymentMethods.ts
│   │   ├── useFixedBills.ts
│   │   └── useIncomes.ts
│   ├── services/            # API service layer
│   │   ├── api.ts          # Axios instance & interceptors
│   │   ├── auth.ts
│   │   ├── expenses.ts
│   │   ├── categories.ts
│   │   ├── paymentMethods.ts
│   │   ├── fixedBills.ts
│   │   └── income.ts
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts   # Currency, date formatting
│   │   ├── validators.ts   # Zod schemas
│   │   └── calculations.ts # Business logic calculations
│   ├── lib/                 # Third-party configurations
│   │   └── utils.ts        # cn() for className merging
│   ├── assets/              # Static assets (images, fonts)
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry point
├── public/                  # Static files served as-is
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── postcss.config.js        # PostCSS configuration
├── nginx.conf               # Production nginx config
├── Dockerfile               # Production Docker image
└── package.json
```

---

## 🎯 Component Architecture

### Component Hierarchy

**1. UI Components (`components/ui/`)**
- **Purpose:** Reusable, generic UI building blocks
- **Characteristics:**
  - No business logic
  - Highly reusable across the app
  - Controlled by props
  - Type-safe with TypeScript
  - Styled with Tailwind CSS variants
  - Accessible (ARIA attributes)

**Examples:**
```typescript
// Button component with variants and sizes
<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>

// Input with label and error handling
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>

// Modal with Headless UI
<Modal open={isOpen} onClose={handleClose} title="Add Expense">
  {children}
</Modal>
```

**2. Feature Components (`components/features/`)**
- **Purpose:** Domain-specific, composed components
- **Characteristics:**
  - Contain business logic
  - Use UI components internally
  - Connected to data (hooks, context)
  - Specific to finance domain

**Examples:**
```typescript
// Expense card with actions
<ExpenseCard
  expense={expense}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Budget progress bar with color coding
<BudgetBar
  spent={1500}
  budget={2000}
  categoryName="Food"
/>

// Month/year selector
<MonthSelector
  value={selectedMonth}
  onChange={setSelectedMonth}
/>
```

**3. Page Components (`pages/`)**
- **Purpose:** Route-level containers
- **Characteristics:**
  - Map to routes in React Router
  - Compose feature and UI components
  - Fetch data using custom hooks
  - Handle page-level state
  - Implement layouts

**Pattern:**
```typescript
export function Dashboard() {
  const { user } = useAuth();
  const { data: expenses } = useExpenses();
  const { data: fixedBills } = useFixedBills();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1>Welcome, {user?.name}</h1>
      {/* Compose feature components */}
      <StatCard label="Total Spent" value={calculateTotal(expenses)} />
      {/* ... */}
    </div>
  );
}
```

---

## 🔐 Authentication Flow

### AuthContext Pattern

**Location:** `src/context/AuthContext.tsx`

**Features:**
- Stores user and JWT token in localStorage
- Provides authentication state to entire app
- Handles login, register, logout
- Auto-loads user on mount if token exists
- Redirects to login on 401 errors (via axios interceptor)

**Usage Pattern:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user.name}</div>;
}
```

**Protected Routes:**
```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## 🌐 API Service Layer

### Axios Instance (`services/api.ts`)

**Configuration:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptor:**
- Automatically attaches JWT token from localStorage
- Sets `Authorization: Bearer <token>` header

**Response Interceptor:**
- Handles 401 errors (auto-logout and redirect)
- Extracts error messages from API responses
- Provides consistent error handling

### Service Pattern

**Example: `services/expenses.ts`**
```typescript
import api from './api';
import type { Expense, CreateExpenseRequest } from '@/types';

export async function getExpenses(params?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}): Promise<Expense[]> {
  const { data } = await api.get('/api/expenses', { params });
  return data.data;
}

export async function createExpense(
  expense: CreateExpenseRequest,
  receipt?: File
): Promise<Expense> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(expense));
  if (receipt) {
    formData.append('receipt', receipt);
  }

  const { data } = await api.post('/api/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/api/expenses/${id}`);
}
```

**Why This Pattern:**
- Centralized API logic
- Type-safe request/response
- Easy to mock for testing
- Consistent error handling
- Reusable across hooks

---

## 🎣 Custom Hooks Pattern

### React Query Integration

All data fetching hooks use **TanStack Query** (React Query) for:
- Automatic caching
- Background refetching
- Loading/error states
- Optimistic updates
- Request deduplication

### Hook Structure

**Example: `hooks/useExpenses.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as expensesService from '@/services/expenses';

// Query hook - fetches data
export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesService.getExpenses(filters),
  });
}

// Mutation hook - creates expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) =>
      expensesService.createExpense(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Mutation hook - deletes expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
```

**Usage in Components:**
```typescript
function ExpensesList() {
  const { data: expenses, isLoading, error } = useExpenses();
  const { mutate: deleteExpense } = useDeleteExpense();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {expenses?.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={() => deleteExpense(expense.id)}
        />
      ))}
    </div>
  );
}
```

### Available Hooks

- `useAuth()` - Authentication state and actions
- `useExpenses()` - Fetch expenses with filters
- `useCreateExpense()` - Create new expense
- `useUpdateExpense()` - Update existing expense
- `useDeleteExpense()` - Delete expense
- `useCategories()` - Fetch user categories
- `usePaymentMethods()` - Fetch payment methods
- `useFixedBills()` - Fetch recurring bills
- `useIncomes()` - Fetch income records

---

## 🎨 Styling with Tailwind CSS

### Tailwind Configuration

**Custom Theme:** (`tailwind.config.js`)

**Colors:**
- `gray.*` - Neutral scale (50-900)
- `accent` - Primary brand color (blue)
- `success` - Green for positive actions
- `warning` - Orange for warnings
- `error` - Red for errors/destructive actions

**Typography:**
- Font family: Inter (sans), JetBrains Mono (mono)
- Custom font sizes with optimized line heights

**Utilities:**
- Custom border radius (6px default)
- Box shadows (sm, default, md, lg)
- Transition durations (fast: 150ms, normal: 250ms, slow: 400ms)

### Styling Patterns

**1. Use `cn()` utility for conditional classes:**
```typescript
import { cn } from '@/lib/utils';

function Button({ variant, className }) {
  return (
    <button
      className={cn(
        'base-button-classes',
        variant === 'primary' && 'primary-classes',
        variant === 'secondary' && 'secondary-classes',
        className, // Allow overrides
      )}
    />
  );
}
```

**2. Component variants pattern:**
```typescript
const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-transparent border border-gray-200 text-gray-900',
  danger: 'bg-error text-white hover:bg-red-700',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
};

<button className={cn(variants[variant], sizes[size])} />
```

**3. Responsive design:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>
```

**4. Dark mode ready (future):**
```typescript
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* Dark mode support via Tailwind's dark: variant */}
</div>
```

### Accessibility

**Always include:**
- Proper semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA attributes where needed
- Focus states: `focus-visible:outline-none focus-visible:ring-2`
- Keyboard navigation support
- Screen reader text when needed

---

## 📝 Form Handling

### React Hook Form + Zod Pattern

**1. Define Zod schema:**
```typescript
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  date: z.date(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;
```

**2. Use in component:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function ExpenseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const onSubmit = async (data: ExpenseFormData) => {
    await createExpense(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Amount"
        type="number"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
      />
      <Input
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

**Why This Pattern:**
- Type-safe forms
- Runtime validation
- Reusable schemas
- Clear error messages
- No boilerplate

---

## 🔧 TypeScript Patterns

### Type Definitions

**Location:** `src/types/index.ts`

**Pattern 1: API Response Types**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  date: string;
  categoryId?: string;
  paymentMethodId?: string;
  receiptUrl?: string;
  isShared: boolean;
  category?: Category;
  paymentMethod?: PaymentMethod;
  sharedWith?: SharedExpense[];
}
```

**Pattern 2: Request DTOs**
```typescript
export interface CreateExpenseRequest {
  amount: number;
  description?: string;
  categoryId?: string;
  paymentMethodId?: string;
  date: string;
  isShared?: boolean;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;
```

**Pattern 3: Component Props**
```typescript
export interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}
```

**Pattern 4: Generic API Response**
```typescript
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Import Aliases

**Use `@/` alias for clean imports:**
```typescript
// ✅ Good
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';

// ❌ Avoid
import { Button } from '../../../components/ui/Button';
```

**Configured in `vite.config.ts`:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Type-only Imports

```typescript
import type { User, Expense } from '@/types';
import type { FC, ReactNode } from 'react';
```

---

## 🛠️ Common Development Tasks

### Adding a New Page

1. **Create page component** in `src/pages/`:
```typescript
// src/pages/NewPage.tsx
export function NewPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">New Page</h1>
      {/* Content */}
    </div>
  );
}
```

2. **Add route** in `App.tsx`:
```typescript
import { NewPage } from './pages/NewPage';

<Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

3. **Add navigation link** (if needed) in Layout component

### Adding a New UI Component

1. **Create component** in `src/components/ui/`:
```typescript
// src/components/ui/NewComponent.tsx
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export interface NewComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

export function NewComponent({ variant = 'default', className, ...props }: NewComponentProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'default' && 'default-variant',
        variant === 'outlined' && 'outlined-variant',
        className,
      )}
      {...props}
    />
  );
}
```

2. **Use in feature components or pages**

### Adding API Integration

1. **Define types** in `src/types/index.ts`:
```typescript
export interface NewResource {
  id: string;
  name: string;
  // ...
}
```

2. **Create service** in `src/services/`:
```typescript
// src/services/newResource.ts
import api from './api';
import type { NewResource } from '@/types';

export async function getResources(): Promise<NewResource[]> {
  const { data } = await api.get('/api/resources');
  return data.data;
}

export async function createResource(resource: CreateResourceRequest): Promise<NewResource> {
  const { data } = await api.post('/api/resources', resource);
  return data.data;
}
```

3. **Create custom hook** in `src/hooks/`:
```typescript
// src/hooks/useResources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as resourceService from '@/services/newResource';

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: resourceService.getResources,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceService.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

4. **Use in component:**
```typescript
function ResourceList() {
  const { data, isLoading } = useResources();
  const { mutate: create } = useCreateResource();
  // ...
}
```

### File Upload Pattern

**Example: Receipt upload with expense**
```typescript
function ExpenseForm() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { mutate: createExpense } = useCreateExpense();

  const handleSubmit = async (data: ExpenseFormData) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    createExpense(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
      />
      {/* Other fields */}
    </form>
  );
}
```

---

## 🧪 Testing (Future Implementation)

### Recommended Testing Stack

- **Unit/Integration:** Vitest + Testing Library
- **E2E:** Playwright or Cypress

### Test Structure Example

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
  });
});
```

---

## 🚀 Build & Deployment

### Environment Variables

**Location:** `.env` (gitignored)

**Required:**
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:3001`)

**Development:**
```bash
# .env.development
VITE_API_URL=http://localhost:3001
```

**Production:**
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
```

### Development Server

```bash
npm run dev
# Starts on http://localhost:3000
# Hot module replacement enabled
# API proxied to backend
```

### Production Build

```bash
npm run build
# Outputs to: dist/
# TypeScript type checking + Vite build
# Optimized, minified, tree-shaken
```

### Docker Production Build

**Dockerfile strategy:**
1. Build stage: npm install + npm run build
2. Serve stage: nginx:alpine
3. Copy build artifacts to nginx
4. Custom nginx.conf for SPA routing

**nginx.conf highlights:**
- Serve static files from `/usr/share/nginx/html`
- Proxy `/api` and `/uploads` to backend
- Fallback to `index.html` for client-side routing
- Gzip compression enabled

### Vite Configuration

**Key settings:**
- Port: 3000
- Proxy: `/api` and `/uploads` → `http://localhost:3001`
- Path alias: `@` → `./src`
- React plugin with Fast Refresh

---

## 📚 Utility Functions

### Formatters (`utils/formatters.ts`)

```typescript
// Format currency
formatCurrency(1234.56) // "R$ 1.234,56"

// Format date
formatDate(new Date()) // "15/02/2026"

// Format date and time
formatDateTime(new Date()) // "15/02/2026 14:30"

// Relative date
formatRelativeDate(pastDate) // "2 days ago"

// Parse currency input
parseAmount("R$ 1.234,56") // 1234.56
```

### Validators (`utils/validators.ts`)

```typescript
// Zod schemas for reuse
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(6);

// Custom validators
isValidEmail("test@example.com") // true
isValidCurrency("R$ 100,00") // true
```

### Calculations (`utils/calculations.ts`)

```typescript
// Budget percentage
calculateBudgetPercentage(spent, budget) // 75.5

// Available budget
calculateAvailableBudget(income, fixedBills, expenses) // 1500.00

// Sum expenses
sumExpenses(expenses) // 2345.67
```

---

## 🎭 Code Conventions

### Component Naming

- **Files:** PascalCase (e.g., `ExpenseCard.tsx`, `Button.tsx`)
- **Components:** PascalCase (export name matches file name)
- **Props interfaces:** `ComponentNameProps`

### Function Naming

- **Event handlers:** `handleEventName` (e.g., `handleClick`, `handleSubmit`)
- **Boolean getters:** `isActive`, `hasPermission`, `canEdit`
- **Utilities:** camelCase (e.g., `formatCurrency`, `calculateTotal`)

### File Organization

**Within a component file:**
```typescript
// 1. Imports
import { useState } from 'react';
import type { FC } from 'react';

// 2. Types/Interfaces
export interface ComponentProps {
  // ...
}

// 3. Constants (if needed)
const VARIANTS = { /* ... */ };

// 4. Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => { /* ... */ };

  // Render
  return <div>{/* JSX */}</div>;
}
```

### Import Order

1. React/React-related
2. Third-party libraries
3. Internal utilities/hooks
4. Components
5. Types
6. Styles (if using CSS modules)

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import type { Expense } from '@/types';
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/...'"

**Solution:**
- Verify `vite.config.ts` has the `@` alias configured
- Check `tsconfig.json` includes `"baseUrl": "."` and `"paths": { "@/*": ["src/*"] }`
- Restart Vite dev server

### Issue: API calls return CORS errors

**Solution:**
- Ensure backend CORS_ORIGIN includes frontend URL
- Check Vite proxy configuration in `vite.config.ts`
- Verify API URL in `.env` is correct

### Issue: React Query not refetching after mutation

**Solution:**
- Call `queryClient.invalidateQueries()` in mutation's `onSuccess`
- Ensure query keys match between queries and invalidation
- Check React Query DevTools for cache state

### Issue: Form validation not working

**Solution:**
- Verify Zod schema is correct
- Check `zodResolver` is imported from `@hookform/resolvers/zod`
- Ensure `resolver` prop is passed to `useForm`

### Issue: Tailwind classes not applying

**Solution:**
- Check class names are correct (no typos)
- Verify `tailwind.config.js` content paths include your files
- Restart dev server after config changes
- Check for class name conflicts (use `cn()` utility)

### Issue: "Hydration mismatch" errors

**Solution:**
- Avoid using browser-only APIs (localStorage) during initial render
- Use `useEffect` for client-side-only operations
- Ensure server/client rendered content matches

---

## 🔄 State Management Strategy

### When to Use What

**Local State (useState):**
- Component-specific UI state (modals open/closed, form inputs)
- Temporary state that doesn't need to persist

**Context API (AuthContext):**
- Global authentication state
- User preferences
- Theme settings (if implementing dark mode)

**React Query:**
- All server state (expenses, categories, etc.)
- Cached API responses
- Background refetching
- Optimistic updates

**URL State (React Router):**
- Filters, search params
- Pagination
- Current page/tab

**localStorage:**
- Persist auth token
- User preferences across sessions
- Draft form data (autosave)

---

## 📱 Responsive Design Guidelines

### Breakpoints (Tailwind defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

```typescript
// Base styles are mobile
<div className="p-4 md:p-6 lg:p-8">

// Grid: 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Full width on mobile, fixed width on desktop
<div className="w-full lg:w-1/2">
```

### Touch-Friendly Targets

- Minimum touch target: 44x44px
- Use `h-11` or larger for buttons on mobile
- Add spacing between interactive elements

---

## ✅ Pre-deployment Checklist

- [ ] All TypeScript errors resolved: `npm run build`
- [ ] ESLint warnings addressed: `npm run lint`
- [ ] Environment variables documented
- [ ] API endpoints working with production backend
- [ ] Forms validate correctly
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Images/assets optimized
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility: keyboard navigation works
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance: Lighthouse score reviewed
- [ ] No console.logs in production code
- [ ] Authentication flow works end-to-end
- [ ] File uploads work (receipt images)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Hook Form Guide](https://react-hook-form.com/get-started)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Headless UI](https://headlessui.com/)
- [Zod Documentation](https://zod.dev/)
- [Vite Guide](https://vite.dev/guide/)

---

## 🔧 Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript React code snippets
- Auto Rename Tag
- GitLens

### Browser Extensions

- React Developer Tools
- TanStack Query DevTools (included in dev mode)
- Tailwind CSS DevTools

---

## 🎨 Design Principles

1. **Consistency:** Reuse components, follow established patterns
2. **Simplicity:** Keep components focused, avoid over-engineering
3. **Accessibility:** Always consider keyboard and screen reader users
4. **Performance:** Lazy load routes, optimize images, minimize bundle
5. **Type Safety:** Leverage TypeScript for better DX and fewer bugs
6. **Responsive:** Design for mobile first, enhance for larger screens
7. **User Feedback:** Loading states, error messages, success confirmations

---

**Last Updated:** 2026-02-15
**Maintained By:** MateusPaiv
