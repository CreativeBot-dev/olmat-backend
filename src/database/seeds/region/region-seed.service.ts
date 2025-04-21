import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Regions } from 'src/entities/regions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RegionSeedService {
  constructor(
    @InjectRepository(Regions) private repository: Repository<Regions>,
  ) {}

  async run() {
    const count = await this.repository.count();
    if (count === 0) {
      await this.repository.query(`
        INSERT INTO regions (id, name, region_code, captain, contact, created_at, created_by, updated_at, updated_by) VALUES
          ('BDG', 'Rayon Bandung', '01', 'Ismi Nuridzatillah', '+6281515200240', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('CRBN', 'Rayon Cirebon', '03', 'Resha Hanindya', '+6285749705064', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('JBDT', 'Rayon Jabodetabek', '04', 'Pramesti Anggun Ermaya Sari', '+6288980052954', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('JBR', 'Rayon Jember', '05', 'Rizki Ahmadi', '+6289513945455', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('YGY', 'Rayon Yogyakarta', '18', 'Khoirun Nisak', '+6285852123622', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('KDR', 'Rayon Kediri', '07', 'Nazila Umrotul Laily', '+6281515571840', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('KLMT', 'Rayon Kalimantan', '06', 'Nafilah Maulidina Arifah', '+6282229096418', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('PNRG', 'Rayon Ponorogo', '13', 'Lenny Tya Rahmawati', '+6283840317313', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('LMG', 'Rayon Lamongan', '08', 'Nailah Najihah', '+6282338237887', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MDN', 'Rayon Madiun', '09', 'Dewi Ghoniyatul Maghfiroh', '+6281944638806', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MDR', 'Rayon Madura', '10', 'Siti Nur Laillia', '+6285859636451', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MLG', 'Rayon Malang', '11', 'Cita Alfi Rahmadini', '+6285736395620', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('PPBL', 'Rayon Papua Bali', '12', 'Nabillah Rihhadatul Aisy', '+6287862218128', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('BYMS', 'Rayon Banyumas', '02', 'Melinda Khodijatus Silvia', '+62895350300550', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SLWS', 'Rayon Sulawesi', '15', 'Marsya Kayla Anindita Kurnia Ramadhani', '+6281217365496', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SMTR', 'Rayon Sumatra', '16', 'Ulfa Nurfaizsyah', '+6285801134690', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SBY', 'Rayon Surabaya', '17', 'Balqish Natasyalwa Prisma Hayunda', '+6285733660399', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SMG', 'Rayon Semarang', '14', 'Maullid Avrilyantri Elok Kacandra', '+6288228906018', DEFAULT, DEFAULT, DEFAULT, NULL);
      `);
    }
  }
}
