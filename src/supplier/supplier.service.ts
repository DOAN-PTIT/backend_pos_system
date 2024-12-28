import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupplier(data: any): Promise<any> {
    const { shop_id, ...supplier } = data;
    const existSupplier = await this.prisma.supplier.findFirst({
      where: {
        shop_id: parse_to_int(shop_id),
        OR: [
          {
            name: supplier.name,
          },
          {
            supplier_code: supplier.supplier_code,
          },
        ],
      },
    });

    if (existSupplier) {
      throw new BadRequestException('Nhà cung cấp đã tồn tại');
    }

    return await this.prisma.supplier.create({
      data: {
        shop: {
          connect: {
            id: shop_id,
          },
        },
        ...supplier,
      },
    });
  }

  async getListSupplier(params: any): Promise<any> {
    const { shop_id, page, page_size, search } = parse_to_int(params);
    const skip = (page - 1) * page_size;
    const take = page_size;
    const searchCondition: any = [
      {
        name: { contains: search, mode: 'insensitive' },
      },
      {
        supplier_code: { contains: search, mode: 'insensitive' },
      },
      {
        phone_number: { contains: search, mode: 'insensitive' },
      },
    ];
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        AND: [
          {
            shop_id,
          },
          search
            ? {
                OR: searchCondition,
              }
            : {},
        ],
      },
      skip,
      take,
    });

    const total_entries = await this.prisma.supplier.count({
      where: {
        AND: [
          {
            shop_id,
          },
          search
            ? {
                OR: searchCondition,
              }
            : {},
        ],
      },
    });

    return {
      data: suppliers,
      total_entries,
    };
  }

  async getSupplierById(id: number, shop_id: number): Promise<any> {
    return await this.prisma.supplier.findUnique({
      where: {
        id: parse_to_int(id),
        shop_id: parse_to_int(shop_id),
      },
    });
  }

  async updateSupplier(id: number, shop_id: number, data: any): Promise<any> {
    return await this.prisma.supplier.update({
      where: {
        id: parse_to_int(id),
        shop_id: parse_to_int(shop_id),
      },
      data,
    });
  }
}
