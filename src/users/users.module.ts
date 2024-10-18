import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [AuthModule],
  providers: [UsersService, PrismaService, UserRepository, JwtService, AuthService],
  controllers: [UsersController]
})
export class UsersModule {}
