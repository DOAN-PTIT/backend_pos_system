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

@Injectable()
export class ShopService {

    constructor (
        private readonly prisma: PrismaService,
        private readonly shopRepository: ShopRepository,
        private cloudinary: CloudinaryService,
        private configService: ConfigService,
        private userRepository: UserRepository
    ) {}

    async getListShop(userId: number) {
        let listShop = []
        listShop = await this.shopRepository.findShopByUserId(userId)
        return listShop
    }

    async createShop (createShopDto: CreateShopDto, avatar: Express.Multer.File, userId: number) {
        const { name } = createShopDto

        try {
            // check shop name of user duplicate
            // const foundShop = await this.shopRepository.findShopOfUserByShopName(name, userId)
            // if (foundShop) throw new BadRequestException(`Shop ${name} already exists`)

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
        } catch (err) {
            console.error(err)
            throw new BadRequestException(err.message)
        }
    }

    async getProductsShopById (shopId: number, page: number, sortBy: SortBy = SortBy.CREATED_AT_DESC): Promise<any> {
        const LIMIT = 10
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

        const products = await this.prisma.product.findMany({
            skip: skip,
            take: LIMIT,
            where: {
                shop_id: shopId
            },
            orderBy: orderBy
        })

        // order by revenue

        // order by profit

        return products
    }

    async getEmployeesShopById (shopId: number, page: number, sortBy: SortBy = SortBy.CREATED_AT_DESC): Promise<any> {
        const LIMIT = 10
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
            const employees = await this.prisma.user.findMany({
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
                    id: true, name: true, email: true, phone_number: true, date_of_birth: true, createdAt: true
                },
                orderBy: orderBy
            })
            if (employees == undefined) throw new BadRequestException('Cannot get list employees')

            return employees
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
        image: Express.Multer.File
    ): Promise<any> {
        const {
            name, 
            description = '', 
            note, 
            product_code = '',
            retail_price,
            price_at_counter,
            categories_id = null
        } = createProductDto

        try {
            const foundProductByCode = await this.prisma.product.findFirst({
                where: { 
                    shop_id: shopId,
                    product_code: product_code
                },
            })
            if (foundProductByCode) throw new BadRequestException('Product_code existed')

            let imageUrl:any
            if (image) {
                const imageResponse = await this.cloudinary.uploadImage(image)
                .catch(() => {
                    console.log('Invalid file type')
                    throw new BadRequestException('Invalid file type');
                })
                
                imageUrl = imageResponse.url
            } else {
                imageUrl = this.configService.get<string>('PRODUCT_IMAGE_DEFAULT')
            }

            const newProduct = await this.prisma.product.create({
                data: {
                    name,
                    description,
                    note,
                    product_code,
                    image: imageUrl,
                    shop_id: shopId,
                    retail_price,
                    price_at_counter,
                    categories_id,
                }
            })

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

    async addEmployee (email: string, shopId: number): Promise<any> {
        try {
            const foundUser = await this.userRepository.findUserByEmail(email)
            if (!foundUser) throw new BadRequestException('Employee not found')
            const userId = foundUser.id

            const foundEmployee = await this.prisma.shopUser.findFirst({ 
                where: { 
                    shop_id: shopId,
                    user_id: userId
                }
            })
            if (foundEmployee) throw new BadRequestException('Employee already in shop')

            const newEmployee = await this.prisma.shopUser.create({
                data: {
                    shop_id: shopId,
                    user_id: userId,
                    role: RoleShop.Employee
                }
            })

            return newEmployee
        } catch (err) {
            console.log(err)
            throw new BadRequestException(err.message)
        }
    }

    async removeEmployee(shopUserId: number): Promise<any> {
        try {
            await this.prisma.shopUser.delete({
                where: { id: shopUserId }
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

}
