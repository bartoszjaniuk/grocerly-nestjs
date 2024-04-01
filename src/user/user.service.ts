import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

type UpdateUserDto = {
  refreshToken: string;
};

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async updateUser(id: string, user: UpdateUserDto) {
    return await this.db.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: user.refreshToken || '',
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        groceryLists: true,
      },
    });
    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      groceryLists: user.groceryLists,
    };
  }
}
