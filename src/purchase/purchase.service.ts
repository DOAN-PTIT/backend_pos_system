import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async createPurchase(data: any): Promise<any> {
    const { shop_id, items, supplier_id, shop_user_id, ...purchase } = data;
    const discount: number = parse_to_int(purchase.discount);
    const shipping_fee: number = parse_to_int(purchase.shipping_fee);

    const supplier = await this.prisma.supplier.findUnique({
      where: {
        id: supplier_id || 0,
        shop_id,
      },
    });

    const creator = await this.prisma.shopUser.findFirst({
      where: {
        user_id: shop_user_id || 0,
        shop_id,
      },
    });

    const newPurchase = await this.prisma.purchases.create({
      data: {
        shop: {
          connect: {
            id: shop_id,
          },
        },
        discount,
        shipping_fee,
        total_price: parseInt(purchase.total_price),
        supplier: supplier ? { connect: { id: supplier.id } } : undefined,
        shop_user: creator ? { connect: { id: creator.id } } : undefined,
        ...purchase,
      },
    });

    if (items?.length > 0) {
      const purchaseItems = items.map((item: any) => {
        return {
          purchase_id: newPurchase.id,
          variation_id: item.variation.id,
          quantity: parse_to_int(item.quantity),
          imported_price: parse_to_int(item.imported_price),
        };
      });

      await this.prisma.purchaseItem.createMany({
        data: purchaseItems,
      });
    }

    return newPurchase;
  }

  async getListPurchase(params: any): Promise<any> {
    const { shop_id, page, page_size } = parse_to_int(params);
    const skip = (page - 1) * page_size;
    const take = page_size;
    const purchases = await this.prisma.purchases.findMany({
      where: {
        shop_id,
      },
      include: {
        items: {
          include: {
            variation: true,
          },
        },
        supplier: true,
        shop_user: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
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

  async getPurchaseDetail(shop_id: number, id: number): Promise<any> {
    const purchase = await this.prisma.purchases.findUnique({
      where: {
        id,
        shop_id,
      },
      include: {
        items: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
        supplier: true,
        shop_user: {
          include: {
            user: true,
          },
        },
      },
    });

    return purchase;
  }

  async updatePurchase(shop_id: number, id: number, data: any): Promise<any> {
    if (data.status) {
      return await this.prisma.purchases.update({
        where: {
          id,
          shop_id,
        },
        data: {
          status: parse_to_int(data.status),
        },
      });
    }
    const { items, supplier_id, shop_user_id, ...purchase } = data;
    delete purchase.id;
    delete purchase.shop_id;
    const discount: number = parse_to_int(purchase.discount);
    const shipping_fee: number = parse_to_int(purchase.shipping_fee);

    const supplier = await this.prisma.supplier.findUnique({
      where: {
        id: supplier_id || 0,
        shop_id,
      },
    });

    const shop_user = await this.prisma.shopUser.findFirst({
      where: {
        shop_id,
        user_id: shop_user_id || 0,
      },
    });

    const updatedPurchase = await this.prisma.purchases.update({
      where: {
        id,
        shop_id,
      },
      data: {
        ...purchase,
        shop: {
          connect: {
            id: shop_id,
          },
        },
        discount,
        shipping_fee,
        total_price: parseInt(purchase.total_price),
        supplier: supplier ? { connect: { id: supplier.id } } : undefined,
        shop_user: shop_user ? { connect: { id: shop_user.id } } : undefined,
      },
    });

    if (items?.length > 0) {
      const purchaseItems = items.map((item: any) => {
        return {
          purchase_id: updatedPurchase.id,
          variation_id: item.variation.id,
          quantity: parse_to_int(item.quantity),
          imported_price: parse_to_int(item.imported_price),
        };
      });

      await this.prisma.purchaseItem.deleteMany({
        where: {
          purchase_id: updatedPurchase.id,
        },
      });

      await this.prisma.purchaseItem.createMany({
        data: purchaseItems,
      });
    }

    return updatedPurchase;
  }
}
