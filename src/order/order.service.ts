import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';
import { OrderStatus } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getListOrder(params: {
    page: number;
    page_size: number;
    shop_id: number;
    search?: string;
  }) {
    const { page, page_size, shop_id } = parse_to_int(params);
    const search = params.search ? params.search.trim().toString() : '';
    const skip = (page - 1) * page_size;

    const searchCondition: any = [
      {
        orderitems: {
          some: {
            variation: {
              product: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
      {
        customer: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ];
    const total = await this.prisma.order.count({
      where: {
        AND: [{ shop_id }, search ? { OR: searchCondition } : {}],
      },
    });

    const data = await this.prisma.order.findMany({
      where: {
        AND: [{ shop_id }, search ? { OR: searchCondition } : {}],
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
    if (order?.promotion) {
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
    delete updateOrder.shop_id;
    const order = await this.prisma.order.findUnique({
      where: {
        id,
        shop_id,
      },
    });
    const {
      orderitems,
      customer,
      add_customer,
      shop_delivery_company_id,
      promotion_id,
      customer_id,
      shopuser_id,
      createdAt,
      ...newOrder
    } = updateOrder;
    const findCustomer = await this.prisma.customer.findFirst({
      where: {
        id: add_customer?.id || customer_id,
        shopcustomers: { some: { shop_id } },
      },
    });

    console.log(findCustomer);
    if (updateOrder.status && updateOrder.is_update_status) {
      if (updateOrder.status == 4) {
        const newCustomer = await this.prisma.customer.update({
          where: { id: findCustomer.id },
          data: { last_purchase: new Date() },
        });

        console.log(newCustomer);
      }
      return await this.prisma.order.update({
        where: {
          id,
          shop_id,
        },
        data: {
          status: parse_to_int(updateOrder.status),
        },
      });
    }

    const findShopUser = await this.prisma.shopUser.findUnique({
      where: { id: shopuser_id, shop_id },
    });
    const findPromotion = promotion_id
      ? await this.prisma.promotion.findUnique({
          where: { id: promotion_id, shop_id },
        })
      : null;
    const findShopDeliveryCompany = shop_delivery_company_id
      ? await this.prisma.shopDeliveryCompany.findUnique({
          where: { id: shop_delivery_company_id, shop_id },
        })
      : null;

    const orderUpdate = await this.prisma.order.update({
      where: {
        id,
        shop_id,
      },
      data: {
        ...newOrder,
        createdAt: new Date(createdAt),
        customer: findCustomer
          ? { connect: { id: findCustomer.id } }
          : {
              create: {
                name: add_customer.name,
                phone_number: add_customer.phone_number,
                email: add_customer.email,
                address: add_customer.address,
                shopcustomers: {
                  create: {
                    shop_id,
                  },
                },
              },
            },
        shopuser: {
          connect: {
            id: findShopUser.id,
          },
        },
        shop_delivery_company: findShopDeliveryCompany
          ? { connect: { id: findShopDeliveryCompany.id } }
          : undefined,
        promotion: findPromotion
          ? { connect: { id: findPromotion.id } }
          : undefined,
      },
    });

    // update customer last_purchase
    const foundCustomer = await this.prisma.customer.findUnique({
      where: { id: order.customer_id },
    });
    if (foundCustomer && orderUpdate.status === OrderStatus.DELIVERED) {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { last_purchase: orderUpdate.updatedAt },
      });
    }

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

  async getDayChart(shop_id: number) {
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

    const counter = totalAmount.filter((item) => item.at_counter === true);
    const online = totalAmount.filter((item) => item.at_counter === false);

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
          lte: today,
        },
      },
      _count: {
        createdAt: true,
      },
      _sum: {
        total_cost: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
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
        }),
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
          amount:
            (online[0]?._sum?.total_cost || 0) +
            (counter[0]?._sum?.total_cost || 0),
          order:
            (online[0]?._count?.at_counter || 0) +
            (counter[0]?._count?.at_counter || 0),
        },
        online: {
          amount: online[0]?._sum?.total_cost || 0,
          order: online[0]?._count?.at_counter || 0,
        },
        counter: {
          amount: counter[0]?._sum?.total_cost || 0,
          order: counter[0]?._count?.at_counter || 0,
        },
      },
      chart: {
        labels,
        data,
      },
    };
  }

  async getProductStats(shop_id: number) {
    // get shop products
    const productStats = await this.prisma.product.findMany({
      where: { shop_id },
      include: {
        variations: {
          include: {
            orderitems: {
              include: {
                order: true, // Join sang bảng Order
              },
            },
          },
        },
      },
    });

    const result = productStats.map((product) => {
      let totalRevenue = 0;
      let totalOrders = 0;
      let variationDetails = product.variations.map((variation) => {
        const relevantOrderItems = variation.orderitems.filter(
          (item) => item.order && item.order.status === 4, // Chỉ tính đơn hoàn thành
        );

        const variationRevenue = relevantOrderItems.reduce((sum, item) => {
          const price = item.order?.at_counter
            ? variation.price_at_counter // Giá tại quầy
            : variation.retail_price; // Giá online
          return sum + item.quantity * price;
        }, 0);

        totalRevenue += variationRevenue;
        totalOrders += new Set(relevantOrderItems.map((item) => item.order_id))
          .size;

        return {
          variation_id: variation.id,
          variation_code: variation.variation_code,
          revenue: variationRevenue,
          total_quantity: relevantOrderItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
        };
      });

      variationDetails = variationDetails.filter(
        (variation) => variation.revenue > 0,
      );

      return {
        product_id: product.id,
        product_name: product.name,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        variations: variationDetails,
      };
    });

    return result.filter(
      (product) => product.total_revenue > 0 || product.total_orders > 0,
    );
  }

  async getEmployeeStats(shop_id: number) {
    const employeesRevenue = await this.prisma.shopUser.findMany({
      where: { shop_id },
      include: {
        user: true, // Lấy thông tin tên và email của nhân viên
        orders: {
          where: { status: 4 }, // Chỉ lấy đơn hoàn thành
          include: {
            orderitems: {
              include: {
                variation: true, // Lấy giá bán từ Variation
              },
            },
          },
        },
      },
    });

    const result = employeesRevenue.map((employee) => {
      let totalRevenue = 0;
      let totalOrders = employee.orders.length;

      employee.orders.forEach((order) => {
        order.orderitems.forEach((item) => {
          const price = order.at_counter
            ? item.variation?.price_at_counter // Giá bán tại quầy
            : item.variation?.retail_price; // Giá bán online
          totalRevenue += (item.quantity || 0) * (price || 0);
        });
      });

      return {
        shopUser_id: employee.id,
        name: employee.user?.name || 'N/A', // Tên nhân viên
        email: employee.user?.email || 'N/A', // Email nhân viên
        role: employee.role,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
      };
    });

    return result;
  }

  async getTodayRevenueStats(shop_id: number) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalRevenueAndOrders,
      newOrdersCount,
      canceledOrdersCount,
      totalQuantitySold,
      newCustomersCount,
    ] = await Promise.all([
      // Tổng doanh thu và số lượng đơn chốt
      this.prisma.order.groupBy({
        by: ['at_counter'],
        where: {
          shop_id,
          status: 4, // Đơn hàng chốt
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: { total_cost: true },
        _count: { id: true },
      }),
      // Số lượng đơn tạo mới
      this.prisma.order.count({
        where: {
          shop_id,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Số lượng đơn bị hủy
      this.prisma.order.count({
        where: {
          shop_id,
          status: -1,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Số lượng hàng bán ra
      this.prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
          order: {
            shop_id,
            status: 4,
            createdAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      }),
      // Số khách hàng mới
      this.prisma.customer.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          shopcustomers: {
            some: { shop_id },
          },
        },
      }),
    ]);

    const totalRevenueOnline =
      totalRevenueAndOrders.find((item) => !item.at_counter)?._sum
        ?.total_cost || 0;
    const totalRevenueAtCounter =
      totalRevenueAndOrders.find((item) => item.at_counter)?._sum?.total_cost ||
      0;
    const totalOrdersOnline =
      totalRevenueAndOrders.find((item) => !item.at_counter)?._count?.id || 0;
    const totalOrdersAtCounter =
      totalRevenueAndOrders.find((item) => item.at_counter)?._count?.id || 0;

    return {
      totalRevenueOnline,
      totalOrdersOnline,
      totalRevenueAtCounter,
      totalOrdersAtCounter,
      newOrdersCount,
      canceledOrdersCount,
      totalQuantitySold: totalQuantitySold._sum.quantity || 0,
      newCustomersCount,
    };
  }
}
