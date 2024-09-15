import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from 'src/entities/payments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payments]), PaymentModule],
  controllers: [RegisterController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
