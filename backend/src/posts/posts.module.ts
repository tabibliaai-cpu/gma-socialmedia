import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SupabaseService } from '../common/supabase/supabase.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, SupabaseService],
  exports: [PostsService],
})
export class PostsModule {}
