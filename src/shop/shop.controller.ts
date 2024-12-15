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
    Query,
    BadRequestException
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
import { OrderService } from 'src/order/order.service';
import { CustomerService } from 'src/customer/customer.service';
import { UpdateOrderDto } from 'src/order/dto/update-order.dto';
import { UsersService } from 'src/users/users.service';
import { ProductService } from 'src/product/product.service';
import { PromotionService } from 'src/promotion/promotion.service';

@Controller('shop')
@UseGuards(AuthGuard, RolesGuard, RolesShopGuard)
export class ShopController {

    constructor (
        private shopService: ShopService,
        private orderService: OrderService,
        private customerService: CustomerService,
        private userService: UsersService,
        private productService: ProductService,
        protected promotionService: PromotionService
    ) {}

    // Shop general
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
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
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get("setting/:shopId")
    async getShopSetting (@Param('shopId', ParseIntPipe) shopId: number): Promise<any> {

        return await this.shopService.getSettingByShopId(shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post("setting/update/:shopId")
    async updateShopSetting (
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() updateShopSettingDto: UpdateShopSettingDto
    ): Promise<any> {

        return await this.shopService.updateSettingByShopId(shopId, updateShopSettingDto)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Delete(":shopId")
    async deleteShop (@Param('shopId', ParseIntPipe) shopId: number): Promise<any> {
        return await this.shopService.deleteShop(shopId)
    }

    // Products
    @Roles(Role.User, Role.Admin)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post('create-product/:shopId')
    async createProduct (
        @Param('shopId', ParseIntPipe) shopId: number, 
        @Body() createProductDto: CreateProductDto,
    ): Promise<any> {
        
        return await this.shopService.createProduct(createProductDto, shopId);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post('products/:shopId')
    async getProducts (@Param('shopId') shopId: number, @Query() getProductsDto: GetProductsDto): Promise<any> {
        const { page, sortBy } = getProductsDto
        return await this.shopService.getProductsShopById(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/products/:searchKey')
    async searchProducts (@Param('shopId') shopId: number, @Param('searchKey') searchKey: string): Promise<any> {
        return await this.shopService.searchProducts(shopId, searchKey);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/product/:productId')
    async getProduct(@Param('shopId') shopId: number, @Param('productId') productId: string): Promise<any> {
        return await this.productService.getProduct(productId, shopId)
    }
  
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/product/:productId/delete')
    async deleteProduct (
        @Param('shopId') shopId: number, 
        @Param('productId') productId: number
    ) {
        return await this.productService.removeProduct(productId);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/product/:productId/update')
    async updateProduct (
        @Param('shopId') shopId: number, 
        @Param('productId') productId: number,
        @Body() updateProductDto: any
    ) {
        return await this.productService.updateProduct(productId, shopId, updateProductDto)
    }

    // Variations
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/variation/:searchKey')
    async searchVariations (@Param('shopId') shopId: number, @Param('searchKey') searchKey: string): Promise<any> {
        return await this.shopService.searchVariations(shopId, searchKey);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
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
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Post(":shopId/employee/add")
    async addEmployee (@Body() body: AddEmployeeDto[], @Param('shopId') shopId: number): Promise<any> {
        return await this.shopService.addEmployee(body, shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/employees')
    async getEmployees (
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query() getEmployeesDto: GetEmployeesDto
    ): Promise<any> {
        const { page, sortBy } = getEmployeesDto
        return await this.shopService.getEmployeesShopById(shopId, page, sortBy);
    }
    
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Get(":shopId/employee/:employId/detail")
    async getDetailEmployee (@Param('shopId') shopId: number, @Param('employId') userId: number): Promise<any> {
        
        return await this.shopService.getEmployeeDetail(shopId, userId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(":shopId/employee/:searchKey")
    async searchEmployee (@Param('shopId') shopId: number, @Param('searchKey') searchKey: string) {
        return await this.shopService.searchEmployee(shopId, searchKey)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Post(":shopId/employee/:userId/remove")
    async removeEmployee (@Param('shopId') shopId: number, @Param('userId') userId: number) {
        
        return await this.shopService.removeEmployee(shopId, userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/employee/add/find-fb-id')
    async findByFbId (@Param('shopId') shopId: number, @Body() body: { fb_id: string }) {
        const { fb_id } = body;
        const foundUser = await this.userService.findByFbId(fb_id);
        const isEmployeeExisted = await this.shopService.isEmployeeExisted(foundUser.id, shopId)

        if (isEmployeeExisted) {
            throw new BadRequestException('Employee already in shop')
        }

        return foundUser
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/employee/add/find-email')
    async findByEmail (@Param('shopId') shopId: number, @Body() body: { email: string }) {
        const { email } = body;
        const foundUser = await this.userService.findByEmail(email);
        const isEmployeeExisted = await this.shopService.isEmployeeExisted(foundUser.id, shopId)

        if (isEmployeeExisted) {
            throw new BadRequestException('Employee already in shop')
        }

        return foundUser
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Get(":shopId/employee/:userId/role")
    async updateShopUserRole (
        @Param('shopId') shopId: number, 
        @Param('userId') userId: number,
        @Query() query: { role: RoleShop }
    ) {
        return await this.shopService.updateShopUserRole(shopId, userId, query.role)
    }

    // Customers
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(":shopId/customer/add")
    async addCustomer (@Body() addCustomerDto: AddCustomerDto, @Param('shopId') shopId: number): Promise<any> {
        
        return await this.shopService.addCustomer(addCustomerDto, shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Get(':shopId/customer/all')
    async getCustomer (@Param('shopId') shopId: number, @Query() getCustomersDto: GetCustomersDto): Promise<any> {
        const { page, sortBy } = getCustomersDto
        return await this.shopService.getCustomers(shopId, page, sortBy);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Get(':shopId/customer/:customerId/remove')
    async removeCustomer (@Param('shopId') shopId: number, @Param('customerId') customerId: number): Promise<any> {
        
        return await this.shopService.removeCustomer(shopId, customerId);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/customers')
    async searchCustomer(@Req() req: Request): Promise<any> {
        return await this.customerService.searchCustomer(req.query as any);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/customer/:customerId/detail')
    async getCustomerDetail (
        @Param('shopId') shopId: number,
        @Param('customerId') customerId: number,
    ): Promise<any> {
        return await this.customerService.getDetailCustomer(customerId, shopId);
    }

    // Orders
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Post(':shopId/order/create')
    async createOrder (@Param('shopId') shopId: number, @Body() createOrderDto: CreateOrderDto): Promise<any> {

        return await this.shopService.createOrder(shopId, createOrderDto);
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/orders')
    async getOrders(@Query() params: { page: number, page_size: number, shop_id: number }): Promise<any> {
        return await this.orderService.getListOrder(params)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/order/:orderId')
    async updateOrder (@Param("shopId") shop_id: number, @Param('orderId') orderId: number, @Body() body: any) {
        return await this.orderService.updateOrder(orderId, shop_id, body)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/order/:orderId')
    async getOrderDetail (@Param('orderId') orderId: number, @Param('shopId') shopId: number) {
        const params = { id: orderId, shop_id: shopId }
        return await this.orderService.getOrderDetail(params)
    }

    // OVERVIEW PAGE API
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/order-stat')
    async orderStat (@Param('shopId') shopId: number) {
        return await this.orderService.getOrderstat(shopId)
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Post(':shopId/variation-stat')
    async variationStat (@Param('shopId') shopId: number) {
        return await this.orderService.getOrderstat(shopId)
    }

    // Promotion
    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/promotions')
    async getPromotions (@Param('shopId') shopId: number, @Query() params: any) {
        return await this.promotionService.getListPromotion({ ...params, shop_id: shopId })
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/promotion/:promotionId')
    async getPromotionDetail (@Param('shopId') shopId: number, @Param('promotionId') promotionId: number) {
        return await this.promotionService.getPromotionDetail({ id: promotionId, shop_id: shopId })
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin)
    @Post(':shopId/promotion/create')
    async createPromotion (@Param('shopId') shopId: number, @Body() params: any) {
        return await this.promotionService.createPromotion({ ...params, shop_id: shopId })
    }

    @Roles(Role.Admin, Role.User)
    @RolesShop(RoleShop.Owner, RoleShop.Admin, RoleShop.Employee)
    @Get(':shopId/promotions/promotion-can-be-active')
    async findPromotionCanBeActive (@Param('shopId') shopId: number, @Query() params: any) {
        return await this.promotionService.findPromotionCanBeActive({ ...params, shop_id: shopId })
    }


}
