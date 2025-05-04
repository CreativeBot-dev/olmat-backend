import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventSettings } from 'src/entities/event-settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventSettingService {
  constructor(
    @InjectRepository(EventSettings)
    private eventSettingRepo: Repository<EventSettings>,
  ) {}

  async findStartEndDate(): Promise<EventSettings> {
    return await this.eventSettingRepo.findOne({
      select: { name: true, start: true, end: true, free: true, amount: true },
      where: {},
    });
  }
}
