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
      await queryRunner.manager.save(
        queryRunner.manager.create(Users, {
          name: 'User One',
          email: 'user@gmail.com',
          password: 'qweqweqwe',
          phone: '08168',
          type: 'Admin',
          region: { id: 'SBY' },
        }),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
