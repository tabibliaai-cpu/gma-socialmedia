import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy validate() called with payload:', JSON.stringify(payload));
    const user = await this.authService.validateUser(payload.sub);
    console.log('validateUser result:', JSON.stringify(user));
    if (!user) {
      console.log('User not found in database');
      return null;
    }
    const result = { id: payload.sub, email: payload.email, role: payload.role };
    console.log('Returning user:', JSON.stringify(result));
    return result;
  }
}
