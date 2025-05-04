import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationResultType } from 'src/shared/types/pagination-result.type';
import { Payments } from 'src/entities/payments.entity';
import { customPagination } from 'src/shared/utils/pagination';
import { AuthUserGuard } from 'src/shared/guards/auth.guard';
import { SessionUser } from 'src/shared/decorators/user.decorator';
import { Users } from 'src/entities/users.entity';

@ApiBearerAuth()
@UseGuards(AuthUserGuard)
@ApiTags('Payment')
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @SessionUser() user: Users,
  ): Promise<PaginationResultType<Payments>> {
    const [data, count] = await this.paymentService.findManyWithPagination(
      {
        page,
        limit,
      },
      user,
    );

    return customPagination(data, count, { page, limit });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne({ id: +id });
  }

  @Get('/invoice/:inv')
  @HttpCode(HttpStatus.OK)
  async findOneByInv(@Param('inv') inv: string) {
    return this.paymentService.findOne({ invoice: inv });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.paymentService.delete({ id: +id });
  }
}
