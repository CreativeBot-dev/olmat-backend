import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { Payments } from 'src/entities/payments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { NullableType } from 'src/shared/types/nullable.type';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payments) private paymentRepository: Repository<Payments>,
  ) {}

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
    user: Users,
  ): Promise<[Payments[], number]> {
    try {
      return await this.paymentRepository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: { user: { id: user.id } },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(
    condition: EntityCondition<Payments>,
  ): Promise<NullableType<Payments>> {
    return await this.paymentRepository.findOne({
      where: condition,
      relations: { participants: true },
    });
  }

  async getUserPayment(user: Users): Promise<Payments[]> {
    return await this.paymentRepository.find({
      select: {
        id: true,
        invoice: true,
        code: true,
        participant_amounts: true,
        fee: true,
        amount: true,
        total_amount: true,
        status: true,
      },
      where: { user: { id: user.id } },
    });
  }

  async delete(condition: EntityCondition<Payments>): Promise<void> {
    const payment = await this.findOne(condition);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    try {
      await this.paymentRepository.remove(payment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete payment');
    }
  }
}
