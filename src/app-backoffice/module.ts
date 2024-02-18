import { AuthAdminModule } from 'src/auth/admin/auth-admin.module';
import { AdminModule } from './admin/admin.module';
import { AdminRoleModule } from './admin-role/admin-role.module';
import { CityModule } from './city/city.module';
import { ParticipantModule } from './participant/participant.module';
import { ProvinceModule } from './province/province.module';
import { RegionModule } from './region/region.module';
import { SchoolModule } from './school/school.module';
import { SubdistrictModule } from './subdistrict/subdistrict.module';
import { UserModule } from './user/user.module';
import { DegreeModule } from './degree/degree.module';

export const BackofficeModules = [
  AuthAdminModule,
  AdminModule,
  AdminRoleModule,
  CityModule,
  ParticipantModule,
  ProvinceModule,
  RegionModule,
  SchoolModule,
  SubdistrictModule,
  UserModule,
  DegreeModule,
];
