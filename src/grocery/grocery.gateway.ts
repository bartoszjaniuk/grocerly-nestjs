import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GroceryService } from './grocery.service';
import { Server, Socket } from 'socket.io';
import { GetWsUser } from 'src/auth/decorator/getWsUser.decorator';
import { UserFromJwtDto } from 'src/auth/dto/userFromJwtDto';
import { AddArticleToListDto } from './dto/addArticleToListDto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
  },
})
export class GroceryGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly groceryService: GroceryService) {}

  afterInit() {
    console.log('Initialized!');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getList')
  async getGroceryList(@MessageBody() groceryListId: string) {
    const groceryList =
      await this.groceryService.getGroceryListById(groceryListId);

    this.server.to(groceryList.name).emit('receiveList', groceryList);
  }

  @SubscribeMessage('joinToList')
  async joinToList(
    @MessageBody() groceryListId: string,
    @ConnectedSocket() socket: Socket,
    @GetWsUser() currentUser: UserFromJwtDto,
  ) {
    const groceryList =
      await this.groceryService.getGroceryListById(groceryListId);

    socket.join(groceryList.name);

    this.server.to(groceryList.name).emit('connectedUser', {
      id: currentUser.userId,
      email: currentUser.email,
    });
  }

  @SubscribeMessage('addArticleToList')
  async addArticleToList(
    @GetWsUser() user: UserFromJwtDto,
    @MessageBody() { categoryId, groceryListId, name }: AddArticleToListDto,
  ) {
    const groceryList =
      await this.groceryService.getGroceryListById(groceryListId);

    const newArticle = await this.groceryService.addArticleToList({
      categoryId,
      groceryListId,
      name,
    });

    this.server.to(groceryList.name).emit('recieveList', [newArticle]);
  }

  @SubscribeMessage('removeArticleFromList')
  async removeArticleFromList(
    @GetWsUser() user: UserFromJwtDto,
    @MessageBody()
    { groceryListId, articleId }: { groceryListId: string; articleId: string },
  ) {
    const groceryList =
      await this.groceryService.getGroceryListById(groceryListId);

    await this.groceryService.deleteArticle({
      articleId,
    });

    // TODO: DO I NEED TO ADD SOMETHING TO ARRAY?
    this.server.to(groceryList.name).emit('recieveList', []);
  }
}
