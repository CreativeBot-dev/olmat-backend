import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ApiTags } from '@nestjs/swagger';
import { XenditWebhookGuard } from 'src/shared/guards/xendit-webhook.guard';
import {
  XenditQRCodeEvent,
  XenditQRCodePayment,
  XenditQRCodeRefund,
} from 'src/vendor/xendit/interfaces/qrcode.interface';

@ApiTags('Webhook')
@Controller({
  version: '1',
  path: '/webhook',
})
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/xendit/qrcode')
  @UseGuards(XenditWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleXenditQRCode(
    @Body()
    payload: XenditQRCodeEvent<XenditQRCodePayment | XenditQRCodeRefund>,
  ): Promise<string> {
    console.log('webhook xendit', payload);
    await this.webhookService.handleXenditQRCode(payload);
    return 'Ok';
  }
}
