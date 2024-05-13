import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/SignUpUserDto';
import { SignInUserDto } from './dto/signInUserDto';
import { GetUser } from './decorator/getUser.decorator';
import { UserFromJwtDto } from './dto/userFromJwtDto';
import { RefreshTokenGuard } from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async signUp(@Body() payload: SignUpUserDto, @Res() res: Response) {
    const registeredUser = await this.authService.signUp(payload);
    res.status(200).send(registeredUser);
  }
  @Post('login')
  async signIn(@Body() payload: SignInUserDto, @Res() res: Response) {
    const loggedInUser = await this.authService.signIn(payload);
    res.status(200).send(loggedInUser);
  }

  @Get('logout')
  async signOut(@GetUser() user: UserFromJwtDto, @Res() res: Response) {
    await this.authService.signOut(user.userId);
    res.status(200).send('Success');
  }

  @UseGuards(RefreshTokenGuard)
  @Get('session')
  async session(@Req() req: Request) {
    const sub = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return await this.authService.refreshTokens(sub, refreshToken);
  }
}
