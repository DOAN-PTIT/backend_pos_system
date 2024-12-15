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
        promotion: true,
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
    const order = await this.prisma.order.findUnique({
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
                promotion_item: true,
              },
            },
          },
        },
        promotion: true,
        shopuser: {
          include: {
            user: true,
          },
        },
        customer: true,
      },
    });

    // parse promotion
    if (order.promotion) {
      order.promotion = {
        ...order.promotion,
        condition: JSON.parse(order.promotion.condition as string),
        order_range: JSON.parse(order.promotion.order_range as string),
      };
    }

    return order;
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

    async getDayChart (shop_id: number) {
        const totalAmount = await this.prisma.order.groupBy({
            by: ['at_counter'],
            _sum: {
                total_cost: true,
            },
            _count: {
                at_counter: true,
            },
            where: {
                shop_id,
                status: 4,
            },
        }); 

        const counter = totalAmount.filter(item => item.at_counter === true);
        const online = totalAmount.filter(item => item.at_counter === false);

        const today = new Date();
        const sevenDaysBefore = new Date(today);
        sevenDaysBefore.setDate(today.getDate() - 7);

        const dataChart = await this.prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                shop_id: shop_id,
                status: 4,
                createdAt: {
                    gte: sevenDaysBefore,
                    lte: today
                }
            },
            _count: {
                createdAt: true,
            },
            _sum: {
                total_cost: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        
        const sevenDates = [];
        let currentDate = new Date(sevenDaysBefore);
        while (currentDate <= today) {
            sevenDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const labels = [];
        const data = [];

        sevenDates.forEach((date) => {
            const dateKey = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
          
            labels.push(
                date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
            );
          
            const found = dataChart.find((item) => {
                const itemDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                return itemDate === dateKey;
            });
          
            data.push(found?._sum?.total_cost || 0);
        });

        return {
            box: {
                total: {
                    amount: online[0]._sum.total_cost + counter[0]._sum.total_cost,
                    order: online[0]._count.at_counter + counter[0]._count.at_counter
                },
                online: {
                    amount: online[0]._sum.total_cost,
                    order: online[0]._count.at_counter,
                },
                counter: {
                    amount: counter[0]._sum.total_cost,
                    order: counter[0]._count.at_counter,
                },
            },
            chart: {
                labels,
                data,
            }
        }
    }
}
