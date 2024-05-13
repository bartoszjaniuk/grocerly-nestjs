import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { DatabaseService } from 'src/database/database.service';
import { GroceryService } from 'src/grocery/grocery.service';
import { InviteController } from './invite.controller';

@Module({
  controllers: [InviteController], // all controllers defined in this module which have to be instantiated
  providers: [InviteService, DatabaseService, GroceryService], //  all providers may be shared at least across this module
  imports: [], // all of imported modules that export the providers which are required in this module
  exports: [InviteService], // all of providers that are provided by this module and should
  //   be available in other modules which import this module.
})
export class InviteModule {}
