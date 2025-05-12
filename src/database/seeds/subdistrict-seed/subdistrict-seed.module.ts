import { Module } from '@nestjs/common';
import { SubdistrictSeedService } from './subdistrict-seed.service';

@Module({
  imports: [],
  providers: [SubdistrictSeedService],
})
export class SubdistrictSeedModule {}
