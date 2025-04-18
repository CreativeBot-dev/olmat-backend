import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Regions } from 'src/entities/regions.entity';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { Repository } from 'typeorm';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Regions) private repository: Repository<Regions>,
  ) {}

  async findAll(): Promise<Regions[]> {
    return await this.repository.find();
  }

  async findRegionByCityId(id: string): Promise<Regions> {
    return await this.repository.findOne({ where: { cities: { id: id } } });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<[Regions[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
