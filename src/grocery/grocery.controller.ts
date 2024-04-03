import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AddArticleToListDto } from './dto/addArticleToListDto';
import { Response } from 'express';
import { DeleteArticleFromListDto } from './dto/deleteArticleFromListDto';
import { UserFromJwtDto } from 'src/auth/dto/userFromJwtDto';

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
    return await this.groceryService.getUserLists(user.userId);
  }

  @Post('article')
  async createNewArticle(@Body() payload: AddArticleToListDto) {
    return await this.groceryService.addArticleToList(payload);
  }

  // TODO: send link to join
  @Post('join')
  async joinToList(
    @GetUser() { userId }: UserFromJwtDto,
    @Body() payload: { groceryListId: string },
  ) {
    return await this.groceryService.joinToList({
      groceryListId: payload.groceryListId,
      userId,
    });
  }

  @Delete('article')
  async deleteArticleFromList(
    @Body() payload: DeleteArticleFromListDto,
    @Res() res: Response,
  ) {
    await this.groceryService.deleteArticle(payload);
    res.status(204);
  }
}
