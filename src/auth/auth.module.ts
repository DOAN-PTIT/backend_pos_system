import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { PrismaService } from 'src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  providers: [
    AuthService, 
    PrismaService, 
    UsersService, 
    UserRepository, 
    JwtService,
    CloudinaryService
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtService]
})
export class AuthModule {}
