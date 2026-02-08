import type { PaymentMethodType, Recurrence } from "@prisma/client";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payment Method ──────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
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

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  budgetLimit: number | null;
  createdAt: Date;
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

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  date: Date;
  categoryId: string | null;
  paymentMethodId: string | null;
  receiptUrl: string | null;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// ─── Shared Expense ──────────────────────────────────────────────────────────

export interface SharedExpense {
  id: string;
  expenseId: string;
  sharedWithId: string;
  createdById: string;
  splitAmount: number;
  isPaid: boolean;
  createdAt: Date;
  sharedWith?: User;
  createdBy?: User;
  expense?: Expense;
}

// ─── Fixed Bill ──────────────────────────────────────────────────────────────

export interface FixedBill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string | null;
  dueDay: number;
  recurrence: Recurrence;
  isPaid: boolean;
  lastPaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
}

export interface CreateFixedBillRequest {
  name: string;
  amount: number;
  categoryId?: string;
  dueDay: number;
  recurrence: Recurrence;
}

export interface UpdateFixedBillRequest {
  name?: string;
  amount?: number;
  categoryId?: string | null;
  dueDay?: number;
  recurrence?: Recurrence;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
