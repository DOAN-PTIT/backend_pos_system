import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';
import { UpdateOrderDto } from './dto/update-order.dto';

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

	async updateOrder (id: number, updateOrder: UpdateOrderDto) {
		return await this.prisma.order.update({
			where: { id },
			data: updateOrder
		})
	}
}
