import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getListOrder(params: {
    page: number;
    page_size: number;
    shop_id: number;
  }) {
    const { page, page_size, shop_id } = parse_to_int(params);
    const skip = (page - 1) * page_size;
    const total = await this.prisma.order.count({
      where: {
        shop_id,
      },
    });
    const data = await this.prisma.order.findMany({
      where: {
        shop_id,
      },
      skip,
      take: page_size,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderitems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    return {
      totalEntries: total,
      data,
    };
  }

  async getOrderDetail(params: { id: number; shop_id: number }) {
    const { id, shop_id } = parse_to_int(params);
    return await this.prisma.order.findUnique({
      where: {
        id,
        shop_id,
      },
      include: {
        orderitems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
        shopuser: {
          include: {
            user: true,
          },
        },
        customer: true,
      },
    });
  }

  async updateOrder(id: number, shop_id: number, updateOrder: any) {
    delete updateOrder.id;
    const { orderitems, shopuser, customer, add_customer, ...newOrder } =
      updateOrder;
    const order = await this.prisma.order.findUnique({
      where: {
        id,
        shop_id,
      },
    });
    const orderUpdate = await this.prisma.order.update({
      where: {
        id,
        shop_id,
      },
      data: {
        ...newOrder,
        customer_id: add_customer ? add_customer?.id : order.customer_id,
      },
    });

    await this.prisma.orderItem.deleteMany({
      where: {
        order_id: id,
      },
    });
    await Promise.all(
      orderitems.map((productOrder) => {
        return this.prisma.orderItem.create({
          data: {
            product_id: productOrder.product_id,
            variation_id: productOrder.variation_id,
            order_id: id,
            quantity: productOrder.quantity,
          },
        });
      }),
    );

    return orderUpdate;
  }

  async getOrderstat(shop_id: number) {
    const totalAmount = await this.prisma.order.groupBy({
      by: ['status'],
      _sum: {
        total_cost: true,
      },
      where: {
        shop_id,
      },
    });

    const totalProductDelivered = await this.prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          status: 4,
          shop_id: shop_id,
        },
      },
    });

    const totalProductCanceled = await this.prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          status: -1,
          shop_id: shop_id,
        },
      },
    });

    const totalOrder = await this.prisma.order.count({
      where: {
        shop_id,
      },
    });

    // count retail_price and amount of variation
    const totalVariation = await this.prisma.variation.aggregate({
      where: {
        product: {
          shop_id,
        },
      },
      _sum: {
        retail_price: true,
        amount: true,
      },
    });

    return {
      totalAmount,
      totalProductDelivered,
      totalProductCanceled,
      totalOrder,
      totalVariation,
    };
  }
}
