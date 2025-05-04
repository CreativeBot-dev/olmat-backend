import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_EVENT } from 'src/shared/enums/auth-event.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailForgotPasswordEvent } from '../events';

@Injectable()
export class EmailForgotPasswordListener {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(AUTH_EVENT.AUTH_RESET_PASSWORD)
  async handleEmailOtpEvent(event: EmailForgotPasswordEvent) {
    // const template = `Berikut adalah link lupa password anda: [link]`;
    const resetPasswordLink =
      process.env.FRONTEND_DOMAIN + `/forgot-pass/${event.hash}`;

    // const htmlContent = `
    //   <p>Klik tombol reset password untuk mereset password anda:</p>
    //   <a href="${resetPasswordLink}"
    //      style="display: inline-block; padding: 10px 20px; background-color: #365486; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; text-align: center;">
    //      Reset Password
    //   </a>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password OLMAT UINSA 2024</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .email-container {
                  background-color: #ffffff;
                  border: 1px solid #dddddd;
                  border-radius: 10px;
                  margin: 20px auto;
                  padding: 15px;
                  max-width: 300px;
              }
              .header {
                  text-align: center;
              }
              .header img {
                  max-width: 70px;
                  height: auto;
              }
              .header h1 {
                  margin-top: 4px;
                  font-size: 27px;
                  color: #333333;
              }
              .sub-header {
                  font-size: 13px;
                  color: #333333;
              }
              .content {
                  text-align: center;
                  margin: 5px 0;
              }
              .content h1 {
                  font-size: 23px;
                  color: #333333;
              }
              .content p {
                  font-size: 16px;
                  color: #666666;
              }
              .footer {
                  text-align: center;
                  margin-top: 10px;
                  font-size: 12px;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <img src="https://olmatuinsa.online/_next/image?url=%2Fassets%2Folmat-logo.png&w=128&q=75" alt="OLMAT 2024 Logo">
                  <h1>OLMAT UINSA 2024</h1>
                  <p class="sub-header">Explore Mathematics Skills with ASIC: Action, Spirit, Intelligence, and Competitive</p>
              </div>
              <div class="content">
                  <h1>Reset Password</h1>
                  <p>Hi ${event.email},</p>
                  <p>Klik tombol berikut untuk reset password</p>
                   <a href="${resetPasswordLink}?email=${event.email}"
                  style="display: inline-block; padding: 10px 20px; background-color: #365486; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; text-align: center;">
                  Reset Password
                  </a>
              </div>
              <div class="footer">
                  <p>Anda menerima email ini karena Anda telah menyatakan lupa password</p>
              </div>
          </div>
      </body>
      </html>
    `;

    // const htmlContent = `
    //   <p>Klik tombol reset password untuk mereset password anda:</p>
    //   <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
    //     <tbody>
    //       <tr>
    //         <td align="center">
    //           <a href="${resetPasswordLink}" target="_blank"
    //             style="display: inline-block; padding: 10px 20px; background-color: #365486; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
    //             Reset Password
    //           </a>
    //         </td>
    //       </tr>
    //     </tbody>
    //   </table>
    // `;
    this.mailerService
      .sendMail({
        to: event.email,
        from: 'olmatuinsa@olmat-uinsa.com',
        subject: 'Link Lupa Password Olmat UINSA',
        // text: template.replace(
        //   '[link]',
        //   process.env.FRONTEND_DOMAIN + `/forgot-pass/${event.hash}`,
        // ),
        html: htmlContent,
      })
      .then(() => {
        console.log('success sending forgot password link');
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
