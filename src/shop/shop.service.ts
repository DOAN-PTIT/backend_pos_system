import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { ShopRepository } from './repositories/shop.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/auth/roles/role.enum';
import { UpdateShopSettingDto } from './dto/update-shop-setting.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UserRepository } from 'src/users/repositories/user.repository';
import { RoleShop } from 'src/auth/roles/role.shop.enum';
import { SortBy } from '../utils/enum/sort-option.enum'
import { AddCustomerDto } from './dto/add-customer.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomerService } from 'src/customer/customer.service';
import { CreateVariationDto } from './dto/create-variation.dto';
import { Prisma } from '@prisma/client';
import { AddEmployeeDto } from './dto/add-employee.dto';
import { OrderStatus } from 'src/order/dto/update-order.dto';

@Injectable()
export class ShopService {

    constructor (
        private readonly prisma: PrismaService,
        private readonly shopRepository: ShopRepository,
        private cloudinary: CloudinaryService,
        private configService: ConfigService,
        private userRepository: UserRepository,
        private customerService: CustomerService
    ) {}

    async getShopInfo (shopId: number): Promise<any> {
        const fb_shop_id = shopId.toString()
        if (shopId < 1000000) {
            const shopInfo = await this.shopRepository.findShopById(shopId);
        if (!shopInfo) throw new BadRequestException('Shop not found or no logger exist')

        return shopInfo
        } else {
            const shopInfo = await this.prisma.shop.findFirst({
                where: { fb_shop_id }
            })
            if (!shopInfo) throw new BadRequestException('Shop not found or no logger exist')

            return shopInfo
        }
    }

    async getListShop(userId: number) {
        let listShop = await this.shopRepository.findShopByUserId(userId)

        const listShopIds = listShop.map(shop => shop.id)

        const listShopWithRole = await Promise.all(
            listShop.map(async (shop) => {
                const shopUser = await this.prisma.shopUser.findFirst({
                    where: {
                        shop_id: shop.id,
                        user_id: userId
                    }
                })

                return {
                    ...shop,
                    user_role: shopUser.role || null
                }
            })
        )

        return listShopWithRole
    }

    async createShop (createShopDto: CreateShopDto, userId: number, avatar?: Express.Multer.File) {
        const { name } = createShopDto

        try {
            // check shop name of user duplicate
            const foundShop = await this.shopRepository.findShopOfUserByShopName(name, userId)
            if (foundShop) throw new BadRequestException(`Shop ${name} already exists`)

            // get avatar url cloud
            let avatarUrl:any
            if (avatar) {
                const avatarResponse = await this.cloudinary.uploadImage(avatar)
                .catch(() => {
                    console.log('Invalid file type')
                    throw new BadRequestException('Invalid file type');
                })
                
                avatarUrl = avatarResponse.url
            } else {
                avatarUrl = this.configService.get<string>('AVATAR_DEFAULT')
            }

            // create shop
            const newShop = await this.prisma.shop.create({
                data: { 
                    name: name,
                    avatar: avatarUrl,
                    currency: "VND",
                    description: "No description"
                }
            })

            // create shop user
            await this.prisma.shopUser.create({
                data: {
                    user_id: userId,
                    shop_id: newShop.id,
                    role: RoleShop.Owner
                }
            })

            // create default shop setting
            await this.prisma.shopSetting.create({
                data: {
                    date_format: "DD/MM/YYYY",
                    location: "Hanoi, Vietnam",
                    language: "en",
                    shop_id: newShop.id,
                }
            })

            return newShop
        } catch (err) {
            console.error(err)
            throw new BadRequestException(err.message)
        }
    }

    async deleteShop (shopId: number): Promise<any> {
        try {
            // delete shop
            await this.prisma.shop.delete({
                where: {
                    id: shopId,
                }
            })
            // transaction delete relation data ... (onDelete: Cascade)

            return { message: "Delete shop success"}
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Delete shop fail and will rollback')
        }
    }

    async getProductsShopById (shopId: number, page: number, sortBy: SortBy = SortBy.CREATED_AT_DESC, search?: string): Promise<any> {
        const LIMIT = 30
        const skip = (page -1) * LIMIT
        let orderBy = {}
    
        switch(sortBy) {
            case SortBy.NAME_ASC:
                orderBy = { name: 'asc' }
                break   
            case SortBy.NAME_DESC:
                orderBy = { name: 'desc' }
                break
            case SortBy.CREATED_AT_ASC:
                orderBy = { createdAt: 'asc' }
                break
            case SortBy.CREATED_AT_DESC:
                orderBy = { createdAt: 'desc' }
                break
        }

        const [products, totalCount] = await Promise.all([
            this.prisma.product.findMany({
                skip: skip,
                take: LIMIT,
                where: {
                    AND: [
                        { shop_id: shopId },
                        search ? {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { product_code: { contains: search, mode: 'insensitive' } },
                                { note: { contains: search, mode: 'insensitive' } }
                            ]
                        } : {}
                    ]
                },
                orderBy: {createdAt: 'desc'},
                include: {
                    variations: true,
                    suppliers_products: {
                        include: {
                            supplier: true
                        }
                    }
                }
            }),
            this.prisma.product.count({
                where: {
                    AND: [
                        { shop_id: shopId },
                        search ? {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { product_code: { contains: search, mode: 'insensitive' } },
                                { note: { contains: search, mode: 'insensitive' } }
                            ]
                        } : {}
                    ]
                }
            })
        ])

        return { products, totalCount }
    }

    async getEmployeesShopById (shopId: number, page: number, sortBy: SortBy = SortBy.CREATED_AT_DESC): Promise<any> {
        const LIMIT = 100
        const skip = (page -1) * LIMIT
        let orderBy = {}
    
        switch(sortBy) {
            case SortBy.NAME_ASC:
                orderBy = { name: 'asc' }
                break   
            case SortBy.NAME_DESC:
                orderBy = { name: 'desc' }
                break
            case SortBy.CREATED_AT_ASC:
                orderBy = { createdAt: 'asc' }
                break
            case SortBy.CREATED_AT_DESC:
                orderBy = { createdAt: 'desc' }
                break
        }

        try {
            const [employees, totalCount] = await Promise.all([
                // QUERY NGƯỢC !!!!!!!!!
                this.prisma.user.findMany({
                    skip,
                    take: LIMIT,
                    where: {
                        shopusers: { 
                            some: { 
                                shop_id: shopId, 
                                // role: Role.Employee 
                            }
                        },
                    },
                    select: {
                        id: true, name: true, email: true, 
                        phone_number: true, date_of_birth: true, 
                        createdAt: true, avatar: true,
                        shopusers: {
                            where: { shop_id: shopId },
                            select: {
                                id: true,
                                role: true,
                                createdAt: true,
                                user_id: true,
                                shop_id: true,
                            },
                        },
                    },
                    orderBy: orderBy
                }),
                this.prisma.user.count({
                    where: {
                        shopusers: { 
                            some: { 
                                shop_id: shopId, 
                                // role: Role.Employee 
                            }
                        },
                    },
                })
            ])

            return { employees, totalCount }
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async getSettingByShopId (shopId: number): Promise<any> {
        try {
            const setting = await this.prisma.shopSetting.findUnique({
                where: { id: shopId },
            })
    
            return setting
        } catch (err) {
            console.log(err)
            throw new BadRequestException('Cannot get setting')
        }
    }

    async updateSettingByShopId (shopId: number, updateShopSettingDto: UpdateShopSettingDto): Promise<any> {
        try {
            const { 
                date_format, location, language, 
                auto_product_code, source_order, time_zone
            } = updateShopSettingDto

            // check shop exist?
            const foundShop = await this.shopRepository.findShopById(shopId)
            if (!foundShop) throw new BadRequestException('Shop to update not found')
            
            const updateShopSetting = await this.prisma.shopSetting.update({
                where: { id: shopId },
                data: {
                    date_format,
                    location,
                    language,
                    auto_product_code,
                    source_order,
                    time_zone,
                }
            })

            return updateShopSetting
        } catch (err) {
            console.log(err)
            throw new BadRequestException(err.message)
        }
    }

    async createProduct (
        createProductDto: CreateProductDto, 
        shopId: number,
    ): Promise<any> {
        const {
            name, 
            description = null, 
            note, 
            product_code = null,
            categories_id = null,
            suppliers_products_ids = []
        } = createProductDto

        try {
            const foundProductByCode = await this.prisma.product.findFirst({
                where: { 
                    shop_id: shopId,
                    product_code: product_code
                },
            })
            if (foundProductByCode) throw new BadRequestException('Product_code existed')

            const foundSupplier = await this.prisma.supplier.findMany({
                where: {
                    id: {
                        in: suppliers_products_ids
                    }
                }
            })

            const newProduct = await this.prisma.product.create({
                data: {
                    name,
                    description,
                    note,
                    product_code,
                    shop_id: shopId,
                    categories_id,
                }
            })

            // create supplier_products
            await Promise.all(
                foundSupplier.map(async (supplier) => {
                    return this.prisma.supplierProducts.create({
                        data: {
                            supplier_id: supplier.id,
                            product_id: newProduct.id
                        }
                    })
                })
            )

            return newProduct
        } catch (err) {
            console.error(err)
            throw new BadRequestException(err.message)
        }
    }

    async updateShopProfile (
        updateShopProfileDto: UpdateShopDto, 
        shopId: number,
        avatar: Express.Multer.File
    ): Promise<any> {
        try {
            const { name } = updateShopProfileDto
            if (avatar) {
                const avatarResponse = await this.cloudinary.uploadImage(avatar)
                .catch(() => {
                    console.log('Invalid file type')
                    throw new BadRequestException('Invalid file type');
                })
                
                const avatarUrl = avatarResponse.url

                return await this.prisma.shop.update({
                    where: { id: shopId },
                    data: {
                        name,
                        avatar: avatarUrl
                    }
                })
            } else {
                return this.prisma.shop.update({
                    where: { id: shopId },
                    data: { name }
                })
            }
        } catch (err) {
            console.error(err)
            throw new BadRequestException(err.message)
        }
    }

    async addEmployee (addEmployee: AddEmployeeDto[], shopId: number): Promise<any> {
        try {
            const data = await Promise.all(
                addEmployee.map(async employee => {
                    return this.prisma.shopUser.create({
                        data: {
                            shop_id: shopId,
                            user_id: employee.user_id,
                            role: RoleShop.Employee
                        }
                    })
                })
            )

            return data
        } catch (err) {
            console.log(err)
            throw new BadRequestException(err.message)
        }
    }

    async isEmployeeExisted (user_id: number, shopId: number): Promise<boolean> {
        const foundEmployee = await this.prisma.shopUser.findFirst({ 
            where: { 
                shop_id: shopId,
                user_id: user_id
            }
        }) 
        if (!foundEmployee) return false

        return true
    }

    async removeEmployee(shopId: number, userId: number) {
        try {
            const foundShopUser = await this.prisma.shopUser.findFirst({ 
                where: { 
                    shop_id: shopId, 
                    user_id: userId 
                } 
            })
            if (foundShopUser.role === RoleShop.Owner) {
                throw new BadRequestException('Cannot remove Shop Owner')
            }

            await this.prisma.shopUser.delete({
                where: { 
                    id: foundShopUser.id
                }
            })

            return { message: 'Remove employee success' }
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async getEmployeeDetail (shopId: number, userId: number): Promise<any> {
        try {
            const employee = await this.prisma.shopUser.findFirst({
                where: { 
                    shop_id: shopId,
                    user_id: userId
                },
                include: { 
                    user: { 
                        select: { 
                            id: true, 
                            email: true, 
                            phone_number: true, 
                            date_of_birth: true, 
                            role: true, 
                            createdAt: true 
                        }
                    }
                }
            })

            return employee
        } catch (error) {
            console.error(error)
            throw new BadRequestException(error.message)
        }
    }

    async searchEmployee (shopId: number, searchKey: string = '') {
        try {
            const employees = await this.prisma.user.findMany({
                where: {
                    AND: [
                        {
                            shopusers: { 
                                some: { 
                                    shop_id: shopId, 
                                    // role: Role.Employee 
                                }
                            }
                        },
                        {
                            name: {
                                contains: searchKey,
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                select: {
                    id: true, name: true, email: true, 
                    phone_number: true, date_of_birth: true, 
                    createdAt: true, avatar: true,
                    shopusers: {
                        where: { shop_id: shopId },
                        select: {
                            id: true,
                            role: true,
                            createdAt: true,
                            user_id: true,
                            shop_id: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc' 
                }
            })

            return employees
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async addCustomer (addCustomerDto: AddCustomerDto, shopId: number): Promise<any> {
        try {
            const { name, email, gender , address, date_of_birth, phone_number, last_purchase } = addCustomerDto    

            // check customer existed 
            const foundCustomer = await this.prisma.customer.findFirst({
                where: {
                    shopcustomers: {
                        some: { shop_id: shopId },
                    },
                    OR: [
                        { email }, 
                        { phone_number }
                    ]
                }
            })
            if (foundCustomer) throw new BadRequestException(`Customer already exists with (email: ${foundCustomer.email}, phone_number: ${foundCustomer.phone_number})`)
            
            // add user
            const newCustomer = await this.prisma.customer.create({
                data: {
                    name: name,
                    email: email,
                    gender: gender ? gender : "MALE",
                    address: address,
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                    phone_number: phone_number,
                    last_purchase: last_purchase ? new Date(last_purchase) : null,
                }
            })
            if (!newCustomer) throw new BadRequestException('Cannot add customer')

            // create shopCustomer
            const newShopCustomer = await this.prisma.shopCustomer.create({
                data: {
                    shop_id: shopId,
                    customer_id: newCustomer.id
                }
            })
            if (!newShopCustomer) throw new BadRequestException('Cannot create shopCustomer, pls take a look in db!')

            return newCustomer
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async getCustomers (shopId: number, page: number, sortBy: SortBy = SortBy.CREATED_AT_DESC, search?: string): Promise<any> {
        try {
            const LIMIT = 30
            const skip = (page -1) * LIMIT
            let orderBy = {}
    
            switch(sortBy) {
                case SortBy.NAME_ASC:
                    orderBy = { name: 'asc' }
                    break   
                case SortBy.NAME_DESC:
                    orderBy = { name: 'desc' }
                    break
                case SortBy.CREATED_AT_ASC:
                    orderBy = { createdAt: 'asc' }
                    break
                case SortBy.CREATED_AT_DESC:
                    orderBy = { createdAt: 'desc' }
                    break
                case SortBy.LAST_PURCHASE_ASC:
                    orderBy = { last_purchase: 'asc' }
                    break
                case SortBy.LAST_PURCHASE_DESC:
                    orderBy = { last_purchase: 'desc' }
                    break
            }

            const [customers, totalCount] = await Promise.all([
                this.prisma.customer.findMany({
                    skip,
                    take: LIMIT,
                    where: {
                        AND: [
                            { shopcustomers: { some: { shop_id: shopId } } },
                            search ? {
                                OR: [
                                    { name: { contains: search, mode: 'insensitive' } },
                                    { email: { contains: search, mode: 'insensitive' } },
                                    { phone_number: { contains: search, mode: 'insensitive' } }
                                ]
                            } : {}
                        ]
                    },
                    orderBy: orderBy
                }),
                this.prisma.customer.count({
                    where: {
                        shopcustomers: { some: { shop_id: shopId } },
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                            { phone_number: { contains: search, mode: 'insensitive' } }
                        ]
                    },
                })
            ]) 

            await Promise.all(
                customers.map(async (customer) => {
                    const totalSpent = await this.prisma.order.aggregate({
                        _sum: {
                            total_cost: true 
                        },
                        _count: {
                            _all: true,
                        },
                        where: {
                            customer_id: customer.id,
                            shop_id: shopId,
                            status: OrderStatus.DELIVERED
                        }
                    })
                    customer['total_spent'] = totalSpent._sum.total_cost || 0
                    customer['order_count'] = totalSpent._count._all || 0
                    return customer;
                })
            )

            return { customers, totalCount }
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async removeCustomer (shopId: number, customerId: number): Promise<any> {
        try {
            // delete shopCustomer
            await this.prisma.shopCustomer.deleteMany({
                where: {
                    shop_id: shopId,
                    customer_id: customerId
                }
            })

            // delete customer
            await this.prisma.customer.delete({
                where: { id: customerId },
            })

            return { message: 'Remove customer success'}
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async searchProducts (shopId: number, searchKey: string = ''): Promise<any> {
        try {
            // check product stock (option) ???

            return await this.prisma.product.findMany({
                where: {
                    AND: [
                        { shop_id: shopId },
                        {
                            OR: [
                                { name: { contains: searchKey, mode: 'insensitive' } },
                                { product_code: { contains: searchKey, mode: 'insensitive' } },
                                {variations: { some: { variation_code: { contains: searchKey, mode: 'insensitive' } } } }
                            ]
                        }
                    ]
                },
                include: {
                    // shop: true,
                    categories: true,
                    variations: true
                },
                orderBy: {
                    name: 'asc'
                }
            });
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async searchVariations (shopId: number, searchKey: string = ''): Promise<any> {
        try {
            // check product stock (option) ???

            return await this.prisma.variation.findMany({
                where: {
                    AND: [
                        { product: {shop_id: shopId} },
                        {
                            OR: [
                                { product: { name: { contains: searchKey, mode: 'insensitive' } }},
                                { variation_code: { contains: searchKey, mode: 'insensitive' } },
                                { product: { product_code: { contains: searchKey, mode: 'insensitive' } }}
                            ]
                        }
                    ]
                },
                include: {
                    // shop: true,
                    product: true,
                    promotion_item: true
                },
                orderBy: {
                    product: {name: 'asc'}
                }
            });
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async createOrder (shopId: number, createOrderDto: CreateOrderDto): Promise<any> {
        try {
            const { 
                note, delivery_address, delivery_company, delivery_cost, delivery_cost_shop,
                estimated_delivery, tracking_number, paid, total_cost,
                recipient_name, recipient_phone_number, createdAt, products_order,
                shopuser_id, add_customer, surcharge, at_counter, promotion_id, total_discount,
                shop_delivery_company_id
            } = createOrderDto

            const shopUser = await this.prisma.shopUser.findUnique({
                where: { id: shopuser_id }
            })
            if (!shopUser) {
                throw new BadRequestException('shopUser not found')
            } 
            
            // check customer existed?
            const foundCustomer = await this.customerService.findByEmailOrPhoneNumberForShop(
                shopId, add_customer.email, add_customer.phone_number
            )
            
            let newOrderCustomerId: number
            if (!foundCustomer) {
                const newCustomer = await this.addCustomer(add_customer, shopId)
                newOrderCustomerId = newCustomer.id
            } else {
                // we can update user exist here!!!
                // now is old customer
                newOrderCustomerId = foundCustomer.id
            }

            // create new order
            const newOrder = await this.prisma.order.create({
                data: {
                    delivery_address, delivery_company, 
                    delivery_cost, delivery_cost_shop, 
                    tracking_number, 
                    paid, total_cost, recipient_name,
                    recipient_phone_number, note,
                    surcharge, 
                    shopuser_id: shopUser.id, 
                    at_counter,
                    status: 1,
                    estimated_delivery: new Date(estimated_delivery), 
                    createdAt: new Date(createdAt), 
                    customer_id: newOrderCustomerId,
                    shop_id: shopId,
                    promotion_id: promotion_id || null,
                    total_discount,
                    shop_delivery_company_id: parseInt(shop_delivery_company_id)
                }
            })
            // create orderItem
            await Promise.all(
                products_order.map(productOrder => {
                    return this.prisma.orderItem.create({
                        data: {
                            product_id: productOrder.product_id,
                            quantity: productOrder.quantity,
                            order_id: newOrder.id,
                            variation_id: productOrder.variation_id,
                        }
                    })
                })
            )

            return newOrder
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
    }

    async integrateFbShop (userId: number, name: string, avatar: string, fb_shop_id: string): Promise<any> {
        try {
            // check shop name of user duplicate
            const foundShop = await this.shopRepository.findShopOfUserByShopName(name, userId)
            if (foundShop) throw new BadRequestException(`Shop ${name} already exists`)

            // create shop
            const newShop = await this.prisma.shop.create({
                data: { 
                    name: name,
                    avatar: avatar,
                    fb_shop_id,
                    currency: "VND",
                    description: "No description"
                }
            })

            // create shop user
            await this.prisma.shopUser.create({
                data: {
                    user_id: userId,
                    shop_id: newShop.id,
                    role: RoleShop.Admin
                }
            })

            // create default shop setting
            await this.prisma.shopSetting.create({
                data: {
                    date_format: "DD/MM/YYYY",
                    location: "Hanoi, Vietnam",
                    language: "en",
                    shop_id: newShop.id,
                }
            })

            return newShop
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error.message)
        }
        
    }

    async createVariation (
        shopId: number, 
        product_id: number,
        createVariationDto: CreateVariationDto
    ): Promise<any> {
        try {
            const { 
                retail_price, amount, barcode, 
                price_at_counter, variation_code, 
                image_url_fb, image, last_imported_price
            } = createVariationDto

            const foundProduct = await this.prisma.product.findFirst({
                where: { id: product_id, AND: { shop_id: shopId } }
            })
            if (!foundProduct) throw new BadRequestException('Product not found')

            // get avatar url cloud
            let imageUrl:string
            if (image && !image_url_fb) {
                imageUrl = image
            } 

            if (!image && image_url_fb) {
                imageUrl = image_url_fb
            }
            
            if (!imageUrl && !image_url_fb) {
                imageUrl = this.configService.get<string>('PRODUCT_IMAGE_DEFAULT')
            }

            const newVariation = await this.prisma.variation.create({
                data: {
                    retail_price, 
                    amount, 
                    barcode, 
                    price_at_counter: parseInt(price_at_counter as any || "0"), 
                    product_id, 
                    variation_code,
                    last_imported_price: parseInt(last_imported_price || "0"),
                    image: imageUrl
                } as Prisma.VariationUncheckedCreateInput
            })

            return newVariation
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Create variation fail')
        }
    }

    async updateShopUserRole (shop_id: number, user_id: number, role: RoleShop) {
        const foundShopUser = await this.prisma.shopUser.findFirst({
            where: {
                user_id,
                shop_id,
            }
        })
        if (!foundShopUser) throw new BadRequestException('ShopUser not found')

        if (foundShopUser.role === RoleShop.Owner) {
            throw new BadRequestException('Cannot update role of owner')
        }

        return await this.prisma.shopUser.update({
            where: { id: foundShopUser.id },
            data: { role }
        })
    }

    async leaveShop (shop_id: number, user_id: number) {
        const shopUser = await this.prisma.shopUser.findFirst({
            where: { 
                shop_id,
                user_id,
            }
        })
        if (!shopUser) {
            throw new BadRequestException('You already leave or no longger belong to this shop')
        }

        if (shopUser.role === RoleShop.Owner) {
            throw new BadRequestException('You cannot leave this shop which you are an Owner')
        }

        return this.prisma.shopUser.delete({
            where: { 
                id: shopUser.id,
            }
        })
    }

    async getRevenueStatsByMonth (shop_id: number, year: number, month?: number) {
        let revenuePeriod: any
        
        if (month) {
            revenuePeriod = await this.prisma.$queryRaw`
                SELECT 
                    TO_CHAR(DATE("createdAt"), 'DD-MM-YYYY') AS day, 
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "total_cost" ELSE 0 END)::numeric AS sales,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "total_cost" - COALESCE("total_discount", 0) ELSE 0 END)::numeric AS revenue,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN COALESCE("total_discount", 0) ELSE 0 END)::numeric AS total_discount,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "delivery_cost" ELSE 0 END)::numeric AS delivery_cost,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "delivery_cost_shop" ELSE 0 END)::numeric AS delivery_cost_shop,
                    COUNT(*) FILTER (
                        WHERE "status" = ${OrderStatus.DELIVERED} 
                        OR "status" = ${OrderStatus.APPROVED}
                        OR "status" = ${OrderStatus.SHIPPED} 
                    )::numeric AS received_orders,
                    COUNT(*) FILTER (WHERE "status" = ${OrderStatus.CANCELED})::numeric AS returned_orders,
                    ARRAY_AGG("id") AS order_ids
                FROM "Order"
                WHERE "shop_id" = ${shop_id}
                AND EXTRACT(YEAR FROM "createdAt") = ${year}::integer
                AND EXTRACT(MONTH FROM "createdAt") = ${month}::integer
                GROUP BY DATE("createdAt")
                ORDER BY day DESC;
            `;
        } else {
            revenuePeriod = await this.prisma.$queryRaw`
                SELECT 
                    TO_CHAR(DATE_TRUNC('month', "createdAt"), 'MM-YYYY') AS month,
                    COUNT(*)::numeric AS total_orders,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "total_cost" ELSE 0 END)::numeric AS sales,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "total_cost" - COALESCE("total_discount", 0) ELSE 0 END)::numeric AS revenue,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN COALESCE("total_discount", 0) ELSE 0 END)::numeric AS total_discount,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "delivery_cost" ELSE 0 END)::numeric AS delivery_cost,
                    SUM(CASE WHEN "status" = ${OrderStatus.DELIVERED} THEN "delivery_cost_shop" ELSE 0 END)::numeric AS delivery_cost_shop,
                    COUNT(*) FILTER (
                        WHERE "status" = ${OrderStatus.DELIVERED} 
                        OR "status" = ${OrderStatus.APPROVED}
                        OR "status" = ${OrderStatus.SHIPPED} 
                    )::numeric AS received_orders,
                    COUNT(*) FILTER (WHERE "status" = ${OrderStatus.CANCELED})::numeric AS returned_orders,
                    ARRAY_AGG("id") AS order_ids
                FROM "Order"
                WHERE "shop_id" = ${shop_id}
                AND EXTRACT(YEAR FROM "createdAt") = ${year}::integer
                GROUP BY DATE_TRUNC('month', "createdAt")
                ORDER BY month ASC;
            `;
        }

        let allPeriods = [];
        if (month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            for (let i = startDate.getDate(); i <= endDate.getDate(); i++) {
                const day = new Date(year, month - 1, i);
                // DD-MM-YYYY
                const formattedDay = `${String(day.getDate()).padStart(2, '0')}-${String(day.getMonth() + 1).padStart(2, '0')}-${day.getFullYear()}`;
                allPeriods.push(formattedDay);
            }
        } else {
            // Tạo danh sách các tháng trong năm
            for (let i = 1; i <= 12; i++) {
                const monthString = `${i.toString().padStart(2, '0')}-${year}`;  // MM-YYYY
                allPeriods.push(monthString);
            }
        }

        const revenueStats = [];
        for (let period of allPeriods) {
            const periodData = revenuePeriod.find(item => item.day === period || item.month === period);
            const order_ids = periodData?.order_ids || [];
            
            let totalImportCost = { total_import_cost: 0 };
            if (order_ids.length > 0) {
                const result = await this.prisma.$queryRaw`
                    SELECT 
                        SUM(oi.quantity * v.last_imported_price)::numeric AS total_import_cost
                    FROM "OrderItem" oi
                    INNER JOIN "Variation" v ON oi.variation_id = v.id
                    WHERE oi.order_id IN (${Prisma.join(order_ids)});
                `;
                totalImportCost = result[0];
            }

            revenueStats.push({
                period,
                revenue: periodData?.revenue || 0,
                delivery_cost: periodData?.delivery_cost || 0,
                delivery_cost_shop: periodData?.delivery_cost_shop || 0,
                received_orders: periodData?.received_orders || 0,
                returned_orders: periodData?.returned_orders || 0,
                total_items_cost: totalImportCost?.total_import_cost || 0,
                total_profit: (periodData?.revenue || 0) - (totalImportCost?.total_import_cost || 0) - (periodData?.delivery_cost || 0) - (periodData?.delivery_cost_shop || 0),
                total_discount: periodData?.total_discount || 0,
                sales: periodData?.sales || 0,
                total_orders: periodData?.total_orders || 0,
            });
        }

        return revenueStats
    }

}
