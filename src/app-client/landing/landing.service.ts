import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LandingService {
  constructor(private dataSource: DataSource) {}

  async getLandingData() {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM participants p
         JOIN schools s ON p.school_id = s.id
         WHERE p.status = 'ACTIVE') AS total_active,

        (SELECT COUNT(*) FROM participants p
         JOIN schools s ON p.school_id = s.id
         WHERE p.status = 'ACTIVE' AND s.degree_id = '01') AS sma,

        (SELECT COUNT(*) FROM participants p
         JOIN schools s ON p.school_id = s.id
         WHERE p.status = 'ACTIVE' AND s.degree_id = '02') AS smp,

        (SELECT COUNT(*) FROM participants p
         JOIN schools s ON p.school_id = s.id
         WHERE p.status = 'ACTIVE' AND s.degree_id = '03') AS sd;
    `;

    const result = await this.dataSource.query(query);
    return result[0];
  }
}
