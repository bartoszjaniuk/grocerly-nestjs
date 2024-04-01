import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

type CreateGroceryListDto = {
  name: string;
  userId: string;
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

  async getList(userId: string) {
    const list = await this.db.userGroceryList.findMany({
      where: {
        userId,
      },
      select: { groceryList: true },
    });

    return list.map((listItem) => ({
      id: listItem.groceryList.id,
      name: listItem.groceryList.name,
    }));
  }
}
