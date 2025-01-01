import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { parse_to_int } from 'src/utils/tools';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProduct(id: string, shop_id: number) {
    return await this.prisma.product.findUnique({
      where: {
        product_code: id,
        shop_id,
      },
      include: {
        variations: true,
        suppliers_products: {
            include: {
                supplier: true
            }
        }
      },
    });
  }

  async removeProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

    async updateProduct(updateProductDto: UpdateProductDto) {
        const foundProduct = await this.prisma.product.findUnique({
            where: { id: updateProductDto.id }
        })
        if (!foundProduct) {
            throw new BadRequestException('Product not found')
        }

        // find supplier
        const suppliers_products = await this.prisma.supplier.findMany({
            where: {
                id: {
                    in: updateProductDto.suppliers_products_ids
                }
            }
        })

        const updatedProduct = await this.prisma.product.update({
            where: { id: updateProductDto.id },
            data: {
                name: updateProductDto.name ?? foundProduct.name,
                description: updateProductDto.description ?? foundProduct.description,
                note: updateProductDto.note ?? foundProduct.note,
                product_code: updateProductDto.product_code ?? foundProduct.product_code,
                categories_id: updateProductDto.categories_id ?? foundProduct.categories_id,
            }
        })

        if (updatedProduct) {
            await this.prisma.supplierProducts.deleteMany({
                where: {
                        product_id: updatedProduct.id
                }
                }) 

            // add new supplier product
            await Promise.all(
                suppliers_products.map(async (supplier) => {
                    return this.prisma.supplierProducts.create({
                        data: {
                            product_id: updatedProduct.id,
                            supplier_id: supplier.id
                        }
                    })
                })
            )
        }

        const variations = updateProductDto.variations
        const updatedVariations = await Promise.all(
            variations.map(async (variation) => {
                // filter remove object field null or undefined
                const {
                    createdAt,
                    updatedAt,
                    ...filteredData
                } = Object.fromEntries(
                    Object.entries(variation).filter(([_, value]) => value !== undefined && value !== null)
                );

                if (variation.id) {
                    return this.prisma.variation.update({
                        where: { id: variation.id },
                        data: filteredData
                    })
                } else {
                    return this.prisma.variation.create({
                        data: {
                            ...filteredData as any,
                            product_id: updateProductDto.id as number
                        }
                    })
                }
            })
        )

        // remove variation
        const delete_variation_ids = updateProductDto.delete_variation_ids
        if (delete_variation_ids && delete_variation_ids?.length > 0) {
            await Promise.all(
                delete_variation_ids.map(async (id) => {
                    return this.prisma.variation.delete({
                        where: { id }
                    })
                })
            )
        }

        return {
            ...updatedProduct,
            variations: updatedVariations
        }
    }
}
