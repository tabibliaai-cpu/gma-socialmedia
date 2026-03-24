import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_KEY');

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

  // Auth operations
  get auth() {
    return this.client.auth as any;
  }

  // Storage operations
  get storage() {
    return this.client.storage as any;
  }

  // Database operations helper
  from(table: string) {
    return this.client.from(table);
  }

  // RPC calls
  rpc(fn: string, args?: Record<string, any>) {
    return this.client.rpc(fn, args);
  }
}
