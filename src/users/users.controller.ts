import { 
    Req,
    Res,
    Controller, 
    Get, 
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Post
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { ShopService } from 'src/shop/shop.service';
import { CreateShopDto } from 'src/shop/dto/create-shop.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
        private readonly shopService: ShopService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('profile')
    async getProfile (@Req() req: Request): Promise<any> {
        const userId = req.user.id;
        return await this.userService.getProfileByUserId(userId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Post('create-shop')
    @UseInterceptors(FileInterceptor('avatar'))
    async createShop (
        @Req() req: Request, 
        @Body() createShopDto: CreateShopDto, 
        @UploadedFile() avatar: Express.Multer.File
    ): Promise<any> {
        const userId = req.user.id;

        return await this.shopService.createShop(createShopDto, avatar, userId);
    }

}
