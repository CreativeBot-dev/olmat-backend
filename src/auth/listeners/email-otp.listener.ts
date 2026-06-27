import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_EVENT } from 'src/shared/enums/auth-event.enum';
import { EmailOTPEvent } from '../events/email-otp.event';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailOtpListener {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(AUTH_EVENT.AUTH_OTP)
  async handleEmailOtpEvent(event: EmailOTPEvent) {
    const template = `Berikut adalah kode otp akun olmat anda: [passcode]`;

    this.mailerService
      .sendMail({
        to: event.email,
        from: process.env.MAIL_USER,
        subject: 'Olmat UINSA - Kode OTP',
        text: template.replace('[passcode]', event.passcode),
      })
      .then(() => {
        console.log('success sending otp');
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
