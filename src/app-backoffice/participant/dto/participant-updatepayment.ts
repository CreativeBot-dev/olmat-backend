import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class participantsUpdateByPaymentDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'active' })
  newStatus?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  newPayment_id?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  newSchool_id?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  newUser_id?: number;
}
