import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = (this.configService.get('SUPABASE_URL') || '').trim();
    const supabaseKey = (this.configService.get('SUPABASE_SERVICE_KEY') || '').trim();

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

  auth() {
    return this.client.auth;
  }

  storage() {
    return this.client.storage;
  }

  from(table: string) {
    return this.client.from(table);
  }

  rpc(fn: string, params?: object) {
    return this.client.rpc(fn, params);
  }
}
