import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        provider: 'local',
      },
    });

    // Generate tokens
    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    // Find refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    return this.generateTokens(storedToken.user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { success: true, message: 'Logged out successfully' };
  }

  async socialLogin(provider: 'apple' | 'google', idToken: string) {
    // TODO: Verify idToken with provider
    // For now, this is a placeholder
    const payload = this.decodeSocialToken(idToken);

    let user = await this.prisma.user.findFirst({
      where: {
        provider,
        providerId: payload.sub,
      },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          provider,
          providerId: payload.sub,
        },
      });
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };

    // Access token
    const accessToken = this.jwtService.sign(payload);

    // Refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private decodeSocialToken(idToken: string) {
    // TODO: Implement actual token verification
    // This is a placeholder that decodes JWT without verification
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  }
}
