import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [CrmController],
  providers: [CrmService, SupabaseService],
  exports: [CrmService],
})
export class CrmModule {}
