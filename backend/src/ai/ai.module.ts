import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [AiController],
  providers: [AiService, SupabaseService],
  exports: [AiService],
})
export class AiModule {}
