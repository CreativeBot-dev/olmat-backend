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

  async updateParticipant(id: number, payload: participantsUpdateByPaymentDTO) {
    const participant = await this.repository.findOneBy({
      payment: { id: id },
    });
    console.log(participant);
    console.log(payload);

    if (!participant) {
      throw new Error('Participant not found');
    }

    if (payload.payment_id !== undefined) {
      participant.payment.id = payload.payment_id;
    }

    await this.repository.save(participant);

    return participant;
  }
}
