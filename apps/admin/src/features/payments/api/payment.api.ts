import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { PaginatedResponse } from '@/shared/api/types';

export interface Payment {
  readonly id: string;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly gateway: string;
  readonly gatewayTxnId: string | null;
  readonly sessionId: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly status: 'PENDING' | 'PAID' | 'FAILED';
  readonly customerName: string;
  readonly customerEmail: string;
  readonly paymentMethod: string;
  readonly createdAt: string;
}

export interface PaymentStats {
  readonly totalPayments: number;
  readonly totalPaidAmount: number;
  readonly byStatus: {
    readonly PENDING: number;
    readonly PAID: number;
    readonly FAILED: number;
  };
  readonly byGateway: Record<string, number>;
}

export function usePayments(page: number, limit: number) {
  return useQuery({
    queryKey: ['payments', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await httpClient.get<PaginatedResponse<Payment>>(
        `/admin/payments?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch payments');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const res = await httpClient.get<PaymentStats>('/admin/payments/stats');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch payment stats');
      return res.data;
    },
    staleTime: 30_000,
  });
}
