import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase/supabase.service';

@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  @Get()
  async check() {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    
    // Test database connection
    let dbStatus = 'unknown';
    let userCount = 0;
    
    try {
      const { data, error } = await this.supabaseService
        .from('users')
        .select('id, email')
        .limit(5);
      
      if (error) {
        dbStatus = `error: ${error.message}`;
      } else {
        dbStatus = 'connected';
        userCount = data?.length || 0;
      }
    } catch (e: any) {
      dbStatus = `exception: ${e.message}`;
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        jwtSecret: this.configService.get('JWT_SECRET') ? 'configured' : 'missing',
        port: this.configService.get('PORT') || 3001,
        nodeEnv: this.configService.get('NODE_ENV') || 'development',
      },
      database: {
        status: dbStatus,
        sampleUsers: userCount,
      },
    };
  }

  @Get('users')
  async getUsers() {
    const { data, error } = await this.supabaseService
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return { error: error.message };
    }

    return { users: data };
  }
}
