import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { CrmModule } from './crm/crm.module';
import { AdsModule } from './ads/ads.module';
import { AiModule } from './ai/ai.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { ArticlesModule } from './articles/articles.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { SetupModule } from './setup/setup.module';
import { HealthModule } from './health/health.module';

// Services
import { SupabaseService } from './common/supabase/supabase.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'super-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    HealthModule,
    AuthModule,
    UsersModule,
    PostsModule,
    ChatModule,
    CrmModule,
    AdsModule,
    AiModule,
    PaymentsModule,
    NotificationsModule,
    SearchModule,
    ArticlesModule,
    AffiliatesModule,
    SetupModule,
  ],
  providers: [SupabaseService],
})
export class AppModule {}
