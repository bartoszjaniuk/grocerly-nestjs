import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserService } from './user.service';

@Module({
  imports: [],
  exports: [UserService],
  providers: [DatabaseService],
  controllers: [],
})
export class UserModule {}
