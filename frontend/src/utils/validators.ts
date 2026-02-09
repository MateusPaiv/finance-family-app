import { z } from 'zod';

/**
 * Validates an email address
 * @param email - The email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a currency input string
 * Accepts formats like: "1234.56", "1.234,56", "R$ 1.234,56", "1234", etc.
 * @param input - The currency string to validate
 * @returns true if valid, false otherwise
 */
export function isValidCurrency(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  // Remove currency symbols and whitespace
  const cleaned = input
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .trim();

  // Check if it matches a valid number format
  // Accepts: 1234, 1234.56, 1.234,56, 1,234.56, etc.
  const currencyRegex = /^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?$|^-?\d+(?:[.,]\d{1,2})?$/;
  return currencyRegex.test(cleaned);
}

/**
 * Validates a password meets minimum requirements
 * @param password - The password to validate
 * @param minLength - Minimum length (default: 6)
 * @returns true if valid, false otherwise
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
}

/**
 * Validates a positive number
 * @param value - The value to validate
 * @returns true if positive number, false otherwise
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

// ============================================================================
// Zod Schemas for Forms
// ============================================================================

/**
 * Schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema for registration form
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema for expense form
 */
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.date(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  isShared: z.boolean().optional(),
  sharedWith: z
    .array(
      z.object({
        userId: z.string(),
        splitAmount: z.number().positive(),
      })
    )
    .optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

/**
 * Schema for category form
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  emoji: z.string().optional(),
  budgetLimit: z.number().positive('Budget must be positive').optional().or(z.literal(0)),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Schema for payment method form
 */
export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'PIX', 'OTHER']),
  icon: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

/**
 * Schema for fixed bill form
 */
export const fixedBillSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().optional(),
  dueDay: z
    .number()
    .min(1, 'Due day must be between 1 and 31')
    .max(31, 'Due day must be between 1 and 31'),
  recurrence: z.enum(['MONTHLY', 'YEARLY']),
});

export type FixedBillFormData = z.infer<typeof fixedBillSchema>;

/**
 * Schema for password change form
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Schema for date range filter
 */
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export type DateRangeFormData = z.infer<typeof dateRangeSchema>;

/**
 * Helper function to validate data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag and errors if any
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
