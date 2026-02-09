import api from './api';
import type {
  ApiResponse,
  CreateExpenseRequest,
  Expense,
  ExpenseFilters,
  MonthlySummary,
  PaginatedResponse,
  SharedExpense,
  UpdateExpenseRequest,
} from '@/types';

export async function getExpenses(
  filters?: ExpenseFilters,
): Promise<PaginatedResponse<Expense>> {
  const { data } = await api.get<PaginatedResponse<Expense>>('/api/expenses', {
    params: filters,
  });
  return data;
}

export async function getExpense(id: string): Promise<Expense> {
  const { data } = await api.get<ApiResponse<Expense>>(`/api/expenses/${id}`);
  return data.data!;
}

export async function createExpense(
  expenseData: CreateExpenseRequest,
  receipt?: File,
): Promise<Expense> {
  const formData = new FormData();
  formData.append('amount', String(expenseData.amount));

  if (expenseData.description) {
    formData.append('description', expenseData.description);
  }
  if (expenseData.date) {
    formData.append('date', expenseData.date);
  }
  if (expenseData.categoryId) {
    formData.append('categoryId', expenseData.categoryId);
  }
  if (expenseData.paymentMethodId) {
    formData.append('paymentMethodId', expenseData.paymentMethodId);
  }
  if (expenseData.isShared !== undefined) {
    formData.append('isShared', String(expenseData.isShared));
  }
  if (expenseData.sharedWith) {
    formData.append('sharedWith', JSON.stringify(expenseData.sharedWith));
  }
  if (receipt) {
    formData.append('receipt', receipt);
  }

  const { data } = await api.post<ApiResponse<Expense>>(
    '/api/expenses',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data!;
}

export async function updateExpense(
  id: string,
  expenseData: UpdateExpenseRequest,
  receipt?: File,
): Promise<Expense> {
  const formData = new FormData();

  if (expenseData.amount !== undefined) {
    formData.append('amount', String(expenseData.amount));
  }
  if (expenseData.description !== undefined) {
    formData.append('description', expenseData.description);
  }
  if (expenseData.date) {
    formData.append('date', expenseData.date);
  }
  if (expenseData.categoryId !== undefined) {
    formData.append('categoryId', expenseData.categoryId ?? '');
  }
  if (expenseData.paymentMethodId !== undefined) {
    formData.append('paymentMethodId', expenseData.paymentMethodId ?? '');
  }
  if (expenseData.isShared !== undefined) {
    formData.append('isShared', String(expenseData.isShared));
  }
  if (receipt) {
    formData.append('receipt', receipt);
  }

  const { data } = await api.put<ApiResponse<Expense>>(
    `/api/expenses/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data!;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/api/expenses/${id}`);
}

export async function getSharedExpenses(): Promise<SharedExpense[]> {
  const { data } = await api.get<ApiResponse<SharedExpense[]>>(
    '/api/expenses/shared/with-me',
  );
  return data.data!;
}

export async function getMonthlySummary(
  year?: number,
  month?: number,
): Promise<MonthlySummary> {
  const { data } = await api.get<ApiResponse<MonthlySummary>>(
    '/api/expenses/summary/monthly',
    { params: { year, month } },
  );
  return data.data!;
}
