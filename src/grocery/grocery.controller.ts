import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { UserFromJwtDto } from 'src/auth/dto/userFromJwtDto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('grocery')
export class GroceryController {
  constructor(private groceryService: GroceryService) {}

  @Post()
  async createNewGroceryList(
    @GetUser() user: UserFromJwtDto,
    @Body() payload: { listName: string },
  ) {
    return await this.groceryService.createGroceryList({
      name: payload.listName,
      userId: user.userId,
    });
  }

  @Get()
  async getGroceryLists(@GetUser() user: UserFromJwtDto) {
    return await this.groceryService.getList(user.userId);
  }
}
