import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GroceryService } from 'src/grocery/grocery.service';
import { InviteService } from './invite.service';
import { GenerateInvitationLinkDto } from './dto/generateInvitationLinkDto';
import { DatabaseService } from 'src/database/database.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { UserFromJwtDto } from 'src/auth/dto/userFromJwtDto';
import { InviteUserByEmailPayload } from './dto/inviteUserByEmailPayload';

@UseGuards(JwtGuard)
@Controller('invite')
export class InviteController {
  constructor(
    private groceryService: GroceryService,
    private inviteService: InviteService,
    private db: DatabaseService,
  ) {}

  @Post()
  async sendInvitation(@Body() payload: InviteUserByEmailPayload) {
    const user = await this.db.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
      },
    });
    await this.inviteService.sendInvitation(user.id, payload.groceryListId);
  }

  @Post('accept')
  async acceptInvitation(
    @GetUser() user: UserFromJwtDto,
    @Body() payload: { groceryListId: string },
  ) {
    return await this.inviteService.acceptInvitation({
      groceryListId: payload.groceryListId,
      userId: user.userId,
    });
  }

  @Post('reject')
  async rejectInvitation(
    @GetUser() user: UserFromJwtDto,
    @Body() payload: { groceryListId: string },
  ) {
    return await this.inviteService.rejectInvitation({
      groceryListId: payload.groceryListId,
      userId: user.userId,
    });
  }

  @Get()
  async getLists(@GetUser() user: UserFromJwtDto) {
    return this.inviteService.getInvitations(user.userId);
  }

  @Post('link')
  sendInvitationLink(
    @Body()
    payload: GenerateInvitationLinkDto,
  ) {
    return this.inviteService.generateInvitationLink(payload);
  }

  @Post(':token')
  async getGroceryLists(@Param('token') token: string) {
    const [userId, groceryListId] = this.inviteService.parseToken(token);
    await this.groceryService.joinToList({ groceryListId, userId });
  }
}
