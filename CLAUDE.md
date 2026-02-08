# 🎯 Family Finance Hub - Claude Code Build Guide

Complete step-by-step guide to build your Family Finance Hub using Claude Code.

---

## 📋 Project Overview

**What we're building:** A multi-user family expense tracking app that runs on your Umbrel server.

**Tech Stack:**
- **Backend:** Node.js + TypeScript + Express + PostgreSQL + Prisma
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Deployment:** Docker + Docker Compose (for Umbrel)

**Key Features:**
- Multi-user accounts (you, sister, dad, mom)
- Custom payment methods (BB Card, NU Card, Itaú, Cash, Pix)
- Custom categories with budget limits
- Expense tracking with receipt photos
- Fixed bills management (recurring payments)
- Shared expenses & bill splitting
- Monthly analytics & reports
- Responsive design (mobile + desktop)

---

## 🗂️ Project Structure

```
family-finance-hub/
├── backend/                 # Node.js + TypeScript API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/                # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
└── docker-compose.yml       # Full stack orchestration
```

---

# 🚀 PHASE 1: Backend Setup & Database

## Step 1.1: Initialize Backend Project

**Prompt for Claude Code:**
```
Create a new Node.js backend project with TypeScript for a family finance tracking app.

Requirements:
- Initialize npm project
- Setup TypeScript with strict mode
- Install dependencies: express, cors, dotenv, bcryptjs, jsonwebtoken, multer, zod, helmet, express-rate-limit, compression
- Install dev dependencies: @types/node, @types/express, @types/bcryptjs, @types/jsonwebtoken, @types/multer, @types/cors, tsx, nodemon, typescript
- Install Prisma: @prisma/client, prisma (as dev dependency)
- Create tsconfig.json with ES modules and strict type checking
- Create basic folder structure: src/config, src/middleware, src/routes, src/controllers, src/services, src/types, src/utils
- Create .env.example with: DATABASE_URL, JWT_SECRET, PORT, NODE_ENV, CORS_ORIGIN, MAX_FILE_SIZE
- Create .gitignore for Node.js
- Setup package.json scripts: dev, build, start, prisma:generate, prisma:migrate, prisma:studio
```

**Expected files created:**
- `package.json`
- `tsconfig.json`
- `.env.example`
- `.gitignore`
- `src/` folder structure

---

## Step 1.2: Setup Database Schema

**Prompt for Claude Code:**
```
Create a Prisma schema for a family finance app with the following models:

User:
- id (uuid, primary key)
- name (string)
- email (string, unique)
- passwordHash (string)
- createdAt, updatedAt (datetime)

PaymentMethod:
- id (uuid)
- userId (foreign key to User)
- name (string) - e.g., "BB Card", "NU Card", "Itaú Card"
- type (enum: CREDIT_CARD, DEBIT_CARD, CASH, PIX, OTHER)
- icon (string, default "💳")
- isDefault (boolean, default false)
- createdAt (datetime)

Category:
- id (uuid)
- userId (foreign key to User)
- name (string) - e.g., "Education", "Health"
- emoji (string, default "📁")
- budgetLimit (decimal, nullable)
- createdAt (datetime)

Expense:
- id (uuid)
- userId (foreign key to User)
- amount (decimal)
- description (string, nullable)
- date (datetime, default now)
- categoryId (foreign key to Category, nullable, set null on delete)
- paymentMethodId (foreign key to PaymentMethod, nullable, set null on delete)
- receiptUrl (string, nullable)
- isShared (boolean, default false)
- createdAt, updatedAt (datetime)

SharedExpense:
- id (uuid)
- expenseId (foreign key to Expense, cascade delete)
- sharedWithId (foreign key to User, cascade delete)
- createdById (foreign key to User, cascade delete)
- splitAmount (decimal)
- isPaid (boolean, default false)
- createdAt (datetime)
- Unique constraint: [expenseId, sharedWithId]

FixedBill:
- id (uuid)
- userId (foreign key to User)
- name (string)
- amount (decimal)
- categoryId (foreign key to Category, nullable, set null on delete)
- dueDay (int, 1-31) - day of month
- recurrence (enum: MONTHLY, YEARLY)
- isPaid (boolean, default false)
- lastPaidAt (datetime, nullable)
- createdAt, updatedAt (datetime)

Database: PostgreSQL
Use camelCase for TypeScript, snake_case for database columns (with @@map)
```

**Expected files created:**
- `prisma/schema.prisma`

---

## Step 1.3: Create TypeScript Types

**Prompt for Claude Code:**
```
Create TypeScript type definitions for the Family Finance app based on the Prisma schema.

Create src/types/index.ts with:
- User type (without passwordHash)
- PaymentMethod type
- Category type
- Expense type (with nested category and paymentMethod)
- SharedExpense type (with nested user info)
- FixedBill type
- LoginRequest, RegisterRequest types
- CreateExpenseRequest, UpdateExpenseRequest types
- CreateCategoryRequest types
- CreatePaymentMethodRequest types
- CreateFixedBillRequest types
- AuthToken type (userId, email, iat, exp)
- ApiResponse<T> generic type
- PaginatedResponse<T> type

Also create src/types/express.d.ts to extend Express Request with user property.
```

**Expected files created:**
- `src/types/index.ts`
- `src/types/express.d.ts`

---

## Step 1.4: Database Configuration

**Prompt for Claude Code:**
```
Create database configuration for the Family Finance app.

Create src/config/database.ts:
- Import PrismaClient
- Create singleton instance
- Export prisma client
- Handle development vs production logging
- Add proper TypeScript types

Also create src/config/env.ts:
- Validate environment variables (DATABASE_URL, JWT_SECRET, PORT, etc.)
- Export typed config object
- Throw errors if required vars are missing
```

**Expected files created:**
- `src/config/database.ts`
- `src/config/env.ts`

---

## Step 1.5: Authentication Middleware

**Prompt for Claude Code:**
```
Create authentication middleware for JWT token verification.

Create src/middleware/auth.ts:
- authenticateToken function: Verify JWT from Authorization header, extract user, add to req.user
- optionalAuth function: Same but don't fail if no token
- Use jsonwebtoken library
- Return 401 for missing/invalid token
- Return 403 for expired token
- Add TypeScript types

Create src/middleware/errorHandler.ts:
- Global error handler
- Handle Prisma errors (P2002 unique constraint, P2025 not found)
- Handle Zod validation errors
- Handle JWT errors
- Handle Multer file upload errors
- Return proper HTTP status codes
- Include stack trace in development only
```

**Expected files created:**
- `src/middleware/auth.ts`
- `src/middleware/errorHandler.ts`

---

## Step 1.6: Authentication Routes

**Prompt for Claude Code:**
```
Create authentication routes with registration, login, and user profile.

Create src/routes/auth.routes.ts:

POST /api/auth/register:
- Validate: name (min 2 chars), email, password (min 6 chars) using Zod
- Check if user exists
- Hash password with bcrypt (10 rounds)
- Create user
- Create default payment method (Cash)
- Create default categories (Shopping, Food, Transport, Health, Entertainment, Bills)
- Generate JWT (7 day expiry)
- Return user + token

POST /api/auth/login:
- Validate email, password
- Find user by email
- Verify password
- Generate JWT
- Return user + token

GET /api/auth/me (protected):
- Return current user profile

GET /api/auth/family (protected):
- Return all other users (exclude current user)
- For sharing expenses

Use Express Router, Zod for validation, proper TypeScript types.
```

**Expected files created:**
- `src/routes/auth.routes.ts`

---

## Step 1.7: Payment Methods Routes

**Prompt for Claude Code:**
```
Create payment methods CRUD routes.

Create src/routes/paymentMethods.routes.ts:

All routes protected (require authentication).

GET /api/payment-methods:
- Return all payment methods for current user
- Order by isDefault DESC, createdAt ASC

POST /api/payment-methods:
- Validate: name, type (enum), icon, isDefault
- If isDefault=true, unset other defaults
- Create payment method for current user

PUT /api/payment-methods/:id:
- Check ownership
- If setting as default, unset others
- Update payment method

DELETE /api/payment-methods/:id:
- Check ownership
- Delete payment method

Use Zod validation, proper error handling, TypeScript types.
```

**Expected files created:**
- `src/routes/paymentMethods.routes.ts`

---

## Step 1.8: Categories Routes

**Prompt for Claude Code:**
```
Create categories CRUD routes with budget tracking.

Create src/routes/categories.routes.ts:

All routes protected.

GET /api/categories:
- Return all categories for current user
- Include expense count and fixed bills count

GET /api/categories/:id:
- Return category with current month spending
- Calculate: totalSpent, budgetRemaining, percentageUsed

POST /api/categories:
- Validate: name, emoji, budgetLimit (optional)
- Create category for current user

PUT /api/categories/:id:
- Check ownership
- Update category

DELETE /api/categories/:id:
- Check ownership
- Delete category (expenses will have categoryId set to null)

GET /api/categories/budget/overview:
- Return all categories with budgets
- Calculate spending vs budget for current month
- Mark as over budget if exceeded
- Include percentage used

Use Zod, TypeScript, proper error handling.
```

**Expected files created:**
- `src/routes/categories.routes.ts`

---

## Step 1.9: Expenses Routes

**Prompt for Claude Code:**
```
Create expenses routes with receipt upload and sharing.

Create src/routes/expenses.routes.ts:

Configure Multer for receipt uploads:
- Storage: ./uploads
- Filename: receipt-{timestamp}-{random}.{ext}
- Limit: 5MB
- Allow: jpeg, jpg, png, pdf
- Reject others with error

All routes protected.

GET /api/expenses:
- Query params: startDate, endDate, categoryId, paymentMethodId, limit, offset
- Return expenses with category, paymentMethod, sharedWith info
- Include pagination metadata

GET /api/expenses/:id:
- Check ownership
- Return full expense details

POST /api/expenses:
- Handle multipart/form-data (receipt file)
- Validate: amount, description, date, categoryId, paymentMethodId, isShared, sharedWith[]
- Save receipt to /uploads
- Create expense in transaction
- If shared, create SharedExpense records
- Return created expense

PUT /api/expenses/:id:
- Check ownership
- Update expense
- Handle new receipt upload

DELETE /api/expenses/:id:
- Check ownership
- Delete expense (SharedExpense cascade deleted)

GET /api/expenses/shared/with-me:
- Return expenses shared with current user
- Include who created it

GET /api/expenses/summary/monthly:
- Query: year, month (default current)
- Calculate: totalSpent, expense count
- Group by category
- Group by payment method
- Return summary object

Use Zod, Multer, TypeScript, transactions for shared expenses.
```

**Expected files created:**
- `src/routes/expenses.routes.ts`

---

## Step 1.10: Fixed Bills Routes

**Prompt for Claude Code:**
```
Create fixed bills routes for recurring payments.

Create src/routes/fixedBills.routes.ts:

All routes protected.

GET /api/fixed-bills:
- Return all fixed bills for current user
- Include category info
- Order by dueDay ASC

GET /api/fixed-bills/:id:
- Check ownership
- Return fixed bill

POST /api/fixed-bills:
- Validate: name, amount, categoryId, dueDay (1-31), recurrence (MONTHLY/YEARLY)
- Create fixed bill

PUT /api/fixed-bills/:id:
- Check ownership
- Update fixed bill

DELETE /api/fixed-bills/:id:
- Check ownership
- Delete fixed bill

POST /api/fixed-bills/:id/pay:
- Check ownership
- Set isPaid=true, lastPaidAt=now

POST /api/fixed-bills/:id/reset:
- Check ownership
- Set isPaid=false (for new month)

GET /api/fixed-bills/upcoming/next-week:
- Return unpaid bills due in next 7 days
- Handle month rollover

GET /api/fixed-bills/summary/monthly:
- Calculate: totalMonthly, paidCount, unpaidCount, totalPaid, totalUnpaid
- Only for MONTHLY recurrence

Use Zod, TypeScript.
```

**Expected files created:**
- `src/routes/fixedBills.routes.ts`

---

## Step 1.11: Main Server Setup

**Prompt for Claude Code:**
```
Create the main Express server with all routes and middleware.

Create src/server.ts:

Import all routes and middleware.

Setup:
- Express app
- Helmet (security headers)
- CORS (configured from env)
- Rate limiting (100 req/15min per IP on /api/*)
- Body parsing (JSON 10MB limit, URL encoded)
- Compression
- Static files (/uploads for receipts)

Routes:
- GET /health - Health check endpoint
- /api/auth -> authRoutes
- /api/expenses -> expenseRoutes
- /api/categories -> categoryRoutes
- /api/payment-methods -> paymentMethodRoutes
- /api/fixed-bills -> fixedBillRoutes

Error handling:
- 404 handler for unknown routes
- Global error handler (must be last)

Server:
- Listen on PORT from env
- Graceful shutdown on SIGTERM
- Log startup info (port, env, URLs)

Use TypeScript, proper imports.
```

**Expected files created:**
- `src/server.ts`

---

## Step 1.12: Docker Setup for Backend

**Prompt for Claude Code:**
```
Create Docker configuration for backend deployment.

Create Dockerfile:
- FROM node:20-alpine
- Install openssl (for Prisma)
- Set WORKDIR /app
- Copy package*.json
- RUN npm ci --only=production
- Copy prisma schema
- Generate Prisma Client
- Copy source code
- Expose 3001
- CMD ["npm", "start"]

Create docker-compose.yml:
- Service: postgres (postgres:16-alpine)
  - Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
  - Volume: postgres_data
  - Port: 5432
  - Healthcheck

- Service: backend
  - Build: ./backend
  - Environment: DATABASE_URL, JWT_SECRET, NODE_ENV=production, PORT=3001
  - Volume: ./backend/uploads
  - Port: 3001
  - Depends on: postgres (wait for healthy)
  - Command: sh -c "npx prisma migrate deploy && npm start"

- Network: finance-network
- Volume: postgres_data

Use proper service names for internal communication.
```

**Expected files created:**
- `backend/Dockerfile`
- `docker-compose.yml` (root)

---

# 🎨 PHASE 2: Frontend Setup

## Step 2.1: Initialize React + TypeScript + Vite

**Prompt for Claude Code:**
```
Create a React + TypeScript + Vite frontend project for the family finance app.

Requirements:
- Initialize with Vite (React + TypeScript template)
- Install dependencies: react, react-dom, react-router-dom
- Install UI: @headlessui/react, @heroicons/react, lucide-react
- Install forms: react-hook-form, zod
- Install data: @tanstack/react-query, axios
- Install utils: date-fns, recharts (for charts)
- Install Tailwind CSS: tailwindcss, postcss, autoprefixer
- Install dev dependencies: @types/react, @types/react-dom, @vitejs/plugin-react

Create folder structure:
- src/components/ui (Button, Input, Card, Modal)
- src/components/features (ExpenseCard, CategoryBadge, BudgetBar)
- src/pages (Login, Dashboard, Expenses, Categories, etc.)
- src/hooks (useAuth, useExpenses, useCategories)
- src/services (api.ts, auth.ts, expenses.ts)
- src/types (index.ts)
- src/utils (formatters.ts, validators.ts)
- src/context (AuthContext.tsx)

Setup Tailwind:
- Create tailwind.config.js
- Create postcss.config.js
- Add Tailwind directives to index.css

Setup Vite config:
- API proxy to backend (http://localhost:3001)
- Port 3000
```

**Expected files created:**
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/` folder structure

---

## Step 2.2: API Service Layer

**Prompt for Claude Code:**
```
Create API service layer for communicating with backend.

Create src/services/api.ts:
- Axios instance with baseURL from env
- Interceptors for adding JWT token to requests
- Interceptors for handling 401 (logout), 403, network errors
- TypeScript types

Create src/services/auth.ts:
- register(name, email, password) → Promise<{user, token}>
- login(email, password) → Promise<{user, token}>
- getCurrentUser() → Promise<User>
- getFamilyMembers() → Promise<User[]>

Create src/services/expenses.ts:
- getExpenses(filters) → Promise<PaginatedResponse<Expense>>
- createExpense(data, receipt?) → Promise<Expense>
- updateExpense(id, data) → Promise<Expense>
- deleteExpense(id) → Promise<void>
- getSharedExpenses() → Promise<SharedExpense[]>
- getMonthlySummary(year, month) → Promise<Summary>

Create similar services for:
- src/services/categories.ts
- src/services/paymentMethods.ts
- src/services/fixedBills.ts

Use axios, proper TypeScript types, error handling.
```

**Expected files created:**
- `src/services/api.ts`
- `src/services/auth.ts`
- `src/services/expenses.ts`
- `src/services/categories.ts`
- `src/services/paymentMethods.ts`
- `src/services/fixedBills.ts`

---

## Step 2.3: Authentication Context & Hooks

**Prompt for Claude Code:**
```
Create authentication context and custom hooks.

Create src/context/AuthContext.tsx:
- Store: user, token, isAuthenticated, isLoading
- Actions: login, logout, register
- Save token to localStorage
- Add token to axios headers
- Load user on mount (if token exists)
- Provider component

Create src/hooks/useAuth.ts:
- Hook to use AuthContext
- Return user, login, logout, register, isAuthenticated

Create src/hooks/useExpenses.ts:
- Use React Query
- Queries: useExpenses, useExpense, useSharedExpenses, useMonthlySummary
- Mutations: useCreateExpense, useUpdateExpense, useDeleteExpense
- Invalidate queries on mutation

Create similar hooks for:
- src/hooks/useCategories.ts
- src/hooks/usePaymentMethods.ts
- src/hooks/useFixedBills.ts

Use React Query for caching, TypeScript.
```

**Expected files created:**
- `src/context/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/useExpenses.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/usePaymentMethods.ts`
- `src/hooks/useFixedBills.ts`

---

## Step 2.4: UI Components (Base)

**Prompt for Claude Code:**
```
Create reusable UI components with Tailwind CSS.

Create src/components/ui/Button.tsx:
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- Props: loading, disabled, icon
- Full TypeScript types

Create src/components/ui/Input.tsx:
- Props: label, error, helperText, prefix, suffix
- Support for types: text, email, password, number, date
- Error state styling

Create src/components/ui/Card.tsx:
- Variants: default, elevated
- Header, body, footer sections
- Padding options

Create src/components/ui/Modal.tsx:
- Use Headless UI Dialog
- Props: open, onClose, title, children
- Backdrop with animation

Create src/components/ui/Select.tsx:
- Use Headless UI Listbox
- Support for options with icons
- Multi-select variant

Create src/components/ui/Badge.tsx:
- Color variants based on type
- Size options

All components:
- Fully typed with TypeScript
- Responsive design
- Accessible (ARIA)
- Use Tailwind CSS
```

**Expected files created:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Badge.tsx`

---

## Step 2.5: Feature Components

**Prompt for Claude Code:**
```
Create feature-specific components.

Create src/components/features/ExpenseCard.tsx:
- Display expense with amount, description, date, category, payment method
- Show receipt thumbnail if exists
- Actions: edit, delete
- Props: expense, onEdit, onDelete

Create src/components/features/BudgetBar.tsx:
- Visual progress bar for budget vs spent
- Props: spent, budget, category name
- Color: green (under 70%), yellow (70-90%), red (over 90%)

Create src/components/features/CategoryBadge.tsx:
- Display category with emoji and name
- Clickable variant
- Props: category, onClick

Create src/components/features/QuickAddExpense.tsx:
- Floating action button
- Modal with form: amount, description, category, payment method, receipt
- Use react-hook-form + zod
- Camera button for receipt

Create src/components/features/MonthSelector.tsx:
- Month/year picker
- Previous/next buttons
- Props: selected month, onChange

Create src/components/features/StatCard.tsx:
- Display stat with icon, label, value
- Trend indicator (up/down)
- Props: label, value, icon, trend

All components use Tailwind, TypeScript, responsive.
```

**Expected files created:**
- `src/components/features/ExpenseCard.tsx`
- `src/components/features/BudgetBar.tsx`
- `src/components/features/CategoryBadge.tsx`
- `src/components/features/QuickAddExpense.tsx`
- `src/components/features/MonthSelector.tsx`
- `src/components/features/StatCard.tsx`

---

## Step 2.6: Authentication Pages

**Prompt for Claude Code:**
```
Create login and register pages.

Create src/pages/Login.tsx:
- Form: email, password
- Use react-hook-form + zod validation
- Call useAuth().login
- Show errors
- Link to register
- Redirect to dashboard on success
- Responsive, centered layout

Create src/pages/Register.tsx:
- Form: name, email, password, confirm password
- Validation with zod
- Call useAuth().register
- Show errors
- Link to login
- Redirect to dashboard on success

Both pages:
- Use UI components (Input, Button, Card)
- Loading states
- Error handling
- Tailwind styling
- TypeScript
```

**Expected files created:**
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`

---

## Step 2.7: Dashboard Page

**Prompt for Claude Code:**
```
Create the main dashboard page.

Create src/pages/Dashboard.tsx:

Layout:
- Header with user name, month selector
- Grid layout (responsive: 1 col mobile, 2-3 cols desktop)

Sections:
1. "What I Can Spend" - Large card
   - Show: monthly budget - fixed bills - expenses = available
   - Progress bar
   - Color-coded (green/yellow/red)

2. Credit Cards Preview
   - Cards for each payment method
   - Show current month total per card
   - Click to see details

3. Upcoming Fixed Bills
   - List next 5 upcoming bills
   - Mark as paid button
   - Due date warnings

4. Recent Expenses
   - Last 10 expenses
   - Quick actions

5. Budget Overview
   - Categories with progress bars
   - Over-budget warnings

6. Quick Stats
   - Total spent this month
   - Number of expenses
   - Average expense

Use:
- useExpenses, useFixedBills, useCategories hooks
- React Query loading states
- StatCard, ExpenseCard, BudgetBar components
- Responsive grid with Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/Dashboard.tsx`

---

## Step 2.8: Expenses Page

**Prompt for Claude Code:**
```
Create expenses management page.

Create src/pages/Expenses.tsx:

Features:
- Month/year filter
- Category filter (dropdown)
- Payment method filter
- Search by description
- Sort by date/amount

Display:
- List of expenses (infinite scroll or pagination)
- Use ExpenseCard component
- Show receipt thumbnails
- Edit/delete actions

Actions:
- "Add Expense" button → opens QuickAddExpense modal
- Edit expense → opens modal with form
- Delete expense → confirmation dialog
- View receipt → full-screen modal

Modals:
- Add/Edit expense form
  - Amount, description, date, category, payment method
  - Receipt upload (camera or file)
  - Share with family toggle
  - If shared, select family members and split amounts
  
Use:
- useExpenses hook
- React Query
- Forms with react-hook-form + zod
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/Expenses.tsx`

---

## Step 2.9: Categories Page

**Prompt for Claude Code:**
```
Create categories management page.

Create src/pages/Categories.tsx:

Display:
- Grid of category cards
- Each card shows:
  - Emoji + name
  - Budget limit (if set)
  - Current month spending
  - Budget progress bar
  - Actions: edit, delete

Actions:
- "Add Category" button
- Edit category → modal with form
- Delete category → confirmation

Forms:
- Name
- Emoji picker (simple input or preset list)
- Budget limit (optional, number input)

Stats:
- Total categories
- Categories over budget
- Total budgeted vs spent

Use:
- useCategories hook
- BudgetBar component
- Modal component
- Forms with validation
- Tailwind grid
- TypeScript
```

**Expected files created:**
- `src/pages/Categories.tsx`

---

## Step 2.10: Payment Methods Page

**Prompt for Claude Code:**
```
Create payment methods management page.

Create src/pages/PaymentMethods.tsx:

Display:
- List of payment methods
- Each shows: icon, name, type, default badge
- Current month total spent with this method

Actions:
- "Add Payment Method" button
- Edit → modal
- Delete → confirmation
- Set as default (radio button or toggle)

Form:
- Name (e.g., "BB Card")
- Type (dropdown: Credit Card, Debit Card, Cash, Pix, Other)
- Icon (emoji picker or preset)
- Set as default checkbox

Stats:
- Total payment methods
- Most used this month

Use:
- usePaymentMethods hook
- Card components
- Modal, forms
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/PaymentMethods.tsx`

---

## Step 2.11: Fixed Bills Page

**Prompt for Claude Code:**
```
Create fixed bills management page.

Create src/pages/FixedBills.tsx:

Display:
- Calendar view or list view toggle
- Each bill shows:
  - Name, amount, category
  - Due day, recurrence
  - Paid/unpaid status
  - Days until due

Actions:
- "Add Fixed Bill" button
- Mark as paid (checkbox or button)
- Edit bill
- Delete bill
- Reset for new month (bulk action)

Form:
- Name (e.g., "Gym Membership")
- Amount
- Category (dropdown)
- Due day (1-31)
- Recurrence (Monthly/Yearly)

Summary:
- Total monthly fixed bills
- Paid vs unpaid
- Next bill due

Upcoming section:
- Bills due in next 7 days
- Overdue bills (highlighted)

Use:
- useFixedBills hook
- Calendar view (can use simple grid)
- Forms, modals
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/FixedBills.tsx`

---

## Step 2.12: Family Sharing Page

**Prompt for Claude Code:**
```
Create family sharing and split expenses page.

Create src/pages/FamilySharing.tsx:

Sections:
1. Shared with me
   - Expenses others shared with me
   - Who created it
   - My split amount
   - Paid/unpaid status
   - Mark as paid button

2. I shared with others
   - Expenses I created and shared
   - Who I shared with
   - Split amounts
   - Payment status per person

3. Summary
   - Total I owe
   - Total others owe me
   - Net balance

Display:
- Use ExpenseCard component
- Show split amounts clearly
- Filter by family member

Use:
- useExpenses (shared endpoints)
- useAuth (for family members list)
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/FamilySharing.tsx`

---

## Step 2.13: Reports Page

**Prompt for Claude Code:**
```
Create analytics and reports page.

Create src/pages/Reports.tsx:

Features:
- Month/year selector
- Date range picker (custom period)

Charts (using Recharts):
1. Spending by category (pie chart)
2. Spending trend (line chart, last 6 months)
3. Spending by payment method (bar chart)
4. Budget vs actual (grouped bar chart)
5. Daily spending (area chart)

Stats:
- Total spent (selected period)
- Average daily spending
- Highest expense
- Most expensive category
- Spending trend (up/down %)

Export:
- Download as CSV button
- Print-friendly view

Use:
- useMonthlySummary hook
- Recharts library
- Date range picker
- Responsive charts
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/Reports.tsx`

---

## Step 2.14: Settings Page

**Prompt for Claude Code:**
```
Create user settings page.

Create src/pages/Settings.tsx:

Sections:
1. Profile
   - Name, email (display only)
   - Change password form

2. Preferences
   - Currency symbol (default R$)
   - Date format
   - First day of week
   - Notifications (future feature placeholder)

3. Data Management
   - Export all data (JSON/CSV)
   - Delete account (with confirmation)

4. About
   - App version
   - Credits

Use:
- useAuth hook
- Forms for password change
- Confirmation modals
- Tailwind
- TypeScript
```

**Expected files created:**
- `src/pages/Settings.tsx`

---

## Step 2.15: Router & Layout

**Prompt for Claude Code:**
```
Create routing and layout components.

Create src/components/Layout.tsx:
- Navigation sidebar (desktop) / bottom bar (mobile)
- Links: Dashboard, Expenses, Categories, Payment Methods, Fixed Bills, Family, Reports, Settings
- User profile dropdown (logout)
- Responsive toggle for mobile menu
- Active route highlighting

Create src/App.tsx:
- React Router setup
- Protected routes (require auth)
- Public routes (login, register)
- React Query provider
- Auth provider
- Routes:
  - / → redirect to /dashboard or /login
  - /login
  - /register
  - /dashboard (protected)
  - /expenses (protected)
  - /categories (protected)
  - /payment-methods (protected)
  - /fixed-bills (protected)
  - /family (protected)
  - /reports (protected)
  - /settings (protected)
  - 404 page

Use:
- react-router-dom
- AuthContext for protection
- Layout wrapper for protected pages
- TypeScript
```

**Expected files created:**
- `src/components/Layout.tsx`
- `src/App.tsx`

---

## Step 2.16: Utilities & Formatters

**Prompt for Claude Code:**
```
Create utility functions.

Create src/utils/formatters.ts:
- formatCurrency(amount: number) → "R$ 1.234,56"
- formatDate(date: Date) → "08/02/2026"
- formatDateTime(date: Date) → "08/02/2026 14:30"
- formatRelativeDate(date: Date) → "2 days ago"
- parseAmount(input: string) → number

Create src/utils/validators.ts:
- isValidEmail(email: string) → boolean
- isValidCurrency(input: string) → boolean
- Zod schemas for forms (export for reuse)

Create src/utils/calculations.ts:
- calculateBudgetPercentage(spent, budget) → number
- calculateAvailableBudget(income, fixedBills, expenses) → number
- sumExpenses(expenses: Expense[]) → number

All functions fully typed with TypeScript.
```

**Expected files created:**
- `src/utils/formatters.ts`
- `src/utils/validators.ts`
- `src/utils/calculations.ts`

---

## Step 2.17: Frontend Dockerfile

**Prompt for Claude Code:**
```
Create Dockerfile for frontend production build.

Create frontend/Dockerfile:
- FROM node:20-alpine as builder
- WORKDIR /app
- Copy package*.json
- RUN npm ci
- Copy source code
- RUN npm run build

- FROM nginx:alpine
- Copy build from builder to /usr/share/nginx/html
- Copy nginx.conf (create custom config)
- Expose 80
- CMD ["nginx", "-g", "daemon off;"]

Create frontend/nginx.conf:
- Serve static files
- Route all paths to index.html (for React Router)
- Proxy /api to backend service
- Gzip compression

Update docker-compose.yml:
- Add frontend service
- Build from ./frontend
- Port: 3000:80
- Depends on: backend
- Environment: VITE_API_URL=http://backend:3001
```

**Expected files created:**
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- Updated `docker-compose.yml`

---

# 🚀 PHASE 3: Testing & Deployment

## Step 3.1: Environment Setup

**Prompt for Claude Code:**
```
Create environment configuration files for all environments.

Create backend/.env.example:
- DATABASE_URL
- JWT_SECRET (generate with: openssl rand -base64 32)
- PORT=3001
- NODE_ENV=development
- CORS_ORIGIN=http://localhost:3000
- MAX_FILE_SIZE=5242880

Create frontend/.env.example:
- VITE_API_URL=http://localhost:3001

Create .env for local development (copy from examples).

Create deployment guide for Umbrel:
- Steps to clone repo
- How to set environment variables
- Docker compose commands
- Access URLs (http://umbrel.local:3000)
```

**Expected files created:**
- `backend/.env.example`
- `frontend/.env.example`
- `DEPLOYMENT.md`

---

## Step 3.2: Testing Setup

**Prompt for Claude Code:**
```
Create basic testing structure (optional but recommended).

Backend:
- Install: jest, supertest, @types/jest, @types/supertest, ts-jest
- Create jest.config.js
- Create test folder structure
- Sample test: auth.test.ts (register, login)
- Sample test: expenses.test.ts (CRUD operations)

Frontend:
- Install: vitest, @testing-library/react, @testing-library/jest-dom
- Create vitest.config.ts
- Sample test: Dashboard.test.tsx
- Sample test: useAuth.test.ts

Add scripts:
- backend: "test": "jest"
- frontend: "test": "vitest"
```

**Expected files created:**
- `backend/jest.config.js`
- `backend/src/__tests__/`
- `frontend/vitest.config.ts`
- `frontend/src/__tests__/`

---

## Step 3.3: Documentation

**Prompt for Claude Code:**
```
Create comprehensive documentation.

Create README.md (root):
- Project overview
- Tech stack
- Features list
- Prerequisites
- Quick start (local development)
- Docker deployment
- Project structure
- API endpoints summary
- Screenshots (placeholder)

Create backend/README.md:
- Backend-specific setup
- Database schema
- API documentation
- Environment variables
- Testing

Create frontend/README.md:
- Frontend-specific setup
- Component structure
- Styling guide
- Build & deploy

Create CONTRIBUTING.md:
- How to contribute
- Code style
- Commit conventions
- PR process
```

**Expected files created:**
- `README.md`
- `backend/README.md`
- `frontend/README.md`
- `CONTRIBUTING.md`

---

## Step 3.4: Final Checklist

**Before deploying to Umbrel:**

Backend:
- [ ] All routes implemented and tested
- [ ] Database migrations work
- [ ] JWT authentication working
- [ ] File upload (receipts) working
- [ ] Error handling in place
- [ ] Environment variables documented
- [ ] Docker build succeeds
- [ ] TypeScript compiles without errors

Frontend:
- [ ] All pages implemented
- [ ] Responsive design (mobile + desktop)
- [ ] Forms with validation working
- [ ] API integration working
- [ ] Authentication flow working
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] TypeScript compiles without errors
- [ ] Build succeeds

Deployment:
- [ ] docker-compose.yml complete
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Can access at http://localhost:3000
- [ ] Can register new user
- [ ] Can create expenses
- [ ] Can upload receipts
- [ ] Can share expenses with family

---

# 📝 Step-by-Step Execution Order

**Day 1: Backend Foundation**
1. Step 1.1 - 1.4: Project setup, database, types
2. Step 1.5 - 1.6: Middleware, authentication
3. Test: Register and login working

**Day 2: Backend Features**
4. Step 1.7 - 1.10: All CRUD routes
5. Step 1.11: Main server
6. Step 1.12: Docker setup
7. Test: All API endpoints working

**Day 3: Frontend Foundation**
8. Step 2.1 - 2.3: Project setup, services, hooks
9. Step 2.4 - 2.5: UI components
10. Step 2.6: Auth pages
11. Test: Can login/register

**Day 4: Frontend Core Pages**
12. Step 2.7: Dashboard
13. Step 2.8: Expenses page
14. Step 2.9 - 2.10: Categories and payment methods
15. Test: Can add expenses, categories

**Day 5: Frontend Advanced**
16. Step 2.11 - 2.13: Fixed bills, sharing, reports
17. Step 2.14 - 2.15: Settings, router, layout
18. Step 2.16 - 2.17: Utils, Docker
19. Test: All features working

**Day 6: Testing & Deployment**
20. Step 3.1 - 3.4: Testing, docs, deployment
21. Deploy to Umbrel
22. Final testing with family

---

# 🎯 Pro Tips for Claude Code

**When prompting Claude Code:**

1. **Be specific about files**: Always mention exact file paths
2. **One feature at a time**: Don't ask for multiple complex features at once
3. **Request TypeScript types**: Always ask for proper typing
4. **Ask for error handling**: Explicitly request try-catch, validation
5. **Request responsive design**: Always mention mobile + desktop
6. **Test incrementally**: Build → test → next feature
7. **Use git commits**: Commit after each major step

**Example good prompt:**
```
Create src/routes/expenses.routes.ts with CRUD endpoints for expenses.
Include file upload with multer, Zod validation, proper TypeScript types,
error handling, and support for shared expenses. All routes should be
protected with authenticateToken middleware.
```

**Example bad prompt:**
```
Make the expenses stuff
```

---

# 🚨 Common Issues & Solutions

**Issue: TypeScript errors**
- Solution: Ask Claude Code to fix with proper types

**Issue: CORS errors**
- Solution: Check CORS_ORIGIN in backend .env matches frontend URL

**Issue: Database connection failed**
- Solution: Verify DATABASE_URL, ensure Postgres is running

**Issue: JWT token not working**
- Solution: Check JWT_SECRET is set, tokens not expired

**Issue: File upload fails**
- Solution: Check uploads folder exists, file size limit, MIME types

**Issue: Frontend can't reach backend**
- Solution: Check API_URL in frontend .env, check backend is running on correct port

---

# ✅ Success Criteria

Your app is ready when:

1. ✅ Family members can register and login
2. ✅ Each user sees only their own data
3. ✅ Can add expenses with receipts
4. ✅ Can create custom categories with budgets
5. ✅ Can create custom payment methods
6. ✅ Budget tracking shows correct percentages
7. ✅ Can share expenses with family members
8. ✅ Fixed bills track payment status
9. ✅ Dashboard shows "what I can spend"
10. ✅ Responsive on mobile and desktop
11. ✅ Runs on Umbrel server
12. ✅ Accessible from family devices on network

---

**🎉 You're ready to build! Start with Phase 1, Step 1.1 and work through systematically.**

**Good luck! 🚀**
