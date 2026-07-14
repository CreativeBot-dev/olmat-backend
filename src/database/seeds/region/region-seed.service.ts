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
          ('BDG', 'Rayon Bandung', '01', 'Salwa Dwi', '+62895633211616', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('BYMS', 'Rayon Banyumas', '02', 'Maryzka Rosa A', '+6282228534274', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('CRBN', 'Rayon Cirebon', '03', 'Zulfan', '+6283833826401', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('JBDT', 'Rayon Jabodetabek', '04', 'Salimah Ramadhani', '+6281319782245', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('JBR', 'Rayon Jember', '05', 'Nadia Sofwah', '+6282111060501', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('KLMT', 'Rayon Kalimantan', '06', 'Dewi G', '+6281944638806', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('KDR', 'Rayon Kediri', '07', 'M. Ali Aditya', '+6282337666029', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('LMG', 'Rayon Lamongan', '08', 'Sriwidayanti', '+6285784845326', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MDN', 'Rayon Madiun', '09', 'Aleeyfa Mukarromah', '+6281949515846', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MDR', 'Rayon Madura', '10', 'Afifah A', '+6287850287150', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('MLG', 'Rayon Malang', '11', 'Eva Nur Jannah', '+6285854911624', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('PPBL', 'Rayon Papua Bali', '12', 'Nabillah', '+6287862218128', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('PNRG', 'Rayon Ponorogo', '13', 'Moch. Angga Dwi K', '+62882244940899', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SMG', 'Rayon Semarang', '14', 'Naisya', '+6285804002685', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SLWS', 'Rayon Sulawesi', '15', 'Sukma Ainul M', '+6281358898220', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SMTR', 'Rayon Sumatra', '16', 'Laudira Neza', '+62895367173124', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('SBY', 'Rayon Surabaya', '17', 'Nadzifah Faizah Al Marifah', '+6285756163379', DEFAULT, DEFAULT, DEFAULT, NULL),
          ('YGY', 'Rayon Yogyakarta', '18', 'Chika R', '+6289513768946', DEFAULT, DEFAULT, DEFAULT, NULL);
      `);
    }
  }
}
