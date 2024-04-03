import { Module } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { GroceryController } from './grocery.controller';
import { DatabaseService } from 'src/database/database.service';
import { GroceryGateway } from './grocery.gateway';

@Module({
  controllers: [GroceryController], // all controllers defined in this module which have to be instantiated
  providers: [GroceryService, DatabaseService, GroceryGateway], //  all providers may be shared at least across this module
  imports: [], // all of imported modules that export the providers which are required in this module
  exports: [GroceryService], // all of providers that are provided by this module and should
  //   be available in other modules which import this module.
})
export class GroceryModule {}
