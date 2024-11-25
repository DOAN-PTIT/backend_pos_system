import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findByEmailOrPhoneNumberForShop(
    shopId: number,
    email: string,
    phoneNumber: string,
  ): Promise<any> {
    return await this.prisma.customer.findFirst({
      where: {
        AND: [
          {
            shopcustomers: { some: { shop_id: shopId } },
          },
          {
            OR: [{ email: email }, { phone_number: phoneNumber }],
          },
        ],
      },
    });
  }

  async searchCustomer(params: {
    shopId: string;
    searchTerm: string;
    field?: 'name' | 'email' | 'phone_number';
  }): Promise<any> {
    const { shopId: shopIdParams, searchTerm, field } = params;
    const shopId = parse_to_int(shopIdParams);

    const searchConfig = { contains: searchTerm, mode: 'insensitive' as const };
    const baseCondition = {
      shopcustomers: { some: { shop_id: shopId } },
    };

    const fieldSearchMap = {
      name: { name: searchConfig },
      email: { email: searchConfig },
      phone_number: { phone_number: searchConfig },
    };

    return this.prisma.customer.findMany({
      where: {
        AND: [
          baseCondition,
          field
            ? fieldSearchMap[field]
            : {
                OR: [
                  { name: searchConfig },
                  { email: searchConfig },
                  { phone_number: searchConfig },
                ],
              },
        ],
      },
    });
  }
}
