import { Entity, Column, OneToMany } from 'typeorm';
import { Cities } from './cities.entity';
import { Users } from './users.entity';
import { AuditTrail } from 'src/shared/utils/entity-helper';

@Entity()
export class Regions {
  @Column({ unique: true, primary: true })
  id: string;

  @Column()
  name: string;

  @Column()
  captain: string;

  @Column()
  contact: string;

  @Column()
  region_code: string;

  @OneToMany(() => Cities, (city) => city.region)
  cities: Cities[];

  @OneToMany(() => Users, (user) => user.region)
  users: Users[];

  @Column(() => AuditTrail, { prefix: false })
  audit_trail: AuditTrail;
}
