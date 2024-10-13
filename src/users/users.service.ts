import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from 'src/database/prisma.service';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class UsersService {

    constructor(
        private UserRepository: UserRepository,
        private prisma: PrismaService
    ) {}

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
                password: passwordHash,
                phoneNumber: createUserDto.phoneNumber || null,
                role: createUserDto.role,
            }
        }) 
        
    }

}
