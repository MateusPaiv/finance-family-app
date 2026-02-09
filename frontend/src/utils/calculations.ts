import type { Expense } from '@/types';

/**
 * Calculates the percentage of budget spent
 * @param spent - Amount spent
 * @param budget - Total budget
 * @returns Percentage (0-100+), or 0 if budget is 0
 */
export function calculateBudgetPercentage(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return (spent / budget) * 100;
}

/**
 * Calculates available budget after fixed bills and expenses
 * @param income - Total income/budget
 * @param fixedBills - Total fixed bills amount
 * @param expenses - Total variable expenses amount
 * @returns Remaining available budget (can be negative if over budget)
 */
export function calculateAvailableBudget(
  income: number,
  fixedBills: number,
  expenses: number
): number {
  return income - fixedBills - expenses;
}

/**
 * Sums the total amount of an array of expenses
 * @param expenses - Array of expense objects
 * @returns Total sum of expense amounts
 */
export function sumExpenses(expenses: Expense[]): number {
  if (!expenses || !Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculates average expense amount
 * @param expenses - Array of expense objects
 * @returns Average expense amount, or 0 if no expenses
 */
export function calculateAverageExpense(expenses: Expense[]): number {
  if (!expenses || expenses.length === 0) return 0;
  const total = sumExpenses(expenses);
  return total / expenses.length;
}

/**
 * Finds the highest expense in an array
 * @param expenses - Array of expense objects
 * @returns Highest expense object, or null if array is empty
 */
export function findHighestExpense(expenses: Expense[]): Expense | null {
  if (!expenses || expenses.length === 0) return null;
  return expenses.reduce((max, expense) =>
    expense.amount > max.amount ? expense : max
  );
}

/**
 * Finds the lowest expense in an array
 * @param expenses - Array of expense objects
 * @returns Lowest expense object, or null if array is empty
 */
export function findLowestExpense(expenses: Expense[]): Expense | null {
  if (!expenses || expenses.length === 0) return null;
  return expenses.reduce((min, expense) =>
    expense.amount < min.amount ? expense : min
  );
}

/**
 * Groups expenses by category and calculates totals
 * @param expenses - Array of expense objects
 * @returns Map of category ID to total amount
 */
export function groupExpensesByCategory(
  expenses: Expense[]
): Map<string, { categoryId: string; categoryName: string; total: number; count: number }> {
  const grouped = new Map<
    string,
    { categoryId: string; categoryName: string; total: number; count: number }
  >();

  expenses.forEach((expense) => {
    if (!expense.category) return;

    const categoryId = expense.category.id;
    const existing = grouped.get(categoryId);

    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      grouped.set(categoryId, {
        categoryId,
        categoryName: expense.category.name,
        total: expense.amount,
        count: 1,
      });
    }
  });

  return grouped;
}

/**
 * Groups expenses by payment method and calculates totals
 * @param expenses - Array of expense objects
 * @returns Map of payment method ID to total amount
 */
export function groupExpensesByPaymentMethod(
  expenses: Expense[]
): Map<string, { methodId: string; methodName: string; total: number; count: number }> {
  const grouped = new Map<
    string,
    { methodId: string; methodName: string; total: number; count: number }
  >();

  expenses.forEach((expense) => {
    if (!expense.paymentMethod) return;

    const methodId = expense.paymentMethod.id;
    const existing = grouped.get(methodId);

    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      grouped.set(methodId, {
        methodId,
        methodName: expense.paymentMethod.name,
        total: expense.amount,
        count: 1,
      });
    }
  });

  return grouped;
}

/**
 * Calculates spending trend percentage compared to previous period
 * @param currentTotal - Total spending in current period
 * @param previousTotal - Total spending in previous period
 * @returns Percentage change (positive means increase, negative means decrease)
 */
export function calculateSpendingTrend(
  currentTotal: number,
  previousTotal: number
): number {
  if (previousTotal === 0) {
    return currentTotal > 0 ? 100 : 0;
  }
  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

/**
 * Calculates the budget remaining for a category
 * @param spent - Amount spent in category
 * @param budget - Budget limit for category
 * @returns Object with remaining amount and isOverBudget flag
 */
export function calculateBudgetRemaining(
  spent: number,
  budget: number
): { remaining: number; isOverBudget: boolean } {
  const remaining = budget - spent;
  return {
    remaining,
    isOverBudget: remaining < 0,
  };
}

/**
 * Splits an amount equally among a number of people
 * @param amount - Total amount to split
 * @param numberOfPeople - Number of people to split among
 * @returns Amount per person (rounded to 2 decimals)
 */
export function splitEqually(amount: number, numberOfPeople: number): number {
  if (numberOfPeople <= 0) return 0;
  return Math.round((amount / numberOfPeople) * 100) / 100;
}

/**
 * Calculates daily average spending for a period
 * @param total - Total amount spent
 * @param days - Number of days in period
 * @returns Daily average (rounded to 2 decimals)
 */
export function calculateDailyAverage(total: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round((total / days) * 100) / 100;
}

/**
 * Rounds a number to a specified number of decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Clamps a number between a minimum and maximum value
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates percentage of a total
 * @param part - Part value
 * @param total - Total value
 * @returns Percentage (0-100), or 0 if total is 0
 */
export function calculatePercentageOfTotal(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}
