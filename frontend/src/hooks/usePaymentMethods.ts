import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as paymentMethodsService from '@/services/paymentMethods';
import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from '@/types';

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodsService.getPaymentMethods(),
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentMethodRequest) =>
      paymentMethodsService.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentMethodRequest;
    }) => paymentMethodsService.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentMethodsService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
