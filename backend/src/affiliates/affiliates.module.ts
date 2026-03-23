import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [AffiliatesController],
  providers: [AffiliatesService, SupabaseService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
