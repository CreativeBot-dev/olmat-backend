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
import { PaymentModule } from './payment/payment.module';
import { SettingModule } from 'src/core/setting/setting.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventSettingModule } from 'src/core/event-setting/event-setting.module';
import { RegisterModule } from './register/register.module';

export const BackofficeModules = [
  AuthAdminModule,
  EventSettingModule,
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
  PaymentModule,
  SettingModule,
  PaymentGatewayModule,
  DashboardModule,
  RegisterModule,
];
