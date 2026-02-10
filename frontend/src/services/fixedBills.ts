import api from './api';
import type {
  ApiResponse,
  CreateFixedBillRequest,
  FixedBill,
  FixedBillSummary,
  SharedFixedBill,
  UpdateFixedBillRequest,
} from '@/types';

export async function getFixedBills(): Promise<FixedBill[]> {
  const { data } =
    await api.get<ApiResponse<FixedBill[]>>('/api/fixed-bills');
  return data.data!;
}

export async function getFixedBill(id: string): Promise<FixedBill> {
  const { data } = await api.get<ApiResponse<FixedBill>>(
    `/api/fixed-bills/${id}`,
  );
  return data.data!;
}

export async function createFixedBill(
  billData: CreateFixedBillRequest,
): Promise<FixedBill> {
  const { data } = await api.post<ApiResponse<FixedBill>>(
    '/api/fixed-bills',
    billData,
  );
  return data.data!;
}

export async function updateFixedBill(
  id: string,
  billData: UpdateFixedBillRequest,
): Promise<FixedBill> {
  const { data } = await api.put<ApiResponse<FixedBill>>(
    `/api/fixed-bills/${id}`,
    billData,
  );
  return data.data!;
}

export async function deleteFixedBill(id: string): Promise<void> {
  await api.delete(`/api/fixed-bills/${id}`);
}

export async function payFixedBill(id: string): Promise<FixedBill> {
  const { data } = await api.post<ApiResponse<FixedBill>>(
    `/api/fixed-bills/${id}/pay`,
  );
  return data.data!;
}

export async function resetFixedBill(id: string): Promise<FixedBill> {
  const { data } = await api.post<ApiResponse<FixedBill>>(
    `/api/fixed-bills/${id}/reset`,
  );
  return data.data!;
}

export async function getSharedFixedBills(): Promise<SharedFixedBill[]> {
  const { data } = await api.get<ApiResponse<SharedFixedBill[]>>(
    '/api/fixed-bills/shared/with-me',
  );
  return data.data!;
}

export async function getUpcomingBills(): Promise<FixedBill[]> {
  const { data } = await api.get<ApiResponse<FixedBill[]>>(
    '/api/fixed-bills/upcoming/next-week',
  );
  return data.data!;
}

export async function getFixedBillsSummary(): Promise<FixedBillSummary> {
  const { data } = await api.get<ApiResponse<FixedBillSummary>>(
    '/api/fixed-bills/summary/monthly',
  );
  return data.data!;
}
