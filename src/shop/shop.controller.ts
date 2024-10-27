import { CreateShopDto } from './dto/create-shop.dto';
import { 
    Controller,
    UseGuards,
    Get,
    Req,
    Body,
    Post,
    Param
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Request, Response } from 'express';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { ShopService } from './shop.service';
import { GetProductsDto } from './dto/get-products.dto';

@Controller('shop')
@UseGuards(AuthGuard, RolesGuard)
export class ShopController {

    constructor (
        private shopService: ShopService,
    ) {}

    @Roles(Role.Admin)
    @Post('products')
    async getProducts (@Body() getProductsDto: GetProductsDto): Promise<any> {
        const { shopId } = getProductsDto
        return await this.shopService.getProductsShopById(shopId);
    }

    @Roles(Role.Admin, Role.User)
    @Get("list-shop")
    async getListShop(@Req() req: Request): Promise<any> {
        const userId = req.user.id;
        return await this.shopService.getListShop(userId)
    }

}
