# 🏗️ Family Finance Hub - Backend Documentation

This document contains architecture decisions, code conventions, and development guidelines for the Family Finance Hub backend API.

---

## 📐 Architecture Overview

**Tech Stack:**
- **Runtime:** Node.js 20+ with ES Modules
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **File Upload:** Multer
- **Security:** Helmet, CORS, bcryptjs

**Architecture Pattern:**
- RESTful API with route-based organization
- Middleware-based request processing
- Database-first design with Prisma schema
- Stateless authentication with JWT tokens

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Prisma client singleton
│   │   └── env.ts           # Environment variable validation
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   └── errorHandler.ts # Global error handler
│   ├── routes/              # API route handlers
│   │   ├── auth.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── expenses.routes.ts
│   │   ├── fixedBills.routes.ts
│   │   ├── income.routes.ts
│   │   └── paymentMethods.routes.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts         # Shared types
│   │   └── express.d.ts     # Express augmentation
│   └── server.ts            # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
├── uploads/                 # User-uploaded files (receipts)
├── dist/                    # Compiled JavaScript (gitignored)
├── package.json
├── tsconfig.json
└── .env                     # Environment variables (gitignored)
```

---

## 🗄️ Database Schema

### Core Models

**User** - Family member accounts
- `id`: UUID primary key
- `name`: User's display name
- `email`: Unique email for login
- `passwordHash`: bcrypt hashed password
- Relations: paymentMethods, categories, expenses, fixedBills, incomes

**PaymentMethod** - Custom payment methods (cards, cash, etc.)
- `id`: UUID
- `userId`: Owner reference
- `name`: Display name (e.g., "BB Card", "NU Card")
- `type`: Enum (CREDIT_CARD, DEBIT_CARD, CASH, PIX, OTHER)
- `icon`: Emoji representation (default: 💳)
- `isDefault`: Boolean flag for default method

**Category** - Expense categories with optional budgets
- `id`: UUID
- `userId`: Owner reference
- `name`: Category name (e.g., "Food", "Transport")
- `emoji`: Visual identifier (default: 📁)
- `budgetLimit`: Optional Decimal(12,2) monthly budget

**Expense** - Individual expense records
- `id`: UUID
- `userId`: Owner reference
- `amount`: Decimal(12,2)
- `description`: Optional text
- `date`: Transaction date (default: now)
- `categoryId`: Optional category reference (nullable on delete)
- `paymentMethodId`: Optional payment method (nullable on delete)
- `receiptUrl`: Optional file path to uploaded receipt
- `isShared`: Boolean - whether expense is split with others

**SharedExpense** - Split expense tracking
- `id`: UUID
- `expenseId`: Parent expense reference (cascade delete)
- `sharedWithId`: User receiving split
- `createdById`: User who created the share
- `splitAmount`: Decimal(12,2) amount for this person
- `isPaid`: Payment status tracking
- Unique constraint: [expenseId, sharedWithId]

**FixedBill** - Recurring monthly/yearly bills
- `id`: UUID
- `userId`: Owner reference
- `name`: Bill name (e.g., "Netflix", "Gym")
- `amount`: Decimal(12,2)
- `categoryId`: Optional category
- `dueDay`: Integer (1-31) for day of month
- `recurrence`: Enum (MONTHLY, YEARLY)
- `isPaid`: Payment status for current period
- `isShared`: Boolean - whether bill is split
- `lastPaidAt`: Timestamp of last payment

**SharedFixedBill** - Split recurring bill tracking
- Similar structure to SharedExpense
- Links fixed bills to multiple users

**Income** - Monthly income tracking
- `id`: UUID
- `userId`: Owner reference
- `amount`: Decimal(12,2)
- `description`: Optional text
- `month`: Integer (1-12)
- `year`: Integer
- Index on [userId, year, month] for fast queries

### Database Conventions

1. **Naming:**
   - TypeScript/Prisma: camelCase (e.g., `userId`, `createdAt`)
   - Database columns: snake_case (e.g., `user_id`, `created_at`)
   - Use `@@map()` for model names, `@map()` for fields

2. **Relationships:**
   - User cascade deletes: All owned resources deleted with user
   - Category/PaymentMethod set null: Preserve expenses if deleted
   - Shared records cascade: Clean up when parent deleted

3. **Decimal Precision:**
   - All monetary values: `Decimal(12, 2)`
   - Max: 9,999,999,999.99 (10 billion)
   - Always use Prisma Decimal type in TypeScript

---

## 🔐 Authentication & Security

### JWT Token Flow

1. **Registration/Login:**
   ```typescript
   // User provides credentials
   // Server validates and hashes password (bcrypt, 10 rounds)
   // Generate JWT with payload:
   {
     userId: string,
     email: string,
     iat: number,  // issued at
     exp: number   // expires (7 days from issue)
   }
   // Return user object + token
   ```

2. **Protected Routes:**
   ```typescript
   // Client sends: Authorization: Bearer <token>
   // authenticateToken middleware extracts and verifies
   // Decoded payload added to req.user
   // Route handler accesses req.user.userId
   ```

3. **Token Expiry:**
   - Default: 7 days (604800 seconds)
   - Client must re-authenticate when expired
   - 403 Forbidden returned on expired token

### Security Middleware

**Helmet** - Security headers
- Cross-origin resource policy: "cross-origin" (for file uploads)

**CORS** - Cross-origin requests
- Origin: Controlled by `CORS_ORIGIN` env var
- Credentials: true (for cookies if needed)

**Rate Limiting** - DISABLED by default
- Currently commented out in `server.ts`
- Designed for: 100 req/15min in production
- Uncomment if needed for production deployment

**Password Security**
- bcryptjs with 10 salt rounds
- Never store plain text passwords
- Never return passwordHash in API responses

---

## 📡 API Design Patterns

### Route Organization

All routes follow this structure:
```typescript
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { prisma } from "../config/database.js";
import { z } from "zod";

const router = express.Router();

// Public routes (if any)
router.post("/public-endpoint", handler);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require auth

router.get("/", listHandler);
router.get("/:id", getHandler);
router.post("/", createHandler);
router.put("/:id", updateHandler);
router.delete("/:id", deleteHandler);

export default router;
```

### Request Validation with Zod

**Pattern:**
```typescript
// Define schema
const CreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().uuid().optional(),
});

// In handler
const parseResult = CreateSchema.safeParse(req.body);
if (!parseResult.success) {
  return res.status(400).json({
    status: "error",
    message: "Validation failed",
    errors: parseResult.error.errors,
  });
}

const data = parseResult.data; // Type-safe validated data
```

**Why Zod:**
- Runtime type validation
- TypeScript type inference
- Detailed error messages
- Composable schemas

### Response Format

**Success Response:**
```typescript
res.status(200).json({
  status: "success",
  data: { ... },  // Single object or array
  message: "Optional success message",
});
```

**Error Response:**
```typescript
res.status(400).json({
  status: "error",
  message: "Human-readable error",
  errors: [...],  // Optional validation errors
});
```

**Pagination (if applicable):**
```typescript
res.status(200).json({
  status: "success",
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5,
  },
});
```

### Error Handling

**Global Error Handler** (`errorHandler.ts`)

Handles:
1. **Prisma Errors:**
   - `P2002`: Unique constraint violation → 409 Conflict
   - `P2025`: Record not found → 404 Not Found
   - Other Prisma errors → 500 with sanitized message

2. **Zod Validation Errors:**
   - Returns 400 with detailed field errors

3. **JWT Errors:**
   - TokenExpiredError → 403 Forbidden
   - JsonWebTokenError → 401 Unauthorized

4. **Multer Errors:**
   - File too large → 400
   - Invalid file type → 400

5. **Unknown Errors:**
   - 500 Internal Server Error
   - Stack trace only in development

**Pattern in Routes:**
```typescript
router.get("/:id", async (req, res, next) => {
  try {
    const data = await prisma.model.findUnique({
      where: { id: req.params.id },
    });

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Resource not found",
      });
    }

    res.json({ status: "success", data });
  } catch (error) {
    next(error); // Pass to global error handler
  }
});
```

---

## 🔧 Common Development Tasks

### Adding a New Route

1. **Create route file** in `src/routes/`
2. **Import dependencies:**
   ```typescript
   import express from "express";
   import { authenticateToken } from "../middleware/auth.js";
   import { prisma } from "../config/database.js";
   import { z } from "zod";
   ```

3. **Define validation schemas** with Zod
4. **Implement handlers** with try-catch
5. **Export router**
6. **Register in `server.ts`:**
   ```typescript
   import newRoutes from "./routes/new.routes.js";
   app.use("/api/new", newRoutes);
   ```

### Adding a New Database Model

1. **Update `prisma/schema.prisma`:**
   ```prisma
   model NewModel {
     id        String   @id @default(uuid())
     userId    String   @map("user_id")
     name      String
     createdAt DateTime @default(now()) @map("created_at")

     user User @relation(fields: [userId], references: [id])

     @@map("new_models")
   }
   ```

2. **Update User model** to include relation
3. **Generate migration:**
   ```bash
   npm run prisma:migrate
   # Enter migration name when prompted
   ```

4. **Regenerate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Update TypeScript types** in `src/types/index.ts`

### File Upload Pattern (Receipts)

**Multer Configuration:**
```typescript
import multer from "multer";
import path from "path";
import { env } from "../config/env.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueName = `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE }, // 5MB default
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
```

**Usage in Route:**
```typescript
router.post("/", upload.single("receipt"), async (req, res, next) => {
  try {
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create expense with receiptUrl
    const expense = await prisma.expense.create({
      data: {
        ...data,
        receiptUrl,
      },
    });

    res.status(201).json({ status: "success", data: expense });
  } catch (error) {
    next(error);
  }
});
```

### Ownership Checks

**Always verify resource ownership before modifications:**

```typescript
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const resource = await prisma.model.findUnique({
      where: { id: req.params.id },
    });

    if (!resource) {
      return res.status(404).json({
        status: "error",
        message: "Resource not found",
      });
    }

    // CRITICAL: Check ownership
    if (resource.userId !== req.user.userId) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You don't own this resource",
      });
    }

    // Proceed with update
    const updated = await prisma.model.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ status: "success", data: updated });
  } catch (error) {
    next(error);
  }
});
```

### Shared Expenses Pattern

**Creating a shared expense:**
```typescript
// Use Prisma transaction for atomicity
const result = await prisma.$transaction(async (tx) => {
  // Create main expense
  const expense = await tx.expense.create({
    data: {
      userId: req.user.userId,
      amount: totalAmount,
      description,
      isShared: true,
      // ... other fields
    },
  });

  // Create SharedExpense records
  const shares = await Promise.all(
    sharedWith.map((share) =>
      tx.sharedExpense.create({
        data: {
          expenseId: expense.id,
          sharedWithId: share.userId,
          createdById: req.user.userId,
          splitAmount: share.amount,
        },
      })
    )
  );

  return { expense, shares };
});
```

---

## 🎯 TypeScript Conventions

### Type Definitions

**Location:** `src/types/index.ts`

**Patterns:**
1. **Exclude sensitive fields:**
   ```typescript
   export type User = Omit<PrismaUser, "passwordHash">;
   ```

2. **Request DTOs:**
   ```typescript
   export interface CreateExpenseRequest {
     amount: number;
     description?: string;
     categoryId?: string;
     paymentMethodId?: string;
   }
   ```

3. **Response wrappers:**
   ```typescript
   export interface ApiResponse<T> {
     status: "success" | "error";
     data?: T;
     message?: string;
   }

   export interface PaginatedResponse<T> {
     status: "success";
     data: T[];
     pagination: {
       total: number;
       page: number;
       limit: number;
       totalPages: number;
     };
   }
   ```

4. **Auth token payload:**
   ```typescript
   export interface AuthToken {
     userId: string;
     email: string;
     iat: number;
     exp: number;
   }
   ```

### Express Type Augmentation

**File:** `src/types/express.d.ts`

```typescript
import type { AuthToken } from "./index.js";

declare global {
  namespace Express {
    interface Request {
      user: AuthToken; // Added by authenticateToken middleware
    }
  }
}
```

This allows accessing `req.user` with full type safety.

### Import Conventions

**ES Modules with .js extensions:**
```typescript
// CORRECT: Include .js extension even for .ts files
import { prisma } from "../config/database.js";
import type { User } from "../types/index.js";

// WRONG: Will fail at runtime
import { prisma } from "../config/database";
```

**Type-only imports:**
```typescript
import type { Request, Response, NextFunction } from "express";
```

---

## 🧪 Testing Guidelines

### Test Structure (Future Implementation)

```typescript
// Example: auth.test.ts
import request from "supertest";
import app from "../server.js";
import { prisma } from "../config/database.js";

describe("Authentication", () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should create a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### Manual Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Protected route:**
```bash
TOKEN="eyJhbGc..."
curl -X GET http://localhost:3001/api/expenses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Deployment

### Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (min 32 chars)

**Optional:**
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production, default: development)
- `CORS_ORIGIN`: Allowed origin (default: http://localhost:3000)
- `MAX_FILE_SIZE`: Max upload size in bytes (default: 5242880 = 5MB)

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Database Migrations

**Development:**
```bash
npm run prisma:migrate
```

**Production (Automated in Docker):**
```bash
npx prisma migrate deploy
```

### Docker Deployment

**Build:**
```bash
docker build -t family-finance-backend .
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

The compose file handles:
- PostgreSQL container with persistent volume
- Backend container with automatic migration
- Network configuration
- Health checks

### Prisma Studio (Database GUI)

**Access in development:**
```bash
npm run prisma:studio
```

Opens at: http://localhost:5555

---

## 📝 Code Style

### Comments

Use section dividers for organization:
```typescript
// ─── Section Name ────────────────────────────────────────────────────────────
```

Document complex logic:
```typescript
// Calculate available budget by subtracting fixed bills and expenses from income
const available = income - fixedBills - expenses;
```

### Naming Conventions

- **Variables/Functions:** camelCase (`getUserById`, `expenseData`)
- **Types/Interfaces:** PascalCase (`User`, `CreateExpenseRequest`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_LIMIT`)
- **Files:** kebab-case (`auth.routes.ts`, `error-handler.ts`)
- **Database:** snake_case (`user_id`, `created_at`)

### Error Messages

- **User-facing:** Clear, actionable
  - ✅ "Email already exists"
  - ❌ "P2002 unique constraint violation"

- **Developer logs:** Include context
  - `console.error("Failed to create expense:", error)`

---

## 🐛 Debugging

### Enable Prisma Query Logging

```typescript
// In database.ts
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

### Common Issues

**Issue: "Cannot find module"**
- Check `.js` extension in imports
- Verify `type: "module"` in package.json

**Issue: "Missing required environment variable"**
- Copy `.env.example` to `.env`
- Fill in all required values

**Issue: Prisma type errors**
- Run: `npm run prisma:generate`

**Issue: Migration failed**
- Reset database: `npx prisma migrate reset`
- Re-run migrations: `npm run prisma:migrate`

---

## 📚 Key Dependencies

- **express**: Web framework
- **@prisma/client**: Database ORM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **zod**: Schema validation
- **multer**: File uploads
- **helmet**: Security headers
- **cors**: Cross-origin requests
- **compression**: Response compression
- **dotenv**: Environment variables

**Dev Dependencies:**
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **prisma**: Database migrations
- **nodemon**: Auto-restart (if needed)

---

## 🔄 Git Workflow

**Branch naming:**
- `feat/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `chore/task-name` - Maintenance tasks

**Never commit directly to `main`**

**Typical workflow:**
```bash
git checkout -b feat/new-endpoint
# Make changes
git add src/routes/new.routes.ts
git commit -m "feat: add new endpoint for X"
git push -u origin feat/new-endpoint
gh pr create --title "feat: add new endpoint for X" --body "..."
```

---

## ✅ Pre-deployment Checklist

- [ ] All routes tested manually or with automated tests
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations are up to date
- [ ] Sensitive data not in responses (no `passwordHash`)
- [ ] Ownership checks on all protected routes
- [ ] Error handling in all route handlers
- [ ] CORS configured correctly for frontend origin
- [ ] Rate limiting configured (if needed)
- [ ] File upload limits set appropriately
- [ ] Prisma Client generated: `npm run prisma:generate`
- [ ] No console.logs in production code (use proper logging)

---

## 📞 Troubleshooting

**Database connection issues:**
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` format: `postgresql://user:password@host:5432/database`
3. Test connection: `npx prisma db push`

**Authentication not working:**
1. Verify `JWT_SECRET` is set and consistent
2. Check token format: `Authorization: Bearer <token>`
3. Verify token hasn't expired (7 day default)

**File uploads failing:**
1. Ensure `uploads/` directory exists
2. Check file size < `MAX_FILE_SIZE`
3. Verify MIME type is allowed
4. Check Helmet CORP policy: `cross-origin`

---

## 🎓 Learning Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Zod Documentation](https://zod.dev/)
- [JWT Introduction](https://jwt.io/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated:** 2026-02-15
**Maintained By:** MateusPaiv
