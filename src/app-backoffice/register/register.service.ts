import { Injectable } from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { PaymentService } from '../payment/payment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payments } from 'src/entities/payments.entity';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Payments)
    private paymentService: PaymentService,
  ) {}
  create(createRegisterDto: CreateRegisterDto) {
    return 'This action adds a new register';
  }

  findAll() {
    return `This action returns all register`;
  }

  update(id: number, updateRegisterDto: UpdateRegisterDto) {
    return `This action updates a #${id} register`;
  }

  remove(id: number) {
    return `This action removes a #${id} register`;
  }
}
