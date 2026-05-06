/**
 * Payment gateway port — defines what any payment provider must implement.
 *
 * To add a new provider:
 *   1. Create a new adapter extending PaymentGateway
 *   2. Add case in payment.factory.ts
 *   3. Set PAYMENT_GATEWAY=<provider> in .env
 */

export interface InitiatePaymentParams {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly amount: number;
  readonly currency: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerPhone: string;
  readonly customerAddress: string;
  readonly customerCity: string;
  readonly productName: string;
  readonly successUrl: string;
  readonly failUrl: string;
  readonly cancelUrl: string;
  readonly webhookUrl: string;
}

export interface PaymentInitResult {
  readonly gatewayUrl: string;
  readonly sessionId: string;
}

export interface PaymentVerifyResult {
  readonly verified: boolean;
  readonly transactionId: string | null;
  readonly status: 'PAID' | 'FAILED' | 'PENDING';
  readonly amount: number;
  readonly raw: Record<string, unknown>;
}

export interface WebhookParseResult {
  readonly orderId: string;
  readonly transactionId: string;
  readonly status: 'PAID' | 'FAILED';
  readonly amount: number;
  readonly sessionId: string | null;
  readonly raw: Record<string, unknown>;
}

export abstract class PaymentGateway {
  abstract readonly provider: string;

  abstract initiate(params: InitiatePaymentParams): Promise<PaymentInitResult>;

  abstract verifyWebhook(payload: Record<string, unknown>): WebhookParseResult;

  abstract validatePayment(sessionId: string): Promise<PaymentVerifyResult>;
}
