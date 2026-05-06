import { createTransport, type Transporter } from 'nodemailer';
import { MailService, type SendMailOptions, type SendMailResult } from '../mailer.port';
import type { MailerConfig } from '../mailer.config';

export class SmtpMailService extends MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: MailerConfig) {
    super();
    if (!config.smtp) throw new Error('SMTP config required: host, port, user, pass');

    this.from = config.from;
    this.transporter = createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return { success: true, messageId: info.messageId as string };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[MailService] Failed to send email to ${options.to}: ${msg}`);
      return { success: false };
    }
  }
}
