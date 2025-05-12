import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payments } from './payments.entity';
import { Schools } from './schools.entity';
import { ParticipantStatus } from 'src/shared/enums/participants.enum';
import { AuditTrail, EntityHelper } from 'src/shared/utils/entity-helper';
import { Users } from './users.entity';

@Entity()
export class Participants extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  keplekId: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column({ unique: false })
  phone: string;

  @Column({ unique: false })
  email: string;

  @Column()
  birth: string;

  @Column()
  img: string;

  @Column()
  attachment: string;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.PENDING,
  })
  status: string;

  @ManyToOne(() => Payments, (payment) => payment.participants, {
    nullable: false,
  })
  payment: Payments;

  @ManyToOne(() => Schools, (school) => school.participants, {
    nullable: false,
  })
  school: Schools;

  @ManyToOne(() => Users, (user) => user.participants, {
    nullable: false,
  })
  user: Users;

  @Column(() => AuditTrail, { prefix: false })
  audit_trail: AuditTrail;
}
