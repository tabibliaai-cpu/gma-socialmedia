import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SupabaseService],
  exports: [SearchService],
})
export class SearchModule {}
