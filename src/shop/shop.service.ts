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

@Injectable()
export class ShopService {

    constructor (
        private readonly prisma: PrismaService,
        private readonly shopRepository: ShopRepository,
        private cloudinary: CloudinaryService,
        private configService: ConfigService,
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
                    role: "admin"
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

    async getProductsShopById (shopId: number): Promise<any> {

        const products = await this.prisma.product.findMany({
            where: {
                shop_id: shopId
            }
        })

        // order by revenue

        // order by profit

        return products
    }

    async getEmployeesShopById (shopId: number): Promise<any> {

        const employees = await this.prisma.shopUser.findMany({
            where: {
                shop: { id: shopId },
                // role: Role.Employee
            },
            include: {
                user: true
            }
        })

        return employees
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

    async createProduct (createProductDto: CreateProductDto, shopId: number, image: Express.Multer.File): Promise<any> {
        const { name, description = '', note, product_code = '' } = createProductDto
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

}
