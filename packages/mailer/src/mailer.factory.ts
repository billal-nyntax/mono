import type { MailerConfig } from './mailer.config';
import { MailService } from './mailer.port';
import { SmtpMailService } from './adapters/smtp.adapter';
import { ConsoleMailService } from './adapters/console.adapter';

export function createMailService(config: MailerConfig): MailService {
  switch (config.provider) {
    case 'smtp':
      return new SmtpMailService(config);
    case 'console':
      return new ConsoleMailService();
    default:
      throw new Error(`Unknown mail provider: "${String(config.provider)}". Use: smtp or console`);
  }
}
