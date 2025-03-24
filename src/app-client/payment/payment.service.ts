import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { Payments } from 'src/entities/payments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
        audit_trail: { created_at: true },
      },
      where: { user: { id: user.id } },
    });
  }

  async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
    const day = String(now.getDate()).padStart(2, '0'); // DD
    const year = String(now.getFullYear()).slice(2); // YY
    const prefix = `OLM-${month}${day}${year}`;

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const count = await this.paymentRepository.count({
      where: {
        audit_trail: {
          created_at: Between(yearStart, yearEnd),
        },
      },
    });

    const sequence = String(count + 1).padStart(6, '0');

    return `${prefix}${sequence}`;
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
