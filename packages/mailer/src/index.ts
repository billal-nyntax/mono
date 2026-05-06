export { MailService } from './mailer.port';
export type { SendMailOptions, SendMailResult } from './mailer.port';
export type { MailerConfig } from './mailer.config';
export { createMailService } from './mailer.factory';
export { SmtpMailService } from './adapters/smtp.adapter';
export { ConsoleMailService } from './adapters/console.adapter';
export { verificationEmail, passwordResetEmail } from './templates';
