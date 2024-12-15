import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  async getListPromotion(params: {
    page: number;
    page_size: number;
    shop_id: number;
  }) {
    const { page, page_size, shop_id } = parse_to_int(params);
    const skip = (page - 1) * page_size;
    const total = await this.prisma.promotion.count();
    const data = await this.prisma.promotion.findMany({
      skip,
      take: page_size,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        shop_id,
      },
    });

    return {
      totalEntries: total,
      data: data.map((item: any) => {
        return {
          ...item,
          condition: JSON.parse(item.condition as any),
          order_range: JSON.parse(item.order_range as any),
        };
      }),
    };
  }

  async getPromotionDetail(params: { id: number; shop_id: number }) {
    const { id, shop_id } = params;
    const promotion = await this.prisma.promotion.findUnique({
      where: {
        id,
        shop_id,
      },
      include: {
        promotion_items: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return {
      ...promotion,
      condition: JSON.parse(promotion.condition as any),
      order_range: JSON.parse(promotion.order_range as any),
    };
  }

  async createPromotion(params: {
    promotion_items: any[];
    shop_id: number;
    name: string;
    start_date: Date; // has format: "2024-12-14"
    due_date: Date; // has format: "2024-12-14"
    condition: any;
    order_range: any;
    type: string;
  }) {
    const {
      promotion_items,
      shop_id,
      name,
      start_date,
      due_date,
      condition,
      order_range,
      type,
    } = params;

    // check promotion has same name
    const promotionExist = await this.prisma.promotion.findFirst({
      where: {
        name,
        shop_id,
      },
    });
    if (promotionExist) {
      throw new BadRequestException('Tên chương trình khuyến mãi đã tồn tại');
    }

    // check variation is exist in anothor promotion item
    if (promotion_items) {
      const variation_ids = promotion_items.map(
        (item: any) => item.variation.id,
      );
      const promotionItem = await this.prisma.promotionItem.findMany({
        where: {
          variation_id: {
            in: variation_ids,
          },
        },
        include: {
          variation: {
            include: {
              product: true,
            },
          },
        },
      });

      if (promotionItem && promotionItem?.length) {
        const listVariationExistName = promotionItem.map((item: any) => {
          return `${item.variation.product.name} - ${item.variation.variation_code}`;
        });
        throw new BadRequestException(
          `Sản phẩm ${listVariationExistName.join('; ')} đã tồn tại trong chương trình khuyến mãi khác`,
        );
      }
    }

    const promotion = await this.prisma.promotion.create({
      data: {
        shop_id,
        name,
        status: 1,
        start_date: new Date(start_date),
        due_date: new Date(due_date),
        condition: JSON.stringify(condition),
        type: parse_to_int(type),
        order_range: JSON.stringify(order_range),
      },
    });

    if (promotion_items.length > 0) {
      const promotionItems = promotion_items.map((item: any) => {
        return {
          promotion_id: promotion.id,
          variation_id: item.variation.id,
          discount: parseInt(item.discount),
          max_discount: parseInt(item.max_discount),
          is_discount_percent: item.is_discount_percent,
        };
      });

      await Promise.all(
        promotionItems.map((item: any) => {
          return this.prisma.promotionItem.create({
            data: item,
          });
        }),
      );
    }

    return promotion;
  }

  async findPromotionCanBeActive(params: any) {
    const { shop_id, order_total, total_price, type } = params;
    const promotions = await this.prisma.promotion.findMany({
      where: {
        shop_id,
        type: parseInt(type),
        status: 1,
        start_date: {
          lte: new Date(),
        },
        due_date: {
          gte: new Date(),
        },
      },
    });

    const promotionCanBeActive = promotions
      .filter((promotion: any) => {
        const orderRange = JSON.parse(promotion.order_range);
        const condition = JSON.parse(promotion.condition);
        if (
          parseInt(total_price) >= orderRange.min_value &&
          parseInt(total_price) <= orderRange.max_value &&
          parseInt(order_total) >= parseInt(condition.order_quantity)
        ) {
          return true;
        }
        return false;
      })
      .map((item: any) => {
        return {
          ...item,
          condition: JSON.parse(item.condition as any),
          order_range: JSON.parse(item.order_range as any),
        };
      });

    return promotionCanBeActive;
  }
}
