import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/SignUpUserDto';
import { SignInUserDto } from './dto/signInUserDto';

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

  //   @Get('logout')
  //   signOut(@GetUserId() userId: string, @Res() res: Response) {
  //     this.authService.signOut(userId);
  //     res.status(200).send('Success');
  //   }
}
