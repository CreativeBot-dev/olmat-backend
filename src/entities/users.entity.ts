import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Payments } from './payments.entity';
import { Schools } from './schools.entity';
import { Exclude } from 'class-transformer';
import { make } from 'src/shared/utils/hash';
import { AuditTrail, EntityHelper } from 'src/shared/utils/entity-helper';
import { Participants } from './participants.entity';
import { Regions } from './regions.entity';

@Entity()
export class Users extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      this.password = make(this.password);
    }
    if (!this.previousPassword) {
      this.previousPassword = this.password;
    }
  }

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  type: string;

  @Column({ unique: true, nullable: true })
  hash: string;

  @OneToMany(() => Payments, (payment) => payment.user)
  payments: Payments[];

  @OneToMany(() => Participants, (participant) => participant.user)
  participants: Participants[];

  @ManyToOne(() => Schools, (school) => school.users, {
    nullable: true,
  })
  school: Schools;

  @ManyToOne(() => Regions, (region) => region.users, {
    nullable: false,
  })
  region: Regions;

  @Column(() => AuditTrail, { prefix: false })
  audit_trail: AuditTrail;
}
