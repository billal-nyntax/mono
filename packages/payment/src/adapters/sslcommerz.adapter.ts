import {
  PaymentGateway,
  type InitiatePaymentParams,
  type PaymentInitResult,
  type PaymentVerifyResult,
  type WebhookParseResult,
} from '../payment.port';
import type { PaymentConfig } from '../payment.config';

const SANDBOX_URL = 'https://sandbox.sslcommerz.com';
const LIVE_URL = 'https://securepay.sslcommerz.com';

export class SSLCommerzGateway extends PaymentGateway {
  readonly provider = 'sslcommerz';
  private readonly storeId: string;
  private readonly storePass: string;
  private readonly baseUrl: string;

  constructor(config: PaymentConfig) {
    super();
    if (!config.sslcommerz) {
      throw new Error('SSLCommerz config required: storeId, storePass');
    }
    this.storeId = config.sslcommerz.storeId;
    this.storePass = config.sslcommerz.storePass;
    this.baseUrl = config.sslcommerz.sandbox ? SANDBOX_URL : LIVE_URL;
  }

  async initiate(params: InitiatePaymentParams): Promise<PaymentInitResult> {
    const body = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePass,
      total_amount: String(params.amount),
      currency: params.currency,
      tran_id: params.orderNumber,
      success_url: params.successUrl,
      fail_url: params.failUrl,
      cancel_url: params.cancelUrl,
      ipn_url: params.webhookUrl,
      cus_name: params.customerName,
      cus_email: params.customerEmail,
      cus_phone: params.customerPhone,
      cus_add1: params.customerAddress,
      cus_city: params.customerCity,
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: params.productName,
      product_category: 'Electronics',
      product_profile: 'general',
      value_a: params.orderId,
    });

    const res = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      redirect: 'follow',
    });

    const text = await res.text();
    let data: {
      status: string;
      GatewayPageURL?: string;
      sessionkey?: string;
      failedreason?: string;
    };

    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      throw new Error(`SSLCommerz returned non-JSON response (HTTP ${String(res.status)}). Check store credentials.`);
    }

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      throw new Error(`SSLCommerz init failed: ${data.failedreason ?? data.status ?? 'Unknown error'}`);
    }

    return {
      gatewayUrl: data.GatewayPageURL,
      sessionId: data.sessionkey ?? params.orderNumber,
    };
  }

  verifyWebhook(payload: Record<string, unknown>): WebhookParseResult {
    const status = String(payload['status'] ?? '');
    const tranId = String(payload['tran_id'] ?? '');
    const amount = Number(payload['amount'] ?? 0);
    const orderId = String(payload['value_a'] ?? '');
    const sessionKey = payload['sessionkey'] ? String(payload['sessionkey']) : null;

    const valid = this.verifySignature(payload);
    if (!valid) {
      throw new Error('SSLCommerz webhook signature verification failed');
    }

    return {
      orderId,
      transactionId: tranId,
      status: status === 'VALID' || status === 'VALIDATED' ? 'PAID' : 'FAILED',
      amount,
      sessionId: sessionKey,
      raw: payload,
    };
  }

  async validatePayment(sessionId: string): Promise<PaymentVerifyResult> {
    const url = `${this.baseUrl}/validator/api/validationserverAPI.php`;
    const params = new URLSearchParams({
      val_id: sessionId,
      store_id: this.storeId,
      store_passwd: this.storePass,
      format: 'json',
    });

    const res = await fetch(`${url}?${params.toString()}`);
    const data = await res.json() as {
      status: string;
      tran_id?: string;
      amount?: string;
    };

    const status = data.status === 'VALID' || data.status === 'VALIDATED' ? 'PAID' : 'FAILED';

    return {
      verified: status === 'PAID',
      transactionId: data.tran_id ?? null,
      status,
      amount: Number(data.amount ?? 0),
      raw: data as Record<string, unknown>,
    };
  }

  private verifySignature(payload: Record<string, unknown>): boolean {
    const storePasswd = String(payload['store_passwd'] ?? '');
    if (storePasswd && storePasswd !== this.storePass) {
      return false;
    }
    const status = String(payload['status'] ?? '');
    return status === 'VALID' || status === 'VALIDATED' || status === 'FAILED' || status === 'CANCELLED';
  }
}
