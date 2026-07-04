import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    private readonly datasource: DataSource,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async handleXenditQRCode(
    payload: XenditQRCodeEvent<XenditQRCodePayment | XenditQRCodeRefund>,
  ): Promise<void> {
    switch (payload.event) {
      case 'qr.payment':
        if (XenditService.isXenditQRCodePayment(payload.data)) {
          if (payload.data.status === 'SUCCEEDED') {
            await this.paid(payload.data.reference_id, payload.data);
          }
          break;
        }
        break;

      case 'qr.refund':
        if (XenditService.isXenditQRCodeRefund(payload.data)) {
          await this.refund(payload.data.qrpy_id, payload.data);
          break;
        }
        break;
    }
  }

  private async paid(invoice: string, payload: any): Promise<void> {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payments, {
        where: { invoice },
        relations: { participants: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new Error('invalid payment');
      }

      /**
       * Xendit bisa mengirim webhook lebih dari sekali.
       * Kalau status sudah PAID, jangan dianggap error.
       */
      if (payment.status === PaymentStatus.PAID) {
        await queryRunner.rollbackTransaction();
        return;
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new Error('Invalid payment status');
      }

      payment.status = PaymentStatus.PAID;
      payment.callback = payload;

      await queryRunner.manager.save(payment);

      payment.participants.forEach((participant: Participants) => {
        participant.status = ParticipantStatus.ACTIVE;
      });

      await queryRunner.manager.save(payment.participants);

      await queryRunner.commitTransaction();

      /**
       * Emit socket hanya setelah database berhasil commit.
       * Yang menerima hanya frontend yang join ke invoice ini.
       */
      this.paymentGateway.emitPaymentPaid(invoice);
    } catch (error) {
      console.log(error);

      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new InternalServerErrorException('transaction error');
    } finally {
      await queryRunner.release();
    }
  }

  private async refund(invoice: string, payload: any): Promise<void> {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payments, {
        where: { invoice },
      });

      if (!payment) {
        throw new BadRequestException('invalid payment');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Invalid payment status');
      }

      payment.status = PaymentStatus.REFUND;
      payment.callback = payload;

      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
