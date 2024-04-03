import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { AddArticleToListDto } from './dto/addArticleToListDto';
import { CreateGroceryListDto } from './dto/createGroceryListDto';
import { DeleteArticleFromListDto } from './dto/deleteArticleFromListDto';

type JoinToListDto = {
  userId: string;
  groceryListId: string;
};

@Injectable()
export class GroceryService {
  constructor(private db: DatabaseService) {}

  async createGroceryList(payload: CreateGroceryListDto) {
    const createdGroceryList = await this.db.groceryList.create({
      data: { name: payload.name },
    });

    const updateCreatedGroceryList = await this.db.userGroceryList.create({
      data: {
        userId: payload.userId,
        groceryListId: createdGroceryList.id,
      },
    });

    return updateCreatedGroceryList;
  }

  async getUserLists(userId: string) {
    const list = await this.db.userGroceryList.findMany({
      where: {
        userId,
      },
      select: {
        groceryList: {
          include: {
            articles: true,
          },
        },
      },
    });

    return list.map((listItem) => ({
      id: listItem.groceryList.id,
      name: listItem.groceryList.name,
      articles: listItem.groceryList.articles,
    }));
  }

  async getGroceryListById(groceryListId: string) {
    // TODO: HOW TO HANDLE ERRORS / TRY CATCH?
    return await this.db.groceryList.findUnique({
      where: {
        id: groceryListId,
      },
    });
  }

  async addArticleToList({
    categoryId,
    groceryListId,
    name,
  }: AddArticleToListDto) {
    const doesListExist = await this.db.groceryList.findUnique({
      where: { id: groceryListId },
    });

    if (!doesListExist) throw new ForbiddenException('List does not exist');

    const article = await this.db.groceryListItem.create({
      data: {
        name,
        categoryId,
        groceryListId,
      },
    });

    return article;
  }

  async deleteArticle(payload: DeleteArticleFromListDto) {
    return await this.db.groceryListItem.delete({
      where: {
        id: payload.articleId,
      },
    });
  }

  async joinToList({ groceryListId, userId }: JoinToListDto) {
    const existingUserGroceryList = await this.db.userGroceryList.findUnique({
      where: {
        userId_groceryListId: {
          userId,
          groceryListId,
        },
      },
    });

    if (existingUserGroceryList)
      throw new ForbiddenException('Uzytkownik juz ma dostęp do listy');

    await this.db.userGroceryList.create({
      data: {
        userId,
        groceryListId,
      },
    });
  }
}
