import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_EVENT } from 'src/shared/enums/auth-event.enum';
import { EmailForgotPasswordEvent } from '../events';

@Injectable()
export class EmailForgotPassListener {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(AUTH_EVENT.AUTH_RESET_PASSWORD)
  async handleForgotPassEvent(event: EmailForgotPasswordEvent) {
    const resetPasswordLink = `${process.env.FRONTEND_DOMAIN}/forgot-pass/${event.hash}?email=${event.email}`;

    // Plain text version as fallback
    const plainText = `
      Reset Password OLMAT UINSA 2024
      
      Hi ${event.email},
      
      Klik link berikut untuk reset password:
      ${resetPasswordLink}
      
      Anda menerima email ini karena Anda telah menyatakan lupa password.
    `;

    try {
      await this.mailerService.sendMail({
        to: event.email,
        from: '"OLMAT UINSA" <olmatuinsa@olmat-uinsa.com>',
        subject: 'Reset Password OLMAT UINSA',
        context: {
          // data to be sent to the template
          email: event.email,
          resetLink: resetPasswordLink,
        },
        text: plainText, // Adding a plain text version improves deliverability
      });
    } catch (error) {
      console.log('Error sending reset password email:', error);
    }
  }
}
