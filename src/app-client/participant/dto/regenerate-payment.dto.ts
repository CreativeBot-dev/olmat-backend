import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegeneratePaymentDTO {
  @ApiProperty()
  @IsNotEmpty()
  oldInvoice: string;

  @ApiProperty()
  @IsNotEmpty()
  paymentCode: string;
}
