import { forwardRef, Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ShopRepository } from './repositories/shop.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/users/repositories/user.repository';
import { CustomerModule } from 'src/customer/customer.module';
import { OrderModule } from 'src/order/order.module';
import { UsersModule } from 'src/users/users.module';
import { ProductService } from 'src/product/product.service';

@Module({
  imports: [
    CloudinaryModule, AuthModule, CustomerModule, OrderModule,
    forwardRef(() => UsersModule)
  ],
  providers: [ShopService, PrismaService, ShopRepository, UserRepository, ProductService],
  controllers: [ShopController],
  exports: [ShopRepository]
})
export class ShopModule {}
