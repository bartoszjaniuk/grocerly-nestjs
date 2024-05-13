import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { WsStrategy } from './strategy/ws.strategy';
import { WsAuthGuard } from './guard/ws.guard';
import { RefreshTokenGuard } from './guard/jwt-refresh.guard';
import { RefreshTokenStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtGuard,
    JwtStrategy,
    WsStrategy,
    WsAuthGuard,
    RefreshTokenGuard,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
