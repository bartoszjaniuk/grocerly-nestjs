import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
    @Body()
    payload: {
      listName: string;
      articles: { name: string; categoryId: string }[];
    },
  ) {
    return await this.groceryService.createGroceryList({
      name: payload.listName,
      userId: user.userId,
      articles: payload.articles,
    });
  }

  @Get()
  async getGroceryLists(@GetUser() user: UserFromJwtDto) {
    return await this.groceryService.getUserLists(user.userId);
  }

  @Get('categories')
  async getCategories() {
    return await this.groceryService.getCategoriesList();
  }

  @Get(':id')
  async getArticleById(
    @GetUser() user: UserFromJwtDto,
    @Param('id') id: string,
  ) {
    return await this.groceryService.getGroceryListById(id, user.userId);
  }

  @Post('article')
  async createNewArticle(@Body() payload: AddArticleToListDto) {
    return await this.groceryService.addArticleToList(payload);
  }

  @Put('category/keywords')
  async updateCategoryKeywords(@Body() payload: Record<string, string[]>) {
    return await this.groceryService.updateCategoriesKeywords(payload);
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
