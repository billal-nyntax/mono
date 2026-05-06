/**
 * Mail service port — defines what any mail provider must implement.
 *
 * To swap providers:
 *   1. Create a new adapter extending MailService
 *   2. Add case in mailer.factory.ts
 *   3. Change MAIL_PROVIDER in .env
 */

export interface SendMailOptions {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
}

export interface SendMailResult {
  readonly success: boolean;
  readonly messageId?: string;
}

export abstract class MailService {
  abstract send(options: SendMailOptions): Promise<SendMailResult>;
}
