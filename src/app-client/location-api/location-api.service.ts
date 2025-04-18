import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityService } from 'src/app-backoffice/city/city.service';
import { DegreeService } from 'src/app-backoffice/degree/degree.service';
import { ProvinceService } from 'src/app-backoffice/province/province.service';
import { RegionService } from 'src/app-backoffice/region/region.service';
import { SchoolService } from 'src/app-backoffice/school/school.service';
import { SubdistrictService } from 'src/app-backoffice/subdistrict/subdistrict.service';
import { Cities } from 'src/entities/cities.entity';
import { Degree } from 'src/entities/degree.entity';
import { Provincies } from 'src/entities/provincies.entity';
import { Regions } from 'src/entities/regions.entity';
import { Schools } from 'src/entities/schools.entity';
import { Subdistricts } from 'src/entities/subdistricts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationApiService {
  constructor(
    @InjectRepository(Cities) private repository: Repository<Cities>,
    private provinceService: ProvinceService,
    private cityService: CityService,
    private subdistrictService: SubdistrictService,
    private schoolService: SchoolService,
    private degreeService: DegreeService,
    private regionService: RegionService,
  ) {}
  async getProvincies(): Promise<Provincies[]> {
    return await this.provinceService.getProvincies();
  }

  async getCities(province_id: string): Promise<Cities[]> {
    return await this.cityService.getCitiesByProvince(province_id);
  }

  async getSubdistricts(city_id: string): Promise<Subdistricts[]> {
    return await this.subdistrictService.getSubdistrictsByCity(city_id);
  }

  async getSchools(subdistrict_id: string): Promise<Schools[]> {
    return await this.schoolService.getSchoolBySubdistrict(subdistrict_id);
  }

  async getDegree(): Promise<Degree[]> {
    return await this.degreeService.findAll();
  }

  async getCitiesByRegion(region_id: string): Promise<Cities[]> {
    return await this.repository.find({
      where: { region: { id: region_id } },
    });
  }

  async getAllCities(): Promise<Cities[]> {
    return await this.cityService.findAll();
  }

  async getRegionByCityId(city_id: string): Promise<Regions> {
    return await this.regionService.findRegionByCityId(city_id);
  }

  async getAllRegions(): Promise<Regions[]> {
    console.log('first');
    const all = await this.regionService.findAll();
    console.log('this', all);
    return await this.regionService.findAll();
  }
}
