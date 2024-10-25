import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ShopRepository } from './repositories/shop.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CloudinaryModule, AuthModule],
  providers: [ShopService, PrismaService, ShopRepository],
  controllers: [ShopController],
  exports: [ShopRepository]
})
export class ShopModule {}
