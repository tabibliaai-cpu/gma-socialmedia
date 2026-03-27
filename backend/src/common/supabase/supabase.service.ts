import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.trim();
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY')?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  auth(): any {
    return this.client.auth;
  }

  storage(): any {
    return this.client.storage;
  }

  from(table: string) {
    return this.client.from(table);
  }

  rpc(fn: string, params?: object) {
    return this.client.rpc(fn, params);
  }
}
