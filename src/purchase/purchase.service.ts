import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async createPurchase(data: any): Promise<any> {
    const { shop_id, ...purchase } = data;
    return await this.prisma.purchases.create({
      data: {
        shop: {
          connect: {
            id: shop_id,
          },
        },
        ...purchase,
      },
    });
  }

  async getListPurchase(params: any): Promise<any> {
    const { shop_id, page, page_size } = params;
    const skip = (page - 1) * page_size;
    const take = page_size;
    const purchases = await this.prisma.purchases.findMany({
      where: {
        shop_id,
      },
      skip,
      take,
    });

    const total_entries = await this.prisma.purchases.count({
      where: {
        shop_id,
      },
    });

    return {
      data: purchases,
      total_entries,
    };
  }
}
