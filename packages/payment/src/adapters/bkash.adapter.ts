import {
  PaymentGateway,
  type InitiatePaymentParams,
  type PaymentInitResult,
  type PaymentVerifyResult,
  type WebhookParseResult,
} from '../payment.port';
import type { PaymentConfig } from '../payment.config';

/**
 * bKash payment gateway adapter — placeholder.
 *
 * To implement:
 *   1. Get bKash merchant credentials (appKey, appSecret, username, password)
 *   2. Implement token grant flow (POST /tokenized/checkout/token/grant)
 *   3. Implement create payment (POST /tokenized/checkout/create)
 *   4. Implement execute payment (POST /tokenized/checkout/execute)
 *   5. Set PAYMENT_GATEWAY=bkash in .env
 */
export class BkashGateway extends PaymentGateway {
  readonly provider = 'bkash';

  constructor(config: PaymentConfig) {
    super();
    if (!config.bkash) {
      throw new Error('bKash config required: appKey, appSecret, username, password');
    }
  }

  async initiate(_params: InitiatePaymentParams): Promise<PaymentInitResult> {
    throw new Error('bKash payment not implemented yet. Set PAYMENT_GATEWAY=sslcommerz');
  }

  verifyWebhook(_payload: Record<string, unknown>): WebhookParseResult {
    throw new Error('bKash webhook not implemented yet');
  }

  async validatePayment(_sessionId: string): Promise<PaymentVerifyResult> {
    throw new Error('bKash validation not implemented yet');
  }
}
