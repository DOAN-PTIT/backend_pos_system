import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProductService {

    constructor (
        private prisma: PrismaService
    ) {}

    async removeProduct (id: number) {
        return this.prisma.product.delete({
            where: { id },
        })
    }

}
