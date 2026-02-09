import api from './api';
import type {
  ApiResponse,
  CreateIncomeRequest,
  Income,
  IncomeSummary,
  UpdateIncomeRequest,
} from '@/types';

export async function getIncomes(
  year?: number,
  month?: number,
): Promise<Income[]> {
  const { data } = await api.get<ApiResponse<Income[]>>('/api/incomes', {
    params: { year, month },
  });
  return data.data!;
}

export async function getIncome(id: string): Promise<Income> {
  const { data } = await api.get<ApiResponse<Income>>(`/api/incomes/${id}`);
  return data.data!;
}

export async function createIncome(
  incomeData: CreateIncomeRequest,
): Promise<Income> {
  const { data } = await api.post<ApiResponse<Income>>(
    '/api/incomes',
    incomeData,
  );
  return data.data!;
}

export async function updateIncome(
  id: string,
  incomeData: UpdateIncomeRequest,
): Promise<Income> {
  const { data } = await api.put<ApiResponse<Income>>(
    `/api/incomes/${id}`,
    incomeData,
  );
  return data.data!;
}

export async function deleteIncome(id: string): Promise<void> {
  await api.delete(`/api/incomes/${id}`);
}

export async function getIncomeSummary(
  year?: number,
  month?: number,
): Promise<IncomeSummary> {
  const { data } = await api.get<ApiResponse<IncomeSummary>>(
    '/api/incomes/summary/monthly',
    { params: { year, month } },
  );
  return data.data!;
}
