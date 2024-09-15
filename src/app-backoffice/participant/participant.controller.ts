import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  Put,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { customPagination } from 'src/shared/utils/pagination';
import { PaginationResultType } from 'src/shared/types/pagination-result.type';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthAdminGuard } from 'src/shared/guards/auth.guard';
import { ParticipantService } from './participant.service';
import { Participants } from 'src/entities/participants.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateParticipantDTO } from './dto/update-participant.dto';
import { NullableType } from 'src/shared/types/nullable.type';
import { participantsUpdateByPaymentDTO } from './dto/participant-updatepayment';

@ApiTags('Participant')
@ApiBearerAuth()
@UseGuards(AuthAdminGuard)
@Controller({
  path: 'backoffice/participant',
  version: '1',
})
export class ParticipantController {
  constructor(private participantService: ParticipantService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  @ApiQuery({ name: 'region', required: false, example: 'SBY' })
  @ApiQuery({ name: 'province', required: false, example: 'province_id' })
  @ApiQuery({ name: 'city', required: false, example: 'city_id' })
  @ApiQuery({ name: 'subdistrict', required: false, example: 'subdistrict_id' })
  @ApiQuery({ name: 'degree', required: false, example: 'degree_id' })
  @ApiQuery({ name: 'school', required: false, example: 'school_id' })
  @ApiQuery({ name: 'name', required: false, example: 'Bejo' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('region') region?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('subdistrict') subdistrict?: string,
    @Query('degree') degree?: string,
    @Query('school') school?: string,
    @Query('name') name?: string,
    @Query('status') status?: string,
  ): Promise<PaginationResultType<Participants>> {
    const [data, count] = await this.participantService.findManyWithPagination(
      {
        page,
        limit,
      },
      {
        region,
        province,
        city,
        subdistrict,
        degree,
        school,
        name,
        status,
      },
    );

    return customPagination(data, count, { page, limit });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<NullableType<Participants>> {
    return await this.participantService.findOne({ id });
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'img', maxCount: 1 },
      { name: 'attachment', maxCount: 1 },
    ]),
  )
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateParticipantDTO,
    @Req() req: { imgFileName: string; attachmentFileName: string },
  ) {
    return await this.participantService.update(
      payload,
      id,
      req.imgFileName,
      req.attachmentFileName,
    );
  }

  @Put('/payments/:id')
  async updateParticipant(
    @Param('id') id: number,
    @Body() payload: participantsUpdateByPaymentDTO,
  ) {
    return this.participantService.updateParticipantsByPayment(id, payload);
  }
}
