import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { AllConfigType } from 'src/shared/types/config.type';

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.configService.get('mail.host', { infer: true }),
        port: this.configService.get('mail.port', { infer: true }),
        ignoreTLS: this.configService.get('mail.ignoreTLS', { infer: true }),
        secure: this.configService.get('mail.secure', { infer: true }),
        requireTLS: this.configService.get('mail.requireTLS', { infer: true }),
        auth: {
          user: this.configService.get('mail.user', { infer: true }),
          pass: this.configService.get('mail.password', { infer: true }),
        },
      },
      defaults: {
        from: `"${this.configService.get('mail.defaultName', {
          infer: true,
        })}" <${this.configService.get('mail.defaultEmail', { infer: true })}>`,
      },
    } as MailerOptions;
  }
}
