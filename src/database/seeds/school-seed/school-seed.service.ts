import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Degree } from 'src/entities/degree.entity';
import { Schools } from 'src/entities/schools.entity';
import { DataSource } from 'typeorm';
import { SEKOLAH } from './SEKOLAH.constant';

@Injectable()
export class SchoolSeedService {
  constructor(private readonly datasource: DataSource) {}
  async run() {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sd = await queryRunner.manager.findOneOrFail(Degree, {
        where: { id: '03' },
      });

      const smp = await queryRunner.manager.findOneOrFail(Degree, {
        where: { id: '02' },
      });

      const sma = await queryRunner.manager.findOneOrFail(Degree, {
        where: { id: '01' },
      });

      if (sd && smp && sma)
        await Promise.all(
          SEKOLAH.map(async (sekolah) => {
            let degree_id: string;

            switch (sekolah.JENJANG_SEKOLAH.trim()) {
              case 'SMA':
                degree_id = sma.id;
                break;
              case 'SMK':
                degree_id = sma.id;
                break;
              case 'MA':
                degree_id = sma.id;
                break;
              case 'SMP':
                degree_id = smp.id;
                break;
              case 'MTS':
                degree_id = smp.id;
                break;
              case 'SD':
                degree_id = sd.id;
                break;
              case 'MI':
                degree_id = sd.id;
                break;

              default:
                console.log(sekolah.JENJANG_SEKOLAH);
                break;
            }

            await queryRunner.manager.save(
              queryRunner.manager.create(Schools, {
                name: sekolah.NAMA_SEKOLAH,
                email: sekolah.EMAIL_SEKOLAH,
                phone: `0${sekolah.TELEPON_SEKOLAH}`,
                address: sekolah.ALAMAT_SEKOLAH,
                degree: { id: `${degree_id}` },
                subdistrict: { id: sekolah.ID_KECAMATAN },
                city: { id: sekolah.ID_KOTA },
                province: { id: sekolah.ID_PROVINSI },
                is_accept: true,
              }),
            );
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
