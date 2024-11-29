import { 
    Injectable, 
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from 'src/database/prisma.service';
import { ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {

    constructor(
        private UserRepository: UserRepository,
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) {}

    async getProfileByUserId (id: number): Promise<any> {
        let userProfile: any
        try {
            const { password, ...user } = await this.prisma.user.findUnique({
                where: { id }
            });
            return user
        } catch (err) {
            console.error(err);
            throw new NotFoundException('User profile not found')
        }

        return userProfile;
    }

    async create (createUserDto: CreateUserDto): Promise<any> {
        // check email existed?
        let email: string | null = null;
        if (createUserDto.email) {
            const foundUser = await this.UserRepository.findUserByEmail(createUserDto.email)
            if (foundUser) throw new ConflictException('Email already exists!')
        }

        // hash password
        let passwordHash: string | undefined = undefined;
        if (createUserDto.password) {
            passwordHash = await bcrypt.hash(createUserDto.password, 10);
        }
        
        return await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                name: createUserDto.name,
                password: passwordHash || '',
                phone_number: createUserDto.phone_number || null,
                role: createUserDto.role,
                fb_id: createUserDto.fb_id,
                access_token: createUserDto.access_token
            }
        }) 
    }

    async findUserByEmail(email: string): Promise<any> {
        let userProfile: any
        try {
            userProfile = await this.UserRepository.findUserByEmail(email);
        } catch (err) {
            console.error(err);
            throw new NotFoundException('User profile not found')
        }

        return userProfile;
    }

    async updateUserProfile (user_id: number, updateUser: UpdateUserDto, avatar?: Express.Multer.File) {
        try {
            if (avatar) {
                const avatarResponse = await this.cloudinary.uploadImage(avatar)
                .catch(() => {
                    console.log('Invalid file type')
                    throw new BadRequestException('Invalid file type');
                })
                
                updateUser['avatar'] = avatarResponse.url
            } 
            const date_of_birth_update = new Date(updateUser.date_of_birth)

            return await this.prisma.user.update({
                where: { id: user_id },
                data: {
                    ...updateUser,
                    date_of_birth: date_of_birth_update,
                }
            })
        } catch (err) {
            console.error(err);
            throw new NotFoundException('Update user profile failed')
        }
    }
    
    async changePassword (user_id: number, changePassword: ChangePasswordDto) {
        const { old_password, new_password } = changePassword

        const foundUser = await this.prisma.user.findUnique({where: { id: user_id }})
        if (!foundUser) throw new BadRequestException('User not found')

        const isValidPassword = await bcrypt.compare(old_password, foundUser.password)
        if (!isValidPassword) throw new BadRequestException('Old password not correct')

        if (old_password === new_password) {
            throw new BadRequestException('New password cannot same as old password')
        }

        let newPasswordHash = await bcrypt.hash(new_password, 10);

        const { password, ...user } = await this.prisma.user.update({
            where: { id: user_id },
            data: {
                password: newPasswordHash,
            }
        })
        return user
    }

}
