import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as expensesService from '@/services/expenses';
import type {
  CreateExpenseRequest,
  ExpenseFilters,
  UpdateExpenseRequest,
} from '@/types';

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesService.getExpenses(filters),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expensesService.getExpense(id),
    enabled: !!id,
  });
}

export function useSharedExpenses() {
  return useQuery({
    queryKey: ['expenses', 'shared'],
    queryFn: () => expensesService.getSharedExpenses(),
  });
}

export function useMonthlySummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['expenses', 'summary', year, month],
    queryFn: () => expensesService.getMonthlySummary(year, month),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      receipt,
    }: {
      data: CreateExpenseRequest;
      receipt?: File;
    }) => expensesService.createExpense(data, receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      receipt,
    }: {
      id: string;
      data: UpdateExpenseRequest;
      receipt?: File;
    }) => expensesService.updateExpense(id, data, receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
