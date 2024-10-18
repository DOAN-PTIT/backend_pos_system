import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/database/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UserRepository {
    
    constructor(
        private prisma: PrismaService,
    ) {}

    async findUserByEmail(email: string): Promise<User> {
        let foundUser: User
        try {
            foundUser = await this.prisma.user.findUnique({ 
                where: { email: email, }
            })
        } catch (err) {
            console.error(err)
            throw new BadRequestException('User not found')
        }

        return foundUser
    }

    async findUserById(userId: number): Promise<any> {
        let userProfile: any
        try {
            userProfile = await this.prisma.user.findUnique({ 
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    date_of_birth: true,
                    role: true
                },
            })
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot get user profile')
        }

        return userProfile
    }

}