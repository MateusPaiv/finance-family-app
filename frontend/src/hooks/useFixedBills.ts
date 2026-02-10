import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as fixedBillsService from '@/services/fixedBills';
import type { CreateFixedBillRequest, UpdateFixedBillRequest } from '@/types';

export function useFixedBills() {
  return useQuery({
    queryKey: ['fixed-bills'],
    queryFn: () => fixedBillsService.getFixedBills(),
  });
}

export function useFixedBill(id: string) {
  return useQuery({
    queryKey: ['fixed-bills', id],
    queryFn: () => fixedBillsService.getFixedBill(id),
    enabled: !!id,
  });
}

export function useUpcomingBills() {
  return useQuery({
    queryKey: ['fixed-bills', 'upcoming'],
    queryFn: () => fixedBillsService.getUpcomingBills(),
  });
}

export function useFixedBillsSummary() {
  return useQuery({
    queryKey: ['fixed-bills', 'summary'],
    queryFn: () => fixedBillsService.getFixedBillsSummary(),
  });
}

export function useSharedFixedBills() {
  return useQuery({
    queryKey: ['fixed-bills', 'shared'],
    queryFn: () => fixedBillsService.getSharedFixedBills(),
  });
}

export function useCreateFixedBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFixedBillRequest) =>
      fixedBillsService.createFixedBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-bills'] });
    },
  });
}

export function useUpdateFixedBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedBillRequest }) =>
      fixedBillsService.updateFixedBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-bills'] });
    },
  });
}

export function useDeleteFixedBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedBillsService.deleteFixedBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-bills'] });
    },
  });
}

export function usePayFixedBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedBillsService.payFixedBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-bills'] });
    },
  });
}

export function useResetFixedBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedBillsService.resetFixedBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-bills'] });
    },
  });
}
