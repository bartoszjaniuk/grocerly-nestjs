import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  exports: [UserService],
  providers: [DatabaseService, UserService],
  controllers: [UserController],
})
export class UserModule {}
