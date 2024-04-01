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
}
