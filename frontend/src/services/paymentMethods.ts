import api from './api';
import type {
  ApiResponse,
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from '@/types';

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } =
    await api.get<ApiResponse<PaymentMethod[]>>('/api/payment-methods');
  return data.data!;
}

export async function createPaymentMethod(
  methodData: CreatePaymentMethodRequest,
): Promise<PaymentMethod> {
  const { data } = await api.post<ApiResponse<PaymentMethod>>(
    '/api/payment-methods',
    methodData,
  );
  return data.data!;
}

export async function updatePaymentMethod(
  id: string,
  methodData: UpdatePaymentMethodRequest,
): Promise<PaymentMethod> {
  const { data } = await api.put<ApiResponse<PaymentMethod>>(
    `/api/payment-methods/${id}`,
    methodData,
  );
  return data.data!;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/api/payment-methods/${id}`);
}
