import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from 'src/entities/payments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payments])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
