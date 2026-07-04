import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XenditWebhookStrategy } from 'src/shared/guards/xendit-webhook.guard';
import { Payments } from 'src/entities/payments.entity';
import { PaymentGateway } from './payment.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Payments])],
  controllers: [WebhookController],
  providers: [WebhookService, XenditWebhookStrategy, PaymentGateway],
})
export class WebhookModule {}
