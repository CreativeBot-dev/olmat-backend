import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schools } from 'src/entities/schools.entity';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { NullableType } from 'src/shared/types/nullable.type';
import { IPaginationOptions } from 'src/shared/types/pagination-options';
import { TFilterSchool } from 'src/shared/types/school.type';
import { Like, Repository } from 'typeorm';
import { ProvinceService } from '../province/province.service';
import { CityService } from '../city/city.service';
import { DegreeService } from '../degree/degree.service';
import { CreateSchoolDTO } from './dto/create-school.dto';
import { SubdistrictService } from '../subdistrict/subdistrict.service';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(Schools) private repository: Repository<Schools>,
    private subdistrictService: SubdistrictService,
    private provinceService: ProvinceService,
    private cityService: CityService,
    private degreeService: DegreeService,
  ) {}

  async craete(payload: CreateSchoolDTO): Promise<Schools> {
    const province = await this.provinceService.findOne({
      id: payload.province_id,
    });
    if (!province) throw new NotFoundException('cant find province');

    const city = await this.cityService.findOne({
      id: payload.city_id,
    });
    if (!city) throw new NotFoundException('cant find city');

    const subdistrict = await this.subdistrictService.findOne({
      id: payload.subdistrict_id,
    });
    if (!subdistrict) throw new NotFoundException('cant find subdistrict');

    const degree = await this.degreeService.findOne({ id: payload.degree_id });
    if (!degree) throw new NotFoundException('cant find degree');

    return await this.repository.save(
      this.repository.create({
        ...payload,
        degree,
        is_accept: true,
        province,
        city,
        subdistrict,
      }),
    );
  }

  async getSchoolBySubdistrict(subdistrict_id: string): Promise<Schools[]> {
    return await this.repository.find({
      where: { subdistrict: { id: subdistrict_id }, is_accept: true },
      relations: { degree: true },
    });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
    filter: TFilterSchool,
  ): Promise<[Schools[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: {
          is_accept: true,
          name: filter.name ? Like(`%${filter.name}%`) : filter.name,
          city: filter.city_id
            ? { id: filter.city_id }
            : filter.region_id
            ? { region: { id: filter.region_id } }
            : undefined,
          subdistrict: filter.subdistrict_id
            ? { id: filter.subdistrict_id }
            : undefined,
          degree: filter.degree_id ? { id: filter.degree_id } : undefined,
        },
        relations: {
          city: { region: true },
          province: true,
          subdistrict: true,
          degree: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(
    condition: EntityCondition<Schools>,
  ): Promise<NullableType<Schools>> {
    const school = await this.repository.findOne({
      where: condition,
      relations: {
        degree: true,
        city: { region: true },
        province: true,
        subdistrict: true,
      },
    });

    if (!school) {
      throw new NotFoundException();
    }

    return school;
  }

  async schoolRequesList(
    paginationOptions: IPaginationOptions,
    filter: TFilterSchool,
  ): Promise<[Schools[], number]> {
    try {
      return await this.repository.findAndCount({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: {
          name: filter.name ? Like(`%${filter.name}%`) : filter.name,
          is_accept: false,
          city: filter.city_id
            ? { id: filter.city_id }
            : filter.region_id
            ? { region: { id: filter.region_id } }
            : undefined,
          subdistrict: filter.subdistrict_id
            ? { id: filter.subdistrict_id }
            : undefined,
          degree: filter.degree_id ? { id: filter.degree_id } : undefined,
        },
        relations: { city: { region: true }, degree: true },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async acceptSchool(school_id: number) {
    const school = await this.findOne({ id: school_id });
    if (!school) throw new BadRequestException();
    try {
      school.is_accept = true;
      school.save();
    } catch (error) {
      throw new InternalServerErrorException(0);
    }
  }

  async deleteSchool(id: number): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
