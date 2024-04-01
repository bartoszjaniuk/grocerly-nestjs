import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

type CreateGroceryListDto = {
  name: string;
  users: User[];
};

@Injectable()
export class GroceryService {
  constructor(private db: DatabaseService) {}

  async createGroceryList(payload: CreateGroceryListDto) {
    // await this.db.groceryList.create({
    //   data: {
    //     name: payload.name,
    //     users: {},
    //   },
    // });
  }
}
