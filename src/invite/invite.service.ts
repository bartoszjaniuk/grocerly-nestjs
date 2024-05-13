import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GenerateInvitationLinkDto } from './dto/generateInvitationLinkDto';
import { AcceptInvitationPayload } from './dto/acceptInvitationPayload';

@Injectable()
export class InviteService {
  constructor(private db: DatabaseService) {}

  async sendInvitation(userId: string, groceryListId: string) {
    return await this.db.invite.create({
      data: {
        groceryListId,
        userId,
      },
    });
  }

  async getInvitations(userId: string) {
    const lists = await this.db.invite.findMany({
      where: {
        userId,
      },
      select: {
        groceryList: {
          include: {
            articles: true,
          },
        },
        user: {
          select: {
            id: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    if (lists.length === 0) return [];

    return lists;
  }

  async acceptInvitation({ groceryListId, userId }: AcceptInvitationPayload) {
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

    const inviteToDelete = await this.db.invite.findFirst({
      where: {
        groceryListId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!inviteToDelete)
      throw new ForbiddenException('Nie znaleziono listy do usunięcia');

    await this.db.invite.delete({
      where: {
        id: inviteToDelete.id,
      },
    });
  }

  async rejectInvitation({ groceryListId, userId }: AcceptInvitationPayload) {
    const inviteToDelete = await this.db.invite.findFirst({
      where: {
        groceryListId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!inviteToDelete)
      throw new ForbiddenException('Nie znaleziono listy do usunięcia');

    await this.db.invite.delete({
      where: {
        id: inviteToDelete.id,
      },
    });
  }

  generateInvitationLink(payload: GenerateInvitationLinkDto) {
    const token = this.generateToken(payload.userId, payload.listId);
    const invitationLink = `${payload.appUrl}/?token=${token}`;
    return invitationLink;
  }

  generateToken(userId: string, listId: string): string {
    return `${userId}-${listId}`;
  }

  parseToken(token: string): string[] {
    // Implement your token parsing logic here
    // This should reverse the process used in generateToken
    return token.split('-');
  }
}
