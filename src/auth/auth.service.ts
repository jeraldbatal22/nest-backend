import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SigninAuthDto } from './dto/signin.dto';
import { SignupAuthDto } from './dto/signup.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signin(SigninAuthDto: SigninAuthDto): Promise<{
    status: string;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    try {
      const existingByEmail = await this.userRepository.findOne({
        where: { email: SigninAuthDto.email },
      });

      if (!existingByEmail) {
        throw new ConflictException('Invalid Email or Password');
      }

      const isPasswordValid = await existingByEmail.validatePassword(
        SigninAuthDto.password,
      );
      if (!isPasswordValid) {
        throw new ConflictException('Invalid Email or Password');
      }

      // Update last login info (best-effort; ignore result)
      existingByEmail.updateLastLogin();

      // Issue tokens
      const payload = {
        sub: existingByEmail.id,
        email: existingByEmail.email,
        fullName: existingByEmail.fullName,
        role: existingByEmail.role,
      };
      const accessToken = await this.jwtService.signAsync(payload);

      // Generate and persist refresh token as JWT
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });
      existingByEmail.refreshToken = refreshToken;
      existingByEmail.refreshTokenExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
      await this.userRepository.save(existingByEmail);

      delete (existingByEmail as Partial<User>).password;

      return {
        status: 'success',
        message: 'Signin successful',
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      throw new UnauthorizedException(
        err.message || 'Failed to generate login credentials',
      );
    }
  }

  async signup(signupDto: SignupAuthDto): Promise<Omit<User, 'password'>> {
    const existingByEmail = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('Email already in use');
    }

    if (signupDto.username) {
      const existingByUsername = await this.userRepository.findOne({
        where: { username: signupDto.username },
      });
      if (existingByUsername) {
        throw new ConflictException('Username already in use');
      }
    }

    const user = this.userRepository.create({
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      email: signupDto.email,
      password: signupDto.password,
      username: signupDto.username,
      phone: signupDto.phone,
    });

    const saved = await this.userRepository.save(user);
    delete (saved as Partial<User>).password;
    return saved as Omit<User, 'password'>;
  }

  async getUserMe(accessToken: string): Promise<Omit<User, 'password'>> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      }>(accessToken);

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      delete (user as Partial<User>).password;
      delete (user as Partial<User>).refreshToken;
      return user as Omit<User, 'password refreshToken'>;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
