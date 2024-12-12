import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

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

  async removeProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateProduct(product_id: number, shop_id: number, params: any) {
    const { variations, id, ...product } = params;
    const newProduct = await this.prisma.product.update({
      where: {
        id: product_id,
        shop_id,
      },
      data: product,
    });

    // remove all variations, then add new variations
    await this.prisma.variation.deleteMany({
      where: {
        product_id,
      },
    });

    if (variations?.length > 0) {
      const newVariations = variations.map((v) => {
        return parse_to_int({
          ...v,
          product_id,
        });
      });

      await this.prisma.variation.createMany({
        data: newVariations,
      });
    }

    return newProduct;
  }
}
