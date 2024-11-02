import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CustomerService {

    constructor (
        private prisma: PrismaService
    ) {}

    async findByEmailOrPhoneNumberForShop (shopId: number, email: string, phoneNumber: string): Promise<any> {
        return await this.prisma.customer.findFirst({
            where: {
                AND: [
                    { 
                        shopcustomers: {some: {shop_id: shopId}}
                    },
                    {
                        OR: [
                            { email: email },
                            { phone_number: phoneNumber }
                        ]
                    }
                ]
            }
        })
    }

}
