import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SignUpUserDto } from './dto/SignUpUserDto';
import { SignInUserDto } from './dto/signInUserDto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async signUp({ email, password }: SignUpUserDto) {
    const hashedPassword = await argon.hash(password);

    const doesUserExist = await this.db.user.findUnique({
      where: {
        email,
      },
    });

    if (doesUserExist) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        refreshToken: '',
      },
    });

    const { access_token, refresh_token } = await this.signTokens(
      newUser.id,
      newUser.email,
    );

    await this.updateRefreshToken(newUser.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user: {
        email: newUser.email,
      },
    };
  }

  async signIn({ email, password }: SignInUserDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new ForbiddenException('User does not exist');

    const doesPasswordMatch = await argon.verify(user.password, password);

    if (!doesPasswordMatch)
      throw new ForbiddenException('Invalid email or password');

    const { access_token, refresh_token } = await this.signTokens(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user: {
        email: user.email,
      },
    };
  }

  async signOut(userId: string): Promise<void> {
    await this.userService.updateUser(userId, { refreshToken: '' });
  }

  async signTokens(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, email };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { access_token, refresh_token };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);

    return await this.userService.updateUser(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}
