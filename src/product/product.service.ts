import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProduct(id: string, shop_id: number) {
    return await this.prisma.product.findUnique({
      where: {
        product_code: id,
        shop_id,
      },
      include: {
        variations: true,
      },
    });
  }

    async removeProduct (id: number) {
        return this.prisma.product.delete({
            where: { id },
        })
    }

}
