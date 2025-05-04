import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cities } from 'src/entities/cities.entity';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { NullableType } from 'src/shared/types/nullable.type';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(Cities) private repository: Repository<Cities>,
  ) {}

  async findAll(): Promise<Cities[]> {
    return await this.repository.find();
  }

  async findOne(
    condition: EntityCondition<Cities>,
  ): Promise<NullableType<Cities>> {
    return await this.repository.findOne({ where: condition });
  }

  async getCitiesByProvince(province_id: string): Promise<Cities[]> {
    return await this.repository.find({
      where: { province: { id: province_id } },
    });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<[Cities[], number]> {
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
