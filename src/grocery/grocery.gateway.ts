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
import { NotFoundException, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guard/ws.guard';
import { CreateGroceryListDto } from './dto/createGroceryListDto';
import { UpdateGroceryListDto } from './dto/updateGroceryListDto';

@WebSocketGateway({
  cors: {
    origin: ['exp://192.168.0.13:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
  },
})
@UseGuards(WsAuthGuard)
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

  @SubscribeMessage('getUserLists')
  async getGroceryLists(
    @GetWsUser() user: UserFromJwtDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const groceryList = await this.groceryService.getUserLists(user.userId);

    socket.emit('receiveUserLists', groceryList);
  }

  @SubscribeMessage('addNewList')
  async addNewList(
    @GetWsUser() user: UserFromJwtDto,
    @ConnectedSocket() socket: Socket,
    @MessageBody() { articles, name }: CreateGroceryListDto,
  ) {
    const newGroceryList = await this.groceryService.createGroceryList({
      articles,
      name,
      userId: user.userId,
    });
    socket.emit('updateList', [newGroceryList.groceryList]);
  }

  @SubscribeMessage('updateExistingList')
  async updateList(
    @GetWsUser() user: UserFromJwtDto,

    @ConnectedSocket() socket: Socket,
    @MessageBody() { articles, listId }: UpdateGroceryListDto,
  ) {
    const groceryList = await this.groceryService.getGroceryListById(
      listId,
      user.userId,
    );

    if (!groceryList) throw new NotFoundException('Nie znaleziono listy');

    const articlesWithoutRepetitions = articles.filter(
      (newArticle) =>
        !groceryList.articles.some(
          (prevArticle) => prevArticle.name === newArticle.name,
        ),
    );

    const newGroceryList = await this.groceryService.updateGroceryList({
      articles: articlesWithoutRepetitions,
      listId,
    });

    socket.emit('receiveList', newGroceryList.articles);
  }

  @SubscribeMessage('getList')
  async getGroceryList(
    @GetWsUser() user: UserFromJwtDto,
    @MessageBody() groceryListId: string,
  ) {
    const groceryList = await this.groceryService.getGroceryListById(
      groceryListId,
      user.userId,
    );

    this.server.to(groceryList.name).emit('receiveList', groceryList);
  }

  @SubscribeMessage('joinToList')
  async joinToList(
    @MessageBody() groceryListId: string,
    @ConnectedSocket() socket: Socket,
    @GetWsUser() currentUser: UserFromJwtDto,
  ) {
    const groceryList = await this.groceryService.getGroceryListById(
      groceryListId,
      currentUser.userId,
    );

    socket.join(groceryList.name);
    socket.emit('receiveList', groceryList.articles);
    // this.server.to(groceryList.name).emit('receiveList', groceryList.articles);

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
    const groceryList = await this.groceryService.getGroceryListById(
      groceryListId,
      user.userId,
    );

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
    const groceryList = await this.groceryService.getGroceryListById(
      groceryListId,
      user.userId,
    );

    await this.groceryService.deleteArticle({
      articleId,
    });

    this.server
      .to(groceryList.name)
      .emit('removedArticle', { articleId, groceryListId });
  }

  @SubscribeMessage('removeList')
  async removeList(
    @MessageBody() groceryListId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.groceryService.removeList(groceryListId);
    socket.emit('deleteList', groceryListId);
  }
}
