import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LandingService } from './landing.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Landing`')
@Controller({
  path: 'landing',
  version: '1',
})
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.landingService.getLandingData();
  }
}
