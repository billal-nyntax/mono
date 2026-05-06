import type { PaymentConfig } from './payment.config';
import { PaymentGateway } from './payment.port';
import { SSLCommerzGateway } from './adapters/sslcommerz.adapter';
import { BkashGateway } from './adapters/bkash.adapter';

/**
 * Factory to create the payment gateway based on config.
 *
 * To switch providers: change PAYMENT_GATEWAY in .env
 *   - 'sslcommerz' → SSLCommerz (Bangladesh)
 *   - 'bkash'      → bKash mobile payment (placeholder)
 */
export function createPaymentGateway(config: PaymentConfig): PaymentGateway {
  switch (config.provider) {
    case 'sslcommerz':
      return new SSLCommerzGateway(config);
    case 'bkash':
      return new BkashGateway(config);
    default:
      throw new Error(`Unknown payment provider: "${String(config.provider)}". Use: sslcommerz or bkash`);
  }
}
