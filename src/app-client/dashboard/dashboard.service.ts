import { Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { ParticipantStatus } from 'src/shared/enums/participants.enum';
import { DataSource } from 'typeorm';
import { EventSettingService } from '../event-setting/event-setting.service';
import { PaymentStatus } from 'src/shared/enums/payment.enum';

@Injectable()
export class DashboardService {
  constructor(
    private datasource: DataSource,
    private eventSettings: EventSettingService,
  ) {}
  async getDashboardData(user: Users) {
    const eventDate = await this.eventSettings.findStartEndDate();
    // const paymentPendings = await this.paymentService.getUserPayment(user);
    const dashboardQuery = `
                  SELECT (SELECT COUNT(*) FROM participants WHERE status = '${ParticipantStatus.ACTIVE}' AND user_id = ${user.id}) as success_participant,
                  (SELECT COUNT(*) FROM participants WHERE status = '${ParticipantStatus.PENDING}' AND user_id = ${user.id}) AS pending_participant,
                  (SELECT COUNT(*) FROM payments WHERE status = '${PaymentStatus.PAID}' AND user_id = ${user.id}) AS success_payment,
                  (SELECT COUNT(*) FROM payments WHERE status = '${PaymentStatus.PENDING}' AND user_id = ${user.id}) AS pending_payment
                  ;`;
    try {
      const res = await this.datasource.query(dashboardQuery);
      return Object.assign(res[0], {
        // payment_pending_lists: paymentPendings,
        event_setting: eventDate,
      });
    } catch (error) {
      throw error;
    }
  }
}
