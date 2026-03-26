import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SupabaseService } from '../common/supabase/supabase.service';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AiModule,
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key-123',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, SupabaseService],
  exports: [ChatService],
})
export class ChatModule { }
