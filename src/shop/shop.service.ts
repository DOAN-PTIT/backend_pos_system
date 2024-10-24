import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { ShopRepository } from './repositories/shop.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ShopService {

    constructor (
        private readonly prisma: PrismaService,
        private readonly shopRepository: ShopRepository,
        private cloudinary: CloudinaryService
    ) {}

    async createShop (createShopDto: CreateShopDto, avatar: Express.Multer.File, userId: number) {
        const { name } = createShopDto
        try {
            // check shop name of user duplicate
            // const foundShop = await this.shopRepository.findShopOfUserByShopName(name, userId)
            // if (foundShop) throw new BadRequestException(`Shop ${name} already exists`)

            // get avatar url cloud
            const avatarResponse = await this.cloudinary.uploadImage(avatar)
            .catch(() => {
                console.log('Invalid file type')
                throw new BadRequestException('Invalid file type');
            })

            // create shop
            const newShop = await this.prisma.shop.create({
                data: { 
                    name: name,
                    avatar: avatarResponse.url,
                    currency: "VND",
                    description: "No description"
                }
            })

            // create shop user
            await this.prisma.shopUser.create({
                data: {
                    user_id: userId,
                    shop_id: newShop.id,
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
            console.error('Create shop failed')
            throw new BadRequestException('Create shop failed')
        }
    }

}
