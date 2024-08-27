import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participants } from 'src/entities/participants.entity';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { NullableType } from 'src/shared/types/nullable.type';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { DataSource, Repository } from 'typeorm';
import { CreateParticipantDTO } from './dto/create-participant.dto';
import { SchoolService } from '../school/school.service';
import { Payments } from 'src/entities/payments.entity';
import { Users } from 'src/entities/users.entity';
import { rtrim0 } from 'src/shared/utils/rtrim.helper';
import { Degree } from 'src/entities/degree.entity';
import { unlink } from 'fs';
import { ErrorException } from 'src/shared/exceptions/error.exception';
import { ulid } from 'ulid';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { XenditService } from 'src/vendor/xendit/xendit.service';
import { PaymentGroup, PaymentProvider } from 'src/shared/enums/payment.enum';
import { EventSettingService } from 'src/core/event-setting/event-setting.service';
import { RegeneratePaymentDTO } from './dto/regenerate-payment.dto';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participants)
    private repository: Repository<Participants>,
    private datasource: DataSource,
    private schoolService: SchoolService,
    private paymentService: PaymentService,
    private eventSettingService: EventSettingService,
    private paymentGatewaryService: PaymentGatewayService,
    private readonly xenditService: XenditService,
  ) {}

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
    user: Users,
    payment_id?: number,
  ): Promise<[Participants[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        relations: { payment: true },
        where: {
          payment: { user: { id: user.id }, id: payment_id },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async adminFindManyWithPagination(
    paginationOptions: IPaginationOptions,
    user: Users,
  ): Promise<[Participants[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: { payment: { user: { id: user.id } } },
        relations: { school: { degree: true, city: { region: true } } },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(
    condition: EntityCondition<Participants>,
  ): Promise<NullableType<Participants>> {
    return await this.repository.findOne({
      where: condition,
      relations: { school: { degree: true, city: { region: true } } },
    });
  }

  private async getPrice(length: number, degree: Degree) {
    const cashbackSetting = await this.eventSettingService.find();
    const cashback =
      Math.floor(length / +cashbackSetting.amount) * cashbackSetting.free;
    let price = degree.register_price * length;
    if (length % cashbackSetting.amount >= cashback) {
      price = price - degree.register_price * cashback;
    } else if (length % cashbackSetting.amount < cashback) {
      price = price - degree.register_price * (length % cashbackSetting.amount);
    }
    return price;
  }

  // async create(
  //   payload: CreateParticipantDTO,
  //   user: Users,
  //   imgs: string[],
  //   attachments: string[],
  // ) {
  //   const school = await this.schoolService.findOne({
  //     id: payload.school_id ? payload.school_id : user.school.id,
  //   });
  //   if (!school) throw new BadRequestException();

  //   const payment = await this.paymentGatewaryService.findOne({
  //     code: payload.payment_code,
  //   });

  //   const amount = await this.getPrice(
  //     typeof payload.participants === 'string'
  //       ? 1
  //       : payload.participants.length,
  //     school.degree,
  //   );

  //   if (!payment) {
  //     throw new BadRequestException('invalid paymnet');
  //   } else if (amount > payment.max_amount) {
  //     throw new BadRequestException(
  //       `The selected payment method is a maximum ${payment.max_amount}`,
  //     );
  //   } else if (amount < payment.min_amount) {
  //     throw new BadRequestException(
  //       `The selected payment method is a minimum ${payment.min_amount}`,
  //     );
  //   }

  //   const payment_fee = Number(
  //     (await this.paymentGatewaryService.getFee(amount, payment)).toFixed(),
  //   );

  //   const total_amount = amount + payment_fee;

  //   const invoice = ulid();

  //   const currentDate = new Date();
  //   const expiredDate = new Date(currentDate);
  //   expiredDate.setDate(new Date().getDate() + 1);
  //   const formattedExpiredDate = expiredDate.toISOString();

  //   let payment_action: object = {};

  //   if (payment.provider === PaymentProvider.XENDIT) {
  //     if (payment.group === PaymentGroup.QRIS) {
  //       const res = await this.xenditService.createQRCode({
  //         reference_id: invoice,
  //         amount: total_amount,
  //         type: 'DYNAMIC',
  //         currency: 'IDR',
  //         expires_at: formattedExpiredDate,
  //       });
  //       payment_action = {
  //         id: res?.id,
  //         type: res?.type,
  //         channel_code: res?.channel_code,
  //         qr_string: res?.qr_string,
  //       };
  //     }
  //   }
  //   const queryRunner = this.datasource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const participantCount = await queryRunner.manager.count(Payments, {
  //       lock: { mode: 'pessimistic_write' },
  //     });
  //     const payment = await queryRunner.manager.save(
  //       queryRunner.manager.create(Payments, {
  //         invoice,
  //         code: payload.payment_code,
  //         participant_amounts:
  //           typeof payload.participants === 'string'
  //             ? 1
  //             : payload.participants.length,
  //         action: payment_action,
  //         fee: payment_fee,
  //         total_amount,
  //         amount,
  //         user,
  //       }),
  //     );

  //     const participants = [];

  //     if (typeof payload.participants === 'string') {
  //       const objParticipant: Participants = JSON.parse(payload.participants);
  //       const res = await queryRunner.manager.save(
  //         queryRunner.manager.create(Participants, {
  //           id:
  //             String(school.city.region.region_code) +
  //             String(school.degree.id) +
  //             rtrim0('0000', String(+participantCount + 1)),
  //           name: objParticipant.name,
  //           gender: objParticipant.gender,
  //           phone: objParticipant.phone,
  //           email: objParticipant.email,
  //           birth: objParticipant.birth,
  //           img: imgs[0],
  //           user: { id: user.id },
  //           attachment: attachments[0],
  //           school,
  //           payment,
  //         }),
  //       );
  //       const propertiesToDelete = [
  //         'payment',
  //         'school',
  //         'status',
  //         'id',
  //         'phone',
  //       ];

  //       propertiesToDelete.forEach((property) => {
  //         if (res.hasOwnProperty(property)) {
  //           delete res[property];
  //         }
  //       });
  //       participants.push(res);
  //     } else {
  //       participants.push(
  //         ...(await Promise.all(
  //           payload.participants.map(async (participant, i) => {
  //             const objParticipant: Participants = JSON.parse(participant);
  //             const res = await queryRunner.manager.save(
  //               queryRunner.manager.create(Participants, {
  //                 id:
  //                   String(school.city.region.region_code) +
  //                   String(school.degree.id) +
  //                   rtrim0('0000', String(+participantCount + i)),
  //                 name: objParticipant.name,
  //                 gender: objParticipant.gender,
  //                 phone: objParticipant.phone,
  //                 email: objParticipant.email,
  //                 birth: objParticipant.birth,
  //                 user: { id: user.id },
  //                 img: imgs[i],
  //                 attachment: attachments[i],
  //                 school,
  //                 payment,
  //               }),
  //             );
  //             const propertiesToDelete = [
  //               'payment',
  //               'school',
  //               'status',
  //               'id',
  //               'phone',
  //             ];

  //             propertiesToDelete.forEach((property) => {
  //               if (res.hasOwnProperty(property)) {
  //                 delete res[property];
  //               }
  //             });
  //             return res;
  //           }),
  //         )),
  //       );
  //     }

  //     await queryRunner.commitTransaction();
  //     delete payment.user;
  //     return {
  //       payment,
  //       participants,
  //     };
  //   } catch (error: any) {
  //     await queryRunner.rollbackTransaction();
  //     imgs.map(async (img) => {
  //       await unlink('./storage/imgs/' + img, (err) => {
  //         if (err) throw err;
  //       });
  //     });
  //     attachments.map(async (attachment) => {
  //       await unlink('./storage/attachments/' + attachment, (err) => {
  //         if (err) throw err;
  //       });
  //     });
  //     let extractedString: string | undefined;
  //     if (error.code === 'ER_DUP_ENTRY') {
  //       const regex = /'([^']+)'/;
  //       const match = error.sqlMessage.match(regex);
  //       if (match && match.length > 1) {
  //         extractedString = match[1];
  //       }
  //       throw new ErrorException(
  //         {
  //           message: `${extractedString} is already to use!`,
  //         },
  //         509,
  //       );
  //     }
  //     throw new InternalServerErrorException();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async create(
    payload: CreateParticipantDTO,
    user: Users,
    imgs: string[],
    attachments: string[],
  ) {
    const school = await this.schoolService.findOne({
      id: payload.school_id ? payload.school_id : user.school.id,
    });
    if (!school) throw new BadRequestException();

    const payment = await this.paymentGatewaryService.findOne({
      code: payload.payment_code,
    });

    const amount = await this.getPrice(
      typeof payload.participants === 'string'
        ? 1
        : payload.participants.length,
      school.degree,
    );

    if (!payment) {
      throw new BadRequestException('Invalid payment method.');
    } else if (amount > payment.max_amount) {
      throw new BadRequestException(
        `The selected payment method has a maximum limit of ${payment.max_amount}.`,
      );
    } else if (amount < payment.min_amount) {
      throw new BadRequestException(
        `The selected payment method has a minimum limit of ${payment.min_amount}.`,
      );
    }

    const payment_fee = Number(
      (await this.paymentGatewaryService.getFee(amount, payment)).toFixed(),
    );

    const total_amount = amount + payment_fee;

    const invoice = ulid();

    const currentDate = new Date();
    const expiredDate = new Date(currentDate);
    expiredDate.setDate(new Date().getDate() + 1);
    const formattedExpiredDate = expiredDate.toISOString();

    let payment_action: object = {};

    if (payment.provider === PaymentProvider.XENDIT) {
      if (payment.group === PaymentGroup.QRIS) {
        const res = await this.xenditService.createQRCode({
          reference_id: invoice,
          amount: total_amount,
          type: 'DYNAMIC',
          currency: 'IDR',
          expires_at: formattedExpiredDate,
        });
        payment_action = {
          id: res?.id,
          type: res?.type,
          channel_code: res?.channel_code,
          qr_string: res?.qr_string,
        };
      }
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const participantCount = await queryRunner.manager.count(Payments, {
        lock: { mode: 'pessimistic_write' },
      });

      const payment = await queryRunner.manager.save(
        queryRunner.manager.create(Payments, {
          invoice,
          code: payload.payment_code,
          participant_amounts:
            typeof payload.participants === 'string'
              ? 1
              : payload.participants.length,
          action: payment_action,
          fee: payment_fee,
          total_amount,
          amount,
          user,
        }),
      );

      const participants = [];

      if (typeof payload.participants === 'string') {
        const objParticipant: Participants = JSON.parse(payload.participants);
        const res = await queryRunner.manager.save(
          queryRunner.manager.create(Participants, {
            id:
              String(school.city.region.region_code) +
              String(school.degree.id) +
              rtrim0('0000', String(+participantCount + 1)),
            name: objParticipant.name,
            gender: objParticipant.gender,
            phone: objParticipant.phone,
            email: objParticipant.email,
            birth: objParticipant.birth,
            img: imgs[0],
            user: { id: user.id },
            attachment: attachments[0],
            school,
            payment,
          }),
        );
        const propertiesToDelete = [
          'payment',
          'school',
          'status',
          'id',
          'phone',
        ];

        propertiesToDelete.forEach((property) => {
          if (res.hasOwnProperty(property)) {
            delete res[property];
          }
        });
        participants.push(res);
      } else {
        for (let i = 0; i < payload.participants.length; i++) {
          const objParticipant: Participants = JSON.parse(
            payload.participants[i],
          );
          const res = await queryRunner.manager.save(
            queryRunner.manager.create(Participants, {
              id:
                String(school.city.region.region_code) +
                String(school.degree.id) +
                rtrim0('0000', String(+participantCount + i + 1)),
              name: objParticipant.name,
              gender: objParticipant.gender,
              phone: objParticipant.phone,
              email: objParticipant.email,
              birth: objParticipant.birth,
              user: { id: user.id },
              img: imgs[i],
              attachment: attachments[i],
              school,
              payment,
            }),
          );
          const propertiesToDelete = [
            'payment',
            'school',
            'status',
            'id',
            'phone',
          ];

          propertiesToDelete.forEach((property) => {
            if (res.hasOwnProperty(property)) {
              delete res[property];
            }
          });
          participants.push(res);
        }
      }

      await queryRunner.commitTransaction();
      delete payment.user;
      return {
        payment,
        participants,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      imgs.map(async (img) => {
        await unlink('./storage/imgs/' + img, (err) => {
          if (err) throw err;
        });
      });
      attachments.map(async (attachment) => {
        await unlink('./storage/attachments/' + attachment, (err) => {
          if (err) throw err;
        });
      });
      let extractedString: string | undefined;
      if (error.code === 'ER_DUP_ENTRY') {
        const regex = /'([^']+)'/;
        const match = error.sqlMessage.match(regex);
        if (match && match.length > 1) {
          extractedString = match[1];
        }
        throw new ErrorException(
          {
            message: `${extractedString} is already in use!`,
          },
          509,
        );
      }
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async regeneratePayment(
    payload: RegeneratePaymentDTO,
    user: Users,
  ): Promise<{ payment: Payments; participants: Participants[] }> {
    const paginationOptions = { page: 1, limit: 100 }; // Sesuaikan limit sesuai kebutuhan Anda
    const [participants, total] = await this.findManyWithPagination(
      paginationOptions,
      user,
      payload.oldPaymentId,
    );

    if (total === 0) {
      throw new BadRequestException('Participants not found');
    }

    const school = await this.schoolService.findOne({
      id: user.school.id,
    });

    if (!school) {
      throw new BadRequestException('School not found');
    }

    const payment = await this.paymentGatewaryService.findOne({
      code: payload.paymentCode,
    });

    const amount = await this.getPrice(participants.length, school.degree);

    if (!payment) {
      throw new BadRequestException('Invalid payment');
    } else if (amount > payment.max_amount) {
      throw new BadRequestException(
        `The selected payment method is a maximum ${payment.max_amount}`,
      );
    } else if (amount < payment.min_amount) {
      throw new BadRequestException(
        `The selected payment method is a minimum ${payment.min_amount}`,
      );
    }

    const payment_fee = Number(
      (await this.paymentGatewaryService.getFee(amount, payment)).toFixed(),
    );

    const total_amount = amount + payment_fee;

    const invoice = ulid();

    const currentDate = new Date();
    const expiredDate = new Date(currentDate);
    expiredDate.setDate(new Date().getDate() + 1);
    const formattedExpiredDate = expiredDate.toISOString();

    let payment_action: object = {};

    if (payment.provider === PaymentProvider.XENDIT) {
      if (payment.group === PaymentGroup.QRIS) {
        const res = await this.xenditService.createQRCode({
          reference_id: invoice,
          amount: total_amount,
          type: 'DYNAMIC',
          currency: 'IDR',
          expires_at: formattedExpiredDate,
        });
        payment_action = {
          id: res?.id,
          type: res?.type,
          channel_code: res?.channel_code,
          qr_string: res?.qr_string,
        };
      }
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let oldPayment;

    try {
      oldPayment = await queryRunner.manager.findOne(Payments, {
        where: { id: payload.oldPaymentId },
      });

      const newPayment = await queryRunner.manager.save(
        queryRunner.manager.create(Payments, {
          invoice,
          code: payload.paymentCode,
          participant_amounts: participants.length,
          action: payment_action,
          fee: payment_fee,
          total_amount,
          amount,
          user,
        }),
      );

      for (const participant of participants) {
        participant.payment = newPayment;
        await queryRunner.manager.save(participant);
      }

      await queryRunner.commitTransaction();
      if (oldPayment) {
        await this.paymentService.delete({ id: oldPayment.id });
      }

      return { payment: newPayment, participants };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
