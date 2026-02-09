import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as incomeService from '@/services/income';
import type { CreateIncomeRequest, UpdateIncomeRequest } from '@/types';

export function useIncomes(year?: number, month?: number) {
  return useQuery({
    queryKey: ['incomes', year, month],
    queryFn: () => incomeService.getIncomes(year, month),
  });
}

export function useIncome(id: string) {
  return useQuery({
    queryKey: ['incomes', id],
    queryFn: () => incomeService.getIncome(id),
    enabled: !!id,
  });
}

export function useIncomeSummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['income-summary', year, month],
    queryFn: () => incomeService.getIncomeSummary(year, month),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeRequest) => incomeService.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['income-summary'] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeRequest }) =>
      incomeService.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['income-summary'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incomeService.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['income-summary'] });
    },
  });
}
