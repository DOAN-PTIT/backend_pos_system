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
import { AddCustomerDto } from './dto/add-customer.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateVariationDto } from './dto/create-variation.dto';

@Controller('shop')
@UseGuards(AuthGuard, RolesGuard, RolesShopGuard)
export class ShopController {

    constructor (
        private shopService: ShopService,
    ) {}

    // Shop general
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
    @Get("list-shop")
    async getListShop(@Req() req: Request): Promise<any> {
        const userId = req.user.id;
        return await this.shopService.getListShop(userId)
    }

    @Roles(Role.Admin, Role.User)
    @Get(":shopId")
    async getShopInfo (@Param('shopId', ParseIntPipe) shopId: number): Promise<any> {
        return await this.shopService.getShopInfo(shopId)
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

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Delete(":shopId")
    async deleteShop (@Param('shopId', ParseIntPipe) shopId: number): Promise<any> {
        return await this.shopService.deleteShop(shopId)
    }

    // Products
    @Roles(Role.User, Role.Admin)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post('create-product/:shopId')
    async createProduct (
        @Param('shopId', ParseIntPipe) shopId: number, 
        @Body() createProductDto: CreateProductDto,
    ): Promise<any> {
        
        return await this.shopService.createProduct(createProductDto, shopId);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post('products/:shopId')
    async getProducts (@Param('shopId') shopId: number, @Query() getProductsDto: GetProductsDto): Promise<any> {
        const { page, sortBy } = getProductsDto
        return await this.shopService.getProductsShopById(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/products/:searchKey')
    async searchProducts (@Param('shopId') shopId: number, @Param('searchKey') searchKey: string): Promise<any> {

        return await this.shopService.searchProducts(shopId, searchKey);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/:productId/variation')
    @UseInterceptors(FileInterceptor('image'))
    async createVariation (
        @Param('shopId') shopId: number, 
        @Param('productId') product_id: number,
        @Body() createVariationDto: CreateVariationDto,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<any> {
        return await this.shopService.createVariation(shopId, product_id, image, createVariationDto);
    }

    // Employees
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Post(":shopId/employee/add")
    async addEmployee (@Body() addEmployeeDto: AddEmployeeDto, @Param('shopId') shopId: number): Promise<any> {
        const { email } = addEmployeeDto
        
        return await this.shopService.addEmployee(email, shopId)
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

    // Customers
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Post(":shopId/customer/add")
    async addCustomer (@Body() addCustomerDto: AddCustomerDto, @Param('shopId') shopId: number): Promise<any> {
        
        return await this.shopService.addCustomer(addCustomerDto, shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Get(':shopId/customer/all')
    async getCustomer (@Param('shopId') shopId: number, @Query() getCustomersDto: GetCustomersDto): Promise<any> {
        const { page, sortBy } = getCustomersDto
        return await this.shopService.getCustomers(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Get(':shopId/customer/:customerId/remove')
    async removeCustomer (@Param('shopId') shopId: number, @Param('customerId') customerId: number): Promise<any> {
        
        return await this.shopService.removeCustomer(shopId, customerId);
    }

    // Orders
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Admin)
    @Post(':shopId/order/create')
    async createOrder (@Param('shopId') shopId: number, @Body() createOrderDto: CreateOrderDto): Promise<any> {

        return await this.shopService.createOrder(shopId, createOrderDto);
    }

}
