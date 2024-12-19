import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/database/prisma.service'
import { Shop } from '@prisma/client'

@Injectable()
export class ShopRepository {
    
    constructor(
        private prisma: PrismaService,
    ) {}

    async findShopOfUserByShopName(shopName: string, userId: number): Promise<any> {
        try {
            const shop = await this.prisma.shop.findFirst({
                where: { 
                    AND: [
                        { name: { equals: shopName, mode: 'insensitive' } },
                        { shopusers: { some: { user_id: userId } } },          
                    ],
                }
            })

            return shop
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot get shops by user id')
        }
    }

    async findShopByUserId(userId: number): Promise<any> {
        let shops: any
        try {
            shops = await this.prisma.shop.findMany({
                where: {
                    shopusers: {
                    some: {
                      user_id: userId,
                    },
                  },
                },
            })
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot get shops by user id')
        }

        return shops
    }

    async findShopById(shopId: number): Promise<Shop> {
        try {
            const shop: Shop = await this.prisma.shop.findUnique({
                where: {id: shopId},
                include: {
                    suppliers: true,
                }
            })

            return shop
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Shop not found')
        }
    }

}