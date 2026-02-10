// ─── Enums ──────────────────────────────────────────────────────────────────

export type PaymentMethodType =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'PIX'
  | 'OTHER';

export type Recurrence = 'MONTHLY' | 'YEARLY';

// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Method ─────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: PaymentMethodType;
  icon?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  type?: PaymentMethodType;
  icon?: string;
  isDefault?: boolean;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  budgetLimit: number | null;
  createdAt: string;
}

export interface CategoryWithCounts extends Category {
  expenseCount: number;
  fixedBillsCount: number;
}

export interface CategoryWithBudget extends Category {
  totalSpent: number;
  budgetRemaining: number | null;
  percentageUsed: number | null;
}

export interface BudgetOverviewItem {
  id: string;
  name: string;
  emoji: string;
  budgetLimit: number;
  totalSpent: number;
  budgetRemaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  emoji?: string;
  budgetLimit?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  emoji?: string;
  budgetLimit?: number | null;
}

// ─── Expense ────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  date: string;
  categoryId: string | null;
  paymentMethodId: string | null;
  receiptUrl: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
  sharedWith?: SharedExpense[];
}

export interface CreateExpenseRequest {
  amount: number;
  description?: string;
  date?: string;
  categoryId?: string;
  paymentMethodId?: string;
  isShared?: boolean;
  sharedWith?: { userId: string; splitAmount: number }[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  isShared?: boolean;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  paymentMethodId?: string;
  limit?: number;
  offset?: number;
}

// ─── Shared Expense ─────────────────────────────────────────────────────────

export interface SharedExpense {
  id: string;
  expenseId: string;
  sharedWithId: string;
  createdById: string;
  splitAmount: number;
  isPaid: boolean;
  createdAt: string;
  sharedWith?: User;
  createdBy?: User;
  expense?: Expense;
}

// ─── Fixed Bill ─────────────────────────────────────────────────────────────

export interface FixedBill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string | null;
  dueDay: number;
  recurrence: Recurrence;
  isPaid: boolean;
  isShared: boolean;
  lastPaidAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  sharedWith?: SharedFixedBill[];
}

export interface SharedFixedBill {
  id: string;
  fixedBillId: string;
  sharedWithId: string;
  createdById: string;
  splitAmount: number;
  isPaid: boolean;
  createdAt: string;
  sharedWith?: User;
  createdBy?: User;
  fixedBill?: FixedBill;
}

export interface CreateFixedBillRequest {
  name: string;
  amount: number;
  categoryId?: string;
  dueDay: number;
  recurrence: Recurrence;
  isShared?: boolean;
  sharedWith?: { userId: string; splitAmount: number }[];
}

export interface UpdateFixedBillRequest {
  name?: string;
  amount?: number;
  categoryId?: string | null;
  dueDay?: number;
  recurrence?: Recurrence;
  isShared?: boolean;
  sharedWith?: { userId: string; splitAmount: number }[];
}

export interface FixedBillSummary {
  totalMonthly: number;
  paidCount: number;
  unpaidCount: number;
  totalPaid: number;
  totalUnpaid: number;
}

// ─── Income ─────────────────────────────────────────────────────────────────

export interface Income {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeRequest {
  amount: number;
  description?: string;
  month: number;
  year: number;
}

export interface UpdateIncomeRequest {
  amount?: number;
  description?: string;
  month?: number;
  year?: number;
}

export interface IncomeSummary {
  year: number;
  month: number;
  totalIncome: number;
  incomeCount: number;
  incomes: Income[];
}

// ─── Monthly Summary ────────────────────────────────────────────────────────

export interface MonthlySummary {
  year: number;
  month: number;
  totalSpent: number;
  expenseCount: number;
  byCategory: {
    name: string;
    emoji: string;
    total: number;
    count: number;
  }[];
  byPaymentMethod: {
    name: string;
    icon: string;
    total: number;
    count: number;
  }[];
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── API Response ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
