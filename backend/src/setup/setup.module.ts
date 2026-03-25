import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SetupController],
})
export class SetupModule {}
