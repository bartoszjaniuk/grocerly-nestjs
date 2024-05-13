import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { AddArticleToListDto } from './dto/addArticleToListDto';
import { CreateGroceryListDto } from './dto/createGroceryListDto';
import { DeleteArticleFromListDto } from './dto/deleteArticleFromListDto';
import { UpdateGroceryListDto } from './dto/updateGroceryListDto';

type JoinToListDto = {
  userId: string;
  groceryListId: string;
};

type InviteToListByEmailDto = {
  email: string;
  groceryListId: string;
};

@Injectable()
export class GroceryService {
  constructor(private db: DatabaseService) {}

  async updateCategoriesKeywords(categories: Record<string, string[]>) {
    const updates = Object.entries(categories).map(
      async ([categoryId, newKeywords]) => {
        const category = await this.db.groceryCategory.findUnique({
          where: { id: categoryId },
        });

        if (!category)
          throw new BadRequestException(
            'Kategoria nie istnieje w bazie danych',
          );

        return this.db.groceryCategory.update({
          where: { id: categoryId },
          data: { keywords: [...category.keywords, ...newKeywords] },
        });
      },
    );

    return await Promise.all(updates);
  }

  async createGroceryList(payload: CreateGroceryListDto) {
    const createdGroceryList = await this.db.groceryList.create({
      data: {
        name: payload.name,
        articles: {
          createMany: {
            data: payload.articles,
          },
        },
      },
    });

    const updateCreatedGroceryList = await this.db.userGroceryList.create({
      data: {
        userId: payload.userId,
        groceryListId: createdGroceryList.id,
      },
      select: {
        groceryList: {
          select: {
            name: true,
            articles: {
              select: {
                id: true,
                name: true,
                groceryListId: true,
                categoryId: true,
              },
            },
            id: true,
          },
        },
      },
    });

    return updateCreatedGroceryList;
  }

  async updateGroceryList(payload: UpdateGroceryListDto) {
    return await this.db.groceryList.update({
      where: {
        id: payload.listId,
      },
      data: {
        articles: {
          createMany: {
            data: payload.articles,
          },
        },
      },
      select: {
        id: true,
        name: true,
        articles: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                color: true,
                label: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserLists(userId: string) {
    try {
      const lists = await this.db.userGroceryList.findMany({
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

      if (lists.length === 0) return [];

      return lists.map((listItem) => ({
        id: listItem.groceryList.id,
        name: listItem.groceryList.name,
        articles: listItem.groceryList.articles,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async getCategoriesList() {
    try {
      const categories = await this.db.groceryCategory.findMany();

      if (categories.length === 0) return [];

      return categories;
    } catch (error) {
      console.log(error);
    }
  }

  async getGroceryListById(groceryListId: string, userId: string) {
    try {
      const userGroceryList = await this.db.userGroceryList.findFirst({
        where: {
          userId: userId,
          groceryListId: groceryListId,
        },
      });

      if (!userGroceryList) {
        throw new Error('User does not own this grocery list');
      }

      const groceryList = await this.db.groceryList.findUnique({
        where: {
          id: groceryListId,
        },
        include: {
          articles: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  label: true,
                  color: true,
                },
              },
            },
          },
        },
      });

      return groceryList;
    } catch (error) {
      console.error('Error fetching grocery list:', error);
      throw new Error('Error fetching grocery list');
    }
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

  async joinToListByEmail({ groceryListId, email }: InviteToListByEmailDto) {
    const user = await this.db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    const existingUserGroceryList = await this.db.userGroceryList.findUnique({
      where: {
        userId_groceryListId: {
          userId: user.id,
          groceryListId,
        },
      },
    });

    if (existingUserGroceryList)
      throw new ForbiddenException('Uzytkownik juz ma dostęp do listy');

    await this.db.userGroceryList.create({
      data: {
        userId: user.id,
        groceryListId,
      },
    });
  }

  async removeList(listId: string) {
    // Find all UserGroceryList records associated with the list
    await this.db.userGroceryList.findMany({
      where: {
        groceryListId: listId,
      },
    });

    // Delete the UserGroceryList records
    await this.db.userGroceryList.deleteMany({
      where: {
        groceryListId: listId,
      },
    });

    // Delete the GroceryList itself
    await this.db.groceryList.delete({
      where: {
        id: listId,
      },
    });
  }
}
