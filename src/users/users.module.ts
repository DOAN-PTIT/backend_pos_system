import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  providers: [UsersService, PrismaService, UserRepository],
  controllers: [UsersController]
})
export class UsersModule {}
