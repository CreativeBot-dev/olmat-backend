import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participants } from 'src/entities/participants.entity';
import { Payments } from 'src/entities/payments.entity';
import { ParticipantStatus } from 'src/shared/enums/participants.enum';
import { PaymentStatus } from 'src/shared/enums/payment.enum';
import {
  XenditQRCodeEvent,
  XenditQRCodePayment,
  XenditQRCodeRefund,
} from 'src/vendor/xendit/interfaces/qrcode.interface';
import { XenditService } from 'src/vendor/xendit/xendit.service';
import { DataSource } from 'typeorm';
import { PaymentGateway } from './payment.gateway';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Payments)
    private datasource: DataSource,
    private paymentGateway: PaymentGateway,
  ) {}

  async handleXenditQRCode(
    payload: XenditQRCodeEvent<XenditQRCodePayment | XenditQRCodeRefund>,
  ): Promise<void> {
    switch (payload.event) {
      case 'qr.payment':
        if (XenditService.isXenditQRCodePayment(payload.data)) {
          if (payload.data.status === 'SUCCEEDED')
            await this.paid(payload.data.reference_id, payload.data);
          break;
        }
      case 'qr.refund':
        if (XenditService.isXenditQRCodeRefund(payload.data)) {
          await this.refund(payload.data.qrpy_id, payload.data);
          break;
        }
    }
  }

  private async paid(invoice: string, payload: any) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payments, {
        where: { invoice },
        relations: { participants: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) throw new Error('invalid payment');

      //only order with stathus pending will be update
      if (payment.status != PaymentStatus.PENDING) {
        throw new Error('Invalid payment status');
      }

      //update payment status
      payment.status = PaymentStatus.PAID;
      payment.callback = payload;
      await queryRunner.manager.save(payment);

      //update participants status
      await Promise.all(
        payment.participants.map(async (participant: Participants) => {
          participant.status = ParticipantStatus.ACTIVE;
        }),
      );

      await queryRunner.manager.save(payment.participants);
      await queryRunner.commitTransaction();
      this.paymentGateway.emitPaymentPaid(invoice);
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('transaction error');
    } finally {
      await queryRunner.release();
    }
  }

  private async refund(invoice: string, payload: any) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const payment = await queryRunner.manager.findOne(Payments, {
      where: { invoice },
    });

    if (!payment) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('invalid payment');
    }

    if (payment.status != PaymentStatus.PENDING) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Invalid payment status');
    }
    try {
      payment.status = PaymentStatus.REFUND;
      payment.callback = payload;
      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
