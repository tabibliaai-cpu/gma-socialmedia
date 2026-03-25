import { Controller, Post, Get } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Controller('setup')
export class SetupController {
  constructor(private supabaseService: SupabaseService) {}

  @Post('database')
  async setupDatabase() {
    const results: { table: string; status: string; error?: string }[] = [];

    // Create posts table
    const createPosts = `
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        media_url TEXT,
        media_type VARCHAR(20),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create followers table
    const createFollowers = `
      CREATE TABLE IF NOT EXISTS followers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );
    `;

    // Create messages table
    const createMessages = `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        encrypted_message TEXT NOT NULL,
        media_url TEXT,
        message_type VARCHAR(20) DEFAULT 'text',
        is_paid BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create likes table
    const createLikes = `
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `;

    // Create comments table
    const createComments = `
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create notifications table
    const createNotifications = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Since we can't run DDL through the Supabase client directly,
    // we'll just check if tables exist and report status
    const tables = ['posts', 'followers', 'messages', 'likes', 'comments', 'notifications'];

    for (const table of tables) {
      try {
        const { error } = await this.supabaseService
          .from(table)
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') {
          results.push({ table, status: 'missing', error: 'Table does not exist. Please run the schema in Supabase SQL Editor.' });
        } else {
          results.push({ table, status: 'exists' });
        }
      } catch (e: any) {
        results.push({ table, status: 'error', error: e.message });
      }
    }

    return {
      message: 'Database status check complete',
      tables: results,
      instructions: 'If tables are missing, please run the schema from database/schema.sql in your Supabase SQL Editor.',
    };
  }

  @Get('status')
  async getStatus() {
    const tables = ['users', 'profiles', 'posts', 'followers', 'messages', 'likes', 'comments', 'notifications'];
    const results: { table: string; exists: boolean }[] = [];

    for (const table of tables) {
      try {
        const { error } = await this.supabaseService
          .from(table)
          .select('id')
          .limit(1);
        
        results.push({ table, exists: !error || error.code !== '42P01' });
      } catch (e) {
        results.push({ table, exists: false });
      }
    }

    return { tables: results };
  }
}
