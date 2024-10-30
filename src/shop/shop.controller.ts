import { CreateShopDto } from './dto/create-shop.dto';
import { 
    Controller,
    UseGuards,
    Get,
    Req,
    Body,
    Post,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    Delete,
    Query
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Request, Response } from 'express';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { ShopService } from './shop.service';
import { GetProductsDto } from './dto/get-products.dto';
import { UpdateShopSettingDto } from './dto/update-shop-setting.dto';
import { RolesShopGuard } from 'src/auth/roles/role.shop.guard';
import { RoleShop } from 'src/auth/roles/role.shop.enum';
import { RolesShop } from 'src/auth/roles/role.shop.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { AddEmployeeDto } from './dto/add-employee.dto';
import { GetEmployeesDto } from './dto/get-employees.dto';

@Controller('shop')
@UseGuards(AuthGuard, RolesGuard, RolesShopGuard)
export class ShopController {

    constructor (
        private shopService: ShopService,
    ) {}

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post('products/:shopId')
    async getProducts (@Param('shopId') shopId: number, @Query() getProductsDto: GetProductsDto): Promise<any> {
        const { page, sortBy } = getProductsDto
        return await this.shopService.getProductsShopById(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/employees')
    async getEmployees (
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query() getEmployeesDto: GetEmployeesDto
    ): Promise<any> {
        const { page, sortBy } = getEmployeesDto
        return await this.shopService.getEmployeesShopById(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @Get("list-shop")
    async getListShop(@Req() req: Request): Promise<any> {
        const userId = req.user.id;
        return await this.shopService.getListShop(userId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Get("setting/:shopId")
    async getShopSetting (@Param('shopId', ParseIntPipe) shopId: number): Promise<any> {

        return await this.shopService.getSettingByShopId(shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post("setting/update/:shopId")
    async updateShopSetting (
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() updateShopSettingDto: UpdateShopSettingDto
    ): Promise<any> {

        return await this.shopService.updateSettingByShopId(shopId, updateShopSettingDto)
    }

    @Roles(Role.User, Role.Admin)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post('create-product/:shopId')
    @UseInterceptors(FileInterceptor('image'))
    async createShop (
        @Param('shopId', ParseIntPipe) shopId: number, 
        @Body() createProductDto: CreateProductDto, 
        @UploadedFile() image: Express.Multer.File
    ): Promise<any> {
        
        return await this.shopService.createProduct(createProductDto, shopId, image);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post("profile/update/:shopId")
    @UseInterceptors(FileInterceptor('avatar'))
    async updateShopProfile (
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() updateShopProfileDto: CreateShopDto,
        @UploadedFile() avatar: Express.Multer.File
    ): Promise<any> {

        return await this.shopService.updateShopProfile(updateShopProfileDto, shopId, avatar);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Post(":shopId/employee/add")
    async addEmployee (@Body() addEmployeeDto: AddEmployeeDto, @Param('shopId') shopId: number): Promise<any> {
        const { email } = addEmployeeDto
        
        return await this.shopService.addEmployee(email, shopId)
    }
    
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Get(":shopId/employee/:employId/detail")
    async getDetailEmployee (@Param('shopId') shopId: number, @Param('employId') userId: number): Promise<any> {
        
        return await this.shopService.getEmployeeDetail(shopId, userId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Post(":shopId/employee/:shopUserId/remove")
    async removeEmployee (@Param('shopUserId') shopUserId: number): Promise<any> {
        
        return await this.shopService.removeEmployee(shopUserId)
    }

}
