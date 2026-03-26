import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, role = 'user', username } = registerDto;

    // Check if user exists
    const { data: existingUser } = await this.supabaseService
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if username exists
    const { data: existingProfile } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

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
      throw new Error(`Failed to create user: ${userError?.message || 'Unknown error'}`);
    }

    // Create profile
    await this.supabaseService.from('profiles').insert({
      user_id: user.id,
      username,
      bio: '',
      badge_type: 'none',
    });

    // Create privacy settings
    await this.supabaseService.from('privacy_settings').insert({
      user_id: user.id,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    console.log('Login attempt for:', email);

    // Find user
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('User query result:', { userFound: !!user, error: error?.message });

    if (error || !user) {
      console.log('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Stored hash:', user.password_hash?.substring(0, 20) + '...');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

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

    // Get profile separately
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('username, bio, avatar_url, badge_type, followers_count, following_count')
      .eq('user_id', userId)
      .single();

    // Get privacy settings
    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('name_visibility, dm_permission')
      .eq('user_id', userId)
      .single();

    return {
      ...user,
      profile: profile || null,
      privacy_settings: privacy || null,
    };
  }

  async logout(userId: string) {
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokens = await this.generateTokens(payload.sub, payload.email, payload.role);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(userId: string) {
    const { data: user } = await this.supabaseService
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();
    return user;
  }
}
