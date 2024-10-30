import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleShop } from './role.shop.enum';
import { ROLES_SHOP_KEY } from './role.shop.decorator';
import { PrismaService } from '../../database/prisma.service';
import { ShopRepository } from 'src/shop/repositories/shop.repository';

@Injectable()
export class RolesShopGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
        private shopRepository: ShopRepository
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<RoleShop[]>(ROLES_SHOP_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { user } = request;
        const shopId = Number(request.params.shopId);

        // check shop existed?
        const foundShop = await this.shopRepository.findShopById(shopId)
        if (!foundShop) throw new BadRequestException('Shop not found or no longger exist')
        
        // check role in shop
        const shopUser = await this.prisma.shopUser.findFirst({
            where: { 
                user_id: user.id,
                shop_id: shopId
            }
        })

        if (!shopUser || !requiredRoles.includes(shopUser.role as RoleShop)) {
            throw new ForbiddenException('Access denied for this shop role');
        }
      
        return true;
    }
}
