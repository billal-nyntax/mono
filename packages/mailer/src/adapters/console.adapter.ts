import { MailService, type SendMailOptions, type SendMailResult } from '../mailer.port';

/**
 * Console mail adapter — logs emails to stdout (for development).
 */
export class ConsoleMailService extends MailService {
  async send(options: SendMailOptions): Promise<SendMailResult> {
    console.log('\n📧 ─── Email ───────────────────────────');
    console.log(`  To:      ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body:    ${options.text ?? options.html.slice(0, 200)}...`);
    console.log('────────────────────────────────────────\n');
    return { success: true, messageId: `console-${Date.now()}` };
  }
}
