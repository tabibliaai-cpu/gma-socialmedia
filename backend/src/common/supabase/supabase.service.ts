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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth(): any {
    return this.client.auth;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
