import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = (this.configService.get('SUPABASE_URL') || 'https://qvgpzjkawocfrwakmfdw.supabase.co').trim();
    const supabaseKey = (this.configService.get('SUPABASE_SERVICE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3B6amthd29jZnJ3YWttZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMTM5NCwiZXhwIjoyMDg5NTA3Mzk0fQ.OlcCYBFpf1CKHaWm2KbmkLjegM1keP4eHrTrefr4kJA').trim();

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
