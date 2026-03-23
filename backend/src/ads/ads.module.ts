import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [AdsController],
  providers: [AdsService, SupabaseService],
  exports: [AdsService],
})
export class AdsModule {}
