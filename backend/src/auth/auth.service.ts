import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../common/supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role = 'user', username } = registerDto;

    // Check if email exists
    const { data: existingUser } = await this.supabaseService
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if username exists
    const { data: existingProfile } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .maybeSingle();

    if (existingProfile) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await this.supabaseService
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        username,
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('Supabase user insert error:', JSON.stringify(userError, null, 2));
      throw new InternalServerErrorException(`Failed to create user: ${userError?.message || 'Unknown error'}`);
    }

    // Create profile
    const { error: profileError } = await this.supabaseService.from('profiles').insert({
      user_id: user.id,
      username,
      bio: '',
      badge_type: 'none',
      avatar_url: '',
    });
    if (profileError) {
      console.error('Failed to create profile for user:', user.id, profileError);
    }

    // Create privacy settings
    const { error: privacyError } = await this.supabaseService.from('privacy_settings').insert({
      user_id: user.id,
    });
    if (privacyError) {
      console.error('Failed to create privacy settings for user:', user.id, privacyError);
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('name_visibility, dm_permission')
      .eq('user_id', userId)
      .maybeSingle();

    let paidChatSettings: any = null;
    if (user.role === 'creator') {
      const { data: pc } = await this.supabaseService
        .from('paid_chat_settings')
        .select('is_enabled, price_per_message')
        .eq('user_id', userId)
        .maybeSingle();
      paidChatSettings = pc;
    }

    let businessSettings: any = null;
    if (user.role === 'business') {
      const { data: bs } = await this.supabaseService
        .from('user_settings')
        .select('auto_reply_enabled, auto_reply_message')
        .eq('user_id', userId)
        .maybeSingle();
      businessSettings = bs;
    }

    return {
      ...user,
      profile: profile || null,
      privacy_settings: privacy || null,
      paid_chat_settings: paidChatSettings,
      business_settings: businessSettings,
    };
  }

  async logout(_userId: string) {
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokens = this.generateTokens(payload.sub, payload.email, payload.role);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateUser(userId: string) {
    const { data: user } = await this.supabaseService
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .maybeSingle();
    return user;
  }
}
