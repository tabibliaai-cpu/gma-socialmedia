import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SupabaseService } from '../common/supabase/supabase.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SearchController],
  providers: [SearchService, SupabaseService],
  exports: [SearchService],
})
export class SearchModule {}
