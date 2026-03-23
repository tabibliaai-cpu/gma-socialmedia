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
  ) {}

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
      })
      .select()
      .single();

    if (userError) {
      throw new Error('Failed to create user');
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

    // Find user
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
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
      .select(`
        id,
        email,
        role,
        created_at,
        profiles (
          username,
          bio,
          avatar_url,
          badge_type,
          followers_count,
          following_count
        ),
        privacy_settings (
          name_visibility,
          dm_permission,
          search_visibility
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async logout(userId: string) {
    // In a real app, you might want to invalidate the token
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
