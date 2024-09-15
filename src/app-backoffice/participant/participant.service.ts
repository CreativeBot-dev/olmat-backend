import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participants } from 'src/entities/participants.entity';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { Like, Repository } from 'typeorm';
import { UpdateParticipantDTO } from './dto/update-participant.dto';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { NullableType } from 'src/shared/types/nullable.type';
import { TParticipantType } from 'src/shared/types/filter.type';
import { participantsUpdateByPaymentDTO } from './dto/participant-updatepayment';
import { Payments } from 'src/entities/payments.entity';
import { Schools } from 'src/entities/schools.entity';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participants)
    private repository: Repository<Participants>,
  ) {}

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
    filter: TParticipantType,
  ): Promise<[Participants[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        relations: { school: { degree: true, city: { region: true } } },
        where: {
          name: filter.name ? Like(`%${filter.name}%`) : undefined,
          school: {
            province: filter.province ? { id: filter.province } : undefined,
            city:
              filter.city && !filter.region
                ? { id: filter.city }
                : filter.city && filter.region
                ? { id: filter.city, region: { id: filter.region } }
                : !filter.city && filter.region
                ? { region: { id: filter.region } }
                : undefined,
            subdistrict: filter.subdistrict
              ? { id: filter.subdistrict }
              : undefined,
            degree: filter.degree ? { id: filter.degree } : undefined,
            name: filter.school ? Like(`%${filter.school}%`) : undefined,
          },
          status: filter.status,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findOne(
    condition: EntityCondition<Participants>,
  ): Promise<NullableType<Participants>> {
    return await this.repository.findOne({ where: condition });
  }

  async update(
    payload: UpdateParticipantDTO,
    id: string,
    img?: string,
    attachment?: string,
  ): Promise<void> {
    const participant = await this.findOne({ id });
    if (!participant) throw new BadRequestException();

    if (img) {
      participant.img = img;
    }
    if (attachment) {
      participant.attachment = attachment;
    }

    Object.assign(participant, {
      name: payload.name,
      birth: payload.birth,
      phone: payload.phone,
      email: payload.email,
      gender: payload.gender,
    });

    await this.repository.save(participant);
  }

  async updateParticipantsByPayment(
    paymentId: number,
    payload: participantsUpdateByPaymentDTO,
  ): Promise<Participants[]> {
    const participants = await this.repository.find({
      where: { payment: { id: paymentId } },
      relations: { payment: true, school: true, user: true },
    });
    for (const participant of participants) {
      if (payload.newStatus) {
        participant.status = payload.newStatus;
      }

      if (payload.newPayment_id) {
        const newPayment = await this.repository.manager.findOne(Payments, {
          where: { id: payload.newPayment_id },
        });
        if (newPayment) {
          participant.payment = newPayment;
        }
      }

      if (payload.newSchool_id) {
        const newSchool = await this.repository.manager.findOne(Schools, {
          where: { id: payload.newSchool_id },
        });
        if (newSchool) {
          participant.school = newSchool;
        }
      }

      if (payload.newUser_id) {
        const newUser = await this.repository.manager.findOne(Users, {
          where: { id: `${payload.newUser_id}` },
        });
        if (newUser) {
          participant.user = newUser;
        }
      }
    }

    await this.repository.save(participants);
    return participants;
  }
}
