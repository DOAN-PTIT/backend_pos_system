import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class DebtService {
  constructor(private readonly prisma: PrismaService) {}

  async getListDebts(
    params: {
      page_size: number;
      page: number;
      search?: string;
    },
    shop_id: number,
  ): Promise<any> {
    const { page_size, page, search } = parse_to_int(params);
    const searchCondition: any = [
      { name: { contains: search, mode: 'insensitive' } },
      { supplier: { name: { contains: search, mode: 'insensitive' } } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    const debts = await this.prisma.debt.findMany({
      where: {
        AND: [
          {
            shop_id,
          },
          search ? { OR: searchCondition } : {},
        ],
      },
      take: page_size,
      skip: page_size * (page - 1),
      include: {
        supplier: true,
        purchase: {
          include: {
            items: true,
          },
        },
      },
    });
    const total_entries = await this.prisma.debt.count({
      where: {
        AND: [
          {
            shop_id,
          },
          search ? { OR: searchCondition } : {},
        ],
      },
    });

    return {
      data: debts,
      total_entries,
    };
  }

  async createDebt(params: any, shop_id: number): Promise<any> {
    const { money_must_pay, ...res } = params;
    const debt = await this.prisma.debt.create({
      data: {
        ...res,
        money_must_pay: parse_to_int(money_must_pay),
        shop_id,
      },
    });

    return debt;
  }

  async updateDebt(id: number, shop_id: number, params: any): Promise<any> {
    if (params.status) {
      return await this.prisma.debt.update({
        where: {
          id,
          shop_id,
        },
        data: {
          status: parse_to_int(params.status),
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { supplier, purchase, ...res } = params;

    const existingDebt = await this.prisma.debt.findFirst({
      where: {
        id,
        shop_id,
      },
    });

    if (!existingDebt) {
      throw new BadRequestException('Debt record not found');
    }

    const debt = await this.prisma.debt.update({
      where: {
        id,
        shop_id,
      },
      data: {
        ...res,
        money_must_pay: parse_to_int(params.money_must_pay),
        supplier_id: supplier?.id,
      },
    });

    return debt;
  }

  async getDebtById(id: number, shop_id: number): Promise<any> {
    const debt = await this.prisma.debt.findFirst({
      where: {
        id,
        shop_id,
      },
      include: {
        supplier: true,
        purchase: {
          include: {
            items: true,
          },
        },
      },
    });

    return debt;
  }
}
