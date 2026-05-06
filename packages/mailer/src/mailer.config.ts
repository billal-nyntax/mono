export interface MailerConfig {
  readonly provider: 'smtp' | 'console';
  readonly from: string;
  readonly smtp?: {
    readonly host: string;
    readonly port: number;
    readonly secure: boolean;
    readonly user: string;
    readonly pass: string;
  };
}
