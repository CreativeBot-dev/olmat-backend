import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UserSeedService {
  constructor(private readonly datasource: DataSource) {}

  async run() {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const regions = await queryRunner.manager.find('regions'); // asumsi nama entitasnya 'regions'

      for (const region of regions) {
        const rayonName = region.name.replace('Rayon ', '').replace(/\s+/g, '');
        const email = `${rayonName.toLowerCase()}@olmat.com`;
        const rawPassword = `AdminRayon${rayonName}`;

        const user = queryRunner.manager.create(Users, {
          name: `Admin ${rayonName}`,
          email,
          password: rawPassword,
          phone: `081${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'Admin',
          region: { id: region.id },
        });

        await queryRunner.manager.save(user);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
