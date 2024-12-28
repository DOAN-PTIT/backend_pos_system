import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ShopPartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getNonActivePartners(shop_id: number) {
    return this.prisma.deliveryCompany.findMany();
  }

  async getActivePartners(shop_id: number) {
    return this.prisma.shopDeliveryCompany.findMany({
      where: {
        shop_id: shop_id,
        is_active: true,
      },
      include: {
        delivery_company: true,
      },
    });
  }

  async handleActivePartner(params: any) {
    const { shop_id, delivery_company_id, price } = params;
    return await this.prisma.shopDeliveryCompany.create({
      data: {
        shop_id: shop_id,
        delivery_company_id: delivery_company_id,
        price: parseInt(price),
        is_active: true,
      },
    });
  }

  async handleNonActivePartner(shop_delivery_company_id: any) {
    const findShopDeliveryCompany =
      await this.prisma.shopDeliveryCompany.findFirst({
        where: {
          id: parseInt(shop_delivery_company_id),
        },
      });
    if (findShopDeliveryCompany) {
      return await this.prisma.shopDeliveryCompany.delete({
        where: {
          id: findShopDeliveryCompany.id,
        },
      });
    } else {
      throw new BadRequestException('Delivery company not found');
    }
  }

  async updatePrice(params: any) {
    const { shop_delivery_company_id, price, shop_id } = params;
    return await this.prisma.shopDeliveryCompany.update({
      where: {
        id: parseInt(shop_delivery_company_id),
        shop_id: shop_id,
      },
      data: {
        price: parseInt(price),
      },
    });
  }
}
