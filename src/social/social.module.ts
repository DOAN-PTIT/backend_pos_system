import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { SocialService } from './social.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ShopRepository } from 'src/shop/repositories/shop.repository';

@Module({
  imports: [UsersModule],
  controllers: [SocialController],
  providers: [
    FacebookStrategy,
    SocialService,
    UsersService,
    UserRepository,
    PrismaService,
    AuthService,
    JwtService,
    CloudinaryService,
    ShopRepository,
    PrismaService
  ],
})
export class SocialModule {}
