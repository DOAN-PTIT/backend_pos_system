import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/database/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UserRepository {
    
    constructor(
        private prisma: PrismaService,
    ) {}

    async findUserByEmail(email: string): Promise<User> {
        let foundUser: User = await this.prisma.user.findUnique({ 
            where: { email: email, }
        })

        return foundUser
    }

    async findUserById(userId: number): Promise<User> {
        let foundUser: User = await this.prisma.user.findUnique({ 
            where: { id: userId }
        })

        return foundUser
    }

}