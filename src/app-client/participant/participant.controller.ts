import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationResultType } from 'src/shared/types/pagination-result.type';
import { Participants } from 'src/entities/participants.entity';
import { customPagination } from 'src/shared/utils/pagination';
import { NullableType } from 'src/shared/types/nullable.type';
import { CreateParticipantDTO } from './dto/create-participant.dto';
import { SessionUser } from 'src/shared/decorators/user.decorator';
import { Users } from 'src/entities/users.entity';
import { AuthUserGuard } from 'src/shared/guards/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RegeneratePaymentDTO } from './dto/regenerate-payment.dto';

@ApiBearerAuth()
@UseGuards(AuthUserGuard)
@ApiTags('Participant')
@Controller({
  path: 'participant',
  version: '1',
})
export class ParticipantController {
  constructor(private participantService: ParticipantService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @SessionUser() user: Users,
  ): Promise<PaginationResultType<Participants>> {
    const [data, count] = await this.participantService.findManyWithPagination(
      {
        page,
        limit,
      },
      user,
    );

    return customPagination(data, count, { page, limit });
  }

  @Get('/admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  async adminFindAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @SessionUser() user: Users,
  ): Promise<PaginationResultType<Participants>> {
    const [data, count] =
      await this.participantService.adminFindManyWithPagination(
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
  async findOne(@Param('id') id: string): Promise<NullableType<Participants>> {
    return await this.participantService.findOne({ id: id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imgs', maxCount: 100 },
      { name: 'attachments', maxCount: 100 },
    ]),
  )
  async create(
    @Body() data: CreateParticipantDTO,
    @SessionUser() user: Users,
    @UploadedFiles()
    files: {
      imgs?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    // Ekstrak nama file dari objek file
    const imgFileNames = files.imgs
      ? files.imgs.map((file) => file.filename)
      : [];
    const attachmentFileNames = files.attachments
      ? files.attachments.map((file) => file.filename)
      : [];

    return await this.participantService.create(
      data,
      user,
      imgFileNames,
      attachmentFileNames,
    );
  }

  // @SerializeOptions({
  //   groups: ['admin'],
  // })
  // @HttpCode(HttpStatus.CREATED)
  // @Post()
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'imgs', maxCount: 100 },
  //     { name: 'attachments', maxCount: 100 },
  //   ]),
  // )
  // async create(
  //   @Body() data: CreateParticipantDTO,
  //   @SessionUser() user: Users,
  //   @Req() req: { imgFileNames: string[]; attachmentFileNames: string[] },
  // ) {
  //   return await this.participantService.create(
  //     data,
  //     user,
  //     req.imgFileNames,
  //     req.attachmentFileNames,
  //   );
  // }

  @Post('regenerate-payment')
  async regeneratePayment(@Body() payload: RegeneratePaymentDTO) {
    return this.participantService.regeneratePayment(payload);
  }
}
