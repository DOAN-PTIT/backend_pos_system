import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ShopModule } from 'src/shop/shop.module';
import { ShopService } from 'src/shop/shop.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [AuthModule, ShopModule, CloudinaryModule, CustomerModule],
  providers: [
    UsersService, 
    PrismaService, 
    UserRepository, 
    JwtService, 
    AuthService, 
    ShopService,
  ],
  controllers: [UsersController]
})
export class UsersModule {}
