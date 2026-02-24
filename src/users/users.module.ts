import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesModule } from '../roles/roles.module';
import { UsersController } from './users.controller';

@Module({
  imports: [RolesModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
