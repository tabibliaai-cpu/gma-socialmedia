import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
