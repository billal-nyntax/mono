export interface PaymentConfig {
  readonly provider: 'sslcommerz' | 'bkash';
  readonly sslcommerz?: {
    readonly storeId: string;
    readonly storePass: string;
    readonly sandbox: boolean;
  };
  readonly bkash?: {
    readonly appKey: string;
    readonly appSecret: string;
    readonly username: string;
    readonly password: string;
    readonly sandbox: boolean;
  };
}
