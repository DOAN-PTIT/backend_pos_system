import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ShopRepository } from './repositories/shop.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [ShopService, PrismaService, ShopRepository,],
  controllers: [ShopController],
  exports: [ShopRepository]
})
export class ShopModule {}
