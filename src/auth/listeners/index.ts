import { Provider } from '@nestjs/common';
import { EmailOtpListener } from './email-otp.listener';
import { EmailForgotPassListener } from './email-forgot-pass.listener';

export const AuthListener: Provider[] = [
  EmailOtpListener,
  // EmailForgotPasswordListener,
  EmailForgotPassListener,
];
