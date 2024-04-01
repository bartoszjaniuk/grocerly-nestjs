import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { UserFromJwtDto } from 'src/auth/dto/userFromJwtDto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getCurrentUser(@GetUser() user: UserFromJwtDto) {
    return await this.userService.getUserById(user.userId);
  }
}
